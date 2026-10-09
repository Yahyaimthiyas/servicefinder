import { NextResponse } from "next/server"
import { connectDB } from "../../../../config/mongodb.js"
import { Chat } from "../../../../models/Chat.js"
import { ObjectId } from "mongodb"
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
    
    const db = await connectDB()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    
    if (!user || user.type !== "professional") {
      return { error: "Access denied", status: 403 }
    }
    
    return { user, db, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// POST /api/professional/chat/start - Start a chat with a customer (from professional side)
export async function POST(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const { customerId, customerEmail, bookingId, initialMessage } = await request.json()

    console.log("🔍 Professional chat start request:", { customerId, customerEmail, bookingId, initialMessage })

    let customerObjectId = null

    // Try to find customer by email first (most reliable)
    if (customerEmail) {
      const customer = await db.collection("users").findOne({ 
        email: customerEmail,
        type: "customer"
      })
      if (customer) {
        customerObjectId = customer._id
        console.log("✅ Found customer by email:", customer.name, customer._id)
      } else {
        console.log("❌ Customer not found by email:", customerEmail)
      }
    }
    
    // If not found by email, try by ID
    if (!customerObjectId && customerId) {
      try {
        customerObjectId = new ObjectId(customerId)
        const customer = await db.collection("users").findOne({ 
          _id: customerObjectId,
          type: "customer"
        })
        if (customer) {
          console.log("✅ Found customer by ID:", customer.name, customer._id)
        } else {
          console.log("❌ Customer not found by ID:", customerId)
          customerObjectId = null
        }
      } catch (error) {
        console.log("❌ Invalid customer ID format:", customerId)
        customerObjectId = null
      }
    }

    if (!customerObjectId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Verify the customer exists
    const customer = await db.collection("users").findOne({ 
      _id: customerObjectId,
      type: "customer"
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check if conversation already exists
    let conversation = await Chat.findByParticipants(db, customerObjectId, user._id)
    
    if (conversation) {
      console.log("✅ Found existing conversation:", conversation.conversationId)
    } else {
      console.log("🔄 Creating new conversation...")
      // Create new conversation
      const chatData = {
        customerId: customerObjectId,
        professionalId: user._id,
        bookingId: bookingId ? new ObjectId(bookingId) : null
      }
      
      conversation = await Chat.create(db, chatData)
      console.log("✅ Created new conversation:", conversation.conversationId)
    }

    // If there's an initial message, send it
    if (initialMessage && initialMessage.trim()) {
      console.log("💬 Sending initial message:", initialMessage)
      const { Message } = await import("../../../../../models/Chat.js")
      
      const messageData = {
        conversationId: conversation.conversationId,
        senderId: user._id,
        senderType: user.type,
        message: initialMessage,
        messageType: "text"
      }

      const newMessage = await Message.create(db, messageData)
      console.log("✅ Message created:", newMessage._id)
      
      await conversation.updateLastMessage(db, initialMessage, new Date())
      await conversation.incrementUnreadCount(db, "customer")
      console.log("✅ Conversation updated with last message")
    }

    return NextResponse.json({
      success: true,
      conversation,
      customer: {
        name: customer.name,
        email: customer.email
      },
      redirectUrl: `/professional/chat?conversation=${conversation.conversationId}`
    })
  } catch (error) {
    console.error("❌ Error starting professional chat:", error)
    return NextResponse.json(
      { error: "Failed to start chat" },
      { status: 500 }
    )
  }
}
