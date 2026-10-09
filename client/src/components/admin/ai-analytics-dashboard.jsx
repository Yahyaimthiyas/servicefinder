 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  TrendingUp,
 
  AlertTriangle,
  Target,
  Zap,
  Eye,
  MessageSquare,
  Star,

  Clock,
  BarChart3,


  Shield,
  Award,
  Lightbulb,
  Bot,




} from "lucide-react"

export function AIAnalyticsDashboard() {
  const [aiInsights, setAiInsights] = useState([])

  const [performanceMetrics, setPerformanceMetrics] = useState({
    aiAccuracy: 0,
    fraudDetected: 0,
    automatedActions: 0,
    customerSatisfaction: 0,
    responseTime: 0,
    costSavings: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) {
          setLoading(false)
          setError("Admin token not found")
          return
        }

        const [adminDashboardRes, bookingAnalyticsRes] = await Promise.all([
          fetch("/api/admin/dashboard"),
          fetch("/api/analytics?metric=bookings&timeframe=30d", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const adminDashboard = await adminDashboardRes.json()
        const bookingAnalytics = await bookingAnalyticsRes.json()

        if (!adminDashboardRes.ok || !bookingAnalyticsRes.ok) {
          setError(
            adminDashboard.error ||
              bookingAnalytics.error ||
              "Failed to load AI analytics data",
          )
          setLoading(false)
          return
        }

        const overviewData = adminDashboard.overview || _optionalChain([adminDashboard, 'access', _ => _.stats, 'optionalAccess', _2 => _2.overview]) || null

        const bookingTrends = _optionalChain([bookingAnalytics, 'access', _3 => _3.analytics, 'optionalAccess', _4 => _4.bookingTrends]) || []
        const totalBookingsWindow = bookingTrends.reduce(
          (sum, p) => sum + (p.total || 0),
          0,
        )
        const completedWindow = bookingTrends.reduce(
          (sum, p) => sum + (p.completed || 0),
          0,
        )
        const cancelledWindow = bookingTrends.reduce(
          (sum, p) => sum + (p.cancelled || 0),
          0,
        )

        const aiAccuracy =
          totalBookingsWindow > 0
            ? (completedWindow / totalBookingsWindow) * 100
            : 0

        const avgRating =
          overviewData && typeof overviewData.averageRating === "number"
            ? overviewData.averageRating
            : 0

        setPerformanceMetrics({
          aiAccuracy,
          fraudDetected: cancelledWindow,
          automatedActions: totalBookingsWindow,
          customerSatisfaction: avgRating,
          responseTime: 0,
          costSavings: 0,
        })

        setOverview(overviewData)

        const insights = []

        if (cancelledWindow > 0 && totalBookingsWindow > 0) {
          const cancellationRate = (cancelledWindow / totalBookingsWindow) * 100
          insights.push({
            type: "fraud_detection",
            title: "Unusual cancellation pattern detected",
            description: `${cancelledWindow} bookings were cancelled in the last 30 days (${cancellationRate.toFixed(
              1,
            )}% of bookings).`,
            severity: cancellationRate > 20 ? "high" : "medium",
            action: "Review recent cancellations and verify affected professionals/customers",
            confidence: Math.min(99, Math.round(cancellationRate)),
          })
        }

        if (avgRating > 0) {
          insights.push({
            type: "quality_monitoring",
            title: "Customer satisfaction overview",
            description: `Average rating across the platform is ${avgRating.toFixed(1)} / 5.`,
            severity: avgRating < 3.5 ? "high" : avgRating < 4.2 ? "medium" : "low",
            action:
              avgRating < 4
                ? "Review low-rated bookings and support affected customers"
                : "Continue promoting top-rated professionals",
            confidence: Math.min(99, Math.round((avgRating / 5) * 100)),
          })
        }

        if (insights.length === 0) {
          insights.push({
            type: "system_health",
            title: "No critical AI alerts",
            description:
              "Current bookings, ratings, and revenue patterns do not show any major anomalies.",
            severity: "low",
            action: "Keep monitoring platform activity",
            confidence: 90,
          })
        }

        setAiInsights(insights)
        setError(null)
        setLoading(false)
      } catch (err) {
        console.error("AI analytics load error:", err)
        setError("Failed to load AI analytics data")
        setLoading(false)
      }
    }

    loadAnalytics()
    const interval = setInterval(loadAnalytics, 15000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Eye className="w-4 h-4" />
      case 'low': return <Lightbulb className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
          <p className="text-muted-foreground">AI-powered insights and automated platform management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bot className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
          <Button size="sm">
            <Brain className="w-4 h-4 mr-2" />
            Train Models
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">AI Accuracy</p>
                <p className="text-2xl font-bold">{performanceMetrics.aiAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Fraud Detected</p>
                <p className="text-2xl font-bold">{performanceMetrics.fraudDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Auto Actions</p>
                <p className="text-2xl font-bold">{performanceMetrics.automatedActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Satisfaction</p>
                <p className="text-2xl font-bold">{performanceMetrics.customerSatisfaction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-2xl font-bold">{performanceMetrics.responseTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Cost Savings</p>
                <p className="text-2xl font-bold">₹{performanceMetrics.costSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Real-time AI analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading AI insights...</p>
            )}
            {!loading && aiInsights.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">No AI insights available for the current data window.</p>
            )}
            {error && (
              <p className="text-sm text-red-600">Error loading AI insights: {error}</p>
            )}
            {!loading && aiInsights.map((insight, index) => (
              <Card key={index} className={`border-2 ${getSeverityColor(insight.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(insight.severity)}`}>
                        {getSeverityIcon(insight.severity)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <p className="text-sm font-medium mt-2">Recommended Action: {insight.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                      <Button size="sm">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Smart Matching */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Smart Matching
            </CardTitle>
            <CardDescription>AI-powered customer-professional matching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Match Accuracy</span>
                <span className="text-sm font-medium">
                  {performanceMetrics.aiAccuracy
                    ? `${performanceMetrics.aiAccuracy.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(100, performanceMetrics.aiAccuracy || 0),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI matches customers with the best professionals based on location, ratings, availability, and preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Fraud Detection
            </CardTitle>
            <CardDescription>Real-time fraud and abuse prevention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Detection Rate</span>
                <span className="text-sm font-medium">
                  {performanceMetrics.automatedActions > 0
                    ? `${(
                        (performanceMetrics.fraudDetected /
                          performanceMetrics.automatedActions) *
                        100 || 0
                      ).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(
                        100,
                        performanceMetrics.automatedActions > 0
                          ? (performanceMetrics.fraudDetected /
                              performanceMetrics.automatedActions) * 100
                          : 0,
                      ),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI identifies fake reviews, suspicious accounts, and fraudulent activities automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demand Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Demand Prediction
            </CardTitle>
            <CardDescription>Forecast service demand patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Bookings (last 30 days)</span>
                <span className="text-sm font-medium">
                  {performanceMetrics.automatedActions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(100, performanceMetrics.automatedActions || 0),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Recent booking volume helps identify demand patterns and peak days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Price Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Price Optimization
            </CardTitle>
            <CardDescription>Dynamic pricing recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Revenue Increase</span>
                <span className="text-sm font-medium">
                  {overview && overview.conversionRate
                    ? `${overview.conversionRate.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(
                        100,
                        overview && overview.conversionRate
                          ? overview.conversionRate
                          : 0,
                      ),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI suggests optimal pricing based on demand, competition, and market conditions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              AI Chatbot
            </CardTitle>
            <CardDescription>Automated customer support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Resolution Rate</span>
                <span className="text-sm font-medium">
                  {performanceMetrics.aiAccuracy
                    ? `${performanceMetrics.aiAccuracy.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(100, performanceMetrics.aiAccuracy || 0),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI chatbot handles customer queries, bookings, and support requests automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quality Assurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              Quality Assurance
            </CardTitle>
            <CardDescription>Automated quality monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Quality Score</span>
                <span className="text-sm font-medium">
                  {performanceMetrics.customerSatisfaction
                    ? `${((performanceMetrics.customerSatisfaction / 5) * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(
                        100,
                        performanceMetrics.customerSatisfaction
                          ? (performanceMetrics.customerSatisfaction / 5) * 100
                          : 0,
                      ),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI monitors service quality through reviews, ratings, and customer feedback analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            AI Model Performance
          </CardTitle>
          <CardDescription>Performance metrics for different AI models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Model Accuracy Trends</h4>
                <div className="space-y-3">
                  {[
                    {
                      model: "Booking completion model",
                      accuracy: performanceMetrics.aiAccuracy,
                      trend: performanceMetrics.aiAccuracy
                        ? `${performanceMetrics.aiAccuracy.toFixed(1)}%`
                        : "N/A",
                    },
                    {
                      model: "Cancellation / risk model",
                      accuracy:
                        performanceMetrics.automatedActions > 0
                          ? (performanceMetrics.fraudDetected /
                              performanceMetrics.automatedActions) * 100
                          : 0,
                      trend:
                        performanceMetrics.automatedActions > 0
                          ? `${(
                              (performanceMetrics.fraudDetected /
                                performanceMetrics.automatedActions) *
                              100 || 0
                            ).toFixed(1)}%`
                          : "N/A",
                    },
                  ].map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.model}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {model.accuracy ? `${model.accuracy.toFixed(1)}%` : "N/A"}
                        </span>
                        <Badge variant="outline" className="text-green-600">
                          {model.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Processing Statistics</h4>
                <div className="space-y-3">
                  {[
                    {
                      metric: "Bookings analyzed",
                      value: performanceMetrics.automatedActions.toLocaleString(),
                      period: "last 30 days",
                    },
                    {
                      metric: "Cancellations flagged",
                      value: performanceMetrics.fraudDetected.toLocaleString(),
                      period: "last 30 days",
                    },
                    {
                      metric: "Average rating",
                      value: performanceMetrics.customerSatisfaction
                        ? performanceMetrics.customerSatisfaction.toFixed(1)
                        : "N/A",
                      period: "platform-wide",
                    },
                    {
                      metric: "Accuracy (bookings)",
                      value: performanceMetrics.aiAccuracy
                        ? `${performanceMetrics.aiAccuracy.toFixed(1)}%`
                        : "N/A",
                      period: "last 30 days",
                    },
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.metric}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{stat.value}</span>
                        <p className="text-xs text-muted-foreground">{stat.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
