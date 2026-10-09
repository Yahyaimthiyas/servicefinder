import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,

} from "lucide-react"

export function ProfessionalNav() {
  const { user } = useAuth()

  if (!user || user.type !== "professional") return null

  const getVerificationBadge = () => {
    switch (user.verificationStatus) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending_admin_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "needs_more_info":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Action Required
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">{user.name}</span>
      </div>
      {getVerificationBadge()}
      {user.verificationStatus !== "verified" && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.location.href = "/professional/verification"}
        >
          Complete Verification
        </Button>
      )}
    </div>
  )
}
