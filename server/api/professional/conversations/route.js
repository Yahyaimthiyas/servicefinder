import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
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

// GET /api/professional/conversations
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Mock conversations
    const conversations = [
      {
        _id: "1",
        customerName: "John Smith",
        customerAvatar: "",
        lastMessage: "Thank you for the excellent service! The kitchen plumbing is working perfectly now.",
        lastMessageTime: "2024-01-22T16:30:00Z",
        unreadCount: 0,
        bookingId: "1",
        serviceType: "Kitchen Plumbing",
        status: "completed"
      },
      {
        _id: "2",
        customerName: "Sarah Johnson",
        customerAvatar: "",
        lastMessage: "What time will you arrive tomorrow?",
        lastMessageTime: "2024-01-22T14:45:00Z",
        unreadCount: 1,
        bookingId: "2",
        serviceType: "Bathroom Repair",
        status: "active"
      },
      {
        _id: "3",
        customerName: "Mike Wilson",
        customerAvatar: "",
        lastMessage: "Professional: I'll be there in 15 minutes",
        lastMessageTime: "2024-01-21T17:30:00Z",
        unreadCount: 0,
        bookingId: "3",
        serviceType: "Emergency Plumbing",
        status: "completed"
      }
    ]

    return NextResponse.json({ 
      success: true, 
      conversations,
      totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0)
    })
  } catch (error) {
    console.error("❌ Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
