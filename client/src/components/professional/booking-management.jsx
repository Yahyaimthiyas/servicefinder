import { useState, useEffect } from "react"
import { useRouter } from "@/hooks/use-router"
import RatingModal from "@/components/rating/rating-modal"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,


  DollarSign,
  CheckCircle,
  XCircle,

  Eye,
  MessageSquare,

  Star,

  Search,
  Loader2
} from "lucide-react"























export default function BookingManagement() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [responseNotes, setResponseNotes] = useState("")
  const [startingChat, setStartingChat] = useState(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter, searchQuery])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        setLoading(false)
        return
      }

      const response = await fetch("/api/professional/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Professional bookings fetched:", data)
        
        // Map the real data to match the interface
        const mappedBookings = (data.bookings || []).map((booking) => ({
          _id: booking._id,
          customerName: booking.customerName || "Unknown Customer",
          customerEmail: booking.customerEmail || "N/A",
          customerPhone: booking.customerPhone || "N/A",
          serviceType: booking.serviceName || booking.serviceType || "Service",
          description: booking.description || booking.notes || "",
          scheduledDate: booking.scheduledDate || booking.date,
          scheduledTime: booking.scheduledTime || booking.time,
          address: booking.address || "",
          city: booking.city || "",
          state: booking.state || "",
          pincode: booking.pincode || "",
          status: booking.status || "pending",
          amount: booking.price || booking.amount || 0,
          createdAt: booking.createdAt,
          notes: booking.notes || "",
          customerRating: booking.customerRating,
          customerReview: booking.customerReview
        }))
        
        setBookings(mappedBookings)
      } else {
        console.error("Failed to fetch bookings:", response.status)
        setBookings([])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/professional/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: responseNotes,
        }),
      })

      if (response.ok) {
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus , notes: responseNotes }
            : booking
        ))
        setSelectedBooking(null)
        setResponseNotes("")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      in_progress: { color: "bg-purple-100 text-purple-800", label: "In Progress" },
      "in-progress": { color: "bg-purple-100 text-purple-800", label: "In Progress" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" }
    }
    
    const config = statusConfig[status ] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusActions = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => updateBookingStatus(booking._id, 'confirmed')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )
      case 'confirmed':
        return (
          <Button 
            size="sm" 
            onClick={() => updateBookingStatus(booking._id, 'in_progress')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Clock className="w-4 h-4 mr-1" />
            Start Job
          </Button>
        )
      case 'in_progress':
      case 'in-progress':
        return (
          <Button 
            size="sm" 
            onClick={() => updateBookingStatus(booking._id, 'completed')}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Complete
          </Button>
        )
      case 'completed':
        return (
          <Button 
            size="sm" 
            onClick={() => openRatingModal(booking)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Star className="w-4 h-4 mr-1" />
            Rate Customer
          </Button>
        )
      default:
        return null
    }
  }

  const startChatWithCustomer = async (booking) => {
    setStartingChat(booking._id)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/professional/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: booking.customerId,
          customerEmail: booking.customerEmail,
          bookingId: booking._id,
          initialMessage: `Hi ${booking.customerName}! I'm ready to discuss your ${booking.serviceType} service scheduled for ${booking.scheduledDate}. How can I help you?`
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Chat started successfully:", data)
        router.push("/professional/chat")
      } else {
        console.error("Failed to start chat")
        // Fallback: navigate to chat page anyway
        router.push("/professional/chat")
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      // Fallback: navigate to chat page anyway
      router.push("/professional/chat")
    } finally {
      setStartingChat(null)
    }
  }

  const openRatingModal = (booking) => {
    setSelectedBookingForRating(booking)
    setRatingModalOpen(true)
  }

  const handleRatingSubmitted = () => {
    // Refresh bookings to update the UI
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading bookings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">₹{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {statusFilter === "all" 
                  ? "You don't have any bookings yet." 
                  : `No ${statusFilter} bookings found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.serviceType}</h3>
                        <p className="text-gray-600">Customer: {booking.customerName}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.scheduledTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ₹{booking.amount}
                      </div>
                    </div>
                    
                    {booking.description && (
                      <p className="text-sm text-gray-600 mb-4">{booking.description}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {getStatusActions(booking)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startChatWithCustomer(booking)}
                        disabled={startingChat === booking._id}
                        title="Chat with Customer"
                      >
                        {startingChat === booking._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Information</h4>
                                  <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                                  <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                  <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Service Details</h4>
                                  <p><strong>Service:</strong> {selectedBooking.serviceType}</p>
                                  <p><strong>Date:</strong> {new Date(selectedBooking.scheduledDate).toLocaleDateString()}</p>
                                  <p><strong>Time:</strong> {selectedBooking.scheduledTime}</p>
                                  <p><strong>Amount:</strong> ₹{selectedBooking.amount}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Address</h4>
                                <p>{selectedBooking.address}, {selectedBooking.city}, {selectedBooking.state} - {selectedBooking.pincode}</p>
                              </div>
                              {selectedBooking.description && (
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p>{selectedBooking.description}</p>
                                </div>
                              )}
                              {selectedBooking.customerRating && (
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Rating</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < selectedBooking.customerRating
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span>{selectedBooking.customerRating}/5</span>
                                  </div>
                                  {selectedBooking.customerReview && (
                                    <p className="mt-2 text-sm text-gray-600">{selectedBooking.customerReview}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {selectedBookingForRating && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          booking={selectedBookingForRating}
          userType="professional"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
