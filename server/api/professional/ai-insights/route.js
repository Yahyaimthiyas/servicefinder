import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"
import { Booking } from "../../../models/Booking.js"

// GET /api/professional/ai-insights
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const professionalId = user._id

    // Overall booking stats for this professional
    const bookingStats = await Booking.getStats(db, { professionalId })
    const totalBookings = bookingStats.total || 0
    const completedBookings = bookingStats.completed || 0
    const totalRevenue = bookingStats.totalRevenue || 0
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
    const averageJobValue = completedBookings > 0 ? totalRevenue / completedBookings : 0

    // Service-level stats
    const serviceAgg = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            professionalId,
          },
        },
        {
          $group: {
            _id: "$serviceName",
            bookings: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$price", 0] } },
          },
        },
        { $sort: { bookings: -1 } },
      ])
      .toArray()

    const topService = serviceAgg[0] || null

    const insights = []

    // Pricing insight based on average job value
    if (completedBookings > 0) {
      const currentAvg = Math.round(averageJobValue)
      const potentialAvg = Math.round(currentAvg * 1.1)
      const improvement = potentialAvg - currentAvg

      insights.push({
        id: "pricing-avg-job",
        type: "pricing",
        title: topService?._id
          ? `Optimize pricing for ${topService._id}`
          : "Optimize your service pricing",
        description:
          `You have completed ${completedBookings} jobs with an average value of ₹${currentAvg.toLocaleString()}. ` +
          "A small price adjustment could improve your earnings.",
        impact: "medium",
        confidence: Math.min(95, 60 + completedBookings * 2),
        actionable: true,
        recommendation: `Consider increasing your average job value by about 10% to ₹${potentialAvg.toLocaleString()}.`,
        metrics: {
          current: currentAvg,
          potential: potentialAvg,
          improvement: `+₹${improvement.toLocaleString()} per job`,
        },
      })
    }

    // Demand insight based on the most booked service
    if (topService) {
      const demandShare = totalBookings > 0 ? Math.round((topService.bookings / totalBookings) * 100) : 0

      insights.push({
        id: "demand-top-service",
        type: "demand",
        title: `High demand for ${topService._id}`,
        description:
          `${topService._id} accounts for ${demandShare}% of your bookings ` +
          `(${topService.bookings} out of ${totalBookings} total).`,
        impact: demandShare >= 40 ? "high" : "medium",
        confidence: 80,
        actionable: true,
        recommendation:
          "Highlight this service in your profile and consider premium pricing or add-on packages.",
        metrics: {
          current: topService.bookings,
          potential: topService.bookings + 2,
          improvement: "+2 bookings (estimate)",
        },
      })
    }

    // Performance insight from completion rate
    if (totalBookings > 0) {
      const targetCompletion = 90
      const potentialExtraJobs =
        completionRate < targetCompletion
          ? Math.round(((targetCompletion - completionRate) / 100) * totalBookings)
          : 0

      insights.push({
        id: "performance-completion",
        type: "performance",
        title: "Improve completion rate",
        description:
          `Your job completion rate is ${completionRate}% across ${totalBookings} bookings. ` +
          "Improving this can directly increase your completed jobs and earnings.",
        impact: completionRate < 80 ? "high" : "medium",
        confidence: 75,
        actionable: true,
        recommendation:
          "Confirm bookings quickly, reduce cancellations, and follow up on pending jobs to raise your completion rate.",
        metrics: {
          current: completionRate,
          potential: targetCompletion,
          improvement: potentialExtraJobs > 0
            ? `≈${potentialExtraJobs} more completed jobs`
            : "Already near target",
        },
      })
    }

    // Build marketTrends from service aggregation
    const maxBookings = serviceAgg.reduce((max, s) => Math.max(max, s.bookings), 0)

    const marketTrends = serviceAgg.slice(0, 5).map((s) => {
      const demand = maxBookings > 0 ? Math.round((s.bookings / maxBookings) * 100) : 0
      const opportunity = demand >= 70 ? "high" : demand >= 40 ? "medium" : "low"
      return {
        service: s._id || "Service",
        demand,
        growth: 0,
        competition: 0,
        opportunity,
        seasonality: "Data not available yet",
      }
    })

    // Simple performance metrics for the performance tab
    const averageRating = user.rating || 0
    const performanceMetrics = [
      {
        metric: "Completion Rate",
        current: completionRate,
        benchmark: 90,
        trend: "stable",
        recommendation:
          "Aim for at least 90% completion rate by reducing cancellations and no-shows.",
      },
      {
        metric: "Average Rating",
        current: averageRating,
        benchmark: 4.5,
        trend: "stable",
        recommendation:
          "Request reviews from happy customers and respond politely to all feedback.",
      },
    ]

    const averageConfidence =
      insights.length > 0
        ? Math.round(
            insights.reduce((sum, i) => sum + (i.confidence || 0), 0) / insights.length
          )
        : 0

    return NextResponse.json({
      success: true,
      insights,
      marketTrends,
      performanceMetrics,
      summary: {
        totalInsights: insights.length,
        highImpact: insights.filter((i) => i.impact === "high").length,
        actionableItems: insights.filter((i) => i.actionable).length,
        averageConfidence,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching AI insights:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI insights" },
      { status: 500 }
    )
  }
}
