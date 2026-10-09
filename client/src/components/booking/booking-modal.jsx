 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPin, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/use-router"







export function BookingModal({ isOpen, onClose, professional }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
 
  const defaultServiceName =
    (professional.services && professional.services.length > 0 && professional.services[0]) ||
    professional.profession ||
    professional.serviceCategory ||
    "Service"

  const hourlyRate = _optionalChain([professional, 'access', _ => _.pricing, 'optionalAccess', _2 => _2.hourlyRate]) || professional.hourlyRate || 50
  
  const { user } = useAuth()
  const router = useRouter()

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ]

  const handleBooking = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!selectedDate || !selectedTime || !address) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          professionalId: professional._id,
          serviceName: defaultServiceName,
          scheduledDate: selectedDate.toISOString().split('T')[0],
          scheduledTime: selectedTime,
          description,
          address,
          status: "pending",
          price: hourlyRate,
          duration: 60, // Default 1 hour
          notes: description,
          paymentStatus: "pending"
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking")
      }

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        router.push('/customer/bookings')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Service with {professional.name}</DialogTitle>
          <DialogDescription>Schedule your appointment and provide service details</DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              Your service has been booked with {professional.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your bookings...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Professional Summary */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{professional.name}</h3>
                <p className="text-sm text-muted-foreground">{professional.location}</p>
              </div>
              <Badge variant="default" className="bg-green-600">
                {professional.rating} ⭐
              </Badge>
            </div>
          </div>

          {/* Service Information (fixed per professional) */}
          <div className="space-y-1">
            <Label>Service</Label>
            <p className="text-sm font-medium">
              {defaultServiceName}
              <span className="text-muted-foreground"> - ₹{hourlyRate}/hr</span>
            </p>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <div className="border rounded-lg p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Select Time</Label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Service Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you need help with..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Hourly Rate:</span>
              <span className="font-medium">₹{hourlyRate}/hr</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Total:</span>
                <span className="font-bold text-lg">₹{hourlyRate}/hr</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              className="flex-1"
              disabled={!selectedDate || !selectedTime || !address || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book Service
                </>
              )}
            </Button>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
