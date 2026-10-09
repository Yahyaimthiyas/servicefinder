import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"

// Initialize admin system - Create admin user and setup collections
export async function POST(request) {
  try {
    console.log("🚀 Initializing admin system...")
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    // Check if admin already exists
    const existingAdmin = await User.findByEmail(db, "admin@servicefinder.com")
    
    let adminCreated = false
    let adminUser = existingAdmin

    if (!existingAdmin) {
      // Create default admin user
      const adminData = {
        name: "Admin User",
        email: "admin@servicefinder.com",
        password: "admin123", // In production, use hashed password
        type: "admin",
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: null
      }

      adminUser = await User.create(db, adminData)
      adminCreated = true
      console.log("✅ Default admin created")
    }

    // Get system statistics
    const [
      totalUsers,
      totalProfessionals,
      verifiedProfessionals,
      pendingVerifications,
      totalBookings
    ] = await Promise.all([
      db.collection("users").countDocuments({ type: { $ne: "admin" } }),
      db.collection("users").countDocuments({ type: "professional" }),
      db.collection("users").countDocuments({ 
        type: "professional", 
        verificationStatus: "verified" 
      }),
      db.collection("users").countDocuments({ 
        type: "professional", 
        verificationStatus: { $in: ["pending_documents", "pending_admin_review"] }
      }),
      db.collection("bookings").countDocuments()
    ])

    // Create indexes for better performance
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      await db.collection("users").createIndex({ type: 1 })
      await db.collection("users").createIndex({ verificationStatus: 1 })
      console.log("📊 Database indexes created")
    } catch (error) {
      console.log("📊 Database indexes already exist")
    }

    const systemStats = {
      totalUsers,
      totalProfessionals,
      verifiedProfessionals,
      pendingVerifications,
      totalBookings,
      adminExists: !adminCreated,
      adminCreated
    }

    console.log("✅ Admin system initialized successfully")

    return NextResponse.json({
      success: true,
      message: adminCreated ? "Admin system initialized and default admin created" : "Admin system already initialized",
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        type: adminUser.type,
        created: adminCreated
      },
      systemStats
    })

  } catch (error) {
    console.error("❌ Error initializing admin system:", error)
    return NextResponse.json({ 
      error: "Failed to initialize admin system",
      details: error.message
    }, { status: 500 })
  }
}
