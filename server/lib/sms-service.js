// Fast2SMS Service for OTP
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || ""
const FAST2SMS_URL = process.env.FAST2SMS_URL || "https://www.fast2sms.com/dev/bulkV2"

// In-memory OTP storage (in production, use Redis or database)
// Use global to persist across hot reloads in development
if (!global.otpStorage) {
  global.otpStorage = new Map()
}
const otpStorage = global.otpStorage

export class SMSService {
  // Normalize mobile number to consistent format
  static normalizeMobile(mobile) {
    // Remove all non-digits and normalize
    const cleaned = mobile.replace(/\D/g, '')
    console.log(`📱 Normalizing mobile: "${mobile}" → "${cleaned}"`)
    return cleaned
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async sendOTP(mobile, otp) {
    try {
      // Log OTP to console for development
      console.log(`🔐 OTP for ${mobile}: ${otp}`)
      
      // Prepare message
      const message = `Your ServiceFinder verification OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`
      
      // Fast2SMS API call
      const response = await fetch(FAST2SMS_URL, {
        method: 'POST',
        headers: {
          'Authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: message,
          language: 'english',
          flash: 0,
          numbers: mobile.replace('+', '').replace(/\D/g, '') // Remove + and non-digits
        })
      })

      const result = await response.json()
      
      if (response.ok && result.return) {
        console.log(`✅ SMS sent successfully to ${mobile}`)
        return { success: true, message: 'OTP sent successfully' }
      } else {
        console.error('❌ SMS sending failed:', result)
        // Still return success for development (OTP is logged)
        return { success: true, message: 'OTP sent (development mode)' }
      }
    } catch (error) {
      console.error('❌ SMS service error:', error)
      // Return success for development (OTP is logged)
      return { success: true, message: 'OTP sent (development mode)' }
    }
  }

  static storeOTP(mobile, otp) {
    const normalizedMobile = this.normalizeMobile(mobile)
    const expiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    console.log(`💾 Storing OTP for ${normalizedMobile}: ${otp}`)
    console.log(`📊 Storage before storing:`, Array.from(otpStorage.entries()))
    
    otpStorage.set(normalizedMobile, { otp, expiryTime })
    
    console.log(`✅ OTP stored successfully`)
    console.log(`📊 Storage after storing:`, Array.from(otpStorage.entries()))
    console.log(`🔍 Can retrieve immediately:`, otpStorage.get(normalizedMobile))
    
    // Auto-cleanup expired OTPs
    setTimeout(() => {
      if (otpStorage.has(normalizedMobile)) {
        const stored = otpStorage.get(normalizedMobile)
        if (stored && stored.expiryTime <= Date.now()) {
          otpStorage.delete(normalizedMobile)
          console.log(`🗑️ Expired OTP cleaned up for ${normalizedMobile}`)
        }
      }
    }, 10 * 60 * 1000)
  }

  static verifyOTP(mobile, inputOTP) {
    const normalizedMobile = this.normalizeMobile(mobile)
    console.log(`🔍 Verifying OTP for ${normalizedMobile}: ${inputOTP}`)
    
    // Check storage health first
    this.checkStorageHealth()
    
    console.log(`📋 Current stored OTPs:`, this.getStoredOTPs())
    console.log(`🗂️ Raw storage contents:`, Array.from(otpStorage.entries()))
    
    const stored = otpStorage.get(normalizedMobile)
    console.log(`🔍 Retrieved stored data:`, stored)
    
    if (!stored) {
      console.log(`❌ No OTP found for ${normalizedMobile}`)
      console.log(`🔍 Available keys in storage:`, Array.from(otpStorage.keys()))
      return { success: false, message: 'OTP not found or expired' }
    }

    const currentTime = Date.now()
    console.log(`⏰ Current time: ${currentTime}, Expiry time: ${stored.expiryTime}`)
    
    if (stored.expiryTime <= currentTime) {
      console.log(`❌ OTP expired for ${normalizedMobile}`)
      otpStorage.delete(normalizedMobile)
      return { success: false, message: 'OTP has expired' }
    }

    // Ensure both are strings and trimmed
    const storedOTPStr = String(stored.otp).trim()
    const inputOTPStr = String(inputOTP).trim()
    
    console.log(`🔍 Comparing OTPs: stored="${storedOTPStr}", input="${inputOTPStr}", types: ${typeof storedOTPStr}, ${typeof inputOTPStr}`)
    
    if (storedOTPStr === inputOTPStr) {
      console.log(`✅ OTP verified successfully for ${normalizedMobile}`)
      otpStorage.delete(normalizedMobile) // Remove OTP after successful verification
      return { success: true, message: 'OTP verified successfully' }
    }

    console.log(`❌ Invalid OTP for ${normalizedMobile}`)
    return { success: false, message: 'Invalid OTP' }
  }

  static async sendAndStoreOTP(mobile) {
    try {
      const otp = this.generateOTP()
      this.storeOTP(mobile, otp)
      const result = await this.sendOTP(mobile, otp)
      return result
    } catch (error) {
      console.error('Error in sendAndStoreOTP:', error)
      return { success: false, message: 'Failed to send OTP' }
    }
  }

  // Get stored OTPs for debugging (development only)
  static getStoredOTPs() {
    const otps = {}
    for (const [mobile, data] of otpStorage.entries()) {
      if (data && data.expiryTime > Date.now()) {
        otps[mobile] = {
          otp: data.otp,
          expiresIn: Math.round((data.expiryTime - Date.now()) / 1000) + 's'
        }
      }
    }
    return otps
  }

  // Debug method to check storage health
  static checkStorageHealth() {
    console.log(`🏥 Storage Health Check:`)
    console.log(`📊 Storage instance:`, otpStorage)
    console.log(`📊 Storage size:`, otpStorage.size)
    console.log(`📊 Raw contents:`, Array.from(otpStorage.entries()))
    console.log(`📊 Global storage:`, global.otpStorage === otpStorage)
    return {
      size: otpStorage.size,
      contents: Array.from(otpStorage.entries()),
      isGlobal: global.otpStorage === otpStorage
    }
  }
}
