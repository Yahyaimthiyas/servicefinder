import { NextResponse } from "next/server"
import { connectDB } from "../../config/mongodb.js"
import { Rating } from "../../models/Rating.js"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

// Verify user access
async function verifyUserAccess(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No valid authorization header", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    
    const db = await connectDB()
    
    // Convert userId to ObjectId if it's a string
    let userId = decoded.userId
    if (typeof userId === 'string') {
      try {
        userId = new ObjectId(userId)
      } catch (error) {
        return { error: "Invalid user ID format", status: 400 }
      }
    }
    
    const user = await db.collection("users").findOne({ _id: userId })
    
    if (!user) {
      return { error: "User not found", status: 404 }
    }
    
    return { user, db, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// POST /api/ratings - Submit a rating
export async function POST(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const ratingData = await request.json()

    console.log("📝 Submitting rating:", ratingData)

    // Validate required fields
    if (!ratingData.bookingId || !ratingData.rating) {
      return NextResponse.json({ error: "Booking ID and rating are required" }, { status: 400 })
    }

    // Check if booking exists and user has access
    const booking = await db.collection("bookings").findOne({ 
      _id: new ObjectId(ratingData.bookingId)
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify user is part of this booking
    const isCustomer = booking.customerId.toString() === user._id.toString()
    const isProfessional = booking.professionalId.toString() === user._id.toString()

    if (!isCustomer && !isProfessional) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only rate completed bookings" }, { status: 400 })
    }

    // Check if user has already rated this booking
    const hasRated = await Rating.hasUserRated(db, ratingData.bookingId, user._id, user.type)
    if (hasRated) {
      return NextResponse.json({ error: "You have already rated this booking" }, { status: 400 })
    }

    // Prepare rating data
    const newRatingData = {
      bookingId: ratingData.bookingId,
      customerId: booking.customerId,
      professionalId: booking.professionalId,
      raterType: user.type,
      rateeType: user.type === "customer" ? "professional" : "customer",
      rating: ratingData.rating,
      review: ratingData.review || "",
      serviceQuality: ratingData.serviceQuality || null,
      communication: ratingData.communication || null,
      punctuality: ratingData.punctuality || null,
      professionalism: ratingData.professionalism || null,
      paymentOnTime: ratingData.paymentOnTime || null,
      respectful: ratingData.respectful || null,
      wouldRecommend: ratingData.wouldRecommend || null
    }

    // Create rating
    const rating = await Rating.create(db, newRatingData)

    // Update user's average rating
    const rateeId = user.type === "customer" ? booking.professionalId : booking.customerId
    const rateeType = user.type === "customer" ? "professional" : "customer"
    
    const avgRating = await Rating.getAverageRating(db, rateeId, rateeType)
    
    await db.collection("users").updateOne(
      { _id: rateeId },
      {
        $set: {
          rating: Math.round(avgRating.averageRating * 10) / 10,
          totalReviews: avgRating.totalRatings,
          updatedAt: new Date()
        }
      }
    )

    console.log("✅ Rating submitted successfully")

    return NextResponse.json({
      success: true,
      rating,
      message: "Rating submitted successfully"
    })

  } catch (error) {
    console.error("❌ Error submitting rating:", error)
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    )
  }
}

// GET /api/ratings - Get ratings for a user or booking
export async function GET(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')

    let ratings = []

    if (bookingId) {
      // Get ratings for a specific booking
      ratings = await Rating.findByBooking(db, bookingId)
    } else if (userId && userType) {
      // Get ratings for a specific user
      ratings = await Rating.findByUser(db, userId, userType)
    } else {
      // Get ratings for the current user
      ratings = await Rating.findByUser(db, user._id, user.type)
    }

    return NextResponse.json({
      success: true,
      ratings
    })

  } catch (error) {
    console.error("❌ Error fetching ratings:", error)
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    )
  }
}
