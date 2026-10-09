import { NextResponse } from "next/server"
import { SMSService } from "../../../lib/sms-service.js"

export async function POST(request) {
  try {
    const { mobile, otp } = await request.json()
    console.log(`🔍 API received verification request: mobile="${mobile}", otp="${otp}"`)

    if (!mobile || !otp) {
      return NextResponse.json({ error: "Mobile number and OTP are required" }, { status: 400 })
    }

    // Verify OTP
    console.log(`🔍 Calling SMSService.verifyOTP with mobile="${mobile}", otp="${otp}"`)
    const verificationResult = SMSService.verifyOTP(mobile, otp)
    console.log(`🔍 Verification result:`, verificationResult)
    
    if (!verificationResult.success) {
      return NextResponse.json({ 
        error: verificationResult.message,
        type: "otp_verification_failed"
      }, { status: 400 })
    }

    // Log for development
    console.log(`✅ OTP Verified successfully for ${mobile}`)
    console.log(`📋 Remaining OTPs:`, SMSService.getStoredOTPs())

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      mobile: mobile,
      verified_at: new Date().toISOString()
    })

  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint for development - to check stored OTPs
export async function GET() {
  try {
    const storedOTPs = SMSService.getStoredOTPs()
    return NextResponse.json({
      success: true,
      stored_otps: storedOTPs,
      message: "Development endpoint - shows active OTPs"
    })
  } catch (error) {
    console.error("Get OTPs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
