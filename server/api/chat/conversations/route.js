import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { Chat } from "../../../models/Chat.js"
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
    
    console.log("🔍 Decoded token:", decoded)
    
    const db = await connectDB()
    
    // Convert userId to ObjectId if it's a string
    let userId = decoded.userId
    if (typeof userId === 'string') {
      try {
        userId = new ObjectId(userId)
      } catch (error) {
        console.log("❌ Invalid ObjectId format:", userId)
        return { error: "Invalid user ID format", status: 400 }
      }
    }
    
    console.log("🔍 Looking for user with ID:", userId)
    const user = await db.collection("users").findOne({ _id: userId })
    
    if (!user) {
      console.log("❌ User not found in database")
      // Let's see what users exist
      const allUsers = await db.collection("users").find({}).limit(5).toArray()
      console.log("📋 Available users:", allUsers.map(u => ({ id: u._id, name: u.name, email: u.email })))
      return { error: "User not found", status: 404 }
    }
    
    console.log("✅ User found:", user.name, user.email, user.type)
    
    return { user, db, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET /api/chat/conversations - Get all conversations for a user
export async function GET(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    
    console.log("🔍 Fetching conversations for user:", user.name, user.type, user._id)
    
    // Get conversations for this user
    const conversations = await Chat.findByUser(db, user._id, user.type)
    
    console.log("✅ Found conversations:", conversations.length)
    
    return NextResponse.json({
      success: true,
      conversations
    })
  } catch (error) {
    console.error("❌ Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Create or get existing conversation
export async function POST(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { otherUserId, bookingId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
    }

    let customerId, professionalId
    
    if (user.type === "customer") {
      customerId = user._id
      professionalId = otherUserId
    } else {
      customerId = otherUserId
      professionalId = user._id
    }

    // Check if conversation already exists
    let conversation = await Chat.findByParticipants(db, customerId, professionalId)
    
    if (!conversation) {
      // Create new conversation
      const chatData = {
        customerId,
        professionalId,
        bookingId: bookingId || null
      }
      
      conversation = await Chat.create(db, chatData)
    }

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error("❌ Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
