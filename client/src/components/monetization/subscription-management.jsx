import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Calendar, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"





export function SubscriptionManagement({ userType }) {
  const [currentPlan] = useState(userType === "customer" ? "premium" : "professional")
  const [billingCycle] = useState("monthly")
  const [nextBillingDate] = useState("2024-04-15")
  const [usageData] = useState({
    bookings: { used: 23, limit: 50 },
    listings: { used: 8, limit: 10 },
    support: { used: 3, limit: 10 },
  })

  const planDetails = {
    customer: {
      basic: { name: "Basic", price: 0, features: ["Basic features"] },
      premium: { name: "Premium", price: 9.99, features: ["All premium features"] },
    },
    professional: {
      starter: { name: "Starter", price: 29.99, features: ["Basic professional tools"] },
      professional: { name: "Professional", price: 59.99, features: ["Advanced tools"] },
      enterprise: { name: "Enterprise", price: 149.99, features: ["Complete solution"] },
    },
  }

  const currentPlanDetails = planDetails[userType][currentPlan ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{currentPlanDetails.name}</h3>
              <p className="text-muted-foreground">
                ${currentPlanDetails.price}/{billingCycle === "monthly" ? "month" : "year"}
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Next billing: {nextBillingDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Auto-renewal enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bookings</span>
                <span>
                  {usageData.bookings.used}/{usageData.bookings.limit}
                </span>
              </div>
              <Progress value={(usageData.bookings.used / usageData.bookings.limit) * 100} className="h-2" />
            </div>

            {userType === "professional" && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Service Listings</span>
                  <span>
                    {usageData.listings.used}/{usageData.listings.limit}
                  </span>
                </div>
                <Progress value={(usageData.listings.used / usageData.listings.limit) * 100} className="h-2" />
              </div>
            )}

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Support Requests</span>
                <span>
                  {usageData.support.used}/{usageData.support.limit}
                </span>
              </div>
              <Progress value={(usageData.support.used / usageData.support.limit) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-03-15", amount: currentPlanDetails.price, status: "Paid" },
              { date: "2024-02-15", amount: currentPlanDetails.price, status: "Paid" },
              { date: "2024-01-15", amount: currentPlanDetails.price, status: "Paid" },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{invoice.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" className="w-full bg-transparent">
          <CreditCard className="h-4 w-4 mr-2" />
          Update Payment Method
        </Button>
        <Button variant="outline" className="w-full bg-transparent">
          <TrendingUp className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      {/* Cancellation Warning */}
      <Card className="border-yellow-500/20 bg-yellow-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Plan Cancellation</p>
              <p className="text-sm text-yellow-300 mt-1">
                You can cancel your subscription at any time. Your plan will remain active until the end of the current
                billing period.
              </p>
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 mt-2 p-0">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
