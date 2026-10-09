import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { INDIA_STATES, getDistrictsForState } from "@/lib/india-locations"
import { 
  User,



 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,

  Briefcase,
  CreditCard,

} from "lucide-react"







































export function CompleteVerificationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    businessName: "",
    serviceCategory: "",
    specializations: [],
    yearsExperience: 0,
    description: "",
    profilePhoto: null,
    idProof: null,
    addressProof: null,
    businessLicense: null,
    certifications: [],
    portfolioImages: [],
    emergencyContact: "",
    emergencyPhone: "",
    workingHours: "",
    serviceAreas: [],
    pricing: {
      hourlyRate: 0,
      calloutFee: 0,
      minimumCharge: 0
    }
  })

  const stateDistricts = getDistrictsForState(formData.state)

  const handleInputChange = (field, value) => {
    if (field.startsWith('pricing.')) {
      const pricingField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleFileUpload = (field, files) => {
    if (!files) return
    
    if (field === 'certifications' || field === 'portfolioImages') {
      const fileArray = Array.from(files)
      setFormData(prev => ({ ...prev, [field]: fileArray }))
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }))
    }
  }

  const submitVerification = async () => {
    try {
      setLoading(true)
      setError("")

      // Create FormData for file uploads
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'pricing') {
          submitData.append(key, JSON.stringify(value))
        } else if (key === 'specializations' || key === 'serviceAreas') {
          submitData.append(key, JSON.stringify(value))
        } else if (value instanceof File) {
          submitData.append(key, value)
        } else if (Array.isArray(value) && value[0] instanceof File) {
          value.forEach((file, index) => {
            submitData.append(`${key}[${index}]`, file)
          })
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value.toString())
        }
      })

      const token = localStorage.getItem("token")
      const response = await fetch("/api/professional/verification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Verification submission failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/70 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your verification documents have been submitted successfully. Our admin team will review your application within 24-48 hours.
            </p>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Status: Under Review
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Professional Verification
          </h1>
          <p className="text-gray-600 text-lg">Complete your verification to start serving customers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {currentStep === 1 && <><User className="w-6 h-6 text-blue-600" /> Personal Information</>}
              {currentStep === 2 && <><Briefcase className="w-6 h-6 text-green-600" /> Professional Details</>}
              {currentStep === 3 && <><Upload className="w-6 h-6 text-purple-600" /> Document Upload</>}
              {currentStep === 4 && <><CheckCircle className="w-6 h-6 text-amber-600" /> Review & Submit</>}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Provide your personal details for verification"}
              {currentStep === 2 && "Tell us about your professional background"}
              {currentStep === 3 && "Upload required documents and photos"}
              {currentStep === 4 && "Review your information and submit"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Complete Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City / District *</Label>
                    {stateDistricts.length > 0 ? (
                      <Select
                        value={formData.city}
                        onValueChange={(value) => handleInputChange('city', value)}
                      >
                        <SelectTrigger id="city" className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        placeholder="City / District"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                        required
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => {
                        handleInputChange('state', value)
                        handleInputChange('city', '')
                      }}
                    >
                      <SelectTrigger id="state" className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIA_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:max-w-xs">
                    <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-semibold text-gray-700">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Your business name"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceCategory" className="text-sm font-semibold text-gray-700">Service Category *</Label>
                    <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange('serviceCategory', value)}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="cleaning">House Cleaning</SelectItem>
                        <SelectItem value="handyman">Handyman</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="landscaping">Landscaping</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="carpentry">Carpentry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience" className="text-sm font-semibold text-gray-700">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    placeholder="Years of experience"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Service Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your services and expertise"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-sm font-semibold text-gray-700">Hourly Rate (₹) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="500"
                      value={formData.pricing.hourlyRate}
                      onChange={(e) => handleInputChange('pricing.hourlyRate', parseInt(e.target.value))}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calloutFee" className="text-sm font-semibold text-gray-700">Call-out Fee (₹)</Label>
                    <Input
                      id="calloutFee"
                      type="number"
                      placeholder="200"
                      value={formData.pricing.calloutFee}
                      onChange={(e) => handleInputChange('pricing.calloutFee', parseInt(e.target.value))}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumCharge" className="text-sm font-semibold text-gray-700">Minimum Charge (₹)</Label>
                    <Input
                      id="minimumCharge"
                      type="number"
                      placeholder="1000"
                      value={formData.pricing.minimumCharge}
                      onChange={(e) => handleInputChange('pricing.minimumCharge', parseInt(e.target.value))}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Profile Photo *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('profilePhoto', e.target.files)}
                        className="hidden"
                        id="profilePhoto"
                      />
                      <label htmlFor="profilePhoto" className="cursor-pointer">
                        <span className="text-sm text-gray-600">Click to upload profile photo</span>
                      </label>
                      {formData.profilePhoto && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.profilePhoto.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">ID Proof *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idProof', e.target.files)}
                        className="hidden"
                        id="idProof"
                      />
                      <label htmlFor="idProof" className="cursor-pointer">
                        <span className="text-sm text-gray-600">Upload Aadhar/PAN/License</span>
                      </label>
                      {formData.idProof && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.idProof.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Address Proof *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('addressProof', e.target.files)}
                        className="hidden"
                        id="addressProof"
                      />
                      <label htmlFor="addressProof" className="cursor-pointer">
                        <span className="text-sm text-gray-600">Upload utility bill/lease</span>
                      </label>
                      {formData.addressProof && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.addressProof.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Business License</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('businessLicense', e.target.files)}
                        className="hidden"
                        id="businessLicense"
                      />
                      <label htmlFor="businessLicense" className="cursor-pointer">
                        <span className="text-sm text-gray-600">Upload business license</span>
                      </label>
                      {formData.businessLicense && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.businessLicense.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Portfolio Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload('portfolioImages', e.target.files)}
                      className="hidden"
                      id="portfolioImages"
                    />
                    <label htmlFor="portfolioImages" className="cursor-pointer">
                      <span className="text-sm text-gray-600">Upload your work samples (multiple files)</span>
                    </label>
                    {formData.portfolioImages.length > 0 && (
                      <p className="text-xs text-green-600 mt-2">✓ {formData.portfolioImages.length} files selected</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Review Your Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {formData.fullName}</p>
                      <p><strong>Business:</strong> {formData.businessName}</p>
                      <p><strong>Category:</strong> {formData.serviceCategory}</p>
                      <p><strong>Experience:</strong> {formData.yearsExperience} years</p>
                    </div>
                    <div>
                      <p><strong>City:</strong> {formData.city}, {formData.state}</p>
                      <p><strong>Hourly Rate:</strong> ₹{formData.pricing.hourlyRate}</p>
                      <p><strong>Documents:</strong> {[
                        formData.profilePhoto && 'Profile Photo',
                        formData.idProof && 'ID Proof',
                        formData.addressProof && 'Address Proof',
                        formData.businessLicense && 'Business License'
                      ].filter(Boolean).length} uploaded</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-red-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50">
                  <h4 className="font-semibold text-amber-800 mb-2">Important Notice</h4>
                  <p className="text-sm text-amber-700">
                    By submitting this verification, you agree that all information provided is accurate and complete. 
                    Our admin team will review your application within 24-48 hours. You'll receive an email notification 
                    once your verification is approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-white/50 hover:bg-white/80 border-gray-200 hover:border-gray-300 rounded-xl"
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={submitVerification}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
