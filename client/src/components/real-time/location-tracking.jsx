import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Phone, MessageCircle } from "lucide-react"








export function LocationTracking({
  bookingId,
  professionalName,
  estimatedArrival,
  serviceAddress,
}) {
  const [professionalLocation, setProfessionalLocation] = useState({
    lat: 40.7128,
    lng: -74.006,
    address: "123 Main St, New York, NY",
  })
  const [status, setStatus] = useState("on_way")
  const [estimatedTime, setEstimatedTime] = useState(15)
  const [distance, setDistance] = useState(2.3)

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDistance((prev) => {
        const newDistance = Math.max(0, prev - 0.1)

        if (newDistance < 0.5 && status === "on_way") {
          setStatus("nearby")
        } else if (newDistance < 0.1 && status === "nearby") {
          setStatus("arrived")
        }

        return newDistance
      })

      setEstimatedTime((prev) => Math.max(0, prev - 1))

      // Simulate location updates
      setProfessionalLocation((prev) => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [status])

  const getStatusBadge = () => {
    switch (status) {
      case "on_way":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">On the way</Badge>
      case "nearby":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Nearby</Badge>
      case "arrived":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Arrived</Badge>
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "on_way":
        return `${professionalName} is on the way to your location`
      case "nearby":
        return `${professionalName} is nearby and will arrive shortly`
      case "arrived":
        return `${professionalName} has arrived at your location`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Live Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{professionalName}</p>
            <p className="text-sm text-muted-foreground">Professional</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Status Message */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">{getStatusMessage()}</p>
        </div>

        {/* Location Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Current Location</p>
              <p className="text-xs text-muted-foreground">{professionalLocation.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Destination</p>
              <p className="text-xs text-muted-foreground">{serviceAddress}</p>
            </div>
          </div>
        </div>

        {/* Time and Distance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{estimatedTime} min</p>
            <p className="text-xs text-muted-foreground">ETA</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Navigation className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{distance.toFixed(1)} mi</p>
            <p className="text-xs text-muted-foreground">Distance</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Interactive map would appear here</p>
            <p className="text-xs text-muted-foreground">Showing real-time location updates</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>

        {/* Booking Details */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono">{bookingId}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Scheduled Time:</span>
            <span>{estimatedArrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
