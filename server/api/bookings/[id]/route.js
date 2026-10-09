import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { Booking } from "../../../models/Booking.js"
import jwt from "jsonwebtoken"

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, process.env.JWT_SECRET || "demo-secret")
}

export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request)
    const { id } = params

    const client = await clientPromise
    const db = client.db("servicefinder")

    const booking = await Booking.findById(db, id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user has access to this booking
    if (
      booking.customerId.toString() !== decoded.userId &&
      booking.professionalId.toString() !== decoded.userId &&
      decoded.type !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error("Booking fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const decoded = verifyToken(request)
    const { id } = params
    const updateData = await request.json()

    const client = await clientPromise
    const db = client.db("servicefinder")

    const booking = await Booking.findById(db, id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check permissions
    if (
      booking.customerId.toString() !== decoded.userId &&
      booking.professionalId.toString() !== decoded.userId &&
      decoded.type !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updated = await booking.update(db, updateData)
    if (!updated) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    })
  } catch (error) {
    console.error("Booking update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
