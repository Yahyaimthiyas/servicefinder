import { NextResponse } from "next/server"
import { SMSService } from "../../../lib/sms-service.js"

export async function POST(request) {
  try {
    const { mobile } = await request.json()

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    }

    // Validate mobile number format
    const mobileRegex = /^[+]?[1-9]\d{1,14}$/
    if (!mobileRegex.test(mobile.replace(/[\s-]/g, ''))) {
      return NextResponse.json({ error: "Invalid mobile number format" }, { status: 400 })
    }

    // Send OTP
    const otpResult = await SMSService.sendAndStoreOTP(mobile)
    
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.message }, { status: 500 })
    }

    // Log for development
    console.log(`📱 OTP Request for ${mobile}`)
    console.log(`📋 Current OTPs:`, SMSService.getStoredOTPs())

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      mobile: mobile
    })

  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
