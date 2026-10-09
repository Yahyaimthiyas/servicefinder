import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Alert component - using Card instead for compatibility
import { 
  Zap,
  Clock,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Star,


  Settings,
  Bell,
  Shield,
  Truck,
  Timer,

  Award,
  TrendingUp
} from "lucide-react"

































export default function EmergencyServices() {
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [emergencyServices, setEmergencyServices] = useState([])
  const [emergencyBookings, setEmergencyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [emergencyRadius, setEmergencyRadius] = useState(10)
  const [emergencyRate, setEmergencyRate] = useState(1.5)
  const [emergencyStats, setEmergencyStats] = useState({
    responseRate: 0,
    avgResponseTimeMinutes: null,
    rating: 0,
    earnings: 0,
  })

  useEffect(() => {
    fetchEmergencySettings()
    fetchEmergencyBookings()
    getCurrentLocation()
  }, [])

  const fetchEmergencySettings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/emergency-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setEmergencyMode(data.emergencyMode || false)
        if (typeof data.radius === "number") {
          setEmergencyRadius(data.radius)
        }
        if (typeof data.rate === "number") {
          setEmergencyRate(data.rate)
        }
        setEmergencyServices(data.services || [])
        if (data.stats) {
          setEmergencyStats({
            responseRate: data.stats.responseRate || 0,
            avgResponseTimeMinutes:
              typeof data.stats.avgResponseTimeMinutes === "number"
                ? data.stats.avgResponseTimeMinutes
                : null,
            rating: data.stats.rating || 0,
            earnings: data.stats.earnings || 0,
          })
        }
      } else {
        console.error("Failed to fetch emergency settings:", response.statusText)
        // Keep empty arrays - no mock data
        setEmergencyServices([])
      }
    } catch (error) {
      console.error("Error fetching emergency settings:", error)
    }
  }

  const fetchEmergencyBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/emergency-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmergencyBookings(data.bookings || [])
      } else {
        console.error("Failed to fetch emergency bookings:", response.statusText)
        // Keep empty array - no mock data
        setEmergencyBookings([])
      }
    } catch (error) {
      console.error("Error fetching emergency bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setCurrentLocation({ lat: 19.0760, lng: 72.8777 })
        }
      )
    }
  }

  const toggleEmergencyMode = async (enabled) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/emergency-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        setEmergencyMode(enabled)
      }
    } catch (error) {
      console.error("Error toggling emergency mode:", error)
    }
  }

  const respondToEmergency = async (bookingId, action) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/professional/emergency-bookings/${bookingId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        setEmergencyBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: action === 'accept' ? 'accepted' : 'pending' }
            : booking
        ))
      }
    } catch (error) {
      console.error("Error responding to emergency:", error)
    }
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'en_route': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading emergency services...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Emergency Mode Header */}
      <Card className={`border-2 ${emergencyMode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                emergencyMode ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Zap className={`w-8 h-8 ${emergencyMode ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Services</h2>
                <p className={`${emergencyMode ? 'text-red-700' : 'text-gray-600'}`}>
                  {emergencyMode 
                    ? "🔴 You are currently available for emergency calls" 
                    : "Provide 24/7 emergency services to customers in urgent need"
                  }
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={emergencyMode ? "destructive" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {emergencyMode ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                  {emergencyMode && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Available 24/7
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium">Emergency Mode</span>
                <Switch
                  checked={emergencyMode}
                  onCheckedChange={toggleEmergencyMode}
                />
              </div>
              {emergencyMode && (
                <p className="text-xs text-red-600">Earn 50-200% more on emergency calls</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alert */}
      {emergencyMode && emergencyBookings.filter(b => b.status === 'pending').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-red-800">
                <strong>🚨 {emergencyBookings.filter(b => b.status === 'pending').length} Emergency Request(s) Waiting!</strong>
                <span className="ml-2">Respond quickly to maintain your emergency rating.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Emergency Bookings */}
      {emergencyBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Emergency Requests
            </CardTitle>
            <CardDescription>
              Urgent service requests requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyBookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className={`p-4 border-2 rounded-lg ${
                    booking.urgencyLevel === 'critical' ? 'border-red-300 bg-red-50' :
                    booking.urgencyLevel === 'high' ? 'border-orange-300 bg-orange-50' :
                    'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{booking.serviceType}</h4>
                        <p className="text-sm text-gray-600">{booking.customerName} • {booking.customerPhone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(booking.urgencyLevel)}>
                        {booking.urgencyLevel.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{booking.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Requested: {new Date(booking.requestedTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span>{booking.distance} km away</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          Estimated: ₹{booking.estimatedPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span>Response needed within 15 minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Problem Description:</p>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                      {booking.description}
                    </p>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => respondToEmergency(booking._id, 'accept')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Emergency
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => respondToEmergency(booking._id, 'decline')}
                      >
                        Decline
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                    </div>
                  )}
                  
                  {booking.status === 'accepted' && (
                    <div className="flex items-center gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Truck className="w-4 h-4 mr-2" />
                        Start Navigation
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                      <Button variant="outline">
                        Update Status
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Services Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Emergency Services Configuration
          </CardTitle>
          <CardDescription>
            Configure your emergency service offerings and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Service Radius (km)</label>
              <Input
                type="number"
                value={emergencyRadius}
                onChange={(e) => setEmergencyRadius(Number(e.target.value))}
                placeholder="10"
              />
              <p className="text-xs text-gray-500">Maximum distance you'll travel for emergencies</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Rate Multiplier</label>
              <Select value={emergencyRate.toString()} onValueChange={(value) => setEmergencyRate(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">1.5x (50% extra)</SelectItem>
                  <SelectItem value="2.0">2.0x (100% extra)</SelectItem>
                  <SelectItem value="2.5">2.5x (150% extra)</SelectItem>
                  <SelectItem value="3.0">3.0x (200% extra)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">How much extra to charge for emergency services</p>
            </div>
          </div>

          {/* Emergency Services List */}
          <div className="space-y-4">
            <h4 className="font-semibold">Available Emergency Services</h4>
            {emergencyServices.map((service) => (
              <div key={service.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={service.enabled}
                      onCheckedChange={(enabled) => {
                        setEmergencyServices(prev => prev.map(s => 
                          s.id === service.id ? { ...s, enabled } : s
                        ))
                      }}
                    />
                    <div>
                      <h5 className="font-semibold">{service.name}</h5>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ₹{service.basePrice} × {service.urgencyMultiplier}
                    </p>
                    <p className="text-xs text-gray-500">Base × Multiplier</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Available: {service.availableHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-green-600" />
                    <span>Response: {service.responseTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Emergency Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {emergencyStats.responseRate.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {emergencyStats.avgResponseTimeMinutes != null
                  ? `${emergencyStats.avgResponseTimeMinutes} min`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {emergencyStats.rating ? emergencyStats.rating.toFixed(1) : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Emergency Rating</p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                ₹{Number(emergencyStats.earnings || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Emergency Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Tips */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Bell className="w-5 h-5" />
            Emergency Service Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-800">Best Practices</h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Respond to emergency calls within 5 minutes</li>
                <li>• Keep emergency tools and supplies ready</li>
                <li>• Maintain clear communication with customers</li>
                <li>• Update your location status regularly</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-red-800">Earning Potential</h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Emergency services pay 50-200% more</li>
                <li>• Higher customer loyalty and ratings</li>
                <li>• Priority placement in search results</li>
                <li>• Exclusive emergency professional badge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
