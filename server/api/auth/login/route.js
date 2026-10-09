import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"

export async function POST(request) {
  try {
    const { email, password, userType } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findByEmail(db, email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if trying to login as admin but user is not admin
    if (userType === "admin" && user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Simple password comparison for demo - in production use bcrypt
    if (password !== user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    try {
      await user.update(db, { lastLoginAt: new Date() })
    } catch (error) {
      console.warn("Failed to update last login:", error)
    }

    // Create JWT token (in production, use proper JWT secret)
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: user.type,
      },
      process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
