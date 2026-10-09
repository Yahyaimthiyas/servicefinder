import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Star, TrendingUp, Shield, Headphones } from "lucide-react"






export function PremiumFeatures({ userType, currentPlan }) {
  const customerFeatures = [
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Get personalized service recommendations based on your needs and preferences",
      available: currentPlan === "premium",
    },
    {
      icon: Star,
      title: "Priority Booking",
      description: "Skip the queue and get faster responses from professionals",
      available: currentPlan === "premium",
    },
    {
      icon: Shield,
      title: "Extended Protection",
      description: "Enhanced insurance coverage and satisfaction guarantee",
      available: currentPlan === "premium",
    },
    {
      icon: Headphones,
      title: "24/7 Premium Support",
      description: "Get instant help from our dedicated premium support team",
      available: currentPlan === "premium",
    },
  ]

  const professionalFeatures = [
    {
      icon: TrendingUp,
      title: "Priority Search Placement",
      description: "Appear at the top of search results and get more visibility",
      available: ["professional", "enterprise"].includes(currentPlan),
    },
    {
      icon: Crown,
      title: "Custom Branding",
      description: "Customize your profile with your brand colors and logo",
      available: ["professional", "enterprise"].includes(currentPlan),
    },
    {
      icon: Zap,
      title: "AI Scheduling Optimization",
      description: "Automatically optimize your schedule for maximum bookings",
      available: ["professional", "enterprise"].includes(currentPlan),
    },
    {
      icon: Star,
      title: "Advanced Analytics",
      description: "Detailed insights into your performance and customer behavior",
      available: ["professional", "enterprise"].includes(currentPlan),
    },
  ]

  const features = userType === "customer" ? customerFeatures : professionalFeatures

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Premium Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${feature.available ? "bg-blue-500/10" : "bg-gray-500/10"}`}>
                  <Icon className={`h-4 w-4 ${feature.available ? "text-blue-500" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    {feature.available ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="outline">Upgrade Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}

          {currentPlan === "basic" || currentPlan === "starter" ? (
            <div className="pt-4 border-t">
              <Button className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
