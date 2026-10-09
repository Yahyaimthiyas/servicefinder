 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Crown,
  Check,

  Star,

  Shield,
  TrendingUp,
  Users,
  Calendar,
  Phone,

  Award,

  Sparkles,
  CreditCard,
  Clock,
  BarChart3
} from "lucide-react"

































export default function SubscriptionManagement({ professional }) {
  const [currentPlan, setCurrentPlan] = useState({
    id: "basic",
    name: "Basic",
    price: 0,
    duration: "Free Forever",
    features: [],
    limits: {
      bookingsPerMonth: 5,
      profileViews: 100,
      customerSupport: "Email only",
      portfolioImages: 3,
      featuredListing: false,
      prioritySupport: false,
      analytics: false,
      multipleServices: false
    }
  })
  const [availablePlans, setAvailablePlans] = useState([])
  const [usage, setUsage] = useState({
    bookingsThisMonth: 0,
    profileViewsThisMonth: 0,
    portfolioImagesUsed: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    fetchAvailablePlans()
    fetchUsageStats()
  }, [])

  useEffect(() => {
    if (availablePlans.length > 0) {
      fetchSubscriptionData()
    }
  }, [availablePlans])

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/subscription", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Subscription API response:", data)
        // Find the plan details from available plans
        const planId = _optionalChain([data, 'access', _ => _.subscription, 'optionalAccess', _2 => _2.currentPlan]) || 'basic'
        console.log("Current plan ID:", planId)
        const planDetails = availablePlans.find(p => p.id === planId)
        console.log("Found plan details:", planDetails)
        if (planDetails) {
          setCurrentPlan(planDetails)
        } else {
          // Fallback to basic plan if not found
          const basicPlan = availablePlans.find(p => p.id === 'basic')
          if (basicPlan) {
            setCurrentPlan(basicPlan)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
    }
  }

  const fetchAvailablePlans = () => {
    // Mock subscription plans
    const plans = [
      {
        id: "basic",
        name: "Basic",
        price: 0,
        duration: "Free Forever",
        features: [
          "Create professional profile",
          "Receive customer bookings",
          "Basic customer communication",
          "Mobile app access"
        ],
        limits: {
          bookingsPerMonth: 5,
          profileViews: 100,
          customerSupport: "Email only",
          portfolioImages: 3,
          featuredListing: false,
          prioritySupport: false,
          analytics: false,
          multipleServices: false
        }
      },
      {
        id: "professional",
        name: "Professional",
        price: 299,
        duration: "per month",
        popular: true,
        features: [
          "Everything in Basic",
          "Unlimited bookings",
          "Featured profile listing",
          "Advanced analytics",
          "Priority customer support",
          "Multiple service categories",
          "Portfolio showcase (10 images)",
          "Customer review management"
        ],
        limits: {
          bookingsPerMonth: "Unlimited",
          profileViews: "Unlimited",
          customerSupport: "Phone & Email",
          portfolioImages: 10,
          featuredListing: true,
          prioritySupport: true,
          analytics: true,
          multipleServices: true
        }
      },
      {
        id: "premium",
        name: "Premium",
        price: 599,
        duration: "per month",
        features: [
          "Everything in Professional",
          "Top search ranking",
          "Verified professional badge",
          "24/7 priority support",
          "Advanced booking management",
          "Customer insights & AI recommendations",
          "Unlimited portfolio images",
          "Marketing tools & promotions",
          "Revenue analytics & reports"
        ],
        limits: {
          bookingsPerMonth: "Unlimited",
          profileViews: "Unlimited",
          customerSupport: "24/7 Phone & Chat",
          portfolioImages: "Unlimited",
          featuredListing: true,
          prioritySupport: true,
          analytics: true,
          multipleServices: true
        }
      }
    ]
    
    setAvailablePlans(plans)
    
    // Set current plan based on professional data
    const current = plans.find(p => p.id === (_optionalChain([professional, 'optionalAccess', _3 => _3.subscriptionPlan]) || 'basic'))
    setCurrentPlan(current || plans[0]) // This will set Basic plan as default
    setLoading(false)
    
    console.log("Available plans:", plans)
    console.log("Professional subscription plan:", _optionalChain([professional, 'optionalAccess', _4 => _4.subscriptionPlan]))
    console.log("Selected current plan:", current || plans[0])
  }

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/usage-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      } else {
        console.error("Failed to fetch usage stats:", response.statusText)
        // Keep default empty usage - no mock data
        setUsage({
          bookingsThisMonth: 0,
          profileViewsThisMonth: 0,
          portfolioImagesUsed: 0
        })
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error)
      setUsage({
        bookingsThisMonth: 0,
        profileViewsThisMonth: 0,
        portfolioImagesUsed: 0
      })
    }
  }

  const upgradePlan = async (planId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        // Redirect to payment or update UI
        fetchSubscriptionData()
      }
    } catch (error) {
      console.error("Error upgrading plan:", error)
    }
  }

  const getUsagePercentage = (used, limit) => {
    if (limit === "Unlimited") return 0
    return Math.min((used / (limit )) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading subscription details...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{_optionalChain([currentPlan, 'optionalAccess', _5 => _5.name])} Plan</h2>
                  <p className="text-blue-100">
                    {_optionalChain([currentPlan, 'optionalAccess', _6 => _6.price]) === 0 ? 'Free Forever' : `₹${_optionalChain([currentPlan, 'optionalAccess', _7 => _7.price])}/${_optionalChain([currentPlan, 'optionalAccess', _8 => _8.duration])}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                {_optionalChain([professional, 'optionalAccess', _9 => _9.subscriptionExpiry]) && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires: {new Date(professional.subscriptionExpiry).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Crown className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Current Usage
          </CardTitle>
          <CardDescription>
            Track your plan usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bookings Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Bookings</span>
                <span className="text-sm text-gray-600">
                  {usage.bookingsThisMonth} / {_optionalChain([currentPlan, 'optionalAccess', _10 => _10.limits, 'access', _11 => _11.bookingsPerMonth])}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.bookingsThisMonth, _optionalChain([currentPlan, 'optionalAccess', _12 => _12.limits, 'access', _13 => _13.bookingsPerMonth]) || 0)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {_optionalChain([currentPlan, 'optionalAccess', _14 => _14.limits, 'access', _15 => _15.bookingsPerMonth]) === "Unlimited" 
                  ? "Unlimited bookings available" 
                  : `${(_optionalChain([currentPlan, 'optionalAccess', _16 => _16.limits, 'access', _17 => _17.bookingsPerMonth]) ) - usage.bookingsThisMonth} bookings remaining`
                }
              </p>
            </div>

            {/* Profile Views */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Views</span>
                <span className="text-sm text-gray-600">
                  {usage.profileViewsThisMonth} / {_optionalChain([currentPlan, 'optionalAccess', _18 => _18.limits, 'access', _19 => _19.profileViews])}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.profileViewsThisMonth, _optionalChain([currentPlan, 'optionalAccess', _20 => _20.limits, 'access', _21 => _21.profileViews]) || 0)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {_optionalChain([currentPlan, 'optionalAccess', _22 => _22.limits, 'access', _23 => _23.profileViews]) === "Unlimited" 
                  ? "Unlimited views available" 
                  : `${(_optionalChain([currentPlan, 'optionalAccess', _24 => _24.limits, 'access', _25 => _25.profileViews]) ) - usage.profileViewsThisMonth} views remaining`
                }
              </p>
            </div>

            {/* Portfolio Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Images</span>
                <span className="text-sm text-gray-600">
                  {usage.portfolioImagesUsed} / {_optionalChain([currentPlan, 'optionalAccess', _26 => _26.limits, 'access', _27 => _27.portfolioImages])}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.portfolioImagesUsed, _optionalChain([currentPlan, 'optionalAccess', _28 => _28.limits, 'access', _29 => _29.portfolioImages]) || 0)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {_optionalChain([currentPlan, 'optionalAccess', _30 => _30.limits, 'access', _31 => _31.portfolioImages]) === "Unlimited" 
                  ? "Unlimited images available" 
                  : `${(_optionalChain([currentPlan, 'optionalAccess', _32 => _32.limits, 'access', _33 => _33.portfolioImages]) ) - usage.portfolioImagesUsed} images remaining`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Available Plans</h3>
          <p className="text-sm text-gray-600">Choose the plan that fits your business needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${
                _optionalChain([currentPlan, 'optionalAccess', _34 => _34.id]) === plan.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {plan.id === 'basic' && <Shield className="w-8 h-8 text-gray-600" />}
                  {plan.id === 'professional' && <Crown className="w-8 h-8 text-blue-600" />}
                  {plan.id === 'premium' && <Sparkles className="w-8 h-8 text-purple-600" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  <span className="text-sm font-normal text-gray-600">
                    {plan.price > 0 && `/${plan.duration}`}
                  </span>
                </div>
                <CardDescription>{plan.duration}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Plan Limits */}
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold text-sm">Plan Limits:</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Monthly Bookings:</span>
                      <span className="font-medium">{plan.limits.bookingsPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Portfolio Images:</span>
                      <span className="font-medium">{plan.limits.portfolioImages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Support:</span>
                      <span className="font-medium">{plan.limits.customerSupport}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {_optionalChain([currentPlan, 'optionalAccess', _35 => _35.id]) === plan.id ? (
                    <Button disabled className="w-full">
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {plan.price === 0 ? 'Downgrade to' : 'Upgrade to'} {plan.name} Plan
                          </DialogTitle>
                        </DialogHeader>
                        {selectedPlan && (
                          <div className="space-y-4">
                            <div className="text-center p-6 bg-gray-50 rounded-lg">
                              <div className="text-3xl font-bold mb-2">
                                {selectedPlan.price === 0 ? 'Free' : `₹${selectedPlan.price}`}
                              </div>
                              <p className="text-gray-600">{selectedPlan.duration}</p>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold">What you'll get:</h4>
                              {selectedPlan.features.slice(0, 4).map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>

                            {selectedPlan.price > 0 && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Payment Details</span>
                                </div>
                                <p className="text-sm text-blue-700">
                                  You'll be charged ₹{selectedPlan.price} immediately. 
                                  Your subscription will auto-renew monthly.
                                </p>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <Button 
                                onClick={() => upgradePlan(selectedPlan.id)}
                                className="flex-1"
                              >
                                {selectedPlan.price === 0 ? 'Confirm Downgrade' : 'Proceed to Payment'}
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits of Upgrading */}
      {_optionalChain([currentPlan, 'optionalAccess', _36 => _36.id]) === 'basic' && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Why Upgrade?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Get More Customers</h4>
                  <p className="text-sm text-green-700">Featured listings get 3x more views</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Unlimited Bookings</h4>
                  <p className="text-sm text-blue-700">Accept as many jobs as you want</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800">Priority Support</h4>
                  <p className="text-sm text-purple-700">Get help when you need it most</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800">Professional Badge</h4>
                  <p className="text-sm text-amber-700">Build trust with verified status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
