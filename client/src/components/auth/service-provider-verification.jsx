import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  MessageSquare,
  ArrowRight
} from "lucide-react"






export function ServiceProviderVerification({ mobile, onVerificationComplete }) {
  const [step, setStep] = useState("mobile")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otp, setOtp] = useState("")
  const [mobileNumber, setMobileNumber] = useState(mobile)
  const [otpSent, setOtpSent] = useState(false)

  const sendOTP = async () => {
    try {
      setLoading(true)
      setError("")

      if (!mobileNumber) {
        setError("Mobile number is required")
        return
      }

      // Clean mobile number format
      const cleanMobile = mobileNumber.replace(/\s/g, '')

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: cleanMobile }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setOtpSent(true)
      setStep("otp")

    } catch (err) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    try {
      setLoading(true)
      setError("")

      if (!otp) {
        setError("Please enter the OTP")
        return
      }

      // Clean mobile number format
      const cleanMobile = mobileNumber.replace(/\s/g, '')

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: cleanMobile,
          otp: otp.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      setStep("verified")
      onVerificationComplete(cleanMobile)

    } catch (err) {
      setError(err.message || "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setOtp("")
    setError("")
    await sendOTP()
  }

  if (step === "verified") {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Mobile Verified Successfully!
          </h3>
          <p className="text-gray-600 font-medium">
            Your mobile number has been verified. You can now complete your registration.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-semibold">Verification Complete</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Mobile Verification Required
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Service providers must verify their mobile number to build customer trust, receive bookings, and access all platform features
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Secure & Fast Verification</span>
        </div>
      </div>

      {step === "mobile" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700">
              Mobile Number
            </Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Your number will be kept secure and used only for verification
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            onClick={sendOTP} 
            disabled={loading || !mobileNumber.trim()} 
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Sending OTP to your mobile...
              </>
            ) : (
              <>
                <MessageSquare className="mr-3 h-5 w-5" />
                Send Verification Code
                <ArrowRight className="ml-3 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">
                We've sent a 6-digit verification code to
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-3">
                <p className="font-bold text-blue-800 text-lg">{mobileNumber}</p>
              </div>
              <p className="text-xs text-gray-500">Check your SMS messages</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="otp" className="text-sm font-semibold text-gray-700 text-center block">
              Enter 6-Digit Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-[0.8em] h-16 font-mono font-bold border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              autoComplete="one-time-code"
            />
            <p className="text-xs text-gray-500 text-center">Enter the code exactly as received</p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-red-800">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={verifyOTP} 
              disabled={loading || otp.length !== 6} 
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Verifying your code...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Verify & Complete
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Didn't receive OTP?</span>
              <Button 
                variant="link" 
                onClick={resendOTP} 
                disabled={loading}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                Resend OTP
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setStep("mobile")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Change Mobile Number
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
