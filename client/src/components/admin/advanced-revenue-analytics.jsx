 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp,

  Users, 
  CreditCard,
  Target,
  Award,

  Crown,
  Star,
  BarChart3,
  PieChart,

  Download,

  ArrowUp,


  Wallet,
  Banknote,
  Receipt,




} from "lucide-react"









export function AdvancedRevenueAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("total")

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [growthPercentage, setGrowthPercentage] = useState(0)
  const [avgPerBooking, setAvgPerBooking] = useState(0)
  const [revenueStreams, setRevenueStreams] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [categoryStats, setCategoryStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)

  const fetchRevenueAnalytics = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setTotalRevenue(0)
        setTotalTransactions(0)
        setRevenueTrend([])
        setGrowthPercentage(0)
        setAvgPerBooking(0)
        setError("Admin token not found")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/analytics?metric=revenue&timeframe=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to load revenue analytics")
        setRevenueTrend([])
        setTotalRevenue(0)
        setTotalTransactions(0)
        setGrowthPercentage(0)
        setAvgPerBooking(0)
        setLoading(false)
        return
      }

      const trend = _optionalChain([data, 'access', _ => _.analytics, 'optionalAccess', _2 => _2.revenueTrends]) || []

      const totalRev = trend.reduce((sum, point) => sum + (point.revenue || 0), 0)
      const totalTx = trend.reduce((sum, point) => sum + (point.bookings || 0), 0)

      let growth = 0
      if (trend.length > 1) {
        const first = trend[0].revenue || 0
        const last = trend[trend.length - 1].revenue || 0
        if (first > 0) {
          growth = ((last - first) / first) * 100
        }
      }

      setRevenueTrend(trend)
      setTotalRevenue(totalRev)
      setTotalTransactions(totalTx)
      setAvgPerBooking(totalTx > 0 ? totalRev / totalTx : 0)
      setGrowthPercentage(growth)
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error("Revenue analytics error:", err)
      setError("Failed to load revenue analytics")
      setRevenueTrend([])
      setTotalRevenue(0)
      setTotalTransactions(0)
      setGrowthPercentage(0)
      setAvgPerBooking(0)
      setLoading(false)
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      const data = await response.json()

      if (!response.ok) {
        console.error("Failed to load category stats:", data.error)
        return
      }

      const stats = data.categoryStats || _optionalChain([data, 'access', _3 => _3.stats, 'optionalAccess', _4 => _4.categoryStats]) || []
      const ov = data.overview || _optionalChain([data, 'access', _5 => _5.stats, 'optionalAccess', _6 => _6.overview]) || null
      setOverview(ov)
      setCategoryStats(stats)

      const total = stats.reduce((sum, c) => sum + (c.revenue || 0), 0)
      if (total > 0) {
        const streams = stats.map((c, index) => ({
          name: c._id || "Other",
          amount: c.revenue || 0,
          percentage: ((c.revenue || 0) / total) * 100,
          color: ["blue", "green", "purple", "orange"][index % 4],
          icon: index === 0 ? "Crown" : "DollarSign",
        }))
        setRevenueStreams(streams)
        if (totalRevenue === 0) {
          setTotalRevenue(total)
        }
      } else {
        setRevenueStreams([])
      }
    } catch (err) {
      console.error("Category stats load error:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchRevenueAnalytics()
    const interval = setInterval(fetchRevenueAnalytics, 15000)
    return () => clearInterval(interval)
  }, [timeRange])

  useEffect(() => {
    fetchCategoryStats()
  }, [])

  const daysForRange = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
  const monthlyRecurringRevenue = daysForRange > 0 ? (totalRevenue * 30) / daysForRange : totalRevenue
  const averageRevenuePerUser =
    overview && overview.totalUsers > 0 ? overview.totalRevenue / overview.totalUsers : 0
  const conversionRate = _optionalChain([overview, 'optionalAccess', _7 => _7.conversionRate]) || 0

  const getIcon = (iconName) => {
    const icons = {
      Crown: Crown,
      DollarSign: DollarSign,
      Award: Award,
      Star: Star,
      Users: Users,
      CreditCard: CreditCard,
      Wallet: Wallet,
      Banknote: Banknote
    }
    const Icon = icons[iconName ] || DollarSign
    return <Icon className="w-5 h-5" />
  }

  const getColorClass = (color) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      orange: "text-orange-600 bg-orange-100"
    }
    return colors[color ] || colors.blue
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track platform monetization and financial performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {growthPercentage ? `${growthPercentage.toFixed(1)}% change` : "Based on completed bookings"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Monthly Growth</p>
                <p className="text-2xl font-bold">
                  {growthPercentage ? `${growthPercentage.toFixed(1)}%` : "0%"}
                </p>
                <p className="text-xs text-blue-600">Change over selected period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
                <p className="text-xs text-purple-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg. Revenue/User</p>
                <p className="text-2xl font-bold">{formatCurrency(averageRevenuePerUser || 0)}</p>
                <p className="text-xs text-orange-600">Based on total users and revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Revenue Streams
          </CardTitle>
          <CardDescription>Breakdown of platform monetization sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {revenueStreams.map((stream, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClass(stream.color)}`}>
                      {getIcon(stream.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{stream.name}</h3>
                      <p className="text-xs text-muted-foreground">{stream.percentage}% of total</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{formatCurrency(stream.amount)}</span>
                      <Badge variant="outline" className="text-xs">
                        {stream.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stream.color === 'blue' ? 'bg-blue-600' :
                          stream.color === 'green' ? 'bg-green-600' :
                          stream.color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'
                        }`}
                        style={{ width: `${stream.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Revenue Trend
          </CardTitle>
          <CardDescription>Revenue growth over the past 9 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueTrend.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No revenue data for the selected period.</p>
            )}
            {revenueTrend.slice(-12).map((point, index) => {
              const label = point._id || ""
              const revenue = point.revenue || 0
              const bookings = point.bookings || 0
              const maxRevenue = revenueTrend.reduce(
                (max, p) => Math.max(max, p.revenue || 0),
                0
              ) || 1
              const width = `${Math.max(5, Math.min(100, (revenue / maxRevenue) * 100))}%`
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-lg font-bold">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bookings: {bookings}</span>
                      <span>Avg / booking: {bookings > 0 ? formatCurrency(revenue / bookings) : "-"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Revenue breakdown by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Payment method analytics will appear here once payment method tracking is implemented in bookings.
            </p>
          </CardContent>
        </Card>

        {/* Advanced Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Advanced Metrics
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Customer Lifetime Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(averageRevenuePerUser || 0)}</p>
                  <p className="text-xs text-green-600">Approximate revenue per user</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyRecurringRevenue || 0)}</p>
                  <p className="text-xs text-blue-600">Scaled from selected period</p>
                </div>
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Revenue per Transaction</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgPerBooking || 0)}</p>
                  <p className="text-xs text-purple-600">Average revenue per booking</p>
                </div>
                <Receipt className="w-8 h-8 text-purple-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {conversionRate ? `${conversionRate.toFixed(1)}%` : "0%"}
                  </p>
                  <p className="text-xs text-orange-600">Completed vs total bookings</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Projections
          </CardTitle>
          <CardDescription>AI-powered revenue forecasting for next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Next Month</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyRecurringRevenue || 0)}</p>
              <p className="text-xs text-blue-600">Projection based on current trend</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Next Quarter</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency((monthlyRecurringRevenue || 0) * 3)}</p>
              <p className="text-xs text-green-600">3-month projection</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Next 6 Months</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency((monthlyRecurringRevenue || 0) * 6)}</p>
              <p className="text-xs text-purple-600">6-month projection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
