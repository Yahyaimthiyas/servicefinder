import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { Booking } from "../../../models/Booking.js"
import { Review } from "../../../models/Review.js"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, process.env.JWT_SECRET || "demo-secret")
}

export async function GET(request) {
  try {
    const decoded = verifyToken(request)
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("userType") || decoded.type

    const client = await clientPromise
    const db = client.db("servicefinder")

    let stats = {}

    if (userType === "admin") {
      // Admin dashboard stats
      const [totalUsers, totalBookings, totalRevenue, recentActivity] = await Promise.all([
        db.collection("users").countDocuments(),
        db.collection("bookings").countDocuments(),
        db
          .collection("bookings")
          .aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$price" } } }])
          .toArray(),
        db.collection("bookings").find().sort({ createdAt: -1 }).limit(10).toArray(),
      ])

      stats = {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentActivity,
        userGrowth: await getUserGrowthStats(db),
        bookingTrends: await getBookingTrends(db),
      }
    } else if (userType === "professional") {
      // Professional dashboard stats
      const professionalId = decoded.userId
      const [myBookings, myReviews, earnings, upcomingBookings] = await Promise.all([
        Booking.findByUser(db, professionalId, "professional"),
        Review.findByProfessional(db, professionalId),
        db
          .collection("bookings")
          .aggregate([
            { $match: { professionalId: new ObjectId(professionalId), status: "completed" } },
            { $group: { _id: null, total: { $sum: "$price" } } },
          ])
          .toArray(),
        db
          .collection("bookings")
          .find({
            professionalId: new ObjectId(professionalId),
            status: { $in: ["pending", "confirmed"] },
          })
          .sort({ scheduledDate: 1 })
          .limit(5)
          .toArray(),
      ])

      stats = {
        totalBookings: myBookings.length,
        completedBookings: myBookings.filter((b) => b.status === "completed").length,
        pendingBookings: myBookings.filter((b) => b.status === "pending").length,
        totalEarnings: earnings[0]?.total || 0,
        averageRating: myReviews.length > 0 ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length : 0,
        totalReviews: myReviews.length,
        upcomingBookings,
        monthlyEarnings: await getMonthlyEarnings(db, professionalId),
      }
    } else {
      // Customer dashboard stats
      const customerId = decoded.userId
      const [myBookings, myReviews, favoriteServices] = await Promise.all([
        Booking.findByUser(db, customerId, "customer"),
        db
          .collection("reviews")
          .find({ customerId: new ObjectId(customerId) })
          .toArray(),
        db
          .collection("bookings")
          .aggregate([
            { $match: { customerId: new ObjectId(customerId) } },
            { $group: { _id: "$serviceName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ])
          .toArray(),
      ])

      stats = {
        totalBookings: myBookings.length,
        completedBookings: myBookings.filter((b) => b.status === "completed").length,
        upcomingBookings: myBookings.filter((b) => b.status === "confirmed").length,
        totalSpent: myBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.price || 0), 0),
        reviewsGiven: myReviews.length,
        favoriteServices,
        recentBookings: myBookings.slice(0, 5),
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getUserGrowthStats(db) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, newUsersThisMonth, newUsersThisWeek] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ joinedAt: { $gte: thirtyDaysAgo } }),
    db.collection("users").countDocuments({ joinedAt: { $gte: sevenDaysAgo } }),
  ])

  return {
    total: totalUsers,
    thisMonth: newUsersThisMonth,
    thisWeek: newUsersThisWeek,
  }
}

async function getBookingTrends(db) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const trends = await db
    .collection("bookings")
    .aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  return trends
}

async function getMonthlyEarnings(db, professionalId) {
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)

  const earnings = await db
    .collection("bookings")
    .aggregate([
      {
        $match: {
          professionalId: new ObjectId(professionalId),
          status: "completed",
          completedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$completedAt" },
          },
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  return earnings
}
