 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { useRouter } from "@/hooks/use-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDIA_STATES, getDistrictsForState, getServiceAreasForDistrict } from "@/lib/india-locations"
import { 
  Upload, 
  FileText,


  Loader2,


  Clock,

  XCircle,
  User,


  Briefcase,

  Calendar
} from "lucide-react"

export default function ProfessionalVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationStatus, setVerificationStatus] = useState("pending_documents")
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Professional Information
    profession: "",
    specialization: "",
    experience: "",
    qualification: "",
    businessName: "",
    businessAddress: "",
    
    // Documents
    governmentId: null ,
    governmentIdNumber: "",
    professionalLicense: null ,
    licenseNumber: "",
    businessRegistration: null ,
    experienceCertificate: null ,
    portfolioImages: [] ,
    
    // Additional Info
    workingHours: "",
    serviceAreas: "",
    emergencyContact: "",
    references: ""
  })

  const [selectedServiceAreas, setSelectedServiceAreas] = useState([])

  const stateDistricts = getDistrictsForState(formData.state)
  const serviceAreaOptions = getServiceAreasForDistrict(formData.state, formData.city)

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/professional/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data.verificationStatus)
        
        // If already verified, redirect to dashboard
        if (data.verificationStatus === "verified") {
          router.push("/professional/dashboard")
          return
        }
      }
    } catch (error) {
      console.error("Error checking status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const toggleServiceArea = (area) => {
    setSelectedServiceAreas((prev) => {
      const exists = prev.includes(area)
      const updated = exists ? prev.filter((a) => a !== area) : [...prev, area]
      // Keep the string version in sync for backend/admin views
      setFormData((prevForm) => ({
        ...prevForm,
        serviceAreas: updated.join(", "),
      }))
      return updated
    })
  }

  const submitDocuments = async () => {
    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      
      // Validate required fields
      if (!formData.fullName || !formData.profession || !formData.experience) {
        alert("Please fill in all required personal and professional information")
        return
      }
      
      if (!formData.governmentId || !formData.professionalLicense) {
        alert("Please upload Government ID and Professional License")
        return
      }
      
      // Build the payload that will be stored for admin review
      const documentsData = {
        personalInfo: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        professionalInfo: {
          profession: formData.profession,
          specialization: formData.specialization,
          experience: formData.experience,
          qualification: formData.qualification,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress
        },
        documents: {
          governmentId: _optionalChain([formData, 'access', _ => _.governmentId, 'optionalAccess', _2 => _2.name]) || "",
          governmentIdNumber: formData.governmentIdNumber,
          professionalLicense: _optionalChain([formData, 'access', _3 => _3.professionalLicense, 'optionalAccess', _4 => _4.name]) || "",
          licenseNumber: formData.licenseNumber,
          businessRegistration: _optionalChain([formData, 'access', _5 => _5.businessRegistration, 'optionalAccess', _6 => _6.name]) || "",
          experienceCertificate: _optionalChain([formData, 'access', _7 => _7.experienceCertificate, 'optionalAccess', _8 => _8.name]) || "",
          portfolioImages: formData.portfolioImages.map(img => _optionalChain([img, 'optionalAccess', _9 => _9.name]) || "")
        },
        additionalInfo: {
          workingHours: formData.workingHours,
          serviceAreas: formData.serviceAreas,
          emergencyContact: formData.emergencyContact,
          references: formData.references
        },
        // Also include flat fields for easier access
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        profession: formData.profession,
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        businessName: formData.businessName,
        workingHours: formData.workingHours,
        serviceAreas: formData.serviceAreas,
        emergencyContact: formData.emergencyContact,
        references: formData.references,
        submittedAt: new Date().toISOString()
      }

      console.log("📤 Submitting documents:", documentsData)

      // Send as multipart/form-data so actual files are uploaded, not just names
      const payload = new FormData()
      payload.append("payload", JSON.stringify(documentsData))

      if (formData.governmentId) {
        payload.append("governmentIdFile", formData.governmentId)
      }
      if (formData.professionalLicense) {
        payload.append("professionalLicenseFile", formData.professionalLicense)
      }
      if (formData.businessRegistration) {
        payload.append("businessRegistrationFile", formData.businessRegistration)
      }
      if (formData.experienceCertificate) {
        payload.append("experienceCertificateFile", formData.experienceCertificate)
      }
      if (formData.portfolioImages && formData.portfolioImages.length > 0) {
        formData.portfolioImages.forEach((image) => {
          if (image) {
            payload.append("portfolioImages", image)
          }
        })
      }

      const response = await fetch("/api/professional/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      })

      const responseData = await response.json()
      console.log("📥 Response:", responseData)

      if (response.ok) {
        setVerificationStatus("pending_admin_review")
        alert("Documents submitted successfully! You'll be notified once reviewed.")
      } else {
        alert(`Error: ${responseData.error || "Failed to submit documents"}`)
      }
    } catch (error) {
      console.error("Error submitting documents:", error)
      alert("Failed to submit documents. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusMessage = () => {
    switch (verificationStatus) {
      case "pending_documents":
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Complete Your Verification</h3>
                  <p className="text-blue-700">Upload required documents to start serving customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case "pending_admin_review":
        return (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Under Review</h3>
                  <p className="text-yellow-700">
                    Your documents are being reviewed by our admin team. You'll be notified once approved.
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Review typically takes 24-48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case "rejected":
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Verification Rejected</h3>
                  <p className="text-red-700">Please review feedback and resubmit documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Verification</h1>
          <p className="text-gray-600">Complete your verification to start serving customers</p>
        </div>

        {/* Status Message */}
        <div className="mb-8">
          {renderStatusMessage()}
        </div>

        {/* Verification Form - Only show if pending documents or rejected */}
        {(verificationStatus === "pending_documents" || verificationStatus === "rejected") && (
          <div className="space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Provide your personal details for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City / District *</Label>
                      {stateDistricts.length > 0 ? (
                        <Select
                          value={formData.city}
                          onValueChange={(value) => handleInputChange("city", value)}
                        >
                          <SelectTrigger id="city" className="h-11">
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
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="City / District"
                          className="h-11"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => {
                          handleInputChange("state", value)
                          handleInputChange("city", "")
                        }}
                      >
                        <SelectTrigger id="state" className="h-11">
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
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="Pincode"
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                  <CardDescription>Tell us about your professional background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profession">Profession *</Label>
                      <Select value={formData.profession} onValueChange={(value) => handleInputChange("profession", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumber">Plumber</SelectItem>
                          <SelectItem value="electrician">Electrician</SelectItem>
                          <SelectItem value="carpenter">Carpenter</SelectItem>
                          <SelectItem value="painter">Painter</SelectItem>
                          <SelectItem value="cleaner">House Cleaner</SelectItem>
                          <SelectItem value="mechanic">Mechanic</SelectItem>
                          <SelectItem value="gardener">Gardener</SelectItem>
                          <SelectItem value="tutor">Tutor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        placeholder="e.g., Residential Plumbing, AC Repair"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="qualification">Highest Qualification</Label>
                      <Input
                        id="qualification"
                        value={formData.qualification}
                        onChange={(e) => handleInputChange("qualification", e.target.value)}
                        placeholder="e.g., ITI, Diploma, Degree"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="businessName">Business Name (if applicable)</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceAreas">Service Areas *</Label>
                    {serviceAreaOptions.length > 0 && formData.state === "Tamil Nadu" ? (
                      <>
                        <p className="text-xs text-gray-500">
                          Choose the main areas you serve in {formData.city || "this district"}. You can
                          select multiple locations.
                        </p>
                        <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {serviceAreaOptions.map((area) => (
                              <label
                                key={area}
                                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedServiceAreas.includes(area)}
                                  onChange={() => toggleServiceArea(area)}
                                />
                                <span>{area}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {selectedServiceAreas.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Selected: {selectedServiceAreas.join(", ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <Textarea
                        id="serviceAreas"
                        value={formData.serviceAreas}
                        onChange={(e) => handleInputChange("serviceAreas", e.target.value)}
                        placeholder="List areas where you provide services (e.g., Anna Nagar, T Nagar, Adyar)"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>Upload required documents for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Government ID */}
                  <div className="space-y-2">
                    <Label>Government ID (Aadhaar/Passport/Driving License) *</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("governmentId", _optionalChain([e, 'access', _10 => _10.target, 'access', _11 => _11.files, 'optionalAccess', _12 => _12[0]]) || null)}
                    />
                    <Input
                      placeholder="Enter ID number"
                      value={formData.governmentIdNumber}
                      onChange={(e) => handleInputChange("governmentIdNumber", e.target.value)}
                    />
                  </div>

                  {/* Professional License */}
                  <div className="space-y-2">
                    <Label>Professional License/Certificate *</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("professionalLicense", _optionalChain([e, 'access', _13 => _13.target, 'access', _14 => _14.files, 'optionalAccess', _15 => _15[0]]) || null)}
                    />
                    <Input
                      placeholder="Enter license number"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    />
                  </div>

                  {/* Business Registration */}
                  <div className="space-y-2">
                    <Label>Business Registration (if applicable)</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("businessRegistration", _optionalChain([e, 'access', _16 => _16.target, 'access', _17 => _17.files, 'optionalAccess', _18 => _18[0]]) || null)}
                    />
                  </div>

                  {/* Experience Certificate */}
                  <div className="space-y-2">
                    <Label>Experience Certificate/Previous Work Proof</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("experienceCertificate", _optionalChain([e, 'access', _19 => _19.target, 'access', _20 => _20.files, 'optionalAccess', _21 => _21[0]]) || null)}
                    />
                  </div>

                  {/* Portfolio Images */}
                  <div className="space-y-2">
                    <Label>Portfolio Images (Previous Work) *</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleInputChange("portfolioImages", Array.from(e.target.files || []))}
                    />
                    <p className="text-xs text-muted-foreground">Upload 3-5 photos of your previous work</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>Provide additional details to complete your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workingHours">Working Hours *</Label>
                    <Input
                      id="workingHours"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange("workingHours", e.target.value)}
                      placeholder="e.g., Mon-Sat 9AM-6PM"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Emergency contact number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="references">References (Optional)</Label>
                    <Textarea
                      id="references"
                      value={formData.references}
                      onChange={(e) => handleInputChange("references", e.target.value)}
                      placeholder="Previous clients or employers who can vouch for your work"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={submitDocuments} 
                  disabled={
                    submitting || 
                    !formData.fullName || 
                    !formData.profession || 
                    !formData.experience ||
                    !formData.governmentId ||
                    !formData.professionalLicense
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pending Review Message */}
        {verificationStatus === "pending_admin_review" && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Your verification is in progress. You'll receive an email notification once approved.
            </p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
