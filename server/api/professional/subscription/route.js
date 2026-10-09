import { NextResponse } from "next/server"
import { connectDB } from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import jwt from "jsonwebtoken"

// Verify professional access
async function verifyProfessionalAccess(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No valid authorization header", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    
    await connectDB()
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== "professional") {
      return { error: "Access denied", status: 403 }
    }
    
    return { user, status: 200 }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET /api/professional/subscription
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult

    // Get real subscription data from user
    const currentPlan = user.subscriptionPlan || "basic"
    
    const subscription = {
      currentPlan: currentPlan,
      planDetails: {
        basic: {
          name: "Basic",
          price: 0,
          features: [
            "5 bookings per month",
            "Basic profile listing",
            "Customer reviews",
            "Email support"
          ],
          limits: {
            bookings: 5,
            profileImages: 3,
            portfolioImages: 5
          }
        },
        professional: {
          name: "Professional", 
          price: 299,
          features: [
            "Unlimited bookings",
            "Featured profile listing",
            "Priority customer support",
            "Advanced analytics",
            "Custom pricing",
            "Portfolio showcase"
          ],
          limits: {
            bookings: -1, // unlimited
            profileImages: 10,
            portfolioImages: 20
          }
        },
        premium: {
          name: "Premium",
          price: 599,
          features: [
            "Everything in Professional",
            "Top search ranking",
            "24/7 phone support",
            "AI-powered insights",
            "Emergency service badge",
            "Marketing tools",
            "Revenue optimization"
          ],
          limits: {
            bookings: -1, // unlimited
            profileImages: -1, // unlimited
            portfolioImages: -1 // unlimited
          }
        }
      },
      usage: {
        bookingsThisMonth: 0, // Will be fetched from real data
        profileViews: 0,
        portfolioImages: user.portfolio ? user.portfolio.length : 0,
        customerInquiries: 0
      },
      billingHistory: [], // Only show billing history for paid plans
      nextBilling: currentPlan === "basic" ? null : {
        date: user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: currentPlan === "professional" ? 299 : 599,
        plan: currentPlan
      }
    }

    return NextResponse.json({ 
      success: true, 
      subscription
    })
  } catch (error) {
    console.error("❌ Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
