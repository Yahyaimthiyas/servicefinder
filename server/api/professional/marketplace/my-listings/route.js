import { NextResponse } from "next/server"

// Marketplace my-listings API disabled
export async function GET() {
  return NextResponse.json({ error: "Marketplace API disabled" }, { status: 404 })
}
