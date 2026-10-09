import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
import { Service } from "../../models/Service.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const client = await clientPromise
    const db = client.db("servicefinder")

    const filters = {}
    if (category) filters.category = category
    if (search) filters.search = search

    const services = await Service.findAll(db, filters)

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("Services fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const serviceData = await request.json()

    const client = await clientPromise
    const db = client.db("servicefinder")

    const service = await Service.create(db, serviceData)

    return NextResponse.json(
      {
        success: true,
        service,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Service creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
