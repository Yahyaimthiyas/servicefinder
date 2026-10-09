import { NextResponse } from "next/server"
import clientPromise from "../../../../../config/mongodb.js"
import { User } from "../../../../../models/User.js"
import { Booking } from "../../../../../models/Booking.js"
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

// PUT /api/professional/bookings/[id]/status
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = params
    const { status, notes } = await request.json()

    console.log(`📋 Updating booking ${id} status to: ${status}`)

    // Update booking in database
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const booking = await Booking.findById(db, id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify the booking belongs to this professional
    const professionalIdStr = booking.professionalId?.toString() || ""
    const userIdStr = authResult.userId?.toString() || ""
    
    if (professionalIdStr !== userIdStr) {
      console.log("Access denied - Professional ID mismatch:", { 
        bookingProfessionalId: professionalIdStr, 
        userId: userIdStr 
      })
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update booking status
    const success = await booking.updateStatus(db, status, { notes })
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      booking: { ...booking, status, notes },
      message: `Booking status updated to ${status}`
    })
  } catch (error) {
    console.error("❌ Error updating booking status:", error)
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    )
  }
}
