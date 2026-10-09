import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"

async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production")

    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)

    if (!user || user.type !== "admin") {
      return { error: "Admin access required", status: 403 }
    }

    return { user, db }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

export async function GET(request) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const statusParam = searchParams.get("status")
    const limit = Number.parseInt(limitParam || "50", 10)

    const match = {}
    if (statusParam && statusParam !== "all") {
      match.status = statusParam
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: Number.isNaN(limit) ? 50 : limit },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "professionalId",
          foreignField: "_id",
          as: "professional",
        },
      },
      {
        $project: {
          _id: 1,
          bookingId: 1,
          customerId: 1,
          professionalId: 1,
          serviceName: 1,
          serviceType: 1,
          status: 1,
          price: 1,
          totalCost: 1,
          scheduledDate: 1,
          scheduledTime: 1,
          createdAt: 1,
          customerName: { $arrayElemAt: ["$customer.name", 0] },
          professionalName: { $arrayElemAt: ["$professional.name", 0] },
        },
      },
    ]

    const bookings = await db.collection("bookings").aggregate(pipeline).toArray()

    const formatted = bookings.map((b) => ({
      _id: b._id,
      bookingId: b.bookingId || (b._id instanceof ObjectId ? b._id.toString() : String(b._id)),
      customerName: b.customerName || "Unknown Customer",
      professionalName: b.professionalName || "Unknown Professional",
      serviceName: b.serviceName || b.serviceType || "Service",
      status: b.status || "pending",
      scheduledDate: b.scheduledDate,
      scheduledTime: b.scheduledTime,
      amount: typeof b.price === "number" ? b.price : typeof b.totalCost === "number" ? b.totalCost : 0,
      createdAt: b.createdAt || null,
    }))

    return NextResponse.json({ success: true, bookings: formatted })
  } catch (error) {
    console.error("Admin bookings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
