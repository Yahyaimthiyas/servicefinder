import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import VerificationManagement from "./verification-management"
import { SubscriptionManagement } from "./subscription-management"
import { AdvancedRevenueAnalytics } from "./advanced-revenue-analytics"
import { BookingManagement } from "./booking-management"
import { AIAnalyticsDashboard } from "./ai-analytics-dashboard"
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,


  Download,
  Bell,

  BarChart3,

  Activity,
  Zap,
  Crown,
  Award,








  Briefcase,
  Home,
  Wrench,
  Lightbulb,
  Car,
  Scissors,
  BookOpen,
  Stethoscope,
  Hammer
} from "lucide-react"











































export function AdvancedAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    verifiedProfessionals: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    disputesOpen: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  // Check admin authentication
  useEffect(() => {
    checkAdminAuth()
  }, [])

  // Fetch real admin statistics
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminStats()
      fetchProfessionals()
    }
  }, [isAuthenticated])

  const fetchProfessionals = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/professionals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("👥 Professionals loaded:", data.professionals)
        setProfessionals(data.professionals || [])
      }
    } catch (error) {
      console.error("Error fetching professionals:", error)
    }
  }

  const checkAdminAuth = () => {
    try {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")
      
      if (!token || !userStr) {
        console.log("❌ No admin credentials found")
        window.location.href = "/login"
        return
      }

      const user = JSON.parse(userStr)
      if (user.type !== "admin") {
        console.log("❌ User is not admin:", user.type)
        localStorage.clear()
        window.location.href = "/login"
        return
      }

      console.log("✅ Admin authenticated:", user.name)
      setAdminUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("❌ Auth check error:", error)
      localStorage.clear()
      window.location.href = "/login"
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("📊 Admin stats loaded:", data.stats)
        setStats(data.stats)
        setRecentActivity(data.stats.recentActivity || [])
      } else {
        console.error("Failed to fetch admin stats")
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const [professionals, setProfessionals] = useState([])

  const [bookings, setBookings] = useState([])

  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending_admin_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      needs_more_info: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle }
    }
    
    const config = statusConfig[status ] || statusConfig.pending_admin_review
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  const getSubscriptionBadge = (plan) => {
    const planConfig = {
      free: { color: "bg-gray-100 text-gray-800", icon: Users },
      basic: { color: "bg-blue-100 text-blue-800", icon: Star },
      premium: { color: "bg-purple-100 text-purple-800", icon: Crown }
    }
    
    const config = planConfig[plan ] || planConfig.free
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    )
  }

  const getProfessionIcon = (profession) => {
    const icons = {
      plumber: Wrench,
      electrician: Zap,
      carpenter: Hammer,
      painter: Lightbulb,
      cleaner: Home,
      mechanic: Car,
      barber: Scissors,
      tutor: BookOpen,
      doctor: Stethoscope
    }
    
    const Icon = icons[profession.toLowerCase() ] || Briefcase
    return <Icon className="w-4 h-4" />
  }

  const handleExportData = () => {
    try {
      const doc = new jsPDF()
      const marginLeft = 14
      let currentY = 20

      doc.setFontSize(16)
      doc.text("ServiceFinder Admin Report", marginLeft, currentY)
      currentY += 8

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, currentY)
      currentY += 10

      doc.setFontSize(12)
      doc.text("Key Statistics", marginLeft, currentY)
      currentY += 6

      doc.setFontSize(10)
      const lines = [
        `Total Users: ${stats.totalUsers.toLocaleString()}`,
        `Total Professionals: ${stats.totalProfessionals.toLocaleString()}`,
        `Verified Professionals: ${stats.verifiedProfessionals.toLocaleString()}`,
        `Pending Verifications: ${stats.pendingVerifications.toLocaleString()}`,
        `Total Bookings: ${stats.totalBookings.toLocaleString()}`,
        `Completed Bookings: ${stats.completedBookings.toLocaleString()}`,
        `Monthly Revenue: ₹${stats.monthlyRevenue.toLocaleString()}`,
        `Total Revenue: ₹${stats.totalRevenue.toLocaleString()}`,
        `Active Subscriptions: ${stats.activeSubscriptions.toLocaleString()}`,
        `Open Disputes: ${stats.disputesOpen.toLocaleString()}`,
      ]

      lines.forEach((line) => {
        doc.text(line, marginLeft, currentY)
        currentY += 6
      })

      doc.save("servicefinder-admin-report.pdf")
    } catch (error) {
      console.error("Failed to export PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const openNotificationsPage = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/notifications"
    }
  }

  const handleVerifyProfessional = async (professionalId, action, notes) => {
    try {
      console.log(`🔄 ${action} professional:`, professionalId)
      
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId,
          action,
          notes: notes || `Professional ${action}d by admin`,
          rejectionReason: action === 'reject' ? 'Admin decision' : undefined
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Verification processed:", data)
        
        // Update local state
        setProfessionals(prev => 
          prev.map(p => 
            p._id === professionalId 
              ? { ...p, verificationStatus: data.newStatus }
              : p
          )
        )
        
        // Show success notification
        alert(`Professional ${action}d successfully!`)
        
        // Refresh stats
        fetchAdminStats()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error("❌ Verification error:", error)
      alert("Failed to process verification. Please try again.")
    }
  }

  const filteredProfessionals = professionals.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.profession.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || p.verificationStatus === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header with Glass Effect */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 font-medium">ServiceFinder Platform Management</p>
                </div>
              </div>
              {adminUser && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-700 font-medium">
                    Welcome back, <span className="font-semibold">{adminUser.name}</span>
                  </p>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {adminUser.email}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/50 hover:bg-white/80 border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/50 hover:bg-white/80 border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 relative"
                onClick={openNotificationsPage}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {stats.pendingVerifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center animate-bounce">
                    {stats.pendingVerifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Total Users</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">+12.5%</span>
                </div>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">Active Professionals</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-200 transition-all duration-300">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                {stats.verifiedProfessionals}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <Award className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">+8.2%</span>
                </div>
                <span className="text-xs text-gray-500">verified providers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">Total Bookings</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-200 transition-all duration-300">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {stats.totalBookings.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">+23.1%</span>
                </div>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-amber-700 transition-colors">Monthly Revenue</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-200 transition-all duration-300">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">+15.3%</span>
                </div>
                <span className="text-xs text-gray-500">platform revenue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs with Modern Design */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-2">
            <TabsList className="grid w-full grid-cols-6 bg-transparent gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="professionals" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <Users className="w-4 h-4 mr-2" />
                Professionals
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium relative"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verification
                {stats.pendingVerifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 rounded-full flex items-center justify-center">
                    {stats.pendingVerifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="bookings" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Enhanced Recent Activity */}
              <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800">Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                      </div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors group">
                          <div className={`w-3 h-3 rounded-full shadow-lg ${
                            activity.type === 'registration' ? 'bg-gradient-to-r from-green-400 to-green-500 animate-pulse' : 
                            activity.type === 'booking' ? 'bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse' : 
                            'bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            activity.type === 'registration' ? 'bg-green-100' : 
                            activity.type === 'booking' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {activity.type === 'registration' ? <UserCheck className="w-3 h-3 text-green-600" /> :
                             activity.type === 'booking' ? <Calendar className="w-3 h-3 text-blue-600" /> :
                             <AlertTriangle className="w-3 h-3 text-yellow-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">Activity will appear here as users interact with the platform</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Rating</span>
                      <span className="text-sm font-medium">4.7/5.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Growth</span>
                      <span className="text-sm font-medium text-green-600">+18.5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Trending upward</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Management</CardTitle>
                <CardDescription>Manage and monitor all service professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search professionals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending_admin_review">Pending Review</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Professionals List */}
                <div className="space-y-4">
                  {filteredProfessionals.map((professional) => (
                    <div key={professional._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {getProfessionIcon(professional.profession)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{professional.name}</h3>
                            <p className="text-sm text-muted-foreground">{professional.profession}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{professional.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{professional.rating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{professional.totalBookings} bookings</p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(professional.verificationStatus)}
                            {getSubscriptionBadge(professional.subscriptionPlan)}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() => alert(`Professional Details:\n\nName: ${professional.name}\nEmail: ${professional.email}\nPhone: ${professional.phone}\nProfession: ${professional.profession}\nRating: ${professional.rating}\nTotal Bookings: ${professional.totalBookings}\nRevenue: ₹${professional.revenue}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {professional.verificationStatus === 'pending_admin_review' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to approve ${professional.name}?`)) {
                                      handleVerifyProfessional(professional._id, 'approve', 'Approved after admin review')
                                    }
                                  }}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    const reason = prompt(`Why are you rejecting ${professional.name}?`, 'Does not meet verification requirements')
                                    if (reason) {
                                      handleVerifyProfessional(professional._id, 'reject', reason)
                                    }
                                  }}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <VerificationManagement />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <BookingManagement />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="space-y-6">
              <SubscriptionManagement />
              <AdvancedRevenueAnalytics />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AIAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
