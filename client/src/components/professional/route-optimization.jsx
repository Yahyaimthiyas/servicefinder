import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Navigation,
  MapPin,
  Clock,
  Route,

  Fuel,
  Calendar,
  Zap,
  Target,
  TrendingUp,

  RefreshCw,
  Play,
  Pause,
  CheckCircle,

  Phone,
  MessageSquare
} from "lucide-react"






























export default function RouteOptimization() {
  const [todayBookings, setTodayBookings] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [vehicleType, setVehicleType] = useState("bike")
  const [fuelPrice, setFuelPrice] = useState(100)

  useEffect(() => {
    fetchTodayBookings()
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (todayBookings.length > 0 && currentLocation) {
      optimizeRoute()
    }
  }, [todayBookings, currentLocation, vehicleType])

  const fetchTodayBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/bookings/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTodayBookings(data.bookings || [])
      } else {
        console.error("Failed to fetch today's bookings:", response.statusText)
        // Keep empty array - no mock data
        setTodayBookings([])
      }
    } catch (error) {
      console.error("Error fetching today's bookings:", error)
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
          // Default to Mumbai center
          setCurrentLocation({ lat: 19.0760, lng: 72.8777 })
        }
      )
    } else {
      // Default to Mumbai center
      setCurrentLocation({ lat: 19.0760, lng: 72.8777 })
    }
  }

  const optimizeRoute = async () => {
    if (!currentLocation || todayBookings.length === 0) return

    try {
      // Call real route optimization API
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/optimize-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentLocation,
          bookings: todayBookings
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOptimizedRoute(data.optimization)
      } else {
        console.error("Failed to optimize route:", response.statusText)
        // No fallback - show empty state
        setOptimizedRoute(null)
      }
    } catch (error) {
      console.error("Error optimizing route:", error)
      setOptimizedRoute(null)
    }
  }

  const startNavigation = () => {
    setIsNavigating(true)
    setCurrentBookingIndex(0)
  }

  const completeCurrentBooking = () => {
    const updatedBookings = [...todayBookings]
    updatedBookings[currentBookingIndex].status = 'completed'
    setTodayBookings(updatedBookings)
    
    if (currentBookingIndex < todayBookings.length - 1) {
      setCurrentBookingIndex(currentBookingIndex + 1)
    } else {
      setIsNavigating(false)
    }
  }

  const openMapsNavigation = (booking) => {
    const destination = `${booking.coordinates.lat},${booking.coordinates.lng}`
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
    window.open(mapsUrl, '_blank')
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress': return <Play className="w-4 h-4 text-blue-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading route optimization...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Route Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Today's Route Optimization
            </CardTitle>
            <CardDescription>
              Optimized route for {todayBookings.length} bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optimizedRoute && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Route className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="font-bold text-blue-600">{optimizedRoute.totalDistance} km</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Total Time</p>
                  <p className="font-bold text-green-600">{Math.floor(optimizedRoute.totalTime / 60)}h {optimizedRoute.totalTime % 60}m</p>
                </div>
                
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <Fuel className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Fuel Needed</p>
                  <p className="font-bold text-amber-600">{optimizedRoute.estimatedFuel}L</p>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Cost Saved</p>
                  <p className="font-bold text-purple-600">₹{optimizedRoute.savings.costSaved}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">🏍️ Bike</SelectItem>
                    <SelectItem value="car">🚗 Car</SelectItem>
                    <SelectItem value="van">🚐 Van</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Fuel Price:</span>
                  <Input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">₹/L</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={optimizeRoute}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-optimize
                </Button>
                
                {!isNavigating ? (
                  <Button onClick={startNavigation} disabled={todayBookings.length === 0}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Navigation
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsNavigating(false)}>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Navigation
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Current Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isNavigating && todayBookings[currentBookingIndex] ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {currentBookingIndex + 1} / {todayBookings.length}
                  </div>
                  <p className="text-sm text-gray-600">Current Stop</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{todayBookings[currentBookingIndex].customerName}</p>
                    <p className="text-sm text-gray-600">{todayBookings[currentBookingIndex].serviceType}</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm">{todayBookings[currentBookingIndex].address}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">Scheduled: {todayBookings[currentBookingIndex].scheduledTime}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => openMapsNavigation(todayBookings[currentBookingIndex])}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Open in Maps
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={completeCurrentBooking}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Start navigation to see current route</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Bookings ({todayBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No bookings scheduled for today</p>
              </div>
            ) : (
              todayBookings.map((booking, index) => (
                <div 
                  key={booking._id} 
                  className={`p-4 border rounded-lg ${
                    isNavigating && index === currentBookingIndex 
                      ? 'border-blue-500 bg-blue-50' 
                      : booking.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span className="font-medium">{index + 1}.</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{booking.customerName}</h4>
                          <p className="text-sm text-gray-600">{booking.serviceType}</p>
                        </div>
                        <Badge className={getPriorityColor(booking.priority)}>
                          {booking.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openMapsNavigation(booking)}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Benefits */}
      {optimizedRoute && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="w-5 h-5" />
              Route Optimization Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Time Saved</h4>
                <p className="text-2xl font-bold text-blue-600">{optimizedRoute.savings.timesSaved} min</p>
                <p className="text-sm text-blue-700">Compared to manual routing</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <Fuel className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Fuel Saved</h4>
                <p className="text-2xl font-bold text-green-600">{optimizedRoute.savings.fuelSaved}L</p>
                <p className="text-sm text-green-700">Reduced consumption</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800">Money Saved</h4>
                <p className="text-2xl font-bold text-purple-600">₹{optimizedRoute.savings.costSaved}</p>
                <p className="text-sm text-purple-700">Daily savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
