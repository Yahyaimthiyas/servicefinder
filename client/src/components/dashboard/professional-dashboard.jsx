import { useAuth } from "@/hooks/use-auth"
import ProfessionalDashboardComponent from "@/components/professional/professional-dashboard"

export function ProfessionalDashboard() {
  const { user } = useAuth()

  // Use our comprehensive professional dashboard component
  return <ProfessionalDashboardComponent />
}
