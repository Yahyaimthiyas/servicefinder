import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"

// GET /api/professional/emergency-bookings
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult

    const pipeline = [
      {
        $match: {
          professionalId: user._id,
          isEmergency: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $project: {
          _id: 1,
          address: 1,
          serviceType: "$serviceName",
          description: 1,
          status: 1,
          price: 1,
          createdAt: 1,
          urgencyLevel: { $ifNull: ["$urgencyLevel", "medium"] },
          distance: { $ifNull: ["$distance", 0] },
          customerName: { $arrayElemAt: ["$customer.name", 0] },
          customerPhone: { $arrayElemAt: ["$customer.phone", 0] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]

    const raw = await db.collection("bookings").aggregate(pipeline).toArray()

    const bookings = raw.map((b) => ({
      _id: b._id.toString(),
      customerName: b.customerName || "Unknown",
      customerPhone: b.customerPhone || "",
      address: b.address || "",
      serviceType: b.serviceType || "Emergency Service",
      urgencyLevel: b.urgencyLevel || "medium",
      description: b.description || "",
      requestedTime: b.createdAt || new Date(),
      estimatedPrice: b.price || 0,
      status: b.status || "pending",
      distance: typeof b.distance === "number" ? b.distance : 0,
    }))

    return NextResponse.json({
      success: true,
      bookings,
      totalCount: bookings.length,
    })
  } catch (error) {
    console.error("❌ Error fetching emergency bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency bookings" },
      { status: 500 }
    )
  }
}
