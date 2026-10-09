import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid professional ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("servicefinder")

    // Find the professional by ID and ensure they are verified
    const professional = await User.findById(db, id)

    if (!professional || professional.type !== "professional") {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 })
    }

    // Only return verified professionals to customers
    if (professional.verificationStatus !== "verified" && professional.verificationStatus !== "approved") {
      return NextResponse.json({ error: "Professional not available" }, { status: 404 })
    }

    // Get reviews for this professional (mock for now, can be implemented later)
    const reviews = [
      {
        id: "1",
        customerName: "John Doe",
        rating: 5,
        comment: "Excellent service! Very professional and timely.",
        date: "2024-01-15",
        service: "Plumbing Repair"
      },
      {
        id: "2", 
        customerName: "Sarah Wilson",
        rating: 4,
        comment: "Good work, would recommend.",
        date: "2024-01-10",
        service: "Home Cleaning"
      }
    ]

    // Remove sensitive information
    const { password, verificationDocuments, ...safeProfessional } = professional

    return NextResponse.json({
      success: true,
      professional: safeProfessional,
      reviews
    })
  } catch (error) {
    console.error("Professional fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
