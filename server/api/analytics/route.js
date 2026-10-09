import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
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
    const timeframe = searchParams.get("timeframe") || "30d"
    const metric = searchParams.get("metric") || "bookings"

    if (decoded.type !== "admin" && decoded.type !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("servicefinder")

    let dateFilter = {}
    const now = new Date()

    switch (timeframe) {
      case "7d":
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case "30d":
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case "90d":
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case "1y":
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        break
    }

    let analytics = {}

    if (metric === "bookings") {
      const bookingAnalytics = await db
        .collection("bookings")
        .aggregate([
          { $match: { createdAt: dateFilter } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
              revenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$price", 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()

      analytics = { bookingTrends: bookingAnalytics }
    }

    if (metric === "users") {
      const userAnalytics = await db
        .collection("users")
        .aggregate([
          { $match: { joinedAt: dateFilter } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$joinedAt" },
              },
              newUsers: { $sum: 1 },
              professionals: { $sum: { $cond: [{ $eq: ["$type", "professional"] }, 1, 0] } },
              customers: { $sum: { $cond: [{ $eq: ["$type", "customer"] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()

      analytics = { userGrowth: userAnalytics }
    }

    if (metric === "revenue") {
      const revenueAnalytics = await db
        .collection("bookings")
        .aggregate([
          {
            $match: {
              status: "completed",
              completedAt: dateFilter,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
              },
              revenue: { $sum: "$price" },
              bookings: { $sum: 1 },
              averageValue: { $avg: "$price" },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()

      analytics = { revenueTrends: revenueAnalytics }
    }

    return NextResponse.json({
      success: true,
      analytics,
      timeframe,
      metric,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
