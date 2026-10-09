import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"

// GET /api/professional/analytics
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Mock analytics data
    const analytics = {
      performanceMetrics: {
        responseTime: "2.3 hours",
        completionRate: "98%",
        customerSatisfaction: "4.9/5",
        repeatCustomers: "65%",
        onTimeDelivery: "94%",
        cancellationRate: "2%"
      },
      businessInsights: {
        peakHours: ["9 AM - 12 PM", "2 PM - 6 PM"],
        popularServices: [
          { service: "Emergency Plumbing", bookings: 45, revenue: 13500 },
          { service: "Kitchen Plumbing", bookings: 32, revenue: 9600 },
          { service: "Bathroom Repair", bookings: 28, revenue: 8400 }
        ],
        customerDemographics: {
          ageGroups: {
            "25-35": 35,
            "35-45": 40,
            "45-55": 20,
            "55+": 5
          },
          locations: [
            { area: "Andheri", bookings: 25 },
            { area: "Bandra", bookings: 20 },
            { area: "Powai", bookings: 15 }
          ]
        }
      },
      growthMetrics: {
        monthlyGrowth: "+15%",
        customerGrowth: "+22%",
        revenueGrowth: "+18%",
        ratingImprovement: "+0.3"
      },
      recommendations: [
        {
          type: "pricing",
          title: "Increase Emergency Service Rates",
          description: "Your emergency services are in high demand. Consider increasing rates by 10-15%.",
          impact: "Potential +₹2,000/month"
        },
        {
          type: "schedule",
          title: "Optimize Peak Hours",
          description: "Most bookings occur between 9 AM - 12 PM. Consider blocking this time for premium services.",
          impact: "Better time management"
        },
        {
          type: "service",
          title: "Add Bathroom Renovation",
          description: "High demand for bathroom services in your area. Consider expanding services.",
          impact: "Potential +₹5,000/month"
        }
      ]
    }

    return NextResponse.json({ 
      success: true, 
      analytics
    })
  } catch (error) {
    console.error("❌ Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
