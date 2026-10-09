import { NextResponse } from "next/server"
import { connectDB } from "../../config/mongodb.js"
import jwt from "jsonwebtoken"

// Simple test endpoint to check chat functionality
export async function GET(request) {
  try {
    console.log("🧪 Test chat endpoint called")
    
    // Check authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    console.log("✅ Token decoded:", decoded)
    
    // Connect to database
    const db = await connectDB()
    
    // Find user
    const user = await db.collection("users").findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    console.log("✅ User found:", user.name, user.type)
    
    // Get conversations for this user
    const field = user.type === "customer" ? "customerId" : "professionalId"
    const conversations = await db.collection("chats").find({
      [field]: user._id,
      status: "active"
    }).toArray()
    
    console.log(`✅ Found ${conversations.length} conversations for ${user.name}`)
    
    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        type: user.type,
        id: user._id
      },
      conversationsCount: conversations.length,
      conversations: conversations.map(c => ({
        id: c.conversationId,
        lastMessage: c.lastMessage,
        lastMessageTime: c.lastMessageTime
      }))
    })
    
  } catch (error) {
    console.error("❌ Test chat endpoint error:", error)
    return NextResponse.json(
      { error: "Test failed", details: error.message },
      { status: 500 }
    )
  }
}
