import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, DollarSign } from "lucide-react"












export function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setBookings([])
        setLoading(false)
        return
      }

      const response = await fetch("/api/admin/bookings?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to load bookings")
        setBookings([])
        setLoading(false)
        return
      }

      const rows = (data.bookings || []).map((b) => {
        const rawDate = b.scheduledDate
        let date = ""
        if (rawDate instanceof Date) {
          date = rawDate.toISOString().split("T")[0]
        } else if (typeof rawDate === "string" && rawDate.length > 0) {
          date = rawDate.split("T")[0]
        }

        const amountValue = typeof b.amount === "number" ? b.amount : 0

        return {
          id: b.bookingId || b._id || "",
          customer: b.customerName || "Unknown Customer",
          professional: b.professionalName || "Unknown Professional",
          service: b.serviceName || "Service",
          date,
          time: b.scheduledTime || "",
          status: b.status || "pending",
          amount: amountValue,
        }
      })

      setBookings(rows)
      setError(null)
      setLoading(false)
    } catch (err) {
      setError("Failed to load bookings")
      setBookings([])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 15000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status) => {
    const normalized = status.toLowerCase()
    switch (normalized) {
      case "confirmed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Loading bookings...
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono">{booking.id}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.professional}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {booking.date}
                    <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                    {booking.time}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    ₹{booking.amount.toLocaleString("en-IN")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
