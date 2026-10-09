import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  DollarSign,
  Users,
  Clock,
  Star,
  BarChart3,
  PieChart,


  ArrowUp,
  ArrowDown,
  Calendar,


  Sparkles
} from "lucide-react"
import { useRouter } from "@/hooks/use-router"


































export default function AIInsights() {
  const [insights, setInsights] = useState([])
  const [marketTrends, setMarketTrends] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchAllInsights()
  }, [])

  const fetchAllInsights = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/professional/ai-insights", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setMarketTrends(data.marketTrends || [])
        setPerformanceMetrics(data.performanceMetrics || [])
      } else {
        console.error("Failed to fetch AI insights:", response.statusText)
        // Keep empty arrays - no mock data
        setInsights([])
        setMarketTrends([])
        setPerformanceMetrics([])
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOpportunityColor = (opportunity) => {
    switch (opportunity) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const handleInsightAction = (insight) => {
    switch (insight.type) {
      case "pricing":
      case "growth":
        router.push("/professional/dashboard?tab=earnings")
        break
      case "demand":
        router.push("/professional/dashboard?tab=profile")
        break
      case "performance":
      case "customer":
        router.push("/professional/dashboard?tab=reviews")
        break
      default:
        router.push("/professional/dashboard")
    }
  }

  const averageConfidence =
    insights.length > 0
      ? Math.round(
          insights.reduce((sum, i) => sum + (i.confidence || 0), 0) / insights.length
        )
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading AI insights...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">AI-Powered Business Insights</h2>
              <p className="text-purple-100">
                Get personalized recommendations to grow your business using advanced analytics
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {insights.length} Active Insights
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Target className="w-3 h-3 mr-1" />
                  {averageConfidence}% Avg Confidence
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card 
                key={insight.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedInsight(insight)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        insight.type === 'pricing' ? 'bg-green-100' :
                        insight.type === 'demand' ? 'bg-blue-100' :
                        insight.type === 'performance' ? 'bg-purple-100' :
                        insight.type === 'growth' ? 'bg-orange-100' :
                        'bg-pink-100'
                      }`}>
                        {insight.type === 'pricing' && <DollarSign className="w-5 h-5 text-green-600" />}
                        {insight.type === 'demand' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                        {insight.type === 'performance' && <BarChart3 className="w-5 h-5 text-purple-600" />}
                        {insight.type === 'growth' && <Target className="w-5 h-5 text-orange-600" />}
                        {insight.type === 'customer' && <Users className="w-5 h-5 text-pink-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  {insight.metrics && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-600">Current</p>
                          <p className="font-bold">{insight.metrics.current}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Potential</p>
                          <p className="font-bold text-green-600">{insight.metrics.potential}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Improvement</p>
                          <p className="font-bold text-blue-600">{insight.metrics.improvement}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {insight.recommendation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Recommendation:</p>
                      <p className="text-sm text-blue-800">{insight.recommendation}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{insight.confidence}%</span>
                    </div>
                    
                    {insight.actionable && (
                      <Button size="sm" onClick={() => handleInsightAction(insight)}>
                        <Zap className="w-3 h-3 mr-1" />
                        Take Action
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Market Demand Analysis
              </CardTitle>
              <CardDescription>
                Real-time market trends and opportunities in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{trend.service}</h4>
                      <Badge className={`${getOpportunityColor(trend.opportunity)} bg-transparent border`}>
                        {trend.opportunity} opportunity
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Demand</p>
                        <div className="flex items-center gap-2">
                          <Progress value={trend.demand} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{trend.demand}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Growth</p>
                        <div className="flex items-center gap-2">
                          <Progress value={trend.growth} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-green-600">+{trend.growth}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Competition</p>
                        <div className="flex items-center gap-2">
                          <Progress value={trend.competition} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{trend.competition}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{trend.seasonality}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Benchmarking
              </CardTitle>
              <CardDescription>
                Compare your performance against industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{metric.metric}</h4>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{metric.current}</p>
                        <p className="text-sm text-gray-600">vs {metric.benchmark} benchmark</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Your Performance</span>
                        <span>{metric.current > metric.benchmark ? 'Above' : 'Below'} Benchmark</span>
                      </div>
                      <Progress 
                        value={metric.benchmark > 0 ? (metric.current / metric.benchmark) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendation:</p>
                      <p className="text-sm text-blue-800">{metric.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Implement AI recommendations with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push("/professional/dashboard?tab=earnings")}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Update Pricing</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push("/settings")}
            >
              <Clock className="w-6 h-6" />
              <span className="text-sm">Set Auto-Response</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push("/professional/dashboard?tab=profile")}
            >
              <Star className="w-6 h-6" />
              <span className="text-sm">Add New Service</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push("/professional/dashboard?tab=reviews")}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Follow-up Setup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
