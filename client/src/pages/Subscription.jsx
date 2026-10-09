import { useAuth } from "@/hooks/use-auth"
import { SubscriptionManagement } from "@/components/monetization/subscription-management"
import { PremiumFeatures } from "@/components/monetization/premium-features"

export default function SubscriptionPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Please log in to view your subscription.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your plan, billing, and premium features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SubscriptionManagement userType={user.type } />
          </div>
          <div>
            <PremiumFeatures
              userType={user.type }
              currentPlan={user.type === "customer" ? "premium" : "professional"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
