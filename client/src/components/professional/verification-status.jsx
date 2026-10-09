import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Upload, 
  FileText, 
  Shield,
  AlertCircle,
  Loader2,

  Award
} from "lucide-react"





export function VerificationStatus({ userId }) {
  const [status, setStatus] = useState({
    verificationStatus: "pending_documents",
    documentsSubmitted: false,
    mobileVerified: false,
    canReceiveBookings: false,
    verificationNotes: "",
    rejectionReason: ""
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [documents, setDocuments] = useState({
    governmentId: "",
    professionalLicense: "",
    businessRegistration: "",
    portfolio: [] ,
    experienceCertificates: [] 
  })

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/professional/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Error fetching status:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitDocuments = async () => {
    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch("/api/professional/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(documents),
      })

      if (response.ok) {
        await fetchStatus()
      }
    } catch (error) {
      console.error("Error submitting documents:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusConfig = () => {
    switch (status.verificationStatus) {
      case "pending_documents":
        return {
          icon: Upload,
          title: "Submit Documents",
          description: "Upload your verification documents to get started",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200"
        }
      case "pending_admin_review":
        return {
          icon: Clock,
          title: "Under Review",
          description: "Your documents are being reviewed by our admin team",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200"
        }
      case "verified":
        return {
          icon: CheckCircle,
          title: "Verified Professional",
          description: "You can now receive bookings from customers",
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200"
        }
      case "rejected":
        return {
          icon: XCircle,
          title: "Verification Rejected",
          description: "Please review the feedback and resubmit documents",
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200"
        }
      case "needs_more_info":
        return {
          icon: AlertCircle,
          title: "Additional Information Needed",
          description: "Please provide additional documents as requested",
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          borderColor: "border-orange-200"
        }
      default:
        return {
          icon: Shield,
          title: "Verification Required",
          description: "Complete verification to start serving customers",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200"
        }
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`${config.borderColor} border-2`}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <CardTitle className={config.color}>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${status.mobileVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Mobile Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${status.documentsSubmitted ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Documents Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${status.verificationStatus === 'verified' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Admin Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${status.canReceiveBookings ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Can Receive Bookings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Form */}
      {(status.verificationStatus === "pending_documents" || status.verificationStatus === "rejected" || status.verificationStatus === "needs_more_info") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Verification Documents
            </CardTitle>
            <CardDescription>
              Provide the following documents for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="governmentId">Government ID (Aadhaar/Passport) *</Label>
              <Input
                id="governmentId"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments(prev => ({ ...prev, governmentId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalLicense">Professional License/Certificate *</Label>
              <Input
                id="professionalLicense"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments(prev => ({ ...prev, professionalLicense: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessRegistration">Business Registration (Optional)</Label>
              <Input
                id="businessRegistration"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocuments(prev => ({ ...prev, businessRegistration: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio Photos</Label>
              <Input
                id="portfolio"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setDocuments(prev => ({ ...prev, portfolio: Array.from(e.target.files || []) }))}
              />
              <p className="text-xs text-muted-foreground">Upload photos of your previous work</p>
            </div>

            {status.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                <p className="text-sm text-red-700">{status.rejectionReason}</p>
              </div>
            )}

            {status.verificationNotes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Admin Notes:</h4>
                <p className="text-sm text-blue-700">{status.verificationNotes}</p>
              </div>
            )}

            <Button 
              onClick={submitDocuments} 
              disabled={submitting || !documents.governmentId || !documents.professionalLicense}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {status.verificationStatus === "verified" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
                <p className="text-green-700">
                  You are now a verified professional. You can start receiving bookings from customers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
