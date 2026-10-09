import { useState } from "react"
import { ServiceProviderVerification } from "./service-provider-verification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "@/hooks/use-router"
import { useAuth } from "@/hooks/use-auth"

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMobileVerification, setShowMobileVerification] = useState(false)
  const [isMobileVerified, setIsMobileVerified] = useState(false)
  const [verifiedMobile, setVerifiedMobile] = useState("")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const router = useRouter()
  const { signup } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.type) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // For professionals, mobile verification is mandatory
    if (formData.type === "professional" && !isMobileVerified) {
      setShowMobileVerification(true)
      setIsLoading(false)
      return
    }

    // For customers, OTP verification is optional
    if (formData.type === "customer" && !formData.phone) {
      // Phone is optional for customers, set a default if not provided
      formData.phone = ""
    }

    try {
      const signupData = { ...formData }
      
      // Add mobile verification data if verified
      if (isMobileVerified) {
        signupData.isPhoneVerified = true
        signupData.verifiedMobile = verifiedMobile
      }
      
      await signup(signupData)
      
      // Role-based routing after signup
      switch (formData.type) {
        case "professional":
          router.push("/professional/verification")
          break
        case "customer":
        default:
          router.push("/customer/dashboard")
          break
      }
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMobileVerificationComplete = (mobile) => {
    setIsMobileVerified(true)
    setVerifiedMobile(mobile)
    setShowMobileVerification(false)
    // Update phone in form data
    setFormData(prev => ({
      ...prev,
      phone: mobile
    }))
  }


  return (
    <div className="space-y-6">
      {isMobileVerified && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 text-green-800 font-semibold mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span>Mobile Verified Successfully!</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-sm text-green-700 font-medium ml-11">
            <div className="flex items-center gap-2">
              <span>Verified Mobile:</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                {verifiedMobile}
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-4 h-4 transition-colors" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-4 h-4 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
            Phone Number {formData.type === "professional" && <span className="text-red-500">*</span>}
            {formData.type === "customer" && <span className="text-gray-500 text-xs">(Optional)</span>}
          </Label>
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-4 h-4 transition-colors" />
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required={formData.type === "professional"}
            />
          </div>
          {formData.type === "professional" && isMobileVerified && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Mobile verified successfully</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="type" className="text-sm font-semibold text-gray-700">I am a</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm">
              <SelectValue placeholder="Select your user type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200 shadow-xl">
              <SelectItem value="customer" className="hover:bg-blue-50 cursor-pointer py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Customer</div>
                    <div className="text-xs text-gray-500">Looking for services</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="professional" className="hover:bg-green-50 cursor-pointer py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Service Professional</div>
                    <div className="text-xs text-gray-500">Providing services</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <div className="flex items-center space-x-2">
          <input
            id="terms"
            type="checkbox"
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            required
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm h-auto"
              onClick={() => setShowTermsModal(true)}
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm h-auto"
              onClick={() => setShowPrivacyModal(true)}
            >
              Privacy Policy
            </Button>
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>

      {/* Service Provider Verification Modal */}
      {showMobileVerification && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-8">
            <ServiceProviderVerification
              mobile={formData.phone}
              onVerificationComplete={handleMobileVerificationComplete}
            />
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Terms of Service</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => setShowTermsModal(false)}
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>
            <div className="space-y-3 text-sm text-gray-600 max-h-72 overflow-y-auto">
              <p>
                By creating an account on ServiceFinder, you agree to use the platform in a lawful and respectful
                manner and to provide accurate information about yourself and, if applicable, the services you offer.
              </p>
              <p>
                Customers are responsible for reviewing professional profiles, prices and availability before
                confirming a booking. Professionals are responsible for delivering services with reasonable care and
                skill and for keeping their profile information up to date.
              </p>
              <p>
                ServiceFinder operates as a marketplace that connects customers and independent service professionals.
                We do not directly provide the services and are not liable for any loss, damage or dispute arising
                from a booking, except as required by applicable law.
              </p>
              <p>
                We may update these terms from time to time. Continued use of the platform after updates means that
                you accept the revised terms.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" className="h-9 px-4" onClick={() => setShowTermsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Privacy Policy</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => setShowPrivacyModal(false)}
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>
            <div className="space-y-3 text-sm text-gray-600 max-h-72 overflow-y-auto">
              <p>
                We collect basic information that you provide when creating an account or using the platform, such as
                your name, email address, phone number, location and booking details.
              </p>
              <p>
                This information is used to create and manage your account, connect you with professionals or
                customers, process bookings and payments, improve our services and keep you informed about important
                updates related to your use of ServiceFinder.
              </p>
              <p>
                We may share relevant details with service professionals or customers involved in your bookings and
                with trusted third parties such as payment processors, only as needed to operate and improve the
                platform.
              </p>
              <p>
                You can request access, correction or deletion of your personal data subject to legal and operational
                requirements. For full details, please refer to our complete privacy documentation.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" className="h-9 px-4" onClick={() => setShowPrivacyModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
