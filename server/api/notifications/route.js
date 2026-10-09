import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

function verifyToken(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, process.env.JWT_SECRET || "demo-secret")
}

export async function GET(request) {
  try {
    const decoded = verifyToken(request)
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const client = await clientPromise
    const db = client.db("servicefinder")

    const query = { userId: new ObjectId(decoded.userId) }
    if (unreadOnly) {
      query.read = false
    }

    const notifications = await db
      .collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request) {
  try {
    const notificationData = await request.json()

    const client = await clientPromise
    const db = client.db("servicefinder")

    const notification = {
      ...notificationData,
      _id: new ObjectId(),
      createdAt: new Date(),
      read: false,
    }

    await db.collection("notifications").insertOne(notification)

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Notification creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const decoded = verifyToken(request)
    const { notificationIds, markAsRead } = await request.json()

    const client = await clientPromise
    const db = client.db("servicefinder")

    const query = {
      _id: { $in: notificationIds.map((id) => new ObjectId(id)) },
      userId: new ObjectId(decoded.userId),
    }

    await db.collection("notifications").updateMany(query, {
      $set: { read: markAsRead, updatedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: "Notifications updated successfully",
    })
  } catch (error) {
    console.error("Notifications update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
