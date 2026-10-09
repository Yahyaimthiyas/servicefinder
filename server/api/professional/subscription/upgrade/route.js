import { NextResponse } from "next/server"
import { connectDB } from "../../../../config/mongodb.js"
import { User } from "../../../../models/User.js"
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

// POST /api/professional/subscription/upgrade
export async function POST(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const { plan, paymentMethod } = await request.json()

    console.log(`📋 Upgrading subscription for ${user.name} to ${plan}`)

    // In a real app, this would:
    // 1. Process payment
    // 2. Update user subscription in database
    // 3. Send confirmation email
    
    // Update user subscription in database
    const db = await connectDB()
    const updateResult = await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: {
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          updatedAt: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${plan} plan`,
      transaction: {
        id: `txn_${Date.now()}`,
        plan: plan,
        amount: plan === "professional" ? 299 : 599,
        status: "completed",
        date: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("❌ Error upgrading subscription:", error)
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    )
  }
}
