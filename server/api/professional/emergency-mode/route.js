import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"

// POST /api/professional/emergency-mode
export async function POST(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult
    const body = await request.json()
    const enabled = Boolean(body.enabled)

    const update = {
      "emergencySettings.enabled": enabled,
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: update }
    )

    return NextResponse.json({
      success: true,
      emergencyMode: enabled,
    })
  } catch (error) {
    console.error("❌ Error updating emergency mode:", error)
    return NextResponse.json(
      { error: "Failed to update emergency mode" },
      { status: 500 }
    )
  }
}
