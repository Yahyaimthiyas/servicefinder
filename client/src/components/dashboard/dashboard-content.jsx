import { useAuth } from "@/hooks/use-auth"
import { CustomerDashboard } from "./customer-dashboard"
import { ProfessionalDashboard } from "./professional-dashboard"
import { AdvancedAdminDashboard } from "@/components/admin/advanced-admin-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "@/hooks/use-router"
import { useEffect } from "react"

export function DashboardContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    
    // Redirect unverified professionals to verification page
    if (!isLoading && user && user.type === "professional") {
      const verifiedStatuses = ["verified", "approved"]
      if (!verifiedStatuses.includes(user.verificationStatus || "")) {
        router.push("/professional/verification")
      }
    }
    
    // Redirect customers to their specific dashboard
    if (!isLoading && user && user.type === "customer") {
      const currentPath = window.location.pathname
      if (currentPath === "/dashboard") {
        router.push("/customer/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect border-0 shadow-professional-lg">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/login")}
              className="w-full shadow-professional hover:shadow-professional-lg transition-shadow"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  switch (user.type) {
    case "admin":
      return <AdvancedAdminDashboard />
    case "professional":
      return <ProfessionalDashboard />
    case "customer":
    default:
      return <CustomerDashboard />
  }
}
