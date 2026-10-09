import { NextResponse } from "next/server"

// Marketplace API disabled
export async function GET() {
  return NextResponse.json({ error: "Marketplace API disabled" }, { status: 404 })
}
