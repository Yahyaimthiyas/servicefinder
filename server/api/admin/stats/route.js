import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"

// Middleware to verify admin access
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production")
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)
    
    if (!user || user.type !== "admin") {
      return { error: "Admin access required", status: 403 }
    }

    return { user, db }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET - Get admin dashboard statistics
export async function GET(request) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck

    // Get real statistics from database
    const [
      totalUsers,
      totalProfessionals,
      verifiedProfessionals,
      pendingVerifications,
      totalBookings,
      completedBookings,
      activeSubscriptions
    ] = await Promise.all([
      db.collection("users").countDocuments({ type: "customer" }),
      db.collection("users").countDocuments({ type: "professional" }),
      db.collection("users").countDocuments({ 
        type: "professional", 
        verificationStatus: "verified" 
      }),
      db.collection("users").countDocuments({ 
        type: "professional", 
        verificationStatus: "pending_admin_review" 
      }),
      db.collection("bookings").countDocuments(),
      db.collection("bookings").countDocuments({ status: "completed" }),
      db.collection("subscriptions").countDocuments({ status: "active" })
    ])

    // Calculate revenue (mock calculation - you can implement real revenue tracking)
    const totalRevenue = activeSubscriptions * 750 // Average subscription price
    const monthlyRevenue = Math.floor(totalRevenue * 0.8) // Approximate monthly

    // Get recent activity
    const recentUsers = await db.collection("users")
      .find({ type: "professional" })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const recentBookings = await db.collection("bookings")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const stats = {
      totalUsers: totalUsers + totalProfessionals,
      totalProfessionals,
      verifiedProfessionals,
      pendingVerifications,
      totalBookings,
      completedBookings,
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      disputesOpen: 0, // You can implement dispute tracking later
      // Recent activity is built only from real users and bookings in MongoDB
      recentActivity: [
        ...recentUsers.map((user) => ({
          type: "registration",
          message: `New professional registered: ${user.name || "Unnamed professional"}`,
          time: new Date(user.createdAt || user.joinedAt || new Date()).toLocaleString(),
          timestamp: user.createdAt || user.joinedAt || new Date(),
        })),
        ...recentBookings.map((booking) => ({
          type: "booking",
          message: `Booking ${booking.status || "pending"}: ${
            booking.serviceName || booking.serviceType || booking.service || "Service"
          }`,
          time: new Date(booking.createdAt || booking.scheduledDate || new Date()).toLocaleString(),
          timestamp: booking.createdAt || booking.scheduledDate || new Date(),
        })),
      ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
    }

    return NextResponse.json({ success: true, stats })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch admin statistics", 
      details: error.message 
    }, { status: 500 })
  }
}
