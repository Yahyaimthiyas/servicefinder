import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"

export async function POST(request) {
  try {
    const requestData = await request.json()
    const { name, email, password, type, phone } = requestData

    if (!name || !email || !password || !type) {
      return NextResponse.json({ error: "Name, email, password, and type are required" }, { status: 400 })
    }

    // Prevent admin type registration through API
    if (type === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be created through registration" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("servicefinder")
    
    // Check if user already exists
    const existingUser = await User.findByEmail(db, email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      type,
      phone,
      isVerified: type === "admin", // Only admin is auto-verified
    }

    // For professionals, set initial verification status
    if (type === "professional") {
      userData.verificationStatus = "pending_documents"
      userData.isVerified = false
      userData.mobileVerified = requestData.isPhoneVerified || false
      userData.documentsSubmitted = false
      userData.canReceiveBookings = false
    }

    const newUser = await User.create(db, userData)

    // Create JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        type: newUser.type,
      },
      process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        token,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
