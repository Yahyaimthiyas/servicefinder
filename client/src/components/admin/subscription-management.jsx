import { useState, } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Crown, 
  Star, 
  Users, 
  TrendingUp, 
  DollarSign,

  CreditCard,



  Eye,
  Edit,
  Plus,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"



























export function SubscriptionManagement() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      _id: "1",
      name: "Free",
      price: 0,
      duration: "lifetime",
      features: [
        "Basic profile listing",
        "Up to 5 service categories",
        "Customer reviews",
        "Basic support"
      ],
      isActive: true,
      subscriberCount: 156,
      revenue: 0,
      color: "gray",
      icon: "Users"
    },
    {
      _id: "2",
      name: "Basic",
      price: 499,
      duration: "monthly",
      features: [
        "Everything in Free",
        "Higher search ranking",
        "Up to 15 service categories",
        "Priority customer support",
        "Basic analytics",
        "Featured in category listings"
      ],
      isActive: true,
      subscriberCount: 89,
      revenue: 44411,
      color: "blue",
      icon: "Star"
    },
    {
      _id: "3",
      name: "Premium",
      price: 999,
      duration: "monthly",
      features: [
        "Everything in Basic",
        "Top search placement",
        "Unlimited service categories",
        "24/7 priority support",
        "Advanced analytics & insights",
        "Featured on homepage",
        "AI-powered lead matching",
        "Custom business profile",
        "Verified badge priority"
      ],
      isActive: true,
      subscriberCount: 45,
      revenue: 44955,
      color: "purple",
      icon: "Crown"
    }
  ])

  const [subscriptions, setSubscriptions] = useState([
    {
      _id: "1",
      professionalId: "prof_1",
      professionalName: "Rajesh Kumar",
      planName: "Premium",
      status: "active",
      startDate: "2024-09-01",
      endDate: "2024-10-01",
      amount: 999,
      paymentStatus: "paid",
      autoRenew: true
    },
    {
      _id: "2",
      professionalId: "prof_2",
      professionalName: "Priya Sharma",
      planName: "Basic",
      status: "active",
      startDate: "2024-09-15",
      endDate: "2024-10-15",
      amount: 499,
      paymentStatus: "paid",
      autoRenew: false
    },
    {
      _id: "3",
      professionalId: "prof_3",
      professionalName: "Amit Singh",
      planName: "Basic",
      status: "expired",
      startDate: "2024-08-01",
      endDate: "2024-09-01",
      amount: 499,
      paymentStatus: "paid",
      autoRenew: false
    }
  ])

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editDuration, setEditDuration] = useState("monthly")
  const [editStatus, setEditStatus] = useState("active")

  const totalRevenue = subscriptionPlans.reduce((sum, plan) => sum + plan.revenue, 0)
  const totalSubscribers = subscriptionPlans.reduce((sum, plan) => sum + plan.subscriberCount, 0)
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length
  const expiringSubscriptions = subscriptions.filter(sub => {
    const endDate = new Date(sub.endDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }).length

  const getPlanIcon = (iconName) => {
    const icons = {
      Users: Users,
      Star: Star,
      Crown: Crown
    }
    const Icon = icons[iconName ] || Users
    return <Icon className="w-5 h-5" />
  }

  const getPlanColor = (color) => {
    const colors = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200"
    }
    return colors[color ] || colors.gray
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Active" },
      expired: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Expired" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle, text: "Cancelled" },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" }
    }
    
    const config = statusConfig[status ] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handlePlanUpdate = (planId, updates) => {
    setSubscriptionPlans(prev => 
      prev.map(plan => 
        plan._id === planId ? { ...plan, ...updates } : plan
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">Manage pricing plans and professional subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Revenue Report
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  +15.3% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  +8.2% growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringSubscriptions}</p>
                <p className="text-xs text-orange-600">Within 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Manage pricing plans and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan._id} className={`border-2 ${getPlanColor(plan.color)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.icon)}
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">
                    ₹{plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.duration === 'lifetime' ? 'lifetime' : 'month'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subscribers:</span>
                      <span className="font-medium">{plan.subscriberCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue:</span>
                      <span className="font-medium">₹{plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Plan Details - {plan.name}</DialogTitle>
                          <DialogDescription>
                            Detailed information about the {plan.name} subscription plan
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Plan Name</label>
                              <p className="text-sm text-muted-foreground">{plan.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Price</label>
                              <p className="text-sm text-muted-foreground">₹{plan.price}/{plan.duration}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Subscribers</label>
                              <p className="text-sm text-muted-foreground">{plan.subscriberCount}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Revenue</label>
                              <p className="text-sm text-muted-foreground">₹{plan.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Features</label>
                            <ul className="mt-2 space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setEditName(plan.name)
                        setEditPrice(plan.price.toString())
                        setEditDuration(plan.duration)
                        setEditStatus(plan.isActive ? "active" : "inactive")
                        setIsEditingPlan(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Monitor professional subscriptions and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{subscription.professionalName}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.planName} Plan</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Started: {formatDate(subscription.startDate)}</span>
                        <span>Expires: {formatDate(subscription.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{subscription.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.autoRenew ? "Auto-renew ON" : "Auto-renew OFF"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(subscription.status)}
                      <Badge variant={subscription.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                        {subscription.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionPlans.filter(plan => plan.revenue > 0).map((plan) => {
                const percentage = (plan.revenue / totalRevenue) * 100
                return (
                  <div key={plan._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getPlanIcon(plan.icon)}
                        {plan.name}
                      </span>
                      <span className="font-medium">₹{plan.revenue.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${plan.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Subscription Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">New Subscriptions</p>
                  <p className="text-2xl font-bold text-green-600">+23</p>
                </div>
                <ArrowUp className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Renewals</p>
                  <p className="text-2xl font-bold text-blue-600">+18</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Cancellations</p>
                  <p className="text-2xl font-bold text-red-600">-5</p>
                </div>
                <ArrowDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPlan && (
        <Dialog
          open={isEditingPlan}
          onOpenChange={(open) => {
            setIsEditingPlan(open)
            if (!open) {
              setSelectedPlan(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plan - {selectedPlan.name}</DialogTitle>
              <DialogDescription>
                Update pricing and status for this subscription plan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    className="mt-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Billing Duration</label>
                  <Select
                    value={editDuration}
                    onValueChange={setEditDuration}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editStatus}
                    onValueChange={(value) =>
                      setEditStatus(value )
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingPlan(false)
                  setSelectedPlan(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedPlan) return
                  handlePlanUpdate(selectedPlan._id, {
                    name: editName || selectedPlan.name,
                    price: Number(editPrice) || 0,
                    duration: editDuration,
                    isActive: editStatus === "active",
                  })
                  setIsEditingPlan(false)
                  setSelectedPlan(null)
                }}
              >
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
