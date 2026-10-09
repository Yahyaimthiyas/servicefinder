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
    
    const db = await connectDB()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    
    if (!user) {
      return { error: "User not found", status: 404 }
    }
    
    return { user, db, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// POST /api/chat/start - Start a chat with a professional (from booking)
export async function POST(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { professionalId, bookingId, initialMessage } = await request.json()

    if (!professionalId) {
      return NextResponse.json({ error: "Professional ID is required" }, { status: 400 })
    }

    // Verify the professional exists
    const professional = await db.collection("users").findOne({ 
      _id: new ObjectId(professionalId),
      type: "professional"
    })

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    let customerId, profId
    
    if (user.type === "customer") {
      customerId = user._id
      profId = new ObjectId(professionalId)
    } else {
      return NextResponse.json({ error: "Only customers can start chats with professionals" }, { status: 403 })
    }

    // Check if conversation already exists
    let conversation = await Chat.findByParticipants(db, customerId, profId)
    
    if (!conversation) {
      // Create new conversation
      const chatData = {
        customerId,
        professionalId: profId,
        bookingId: bookingId ? new ObjectId(bookingId) : null
      }
      
      conversation = await Chat.create(db, chatData)
    }

    // If there's an initial message, send it
    if (initialMessage && initialMessage.trim()) {
      const { Message } = await import("../../../../models/Chat.js")
      
      const messageData = {
        conversationId: conversation.conversationId,
        senderId: user._id,
        senderType: user.type,
        message: initialMessage,
        messageType: "text"
      }

      await Message.create(db, messageData)
      await conversation.updateLastMessage(db, initialMessage, new Date())
      await conversation.incrementUnreadCount(db, "professional")
    }

    return NextResponse.json({
      success: true,
      conversation,
      redirectUrl: `/customer/chat?conversation=${conversation.conversationId}`
    })
  } catch (error) {
    console.error("❌ Error starting chat:", error)
    return NextResponse.json(
      { error: "Failed to start chat" },
      { status: 500 }
    )
  }
}
