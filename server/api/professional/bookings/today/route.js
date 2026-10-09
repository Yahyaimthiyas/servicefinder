import { NextResponse } from "next/server"
import { connectDB } from "../../../../config/mongodb.js"
import { ObjectId } from "mongodb"
import { verifyProfessionalAccess } from "../../../../lib/auth-utils.js"

// GET /api/professional/bookings/today
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const db = await connectDB()
    
    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Fetch real bookings for today
    const todayBookings = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId: new ObjectId(user._id),
            scheduledDate: {
              $gte: startOfDay.toISOString().split('T')[0],
              $lt: endOfDay.toISOString().split('T')[0]
            },
            status: { $in: ["pending", "confirmed"] }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customerId",
            foreignField: "_id",
            as: "customer"
          }
        },
        {
          $project: {
            _id: 1,
            customerName: { $arrayElemAt: ["$customer.name", 0] },
            customerPhone: { $arrayElemAt: ["$customer.phone", 0] },
            address: 1,
            coordinates: 1,
            serviceType: "$serviceName",
            scheduledTime: 1,
            estimatedDuration: "$duration",
            priority: { $ifNull: ["$priority", "medium"] },
            status: 1
          }
        },
        { $sort: { scheduledTime: 1 } }
      ])
      .toArray()

    return NextResponse.json({ 
      success: true, 
      bookings: todayBookings,
      totalCount: todayBookings.length
    })
  } catch (error) {
    console.error("❌ Error fetching today's bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch today's bookings" },
      { status: 500 }
    )
  }
}
