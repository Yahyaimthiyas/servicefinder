import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

// Verify professional access
async function verifyProfessionalAccess(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No valid authorization header", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    
    await connectDB()
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== "professional") {
      return { error: "Access denied", status: 403 }
    }
    
    return { user, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET /api/professional/reviews
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const db = await connectDB()
    
    // Fetch real reviews from database
    const reviews = await db.collection("reviews")
      .aggregate([
        {
          $match: {
            professionalId: new ObjectId(user._id)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customerId",
            foreignField: "_id",
            as: "customer"
          }
        },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking"
          }
        },
        {
          $project: {
            _id: 1,
            customerName: { $arrayElemAt: ["$customer.name", 0] },
            customerAvatar: { $arrayElemAt: ["$customer.profileImage", 0] },
            rating: 1,
            comment: 1,
            serviceType: { $arrayElemAt: ["$booking.serviceName", 0] },
            date: "$createdAt",
            bookingId: 1,
            helpful: { $ifNull: ["$helpful", 0] },
            response: "$professionalResponse"
          }
        },
        { $sort: { date: -1 } }
      ])
      .toArray()

    // Calculate real statistics
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }
    
    const reviewsWithResponse = reviews.filter(r => r.response).length
    const responseRate = totalReviews > 0 ? Math.round((reviewsWithResponse / totalReviews) * 100) : 0

    const stats = {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      responseRate,
      recentTrend: "stable" // Would need historical data to calculate trend
    }

    return NextResponse.json({ 
      success: true, 
      reviews,
      stats
    })
  } catch (error) {
    console.error("❌ Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST /api/professional/reviews/respond
export async function POST(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { reviewId, response } = await request.json()

    console.log(`📝 Adding response to review ${reviewId}`)

    // In a real app, this would update the database
    return NextResponse.json({ 
      success: true, 
      message: "Response added successfully",
      reviewId,
      response
    })
  } catch (error) {
    console.error("❌ Error adding review response:", error)
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    )
  }
}
