 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, Crosshair } from "lucide-react"
import { TAMIL_NADU_DISTRICTS } from "@/lib/india-locations"








export function SimpleLocationPicker({ 
  onLocationSelect, 
  placeholder = "Enter your location",
  className = "",
  value = ""
}) {
  const [searchQuery, setSearchQuery] = useState(value)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const debounceRef = useRef()

  // Auto-detect location using GPS with real reverse geocoding
  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser")
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        })
      })

      // Use real reverse geocoding with OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error("Failed to get location details")
      }

      const data = await response.json()
      const address = data.address || {}
      
      const realLocation = {
        city: address.city || address.town || address.village || address.suburb || "Unknown City",
        state: address.state || address.region || "Unknown State",
        address: data.display_name || "Unknown Location",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        country: address.country || "Unknown Country"
      }

      setSearchQuery(`${realLocation.city}, ${realLocation.state}`)
      _optionalChain([onLocationSelect, 'optionalCall', _ => _(realLocation)])
      setShowResults(false)
    } catch (error) {
      console.error("Error getting location:", error)
      // Fallback to IP-based location
      await getLocationFromIP()
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Get location from IP (fallback) - using real IP geolocation
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      if (!response.ok) {
        throw new Error("Failed to get IP location")
      }
      
      const data = await response.json()
      
      const ipLocation = {
        city: data.city || "Unknown City",
        state: data.region || "Unknown State", 
        address: `${data.city || "Unknown City"}, ${data.region || "Unknown State"}, ${data.country_name || "Unknown Country"}`,
        country: data.country_name || "Unknown Country"
      }
      
      setSearchQuery(`${ipLocation.city}, ${ipLocation.state}`)
      _optionalChain([onLocationSelect, 'optionalCall', _2 => _2(ipLocation)])
      setShowResults(false)
    } catch (error) {
      console.error("Error getting IP location:", error)
      // Final fallback - ask user to enter manually
      alert("Unable to detect your location automatically. Please enter your location manually.")
    }
  }

  // Location search limited to Tamil Nadu districts only
  const searchLocations = async (query) => {
    const lower = query.toLowerCase()
    const matches = TAMIL_NADU_DISTRICTS.filter((district) =>
      district.toLowerCase().includes(lower),
    )

    return matches.map((district) => ({
      city: district,
      state: "Tamil Nadu",
      address: `${district}, Tamil Nadu, India`,
    }))
  }

  // Handle search input with debouncing
  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchLocations(query)
        setSearchResults(results)
        setShowResults(true)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  // Handle location selection
  const handleLocationSelect = (selectedLocation) => {
    setShowResults(false)
    setSearchQuery(selectedLocation.city + ", " + selectedLocation.state)
    _optionalChain([onLocationSelect, 'optionalCall', _3 => _3(selectedLocation)])
  }

  // Update search query when value prop changes
  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          onBlur={() => {
            // Delay hiding results to allow for clicks
            setTimeout(() => setShowResults(false), 200)
          }}
          className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        
        {/* Auto-location button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-blue-50"
          title="Use current location"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Crosshair className="w-4 h-4 text-blue-600" />
          )}
        </Button>
        
        {isSearching && (
          <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg border border-gray-200">
          <CardContent className="p-0">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {result.city}, {result.state}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.address}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">No locations found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
