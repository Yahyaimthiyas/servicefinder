import { NextResponse } from "next/server"
import seedDatabase from "../../../scripts/seed-database.js"

export async function POST() {
  try {
    console.log("🌱 Starting database seeding via API...")
    const result = await seedDatabase()
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      ...result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to seed database",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to seed the database",
    endpoint: "/api/database/seed",
    method: "POST"
  })
}
