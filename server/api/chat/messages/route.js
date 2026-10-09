import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { Chat, Message } from "../../../models/Chat.js"
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
    
    // Convert userId to ObjectId if it's a string
    let userId = decoded.userId
    if (typeof userId === 'string') {
      try {
        userId = new ObjectId(userId)
      } catch (error) {
        return { error: "Invalid user ID format", status: 400 }
      }
    }
    
    const user = await db.collection("users").findOne({ _id: userId })
    
    if (!user) {
      return { error: "User not found", status: 404 }
    }
    
    return { user, db, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
export async function GET(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Verify user has access to this conversation
    const conversation = await Chat.findByConversationId(db, conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Check if user is participant in this conversation
    const isParticipant = conversation.customerId.toString() === user._id.toString() || 
                         conversation.professionalId.toString() === user._id.toString()
    
    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get messages
    const messages = await Message.findByConversation(db, conversationId, limit, offset)
    
    // Mark messages as read for this user
    await conversation.markAsRead(db, user.type)

    return NextResponse.json({
      success: true,
      messages,
      conversationId
    })
  } catch (error) {
    console.error("❌ Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request) {
  try {
    const authResult = await verifyUserAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { conversationId, message, messageType = "text", attachments = [], metadata = {} } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Conversation ID and message are required" }, { status: 400 })
    }

    // Verify conversation exists and user has access
    const conversation = await Chat.findByConversationId(db, conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const isParticipant = conversation.customerId.toString() === user._id.toString() || 
                         conversation.professionalId.toString() === user._id.toString()
    
    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create message
    const messageData = {
      conversationId,
      senderId: user._id,
      senderType: user.type,
      message,
      messageType,
      attachments,
      metadata
    }

    const newMessage = await Message.create(db, messageData)
    
    // Update conversation's last message
    await conversation.updateLastMessage(db, message, newMessage.createdAt)
    
    // Increment unread count for the other user
    const otherUserType = user.type === "customer" ? "professional" : "customer"
    await conversation.incrementUnreadCount(db, otherUserType)

    // Get the complete message with sender info
    const messages = await Message.findByConversation(db, conversationId, 1, 0)
    const messageWithSender = messages[0]

    // Send real-time notification via WebSocket
    try {
      const { chatWebSocket } = await import("../../../../config/websocket.js")
      chatWebSocket.broadcastNewMessage(conversationId, messageWithSender, user._id.toString())
    } catch (error) {
      console.log("WebSocket not available:", error.message)
    }

    return NextResponse.json({
      success: true,
      message: messageWithSender,
      conversationId
    })
  } catch (error) {
    console.error("❌ Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
