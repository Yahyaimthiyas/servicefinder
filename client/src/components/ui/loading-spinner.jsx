import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"







const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

export function LoadingSpinner({ size = "md", className, text }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export function LoadingCard({ className }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-muted-foreground/20 rounded w-20"></div>
          <div className="h-8 bg-muted-foreground/20 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Loading...</h3>
          <p className="text-muted-foreground">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  )
}
