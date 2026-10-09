import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { ObjectId } from "mongodb"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"

// GET /api/professional/earnings
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const db = await connectDB()
    
    // Calculate real earnings from completed bookings
    const professionalId = new ObjectId(user._id)
    
    // Get total earnings from completed bookings
    const totalEarningsResult = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: "completed"
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$price" },
            totalJobs: { $sum: 1 }
          }
        }
      ])
      .toArray()
    
    const totalEarnings = totalEarningsResult[0]?.totalEarnings || 0
    
    // Get this month's earnings
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const thisMonthResult = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: "completed",
            completedAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            earnings: { $sum: "$price" },
            jobs: { $sum: 1 }
          }
        }
      ])
      .toArray()
    
    const lastMonthResult = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: "completed",
            completedAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
          }
        },
        {
          $group: {
            _id: null,
            earnings: { $sum: "$price" },
            jobs: { $sum: 1 }
          }
        }
      ])
      .toArray()
    
    // Get pending payments
    const pendingResult = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: "completed",
            paymentStatus: { $ne: "paid" }
          }
        },
        {
          $group: {
            _id: null,
            pendingPayments: { $sum: "$price" }
          }
        }
      ])
      .toArray()
    
    // Get monthly data for last 5 months
    const monthlyData = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for (let i = 4; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthResult = await db.collection("bookings")
        .aggregate([
          {
            $match: {
              professionalId,
              status: "completed",
              completedAt: { $gte: monthStart, $lte: monthEnd }
            }
          },
          {
            $group: {
              _id: null,
              earnings: { $sum: "$price" },
              jobs: { $sum: 1 }
            }
          }
        ])
        .toArray()
      
      monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        earnings: monthResult[0]?.earnings || 0,
        jobs: monthResult[0]?.jobs || 0
      })
    }
    
    // Get recent transactions
    const recentTransactions = await db.collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
            status: { $in: ["completed", "confirmed"] }
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
            type: { $cond: [{ $eq: ["$status", "completed"] }, "payment", "pending"] },
            description: {
              $concat: [
                "$serviceName",
                " - ",
                { $arrayElemAt: ["$customer.name", 0] }
              ]
            },
            amount: "$price",
            date: { $ifNull: ["$completedAt", "$createdAt"] },
            status: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "completed", "pending"] }
          }
        },
        { $sort: { date: -1 } },
        { $limit: 10 }
      ])
      .toArray()
    
    const thisMonth = thisMonthResult[0]?.earnings || 0
    const lastMonth = lastMonthResult[0]?.earnings || 0
    const pendingPayments = pendingResult[0]?.pendingPayments || 0
    
    const earnings = {
      totalEarnings,
      thisMonth,
      lastMonth,
      pendingPayments,
      availableBalance: totalEarnings - pendingPayments,
      monthlyData,
      recentTransactions,
      paymentMethods: [], // Would come from user profile
      earningsBreakdown: {
        regularServices: totalEarnings,
        emergencyServices: 0, // Would need service type tracking
        subscriptionBonus: 0
      }
    }

    return NextResponse.json({ 
      success: true, 
      earnings
    })
  } catch (error) {
    console.error("❌ Error fetching earnings:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
}
