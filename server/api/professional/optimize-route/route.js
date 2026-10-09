import { NextResponse } from "next/server"

// Route optimization API disabled since Routes feature was removed from the UI
export async function POST() {
  return NextResponse.json({ error: "Route optimization API disabled" }, { status: 404 })
}
