 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

import { 
  Search,
 
  Filter,
 
  Loader2, 
  Star,
  Shield,
  Clock,

  Grid3X3,
  List,


  Zap
} from "lucide-react"
import { ServiceCard } from "./service-card"
import { SimpleLocationPicker } from "@/components/simple-location-picker"

export function ServicesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [professionals, setProfessionals] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quickFilters, setQuickFilters] = useState({
    verifiedOnly: true,
    availableToday: false,
    emergencyService: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Build query parameters for professionals (only verified ones)
        // Note: we intentionally do NOT send service category to the API.
        // The backend returns all professionals for the location, and
        // category filtering is handled entirely on the client via matchesCategory.
        const params = new URLSearchParams()

        // Pass Tamil Nadu district/state explicitly so backend can filter by verification data
        if (_optionalChain([selectedLocation, 'optionalAccess', _ => _.city])) {
          params.set('district', selectedLocation.city)
        }
        if (_optionalChain([selectedLocation, 'optionalAccess', _2 => _2.state])) {
          params.set('state', selectedLocation.state)
        }

        params.set('limit', '50')

        // Fetch only verified professionals and services
        const [professionalsRes, servicesRes] = await Promise.all([
          fetch(`/api/professionals?${params.toString()}`),
          fetch("/api/services")
        ])

        if (!professionalsRes.ok || !servicesRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const professionalsData = await professionalsRes.json()
        const servicesData = await servicesRes.json()

        // Filter only verified professionals
        const verifiedProfessionals = (professionalsData.professionals || []).filter(
          (prof) => prof.verificationStatus === 'verified' || prof.verificationStatus === 'approved'
        )

        setProfessionals(verifiedProfessionals)
        setServices(servicesData.services || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory, selectedLocation])

  // Comprehensive service categories based on the dropdown
  const predefinedCategories = [
    "All Services",
    "Plumber", 
    "Electrician",
    "Carpenter", 
    "Painter",
    "House Cleaner",
    "Mechanic",
    "Gardener",
    "Tutor",
    "Home Maintenance",
    "Cleaning",
    "Outdoor",
    "Other"
  ]
  
  // Combine predefined categories with any additional ones from services
  const dynamicCategories = [...new Set(services.map((service) => service.category))]
  const allCategories = [...predefinedCategories, ...dynamicCategories.filter(cat => !predefinedCategories.includes(cat))]
  const categories = [...new Set(allCategories)]

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      searchQuery === "" ||
      professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (professional.services &&
        professional.services.some((service) => service.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "all" ||
      selectedCategory === "All Services" ||
      (professional.services &&
        professional.services.some(
          (service) =>
            String(service).toLowerCase() === selectedCategory.toLowerCase()
        ))

    const hourlyRate = _optionalChain([professional, 'access', _3 => _3.pricing, 'optionalAccess', _4 => _4.hourlyRate]) || 0
    const matchesPrice = hourlyRate >= priceRange[0] && hourlyRate <= priceRange[1]

    const locationQuery = (_optionalChain([selectedLocation, 'optionalAccess', _5 => _5.city]) || _optionalChain([selectedLocation, 'optionalAccess', _6 => _6.address]) || "").toLowerCase()

    const matchesLocation =
      !locationQuery ||
      (professional.city && String(professional.city).toLowerCase().includes(locationQuery)) ||
      (professional.state && String(professional.state).toLowerCase().includes(locationQuery)) ||
      (professional.address && String(professional.address).toLowerCase().includes(locationQuery)) ||
      (Array.isArray(professional.serviceArea) &&
        professional.serviceArea.some((area) => area.toLowerCase().includes(locationQuery))) ||
      (Array.isArray(professional.serviceAreas) &&
        professional.serviceAreas.some((area) => area.toLowerCase().includes(locationQuery)))

    return matchesSearch && matchesCategory && matchesPrice && matchesLocation
  })

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price-low":
        return (_optionalChain([a, 'access', _7 => _7.pricing, 'optionalAccess', _8 => _8.hourlyRate]) || 0) - (_optionalChain([b, 'access', _9 => _9.pricing, 'optionalAccess', _10 => _10.hourlyRate]) || 0)
      case "price-high":
        return (_optionalChain([b, 'access', _11 => _11.pricing, 'optionalAccess', _12 => _12.hourlyRate]) || 0) - (_optionalChain([a, 'access', _13 => _13.pricing, 'optionalAccess', _14 => _14.hourlyRate]) || 0)
      case "reviews":
        return (b.totalReviews || 0) - (a.totalReviews || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading professionals...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-white border-b border-gray-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Trusted by 50,000+ customers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Find Local Service 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Providers</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with verified, trusted professionals in your area. From home repairs to personal services, 
              we've got you covered with quality service providers.
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Verified Professionals
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                4.8+ Average Rating
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                Quick Response
              </div>
            </div>
          </div>

          {/* Simple Search Bar */}
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-lg border border-gray-200 rounded-xl bg-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  {/* Service Search */}
                  <div className="lg:col-span-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What service do you need?
                    </label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="e.g., Plumber, Electrician, Cleaner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white rounded-xl text-base font-medium placeholder:text-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all duration-200">
                        <SelectValue placeholder="All Services" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 shadow-xl">
                        <SelectItem value="all" className="text-base py-3 px-4 hover:bg-blue-50">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-blue-500" />
                            All Services
                          </div>
                        </SelectItem>
                        {predefinedCategories.slice(1).map((category) => (
                          <SelectItem key={category} value={category} className="text-base py-3 px-4 hover:bg-blue-50">
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-lg">
                                {category === 'Plumber' ? '🔧' : 
                                 category === 'Electrician' ? '⚡' :
                                 category === 'Carpenter' ? '🪚' :
                                 category === 'Painter' ? '🎨' :
                                 category === 'House Cleaner' ? '🏠' :
                                 category === 'Mechanic' ? '🔧' :
                                 category === 'Gardener' ? '🌱' :
                                 category === 'Tutor' ? '📚' : '🛠️'}
                              </span>
                              {category}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Simple Location Input */}
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <SimpleLocationPicker
                      onLocationSelect={setSelectedLocation}
                      placeholder="Enter your location"
                      value={_optionalChain([selectedLocation, 'optionalAccess', _15 => _15.city]) ? `${selectedLocation.city}, ${selectedLocation.state || ''}` : ''}
                    />
                  </div>

                  {/* Search Button */}
                  <div className="lg:col-span-2">
                    <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base">
                      <Search className="w-5 h-5 mr-2" />
                      Find Services
                    </Button>
                  </div>
                </div>

                {/* Quick Search Tags */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-700">Popular searches:</p>
                    <span className="text-xs text-gray-500">Click to search instantly</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { name: 'Emergency Plumber', icon: '🚨', category: 'Plumber' },
                      { name: 'House Cleaning', icon: '🏠', category: 'House Cleaner' },
                      { name: 'AC Repair', icon: '❄️', category: 'Electrician' },
                      { name: 'Electrician', icon: '⚡', category: 'Electrician' },
                      { name: 'Painter', icon: '🎨', category: 'Painter' },
                      { name: 'Carpenter', icon: '🪚', category: 'Carpenter' }
                    ].map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          setSearchQuery(tag.name)
                          setSelectedCategory(tag.category)
                        }}
                        className="flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md group"
                      >
                        <span className="mr-2 text-base group-hover:scale-110 transition-transform">
                          {tag.icon}
                        </span>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Filters and Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-gray-300"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Showing {sortedProfessionals.length} results</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="reviews">Sort by Reviews</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Clean Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Filter Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Price Range (per hour)</h3>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000}
                        min={0}
                        step={25}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Availability</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={quickFilters.verifiedOnly}
                          onChange={(e) => setQuickFilters(prev => ({...prev, verifiedOnly: e.target.checked}))}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300" 
                        />
                        <span className="text-sm text-gray-700">Verified professionals</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={quickFilters.availableToday}
                          onChange={(e) => setQuickFilters(prev => ({...prev, availableToday: e.target.checked}))}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300" 
                        />
                        <span className="text-sm text-gray-700">Available today</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={quickFilters.emergencyService}
                          onChange={(e) => setQuickFilters(prev => ({...prev, emergencyService: e.target.checked}))}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300" 
                        />
                        <span className="text-sm text-gray-700">Emergency service</span>
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedCategory("all")
                      setPriceRange([0, 1000])
                      setSortBy("rating")
                      setQuickFilters({verifiedOnly: true, availableToday: false, emergencyService: false})
                    }}
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Grid/List */}
            {sortedProfessionals.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProfessionals.map((professional) => (
                  <ServiceCard 
                    key={professional._id} 
                    professional={professional} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 bg-white border border-gray-200">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No professionals found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or location
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedLocation(null)
                      setSelectedCategory("all")
                      setPriceRange([0, 1000])
                      setQuickFilters({verifiedOnly: true, availableToday: false, emergencyService: false})
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More Button */}
            {sortedProfessionals.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                  Load More Results
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
