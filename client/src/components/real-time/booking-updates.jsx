import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Calendar, User, MapPin, DollarSign } from "lucide-react"














export function BookingUpdates({ bookingId, initialStatus }) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus)
  const [updates, setUpdates] = useState([
    {
      id: "1",
      status: "pending",
      timestamp: new Date(Date.now() - 3600000),
      message: "Booking request submitted",
      details: "Your booking request has been sent to the professional",
    },
    {
      id: "2",
      status: "confirmed",
      timestamp: new Date(Date.now() - 1800000),
      message: "Booking confirmed",
      details: "John Smith has accepted your booking request",
    },
    {
      id: "3",
      status: "in_progress",
      timestamp: new Date(Date.now() - 300000),
      message: "Service in progress",
      details: "The professional has started working on your service",
    },
  ])

  const [progress, setProgress] = useState(60)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && currentStatus !== "completed") {
        const statusFlow = ["pending", "confirmed", "in_progress", "completed"]
        const currentIndex = statusFlow.indexOf(currentStatus)

        if (currentIndex < statusFlow.length - 1) {
          const nextStatus = statusFlow[currentIndex + 1] 
          setCurrentStatus(nextStatus)
          setProgress((currentIndex + 2) * 25)

          const newUpdate = {
            id: Date.now().toString(),
            status: nextStatus,
            timestamp: new Date(),
            message: getStatusMessage(nextStatus),
            details: getStatusDetails(nextStatus),
          }

          setUpdates((prev) => [...prev, newUpdate])
        }
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [currentStatus])

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Booking request submitted"
      case "confirmed":
        return "Booking confirmed"
      case "in_progress":
        return "Service in progress"
      case "completed":
        return "Service completed"
      case "cancelled":
        return "Booking cancelled"
      default:
        return "Status updated"
    }
  }

  const getStatusDetails = (status) => {
    switch (status) {
      case "pending":
        return "Your booking request has been sent to the professional"
      case "confirmed":
        return "The professional has accepted your booking request"
      case "in_progress":
        return "The professional has started working on your service"
      case "completed":
        return "The service has been completed successfully"
      case "cancelled":
        return "The booking has been cancelled"
      default:
        return "Booking status has been updated"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmed</Badge>
      case "in_progress":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock
      case "confirmed":
        return CheckCircle
      case "in_progress":
        return AlertCircle
      case "completed":
        return CheckCircle
      case "cancelled":
        return AlertCircle
      default:
        return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Booking Status</span>
            {getStatusBadge(currentStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Today, 2:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>John Smith</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>123 Main St</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>$150.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Update Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update, index) => {
              const Icon = getStatusIcon(update.status)
              const isLatest = index === updates.length - 1

              return (
                <div key={update.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${isLatest ? "bg-blue-500 text-white" : "bg-muted"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < updates.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{update.message}</p>
                      {isLatest && <Badge variant="secondary">Latest</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{update.details}</p>
                    <p className="text-xs text-muted-foreground">{update.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {currentStatus === "completed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold">Service Completed!</h3>
                <p className="text-sm text-muted-foreground">How was your experience?</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Leave Review</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Book Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
