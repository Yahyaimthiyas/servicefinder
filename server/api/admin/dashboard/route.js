import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { Booking } from "../../../models/Booking.js"
import { Review } from "../../../models/Review.js"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("servicefinder")

    // Get comprehensive admin statistics using native MongoDB
    const [
      totalUsers,
      totalProfessionals,
      totalBookings,
      totalRevenue,
      pendingBookings,
      completedBookings,
      averageRating,
      recentActivity,
    ] = await Promise.all([
      db.collection("users").countDocuments({ type: "customer" }),
      db.collection("users").countDocuments({ type: "professional" }),
      db.collection("bookings").countDocuments(),
      db.collection("bookings").aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]).toArray(),
      db.collection("bookings").countDocuments({ status: "pending" }),
      db.collection("bookings").countDocuments({ status: "completed" }),
      db.collection("reviews").aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]).toArray(),
      db.collection("bookings")
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
    ])

    // Monthly growth data
    const monthlyData = await db.collection("bookings").aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]).toArray()

    // Service category performance
    const categoryStats = await db.collection("bookings").aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 },
          revenue: { $sum: "$totalCost" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { count: -1 } },
    ]).toArray()

    const stats = {
      overview: {
        totalUsers,
        totalProfessionals,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBookings,
        completedBookings,
        averageRating: averageRating[0]?.avgRating || 0,
        conversionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      },
      monthlyData: monthlyData.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        bookings: item.bookings,
        revenue: item.revenue,
      })),
      categoryStats,
      recentActivity: recentActivity.map((booking) => ({
        id: booking._id,
        customer: booking.customerName || "Unknown",
        professional: booking.professionalName || "Unknown", 
        service: booking.serviceType || "Unknown",
        amount: booking.totalCost || 0,
        status: booking.status || "pending",
        date: booking.createdAt || new Date(),
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch admin dashboard data" }, { status: 500 })
  }
}
