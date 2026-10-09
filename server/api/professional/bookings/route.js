import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { Booking } from "../../../models/Booking.js"
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret")
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)
    
    if (!user || user.type !== "professional") {
      return { error: "Access denied", status: 403 }
    }
    
    return { user, userId: decoded.userId, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET /api/professional/bookings
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get real bookings from database
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const bookings = await Booking.findByUser(db, authResult.userId, "professional")
    
    // Enrich bookings with customer information
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const customer = await User.findById(db, booking.customerId)
          return {
            ...booking,
            customerId: booking.customerId, // Ensure customerId is included
            customerName: customer?.name || "Unknown Customer",
            customerPhone: customer?.phone || "N/A",
            customerEmail: customer?.email || "N/A"
          }
        } catch (error) {
          console.error("Error fetching customer data for booking:", booking._id, error)
          return {
            ...booking,
            customerId: booking.customerId, // Ensure customerId is included
            customerName: "Unknown Customer",
            customerPhone: "N/A",
            customerEmail: "N/A"
          }
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      bookings: enrichedBookings,
      totalCount: enrichedBookings.length,
      stats: {
        total: enrichedBookings.length,
        pending: enrichedBookings.filter(b => b.status === 'pending').length,
        confirmed: enrichedBookings.filter(b => b.status === 'confirmed').length,
        completed: enrichedBookings.filter(b => b.status === 'completed').length,
        cancelled: enrichedBookings.filter(b => b.status === 'cancelled').length
      }
    })
  } catch (error) {
    console.error("❌ Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
