import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"








export function VerificationBadge({ 
  status, 
  size = "md", 
  showText = true, 
  className 
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          text: "Verified Professional",
          variant: "default" ,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
        }
      case "pending":
        return {
          icon: Clock,
          text: "Verification Pending",
          variant: "secondary" ,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
        }
      case "rejected":
        return {
          icon: XCircle,
          text: "Verification Failed",
          variant: "destructive" ,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
        }
      default:
        return {
          icon: Shield,
          text: "Unverified",
          variant: "outline" ,
          className: "bg-gray-100 text-gray-800 border-gray-200"
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showText && <span>{config.text}</span>}
    </Badge>
  )
}

// Compact version for lists
export function VerificationIcon({ 
  status, 
  size = "sm",
  className 
}) {
  return (
    <VerificationBadge 
      status={status} 
      size={size} 
      showText={false} 
      className={className}
    />
  )
}
