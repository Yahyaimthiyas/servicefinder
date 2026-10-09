import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"
import { connectDB } from "../../../config/mongodb.js"
import { ObjectId } from "mongodb"

// GET /api/professional/usage-stats
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult
    const db = await connectDB()
    const professionalId = new ObjectId(user._id)
    
    // Get current month's start date
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Get bookings this month
    const bookingsThisMonth = await db.collection("bookings")
      .countDocuments({
        professionalId,
        createdAt: { $gte: startOfMonth }
      })
    
    // Get profile views this month (would need tracking implementation)
    // For now, return 0 as we don't have profile view tracking
    const profileViewsThisMonth = 0
    
    // Get portfolio images count
    const portfolioImagesUsed = user.portfolio ? user.portfolio.length : 0

    const usage = {
      bookingsThisMonth,
      profileViewsThisMonth,
      portfolioImagesUsed
    }

    return NextResponse.json({ 
      success: true, 
      usage 
    })
  } catch (error) {
    console.error("❌ Error fetching usage stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    )
  }
}
