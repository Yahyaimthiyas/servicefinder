import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"

// GET /api/professional/emergency-settings
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult

    // Load latest user document to access emergencySettings
    const userDoc = await db.collection("users").findOne({ _id: user._id })
    const settings = userDoc?.emergencySettings || {}

    const emergencyMode = Boolean(settings.enabled)
    const radius = typeof settings.radius === "number" ? settings.radius : 10
    const rate = typeof settings.rate === "number" ? settings.rate : 1.5
    const services = Array.isArray(settings.services) ? settings.services : []

    // Compute basic real-time stats from emergency bookings
    const emergencyBookings = await db
      .collection("bookings")
      .find({ professionalId: user._id, isEmergency: true })
      .toArray()

    const totalRequests = emergencyBookings.length
    const responded = emergencyBookings.filter((b) => b.status && b.status !== "pending").length
    const completed = emergencyBookings.filter((b) => b.status === "completed").length
    const earnings = emergencyBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const stats = {
      responseRate: totalRequests > 0 ? Math.round((responded / totalRequests) * 100) : 0,
      avgResponseTimeMinutes: null, // Not tracked yet, so return null instead of mock
      rating: user.rating || 0,
      earnings,
      totalRequests,
      completedRequests: completed,
    }

    return NextResponse.json({
      success: true,
      emergencyMode,
      radius,
      rate,
      services,
      stats,
    })
  } catch (error) {
    console.error("❌ Error fetching emergency settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency settings" },
      { status: 500 }
    )
  }
}
