import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"
import { connectDB } from "../../../config/mongodb.js"
import { Booking } from "../../../models/Booking.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"

// GET /api/professional/dashboard-stats
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const db = await connectDB()
    
    // Calculate real dashboard stats from database
    const professionalId = new ObjectId(user._id)
    
    // Get booking statistics
    const bookingStats = await Booking.getStats(db, { professionalId })
    
    // Get all bookings for this professional
    const allBookings = await Booking.findByUser(db, professionalId, "professional")
    
    // Calculate active bookings (pending + confirmed)
    const activeBookings = allBookings.filter(b => 
      b.status === "pending" || b.status === "confirmed"
    ).length
    
    // Get recent bookings (last 5)
    const recentBookingsData = await db.collection("bookings")
      .aggregate([
        { $match: { professionalId } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "customerId",
            foreignField: "_id",
            as: "customer"
          }
        },
        {
          $project: {
            _id: 1,
            serviceName: 1,
            scheduledDate: 1,
            scheduledTime: 1,
            status: 1,
            price: 1,
            createdAt: 1,
            customerName: { $arrayElemAt: ["$customer.name", 0] }
          }
        }
      ])
      .toArray()
    
    // Format recent bookings
    const recentBookings = recentBookingsData.map(booking => ({
      id: booking._id.toString(),
      customerName: booking.customerName || "Unknown Customer",
      service: booking.serviceName || "Service",
      date: booking.scheduledDate || new Date().toISOString().split('T')[0],
      time: booking.scheduledTime || "TBD",
      status: booking.status,
      amount: booking.price || 0
    }))
    
    // Calculate monthly earnings for last 3 months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const monthlyEarningsData = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: "completed",
            completedAt: { $gte: threeMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              month: { $month: "$completedAt" }
            },
            earnings: { $sum: "$price" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
      .toArray()
    
    // Format monthly earnings
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyEarnings = monthlyEarningsData.map(item => ({
      month: monthNames[item._id.month - 1],
      earnings: item.earnings
    }))
    
    // Calculate unique customers
    const uniqueCustomers = await db.collection("bookings")
      .distinct("customerId", { professionalId })
    
    // Calculate profile completion percentage
    const profileFields = [
      user.name, user.email, user.phone, user.profession, 
      user.experience, user.city, user.state
    ]
    const completedFields = profileFields.filter(field => field && field.trim()).length
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100)
    
    // Calculate response rate (mock for now - would need message/response tracking)
    const responseRate = user.responseRate || 0
    
    const stats = {
      totalEarnings: bookingStats.totalRevenue || 0,
      activeBookings: activeBookings,
      completedJobs: bookingStats.completed || 0,
      averageRating: user.rating || 0,
      totalClients: uniqueCustomers.length || 0,
      responseRate: responseRate,
      profileCompletion: profileCompletion,
      monthlyEarnings: monthlyEarnings,
      recentBookings: recentBookings,
      performanceMetrics: {
        responseTime: user.averageResponseTime || "N/A",
        completionRate: bookingStats.total > 0 ? 
          `${Math.round((bookingStats.completed / bookingStats.total) * 100)}%` : "0%",
        customerSatisfaction: user.rating ? `${user.rating}/5` : "N/A",
        repeatCustomers: "N/A" // Would need repeat customer tracking
      }
    }

    return NextResponse.json({ 
      success: true, 
      stats 
    })
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
