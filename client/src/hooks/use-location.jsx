 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
















export function useLocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState(null)

  // Get current position using browser geolocation
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: "Geolocation is not supported by this browser" })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        )
      })

      const { latitude, longitude } = position.coords
      
      // Get address details from coordinates
      const addressData = await reverseGeocode(latitude, longitude)
      
      const locationData = {
        latitude,
        longitude,
        ...addressData,
      }

      setLocation(locationData)
      setPermission("granted")
      
      // Store in localStorage for future use
      localStorage.setItem("userLocation", JSON.stringify(locationData))
      
    } catch (err) {
      const locationError = {
        code: err.code || 0,
        message: getErrorMessage(err.code || 0),
      }
      setError(locationError)
      
      if (err.code === 1) {
        setPermission("denied")
      }
    } finally {
      setLoading(false)
    }
  }

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch address")
      }
      
      const data = await response.json()
      
      return {
        address: data.display_name,
        city: _optionalChain([data, 'access', _ => _.address, 'optionalAccess', _2 => _2.city]) || _optionalChain([data, 'access', _3 => _3.address, 'optionalAccess', _4 => _4.town]) || _optionalChain([data, 'access', _5 => _5.address, 'optionalAccess', _6 => _6.village]),
        state: _optionalChain([data, 'access', _7 => _7.address, 'optionalAccess', _8 => _8.state]),
        country: _optionalChain([data, 'access', _9 => _9.address, 'optionalAccess', _10 => _10.country]),
        postalCode: _optionalChain([data, 'access', _11 => _11.address, 'optionalAccess', _12 => _12.postcode]),
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
      return {}
    }
  }

  // Get location from IP address as fallback
  const getLocationFromIP = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://ipapi.co/json/")
      if (!response.ok) {
        throw new Error("Failed to fetch location from IP")
      }
      
      const data = await response.json()
      
      const locationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        state: data.region,
        country: data.country_name,
        address: `${data.city}, ${data.region}, ${data.country_name}`,
        postalCode: data.postal,
      }

      setLocation(locationData)
      localStorage.setItem("userLocation", JSON.stringify(locationData))
      
    } catch (err) {
      setError({ code: 0, message: "Failed to get location from IP" })
    } finally {
      setLoading(false)
    }
  }

  // Search for locations by query
  const searchLocation = async (query) => {
    if (!query.trim()) return []

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error("Failed to search locations")
      }
      
      const data = await response.json()
      
      return data.map((item) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.display_name,
        city: _optionalChain([item, 'access', _13 => _13.address, 'optionalAccess', _14 => _14.city]) || _optionalChain([item, 'access', _15 => _15.address, 'optionalAccess', _16 => _16.town]) || _optionalChain([item, 'access', _17 => _17.address, 'optionalAccess', _18 => _18.village]),
        state: _optionalChain([item, 'access', _19 => _19.address, 'optionalAccess', _20 => _20.state]),
        country: _optionalChain([item, 'access', _21 => _21.address, 'optionalAccess', _22 => _22.country]),
        postalCode: _optionalChain([item, 'access', _23 => _23.address, 'optionalAccess', _24 => _24.postcode]),
      }))
    } catch (error) {
      console.error("Location search failed:", error)
      return []
    }
  }

  // Get error message based on error code
  const getErrorMessage = (code) => {
    switch (code) {
      case 1:
        return "Location access denied by user"
      case 2:
        return "Location information is unavailable"
      case 3:
        return "Location request timed out"
      default:
        return "An unknown error occurred while retrieving location"
    }
  }

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation))
      } catch (error) {
        console.error("Failed to parse saved location:", error)
        localStorage.removeItem("userLocation")
      }
    }
  }, [])

  // Check geolocation permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermission(result.state )
      })
    }
  }, [])

  return {
    location,
    loading,
    error,
    permission,
    getCurrentLocation,
    getLocationFromIP,
    searchLocation,
    clearLocation: () => {
      setLocation(null)
      localStorage.removeItem("userLocation")
    },
  }
}
