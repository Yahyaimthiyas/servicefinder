 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Star,


  Settings,
  Search,
  Heart,
  MessageSquare,
  Phone,



  TrendingUp,

  ArrowRight,
  CheckCircle,



} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "@/hooks/use-router"

export function CustomerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/bookings?userType=customer", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  const recentBookings = bookings.slice(0, 2).length > 0 ? bookings.slice(0, 2) : [
    {
      id: "1",
      service: "Plumbing Repair",
      professional: "Mike Johnson",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "completed",
      rating: 5,
      price: "₹1,200",
    },
    {
      id: "2",
      service: "House Cleaning",
      professional: "Sarah Wilson",
      date: "2024-01-20",
      time: "2:00 PM",
      status: "upcoming",
      price: "₹800",
    },
  ]

  const popularServices = [
    { name: "Plumber", icon: "🔧", bookings: "2.1k+", rating: 4.8 },
    { name: "Electrician", icon: "⚡", bookings: "1.8k+", rating: 4.9 },
    { name: "House Cleaner", icon: "🏠", bookings: "2.5k+", rating: 4.6 },
    { name: "Carpenter", icon: "🪚", bookings: "950+", rating: 4.5 },
    { name: "Painter", icon: "🎨", bookings: "1.2k+", rating: 4.4 },
    { name: "Mechanic", icon: "🔧", bookings: "800+", rating: 4.7 },
    { name: "Gardener", icon: "🌱", bookings: "650+", rating: 4.3 },
    { name: "Tutor", icon: "📚", bookings: "1.1k+", rating: 4.8 },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedLocation) params.set('location', selectedLocation)
    
    router.push(`/services?${params.toString()}`)
  }


  const quickActions = [
    { icon: Search, label: "Find Services", href: "/services", color: "bg-blue-500" },
    { icon: Calendar, label: "My Bookings", href: "/customer/bookings", color: "bg-green-500" },
    { icon: MessageSquare, label: "Messages", href: "/customer/chat", color: "bg-purple-500" },
    { icon: Settings, label: "Profile", href: "/customer/profile", color: "bg-gray-500" },
    { icon: Heart, label: "Favorites", href: "/customer/favorites", color: "bg-red-500" },
  ]

  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === "completed").length
  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || b.estimatedPrice || 0), 0)
  const avgRating = bookings.filter(b => b.rating).reduce((sum, b, _, arr) => sum + b.rating / arr.length, 0) || 0

  const stats = [
    { label: "Total Bookings", value: totalBookings.toString(), icon: Calendar, trend: `${totalBookings} services booked` },
    { label: "Completed Services", value: completedBookings.toString(), icon: CheckCircle, trend: `${totalBookings > 0 ? Math.round((completedBookings/totalBookings)*100) : 0}% completion rate` },
    { label: "Average Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "N/A", icon: Star, trend: avgRating > 4 ? "Excellent feedback" : "Good feedback" },
    { label: "Total Spent", value: `₹${totalSpent}`, icon: TrendingUp, trend: `Across ${totalBookings} bookings` },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {_optionalChain([user, 'optionalAccess', _2 => _2.name, 'optionalAccess', _3 => _3.charAt, 'call', _4 => _4(0), 'optionalAccess', _5 => _5.toUpperCase, 'call', _6 => _6()]) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {_optionalChain([user, 'optionalAccess', _7 => _7.name])}!</h1>
                <p className="text-muted-foreground mt-1 text-lg">Manage your bookings and discover new services</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {_optionalChain([user, 'optionalAccess', _8 => _8.type])} Account
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="default" size="lg" asChild>
                <a href="/services" className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Find Services
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/customer/bookings" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/50 backdrop-blur-sm"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-foreground">{action.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Service Search Section */}
        <Card className="bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Find Services</CardTitle>
            <CardDescription>Search for trusted professionals in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Home Cleaning</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="ac-repair">AC Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="h-12 px-8">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card className="bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Popular Services</CardTitle>
            <CardDescription>Most booked services this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {popularServices.map((service, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer text-center"
                  onClick={() => {
                    setSelectedCategory(service.name.toLowerCase().replace(' ', '-'))
                    handleSearch()
                  }}
                >
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <div className="flex items-center justify-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                    <span className="text-xs text-muted-foreground">{service.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.bookings} bookings</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Bookings</CardTitle>
                    <CardDescription>Your latest service appointments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/customer/bookings">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking._id || booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(booking.professionalName || booking.professional || "P").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{booking.serviceName || booking.service}</p>
                        <p className="text-sm text-muted-foreground">Booking ID: {booking.bookingId || "N/A"}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {booking.scheduledDate || booking.date} at {booking.scheduledTime || booking.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={booking.status === "completed" ? "default" : "secondary"}
                        className="mb-2"
                      >
                        {booking.status}
                      </Badge>
                      {booking.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">{booking.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Profile & Quick Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {_optionalChain([user, 'optionalAccess', _9 => _9.name, 'optionalAccess', _10 => _10.charAt, 'call', _11 => _11(0), 'optionalAccess', _12 => _12.toUpperCase, 'call', _13 => _13()]) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{_optionalChain([user, 'optionalAccess', _14 => _14.name])}</p>
                    <p className="text-sm text-muted-foreground">{_optionalChain([user, 'optionalAccess', _15 => _15.email])}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{_optionalChain([user, 'optionalAccess', _16 => _16.phone]) || "Add phone number"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{_optionalChain([user, 'optionalAccess', _17 => _17.address]) || "Add address"}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Favorites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Save professionals you love for quick booking</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/customer/favorites">
                    View Favorites
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
