 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2, Search, Navigation, Wifi, X } from "lucide-react"
import { useLocation } from "@/hooks/use-location"








export function LocationPicker({ 
  onLocationSelect, 
  showCurrentLocation = true, 
  placeholder = "Enter your location",
  className = ""
}) {
  const { 
    location, 
    loading, 
    error, 
    permission, 
    getCurrentLocation, 
    getLocationFromIP, 
    searchLocation,
    clearLocation 
  } = useLocation()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Handle search input
  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 3) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchLocation(query)
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (selectedLocation) => {
    setShowResults(false)
    setSearchQuery(selectedLocation.address || selectedLocation.city || "")
    _optionalChain([onLocationSelect, 'optionalCall', _ => _(selectedLocation)])
  }

  // Auto-detect location on mount
  useEffect(() => {
    if (showCurrentLocation && !location && permission !== "denied") {
      // Try GPS first, fallback to IP
      getCurrentLocation().catch(() => {
        getLocationFromIP()
      })
    }
  }, [showCurrentLocation, permission])

  return (
    <div className={`relative ${className}`}>
      {/* Current Location Display */}
      {location && (
        <Card className="mb-4 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">Current Location</p>
                  <p className="text-xs text-muted-foreground">
                    {location.city && location.state 
                      ? `${location.city}, ${location.state}`
                      : location.address
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLocation}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Actions */}
      {showCurrentLocation && (
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use GPS
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={getLocationFromIP}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4 mr-2" />
            )}
            Auto-detect
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-4 bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-destructive" />
              <div>
                <p className="font-medium text-sm text-destructive">Location Error</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(result)}
                  className="w-full text-left p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {result.city && result.state 
                          ? `${result.city}, ${result.state}`
                          : result.address
                        }
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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
        {showResults && searchResults.length === 0 && searchQuery.length >= 3 && !isSearching && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No locations found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Permission Status */}
      {permission === "denied" && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            Location access denied - using manual search only
          </Badge>
        </div>
      )}
    </div>
  )
}
