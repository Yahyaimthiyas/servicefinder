import { NextResponse } from "next/server"
import { SMSService } from "../../../lib/sms-service.js"

// Debug endpoint to check OTP storage
export async function GET() {
  try {
    const storedOTPs = SMSService.getStoredOTPs()
    const healthCheck = SMSService.checkStorageHealth()
    
    return NextResponse.json({
      success: true,
      stored_otps: storedOTPs,
      storage_health: healthCheck,
      message: "Debug endpoint - current OTP storage",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Test OTP verification
export async function POST(request) {
  try {
    const { mobile, otp } = await request.json()
    
    console.log(`🧪 DEBUG: Testing OTP verification`)
    console.log(`📱 Mobile: ${mobile}`)
    console.log(`🔢 OTP: ${otp}`)
    
    const result = SMSService.verifyOTP(mobile, otp)
    
    return NextResponse.json({
      success: true,
      verification_result: result,
      mobile: mobile,
      otp: otp,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
