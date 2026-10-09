import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign,
  TrendingUp,

  Calendar,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Clock,
  Users,
  Star,
  Target,
  Award,
  Zap
} from "lucide-react"

























































export default function EarningsAnalytics({ stats }) {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisWeek: 0,
    lastWeek: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averageJobValue: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0
  })
  
  const [analytics, setAnalytics] = useState({
    profileViews: { total: 0, thisMonth: 0, growth: 0 },
    bookingConversion: { rate: 0, totalInquiries: 0, convertedBookings: 0 },
    customerRetention: { rate: 0, repeatCustomers: 0, newCustomers: 0 },
    servicePopularity: [],
    monthlyTrends: []
  })
  
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("thisMonth")

  useEffect(() => {
    fetchEarningsData()
    fetchAnalyticsData()
  }, [])

  const fetchEarningsData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/earnings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const apiEarnings = data.earnings || {}

        setEarnings((prev) => ({
          ...prev,
          ...apiEarnings,
        }))
      } else {
        console.error("Failed to fetch earnings data:", response.statusText)
        // Keep default empty earnings - no mock data
      }
    } catch (error) {
      console.error("Error fetching earnings data:", error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const apiAnalytics = data.analytics || {}

        setAnalytics((prev) => ({
          ...prev,
          ...apiAnalytics,
          profileViews: {
            ...prev.profileViews,
            ...(apiAnalytics.profileViews || {}),
          },
          bookingConversion: {
            ...prev.bookingConversion,
            ...(apiAnalytics.bookingConversion || {}),
          },
          customerRetention: {
            ...prev.customerRetention,
            ...(apiAnalytics.customerRetention || {}),
          },
          servicePopularity: apiAnalytics.servicePopularity || prev.servicePopularity || [],
          monthlyTrends: apiAnalytics.monthlyTrends || prev.monthlyTrends || [],
        }))
      } else {
        console.error("Failed to fetch analytics data:", response.statusText)
        // Keep default empty analytics - no mock data
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    console.log("Exporting earnings report...")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings & Analytics</h2>
          <p className="text-gray-600">Track your business performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹{Number(earnings.totalEarnings || 0).toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      All time earnings
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">₹{Number(earnings.thisMonth || 0).toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +{earnings.monthlyGrowth}% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Job Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{Number(earnings.averageJobValue || 0).toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <Target className="w-3 h-3" />
                      Per completed job
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">₹{Number(earnings.pendingPayments || 0).toLocaleString()}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Awaiting payment
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Earnings Trend
              </CardTitle>
              <CardDescription>
                Track your earnings growth over the past months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics.monthlyTrends || []).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No monthly trend data available yet.
                  </p>
                ) : (
                  (analytics.monthlyTrends || []).map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{trend.month} 2024</h4>
                          <p className="text-sm text-gray-600">
                            {trend.bookings} bookings completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          ₹{Number(trend.earnings || 0).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{trend.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Revenue by Service Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(analytics.servicePopularity || []).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No service breakdown data available yet.
                  </p>
                ) : (
                  (analytics.servicePopularity || []).map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {service.bookings}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{service.service}</h4>
                          <p className="text-sm text-gray-600">
                            {service.bookings} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ₹{Number(service.revenue || 0).toLocaleString()}
                        </p>
                        {service.bookings > 0 && (
                          <p className="text-xs text-gray-500">
                            ₹{Math.round(service.revenue / service.bookings)} avg
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {analytics.profileViews.thisMonth}
                </h3>
                <p className="text-sm text-gray-600 mb-2">Profile Views This Month</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analytics.profileViews.growth}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {analytics.bookingConversion.rate}%
                </h3>
                <p className="text-sm text-gray-600 mb-2">Booking Conversion Rate</p>
                <p className="text-xs text-gray-500">
                  {analytics.bookingConversion.convertedBookings} of {analytics.bookingConversion.totalInquiries} inquiries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {analytics.customerRetention.rate}%
                </h3>
                <p className="text-sm text-gray-600 mb-2">Customer Retention Rate</p>
                <p className="text-xs text-gray-500">
                  {analytics.customerRetention.repeatCustomers} repeat customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response & Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Clock className="w-3 h-3 mr-1" />
                    2.3 hours
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Job Completion Rate</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Award className="w-3 h-3 mr-1" />
                    96.8%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{stats.averageRating}/5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Repeat Customer Rate</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Users className="w-3 h-3 mr-1" />
                    {analytics.customerRetention.rate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Growth Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Revenue Growth</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{earnings.monthlyGrowth}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Customer Acquisition</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Users className="w-3 h-3 mr-1" />
                    {analytics.customerRetention.newCustomers} this month
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Visibility</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Eye className="w-3 h-3 mr-1" />
                    Top 15%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service Demand</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Zap className="w-3 h-3 mr-1" />
                    High
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Zap className="w-5 h-5" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pricing Optimization</h4>
                  <p className="text-sm text-blue-700">
                    Consider increasing your kitchen plumbing rates by 8-12%. Market analysis shows you're underpricing compared to similar professionals.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📈 Growth Opportunity</h4>
                  <p className="text-sm text-blue-700">
                    Emergency services have 40% higher profit margins. Consider offering 24/7 emergency plumbing to boost earnings.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">⭐ Service Expansion</h4>
                  <p className="text-sm text-blue-700">
                    High demand for bathroom renovations in your area. Adding this service could increase monthly revenue by 25%.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Peak Demand Hours</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Most bookings occur between 2 PM - 6 PM on weekdays
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Optimize your availability
                  </Badge>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Seasonal Trends</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Plumbing services see 30% increase during winter months
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Plan for seasonal demand
                  </Badge>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Competitor Analysis</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    You're performing 15% better than average in your area
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Above market average
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommended Actions
              </CardTitle>
              <CardDescription>
                Take these steps to improve your business performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Update Pricing</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Adjust rates based on market analysis
                      </p>
                      <Button size="sm" variant="outline">Take Action</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Optimize Schedule</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Increase availability during peak hours
                      </p>
                      <Button size="sm" variant="outline">Update Hours</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Improve Rating</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Follow up with recent customers
                      </p>
                      <Button size="sm" variant="outline">Send Follow-up</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Add Services</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Expand to high-demand services
                      </p>
                      <Button size="sm" variant="outline">View Options</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
