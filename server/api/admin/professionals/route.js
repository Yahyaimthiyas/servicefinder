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

// GET - Get all professionals with filtering options
export async function GET(request) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get("status") // pending, approved, rejected
    const limit = parseInt(searchParams.get("limit")) || 50

    const filters = { 
      includeUnverified: true,
      limit 
    }

    console.log("📋 Fetching professionals for admin dashboard...")

    // Get all professionals from database
    const professionals = await db.collection("users").find({
      type: "professional"
    }).sort({ createdAt: -1 }).limit(limit).toArray()

    console.log(`👥 Found ${professionals.length} professionals`)
    
    // Filter by verification status if specified
    let filteredProfessionals = professionals
    if (status) {
      filteredProfessionals = professionals.filter(p => p.verificationStatus === status)
    }

    // Format professionals for dashboard
    const formattedProfessionals = filteredProfessionals.map(prof => ({
      _id: prof._id.toString(),
      name: prof.name,
      email: prof.email,
      phone: prof.phone || "Not provided",
      profession: prof.profession || "Not specified",
      verificationStatus: prof.verificationStatus || "pending_documents",
      subscriptionPlan: prof.subscriptionPlan || "free",
      rating: prof.rating || 0,
      totalBookings: prof.totalBookings || 0,
      revenue: prof.revenue || 0,
      joinedAt: prof.createdAt || new Date(),
      lastActive: prof.lastLoginAt || prof.createdAt,
      documents: { verified: prof.verificationStatus === "verified" },
      location: `${prof.city || "Unknown"}, ${prof.state || "Unknown"}`
    }))

    // Group by verification status for dashboard stats
    const stats = {
      total: professionals.length,
      pending_documents: professionals.filter(p => p.verificationStatus === "pending_documents").length,
      pending_admin_review: professionals.filter(p => p.verificationStatus === "pending_admin_review").length,
      verified: professionals.filter(p => p.verificationStatus === "verified").length,
      rejected: professionals.filter(p => p.verificationStatus === "rejected").length
    }

    return NextResponse.json({
      success: true,
      professionals: formattedProfessionals,
      stats,
      count: formattedProfessionals.length
    })
  } catch (error) {
    console.error("Error fetching professionals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
