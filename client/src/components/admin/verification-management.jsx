 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  Shield,
  Award,
  Briefcase,
  Star,
  Camera
} from "lucide-react"






































export default function VerificationManagement() {
  const [verificationRequests, setVerificationRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [verificationNotes, setVerificationNotes] = useState("")

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/admin/verification", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("📋 Verification requests loaded:", data.verificationRequests)
        
        // The API now properly formats the data, so we can use it directly
        const transformedRequests = (data.verificationRequests || []).map((request) => {
          console.log("🔍 Admin processing request:", request.name, request.verificationDocuments)
          
          return {
            ...request,
            // Extract data with proper fallbacks (API already does most of this)
            fullName: _optionalChain([request, 'access', _ => _.personalInfo, 'optionalAccess', _2 => _2.fullName]) || request.name,
            dateOfBirth: _optionalChain([request, 'access', _3 => _3.personalInfo, 'optionalAccess', _4 => _4.dateOfBirth]) || 'Not provided',
            address: _optionalChain([request, 'access', _5 => _5.personalInfo, 'optionalAccess', _6 => _6.address]) || 'Not provided',
            city: _optionalChain([request, 'access', _7 => _7.personalInfo, 'optionalAccess', _8 => _8.city]) || 'Not provided',
            state: _optionalChain([request, 'access', _9 => _9.personalInfo, 'optionalAccess', _10 => _10.state]) || 'Not provided',
            pincode: _optionalChain([request, 'access', _11 => _11.personalInfo, 'optionalAccess', _12 => _12.pincode]) || 'Not provided',
            
            // Professional info
            businessName: _optionalChain([request, 'access', _13 => _13.professionalInfo, 'optionalAccess', _14 => _14.businessName]) || 'Not provided',
            serviceCategory: _optionalChain([request, 'access', _15 => _15.professionalInfo, 'optionalAccess', _16 => _16.profession]) || request.profession || 'Not specified',
            profession: _optionalChain([request, 'access', _17 => _17.professionalInfo, 'optionalAccess', _18 => _18.profession]) || request.profession || 'Not specified',
            specialization: _optionalChain([request, 'access', _19 => _19.professionalInfo, 'optionalAccess', _20 => _20.specialization]) || 'Not specified',
            experience: _optionalChain([request, 'access', _21 => _21.professionalInfo, 'optionalAccess', _22 => _22.experience]) || request.experience || 'Not specified',
            qualification: _optionalChain([request, 'access', _23 => _23.professionalInfo, 'optionalAccess', _24 => _24.qualification]) || 'Not specified',
            
            // Additional info
            workingHours: _optionalChain([request, 'access', _25 => _25.additionalInfo, 'optionalAccess', _26 => _26.workingHours]) || 'Not specified',
            serviceAreas: _optionalChain([request, 'access', _27 => _27.additionalInfo, 'optionalAccess', _28 => _28.serviceAreas]) || 'Not specified',
            emergencyContact: _optionalChain([request, 'access', _29 => _29.additionalInfo, 'optionalAccess', _30 => _30.emergencyContact]) || 'Not provided',
            references: _optionalChain([request, 'access', _31 => _31.additionalInfo, 'optionalAccess', _32 => _32.references]) || 'Not provided',
            
            // Documents - use the verificationDocuments.documents structure
            documents: _optionalChain([request, 'access', _33 => _33.verificationDocuments, 'optionalAccess', _34 => _34.documents]) || {},
            
            // Status and dates
            verificationStatus: request.verificationStatus || request.status,
            createdAt: request.joinedAt || request.createdAt,
            submittedAt: request.verificationSubmittedAt || request.updatedAt || request.joinedAt || request.createdAt,
            
            // Compatibility fields
            personalInfo: request.personalInfo || {
              fullName: request.name,
              dateOfBirth: 'Not provided',
              address: 'Not provided',
              city: 'Not provided',
              state: 'Not provided',
              pincode: 'Not provided'
            },
            professionalInfo: request.professionalInfo || {
              profession: request.profession || 'Not specified',
              specialization: 'Not specified',
              experience: request.experience || 'Not specified',
              qualification: 'Not specified',
              businessName: 'Not provided'
            },
            additionalInfo: request.additionalInfo || {
              workingHours: 'Not specified',
              serviceAreas: 'Not specified',
              emergencyContact: 'Not provided',
              references: 'Not provided'
            }
          }
        })
        
        setVerificationRequests(transformedRequests)
      } else {
        console.error("Failed to fetch verification requests")
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (professionalId, action) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/admin/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId,
          action,
          notes: verificationNotes,
        }),
      })

      if (response.ok) {
        // Refresh the list
        fetchVerificationRequests()
        setSelectedRequest(null)
        setVerificationNotes("")
      }
    } catch (error) {
      console.error("Error handling verification:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading verification requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Professional Verification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending verification requests
              </div>
            ) : (
              verificationRequests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{request.fullName}</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {request.serviceCategory}
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                          {_optionalChain([request, 'access', _35 => _35.verificationStatus, 'optionalAccess', _36 => _36.replace, 'call', _37 => _37('_', ' '), 'access', _38 => _38.toUpperCase, 'call', _39 => _39()])}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {request.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.city}, {request.state}
                        </span>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedRequest(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Complete Professional Verification Review
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedRequest && (
                          <div className="space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Personal Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Full Name</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.fullName}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.dateOfBirth}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Email</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.email}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Phone</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.phone}</p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <p className="text-sm font-semibold text-gray-700">Complete Address</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">
                                    {selectedRequest.address}, {selectedRequest.city}, {selectedRequest.state} - {selectedRequest.pincode}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Professional Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-green-600" />
                                Professional Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Business Name</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.businessName}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Service Category</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.serviceCategory}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Years of Experience</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.experience}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Qualification</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.qualification}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Specialization</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.specialization}</p>
                                </div>
                              </div>
                            </div>

                            {/* Documents & Photos Section */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Documents & Photos
                              </h4>
                              
                              {(() => {
                                const docs = _optionalChain([selectedRequest, 'access', _40 => _40.verificationDocuments, 'optionalAccess', _41 => _41.documents]) || {}

                                const getDocMeta = (value) => {
                                  if (!value) return { label: "", url: "" }
                                  if (typeof value === "string") {
                                    return { label: value, url: "" }
                                  }
                                  const id = value.id || value._id
                                  const filename = value.filename || "Document"
                                  const url = id ? `/api/admin/verification/document/${id}` : ""
                                  return { label: filename, url }
                                }

                                const openDocument = (value, title) => {
                                  const meta = getDocMeta(value)
                                  if (meta.url) {
                                    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                                    const urlWithToken = token 
                                      ? `${meta.url}?token=${encodeURIComponent(token)}` 
                                      : meta.url
                                    window.open(urlWithToken, "_blank")
                                  } else if (meta.label) {
                                    alert(`${title}: ${meta.label}`)
                                  } else {
                                    alert("No preview available for this document.")
                                  }
                                }

                                const hasDocuments = Object.keys(docs).length > 0 && Object.values(docs).some((doc) => doc && doc !== "")
                                
                                if (!hasDocuments) {
                                  return (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                      <p className="text-gray-600">No documents uploaded</p>
                                    </div>
                                  )
                                }
                                
                                const governmentIdMeta = getDocMeta(docs.governmentId)
                                const professionalLicenseMeta = getDocMeta(docs.professionalLicense)
                                const businessRegistrationMeta = getDocMeta(docs.businessRegistration)
                                const experienceCertificateMeta = getDocMeta(docs.experienceCertificate)

                                return (
                                  <div className="space-y-3">
                                    {/* Simple Document List */}
                                    {docs.governmentId && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Shield className="w-5 h-5 text-green-600" />
                                          <div>
                                            <p className="font-medium text-gray-900">Government ID</p>
                                            <p className="text-sm text-gray-500">{governmentIdMeta.label}</p>
                                            {docs.governmentIdNumber && (
                                              <p className="text-xs text-gray-400">ID: {docs.governmentIdNumber}</p>
                                            )}
                                          </div>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => openDocument(docs.governmentId, "Government ID")}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    )}

                                    {docs.professionalLicense && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Award className="w-5 h-5 text-purple-600" />
                                          <div>
                                            <p className="font-medium text-gray-900">Professional License</p>
                                            <p className="text-sm text-gray-500">{professionalLicenseMeta.label}</p>
                                            {docs.licenseNumber && (
                                              <p className="text-xs text-gray-400">License: {docs.licenseNumber}</p>
                                            )}
                                          </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => openDocument(docs.professionalLicense, "Professional License")}>
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    )}

                                    {docs.businessRegistration && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Briefcase className="w-5 h-5 text-blue-600" />
                                          <div>
                                            <p className="font-medium text-gray-900">Business Registration</p>
                                            <p className="text-sm text-gray-500">{businessRegistrationMeta.label}</p>
                                          </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => openDocument(docs.businessRegistration, "Business Registration")}>
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    )}

                                    {docs.experienceCertificate && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Star className="w-5 h-5 text-amber-600" />
                                          <div>
                                            <p className="font-medium text-gray-900">Experience Certificate</p>
                                            <p className="text-sm text-gray-500">{experienceCertificateMeta.label}</p>
                                          </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => openDocument(docs.experienceCertificate, "Experience Certificate")}>
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    )}

                                    {docs.portfolioImages && docs.portfolioImages.length > 0 && (
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                          <Camera className="w-5 h-5 text-indigo-600" />
                                          <p className="font-medium text-gray-900">Portfolio Images ({docs.portfolioImages.length})</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                          {docs.portfolioImages.map((image, index) => {
                                            const meta = getDocMeta(image)
                                            return (
                                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                <div className="flex items-center gap-2">
                                                  <Camera className="w-4 h-4 text-gray-400" />
                                                  <span className="text-sm text-gray-600 truncate">{meta.label || `Image ${index + 1}`}</span>
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-xs" onClick={() => openDocument(image, `Portfolio Image ${index + 1}`)}>
                                                  <Eye className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}
                            </div>

                            {/* Additional Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                Additional Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Working Hours</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.workingHours || 'Not specified'}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Emergency Contact</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.emergencyContact || 'Not provided'}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Service Areas</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.serviceAreas || 'Not specified'}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">References</p>
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.references || 'Not provided'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                Admin Actions
                              </h4>
                              
                              <div className="mb-4 space-y-3">
                                <label className="text-sm font-semibold text-gray-700">
                                  Admin Notes (Optional)
                                </label>
                                <Textarea
                                  placeholder="Add notes about this verification..."
                                  value={verificationNotes}
                                  onChange={(e) => setVerificationNotes(e.target.value)}
                                  className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                <Button 
                                  onClick={() => handleVerification(selectedRequest._id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Professional
                                </Button>
                                <Button 
                                  onClick={() => handleVerification(selectedRequest._id, 'reject')}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject Application
                                </Button>
                                <Button 
                                  onClick={() => handleVerification(selectedRequest._id, 'request_more_info')}
                                  className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Request More Info
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
