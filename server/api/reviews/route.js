import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
import { Review } from "../../models/Review.js"
import jwt from "jsonwebtoken"

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, process.env.JWT_SECRET || "demo-secret")
}

export async function POST(request) {
  try {
    const decoded = verifyToken(request)
    const reviewData = await request.json()

    const client = await clientPromise
    const db = client.db("servicefinder")

    const review = await Review.create(db, {
      ...reviewData,
      customerId: decoded.userId,
    })

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Review creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get("professionalId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!professionalId) {
      return NextResponse.json({ error: "Professional ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("servicefinder")

    const reviews = await Review.findByProfessional(db, professionalId, limit)

    return NextResponse.json({
      success: true,
      reviews,
    })
  } catch (error) {
    console.error("Reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
