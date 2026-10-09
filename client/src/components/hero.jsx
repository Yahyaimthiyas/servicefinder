import { useState, memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, ArrowRight, Star, Users, CheckCircle, MapPin } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"

const OptimizedHero = memo(() => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedLocation) params.set('location', selectedLocation.city || selectedLocation.address || '')
    window.location.href = `/services?${params.toString()}`
  }, [searchQuery, selectedLocation])

  const handleServiceClick = useCallback((service) => {
    setSearchQuery(service)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-background to-primary/5 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 50,000+ customers</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Find Trusted Local{" "}
            <span className="text-primary">Professionals</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Connect with verified local service providers for all your home and business needs.
          </p>

          {/* Optimized Search Bar */}
          <Card className="p-4 max-w-3xl mx-auto mb-8 bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-0 bg-background/50 focus:bg-background"
                  />
                </div>
              </div>
              <div className="flex-1">
                <LocationPicker
                  onLocationSelect={setSelectedLocation}
                  placeholder="Enter location"
                  showCurrentLocation={true}
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-11 px-6 group"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Quick service buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground mr-2">Popular:</span>
              {["Plumber", "Electrician", "Cleaner", "Handyman"].map((service) => (
                <Button
                  key={service}
                  variant="outline"
                  size="sm"
                  onClick={() => handleServiceClick(service)}
                  className="text-xs"
                >
                  {service}
                </Button>
              ))}
            </div>
          </Card>

          {/* Optimized Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <StatCard icon={Users} value="10K+" label="Professionals" />
            <StatCard icon={Star} value="4.9" label="Average Rating" />
            <StatCard icon={CheckCircle} value="24/7" label="Support" />
            <StatCard icon={MapPin} value="50+" label="Cities" />
          </div>
        </div>
      </div>
    </section>
  )
})

const StatCard = memo(({ icon: Icon, value, label }) => (
  <div className="text-center p-4 rounded-lg bg-card/50">
    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
))

OptimizedHero.displayName = "OptimizedHero"
StatCard.displayName = "StatCard"

export { OptimizedHero as Hero }
