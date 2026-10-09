 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, } from "@/components/ui/tabs"

import { Progress } from "@/components/ui/progress"
import BookingManagement from "./booking-management"
import ProfileServices from "./profile-services"
import SubscriptionManagement from "./subscription-management"
import ReviewsRatings from "./reviews-ratings"
import EarningsAnalytics from "./earnings-analytics"
import { VerificationStatus } from "./verification-status"
import CustomerCommunication from "./customer-communication"

import AIInsights from "./ai-insights"

import EmergencyServices from "./emergency-services"
import { 
  DollarSign,
  Calendar,
  Star,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,




  Briefcase,



  BarChart3,
  MessageSquare,
  Zap,

  AlertTriangle
} from "lucide-react"





























export default function ProfessionalDashboard() {
  const [professional, setProfessional] = useState(null)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    completedJobs: 0,
    averageRating: 0,
    totalClients: 0,
    responseRate: 0,
    profileCompletion: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProfessionalData()
    fetchDashboardStats()
  }, [])

  const fetchProfessionalData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfessional(data.professional)
      }
    } catch (error) {
      console.error("Error fetching professional data:", error)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/professional/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error("Failed to fetch dashboard stats:", response.statusText)
        // Keep default empty stats - no mock data
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Keep default empty stats - no mock data
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {_optionalChain([professional, 'optionalAccess', _ => _.name, 'optionalAccess', _2 => _2.split, 'call', _3 => _3(' '), 'access', _4 => _4[0]]) || 'Professional'}! 👋
              </h1>
              <p className="text-blue-100">
                Manage your services and track your business growth
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Current Plan</p>
                <Badge className="bg-white/20 text-white border-white/30">
                  {_optionalChain([professional, 'optionalAccess', _5 => _5.subscriptionPlan]) === 'basic' ? 'Basic (Free)' : 
                   _optionalChain([professional, 'optionalAccess', _6 => _6.subscriptionPlan]) === 'professional' ? 'Professional' :
                   _optionalChain([professional, 'optionalAccess', _7 => _7.subscriptionPlan]) === 'premium' ? 'Premium' : 'Basic (Free)'}
                </Badge>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Modern Navigation Cards - Row 1 (5 items) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "overview" 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <BarChart3 className={`w-6 h-6 mx-auto mb-2 ${activeTab === "overview" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-sm font-medium ${activeTab === "overview" ? "text-blue-900" : "text-gray-700"}`}>Overview</p>
            </button>
            
            <button
              onClick={() => setActiveTab("bookings")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "bookings" 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Calendar className={`w-6 h-6 mx-auto mb-2 ${activeTab === "bookings" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-sm font-medium ${activeTab === "bookings" ? "text-blue-900" : "text-gray-700"}`}>Bookings</p>
            </button>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "profile" 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Users className={`w-6 h-6 mx-auto mb-2 ${activeTab === "profile" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-sm font-medium ${activeTab === "profile" ? "text-blue-900" : "text-gray-700"}`}>Profile</p>
            </button>
            
            <button
              onClick={() => setActiveTab("reviews")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "reviews" 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Star className={`w-6 h-6 mx-auto mb-2 ${activeTab === "reviews" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-sm font-medium ${activeTab === "reviews" ? "text-blue-900" : "text-gray-700"}`}>Reviews</p>
            </button>
            
            <button
              onClick={() => setActiveTab("earnings")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "earnings" 
                  ? "border-blue-500 bg-blue-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <DollarSign className={`w-6 h-6 mx-auto mb-2 ${activeTab === "earnings" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-sm font-medium ${activeTab === "earnings" ? "text-blue-900" : "text-gray-700"}`}>Earnings</p>
            </button>
          </div>
          
          {/* Advanced Features - Row 2 (5 items including Plans) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <button
              onClick={() => setActiveTab("subscription")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                activeTab === "subscription" 
                  ? "border-blue-500 bg-blue-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Crown className={`w-5 h-5 mx-auto mb-1 ${activeTab === "subscription" ? "text-blue-600" : "text-gray-600"}`} />
              <p className={`text-xs font-medium ${activeTab === "subscription" ? "text-blue-900" : "text-gray-700"}`}>Plans</p>
            </button>
            <button
              onClick={() => setActiveTab("verification")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                activeTab === "verification" 
                  ? "border-green-500 bg-green-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Shield className={`w-5 h-5 mx-auto mb-1 ${activeTab === "verification" ? "text-green-600" : "text-gray-600"}`} />
              <p className={`text-xs font-medium ${activeTab === "verification" ? "text-green-900" : "text-gray-700"}`}>Verify</p>
            </button>
            
            <button
              onClick={() => window.location.href = "/professional/chat"}
              className="p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">Chat</p>
            </button>
            
            <button
              onClick={() => setActiveTab("insights")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                activeTab === "insights" 
                  ? "border-yellow-500 bg-yellow-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Zap className={`w-5 h-5 mx-auto mb-1 ${activeTab === "insights" ? "text-yellow-600" : "text-gray-600"}`} />
              <p className={`text-xs font-medium ${activeTab === "insights" ? "text-yellow-900" : "text-gray-700"}`}>AI Insights</p>
            </button>
            
            <button
              onClick={() => setActiveTab("emergency")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                activeTab === "emergency" 
                  ? "border-red-500 bg-red-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${activeTab === "emergency" ? "text-red-600" : "text-gray-600"}`} />
              <p className={`text-xs font-medium ${activeTab === "emergency" ? "text-red-900" : "text-gray-700"}`}>Emergency</p>
            </button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
                      {stats.totalEarnings > 0 && (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3" />
                          Total from completed jobs
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {stats.activeBookings === 0 ? "No active bookings" : `${stats.activeBookings} active jobs`}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${star <= Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                      <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        {stats.totalClients === 0 ? "No clients yet" : "Unique customers served"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Profile Completion
                  </CardTitle>
                  <CardDescription>
                    Complete your profile to get more bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">{stats.profileCompletion}%</span>
                  </div>
                  <Progress value={stats.profileCompletion} className="h-2" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Basic Information
                      </span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Service Details
                      </span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Portfolio Images
                      </span>
                      <span className="text-amber-600">Pending</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Verification Documents
                      </span>
                      <span className="text-amber-600">Pending</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={() => setActiveTab("profile")}>
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Manage your business efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Clients
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("reviews")}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Reviews & Ratings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("earnings")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Earnings Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {_optionalChain([professional, 'optionalAccess', _8 => _8.subscriptionPlan]) === 'basic' ? 'Upgrade to Premium' : 'Manage Subscription'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Management
                  </CardTitle>
                  <CardDescription>Manage your service bookings and appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Profile & Services Management
                  </CardTitle>
                  <CardDescription>Manage your professional profile and service offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileServices professional={professional} onUpdate={fetchProfessionalData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Reviews & Ratings
                  </CardTitle>
                  <CardDescription>Customer feedback and rating management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewsRatings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Earnings & Analytics
                  </CardTitle>
                  <CardDescription>Revenue tracking and business analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <EarningsAnalytics stats={stats} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Subscription Management
                  </CardTitle>
                  <CardDescription>Manage your subscription and unlock premium features</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionManagement professional={professional} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Verification Status
                  </CardTitle>
                  <CardDescription>Track your professional verification progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <VerificationStatus userId={_optionalChain([professional, 'optionalAccess', _9 => _9._id]) || ''} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Customer Communication
                  </CardTitle>
                  <CardDescription>Real-time chat and communication with customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerCommunication />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>Machine learning recommendations for business growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <AIInsights />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Emergency Services
                  </CardTitle>
                  <CardDescription>24/7 emergency service management with premium pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmergencyServices />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
