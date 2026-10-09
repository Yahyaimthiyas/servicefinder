import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
import { User } from "../../models/User.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const servicesParam = searchParams.get("services")
    const services = servicesParam
      ? servicesParam.split(",").map((s) => s.toLowerCase())
      : undefined
    // Support both legacy `location` and new `district`/`state` params
    const districtParam = searchParams.get("district") || searchParams.get("location") || undefined
    const stateParam = searchParams.get("state") || undefined
    const rating = searchParams.get("rating") ? Number.parseFloat(searchParams.get("rating")) : null
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")) : 20

    const client = await clientPromise
    const db = client.db("servicefinder")

    const filters = { limit }
    if (services) filters.services = services
    if (districtParam) filters.location = districtParam
    if (stateParam) filters.state = stateParam
    if (rating) filters.rating = rating

    const professionals = await User.findProfessionals(db, filters)

    return NextResponse.json({
      success: true,
      professionals,
    })
  } catch (error) {
    console.error("Professionals fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
