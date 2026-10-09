 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, DollarSign, CheckCircle, Lightbulb } from "lucide-react"
import { aiService, } from "@/lib/ai-service"









export function EnhancedBookingModal({ isOpen, onClose, professional, recommendation }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [isLoadingCost, setIsLoadingCost] = useState(false)
  const [suggestedTimes, setSuggestedTimes] = useState([])
  const [scheduleReasoning, setScheduleReasoning] = useState("")
  const [costEstimate, setCostEstimate] = useState(null)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  // Get AI scheduling suggestions
  useEffect(() => {
    if (selectedService && isOpen) {
      getSchedulingSuggestions()
    }
  }, [selectedService, isOpen])

  // Get cost estimate when service and description change
  useEffect(() => {
    if (selectedService && description && isOpen) {
      getCostEstimate()
    }
  }, [selectedService, description, isOpen])

  const getSchedulingSuggestions = async () => {
    setIsLoadingSchedule(true)
    try {
      const result = await aiService.suggestOptimalScheduling({
        serviceType: selectedService,
        professionalSchedule: professional.availability,
        urgency: "normal",
        location: address || "Not specified",
      })
      setSuggestedTimes(result.suggestedTimes)
      setScheduleReasoning(result.reasoning)
    } catch (error) {
      console.error("Error getting scheduling suggestions:", error)
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const getCostEstimate = async () => {
    setIsLoadingCost(true)
    try {
      const result = await aiService.estimateServiceCost({
        serviceType: selectedService,
        description,
        location: address || "Not specified",
        professionalRates: professional.hourlyRate,
      })
      setCostEstimate(result)
    } catch (error) {
      console.error("Error getting cost estimate:", error)
    } finally {
      setIsLoadingCost(false)
    }
  }

  const handleBooking = async () => {
    try {
      const bookingData = {
        professionalId: professional._id,
        service: selectedService,
        date: _optionalChain([selectedDate, 'optionalAccess', _ => _.toISOString, 'call', _2 => _2()]),
        time: selectedTime,
        description,
        address,
        estimatedCost: _optionalChain([costEstimate, 'optionalAccess', _3 => _3.total]) || 0,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const result = await aiService.generateBookingConfirmation({
          professional: professional.name,
          service: selectedService,
          date: _optionalChain([selectedDate, 'optionalAccess', _4 => _4.toDateString, 'call', _5 => _5()]) || "",
          time: selectedTime,
          description,
          address,
          estimatedCost: _optionalChain([costEstimate, 'optionalAccess', _6 => _6.total]) || 0,
        })
        setConfirmationMessage(result.message)

        setTimeout(() => {
          onClose()
          setConfirmationMessage("")
        }, 3000)
      } else {
        throw new Error("Failed to create booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      setConfirmationMessage("Failed to create booking. Please try again.")
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            AI-Enhanced Booking with {professional.name}
          </DialogTitle>
        </DialogHeader>

        {confirmationMessage ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p>{confirmationMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Booking Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="service" className="text-gray-700">
                  Service Type
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {professional.services.map((service) => (
                      <SelectItem key={service} value={service} className="hover:bg-gray-50">
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  Service Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need help with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] bg-white border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-700">
                  Service Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>

              <div>
                <Label className="text-gray-700">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-300 bg-white"
                  disabled={(date) => date < new Date()}
                />
              </div>

              {suggestedTimes.length > 0 && (
                <div>
                  <Label className="text-gray-700">AI Suggested Times</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {suggestedTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>
                  {scheduleReasoning && <p className="text-sm text-gray-600 mt-2">{scheduleReasoning}</p>}
                </div>
              )}
            </div>

            {/* Right Column - AI Insights */}
            <div className="space-y-4">
              {/* AI Recommendation */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700">{recommendation.reasoning}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Match Score: {Math.round(recommendation.matchScore * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Estimate */}
              {costEstimate && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      AI Cost Estimate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-green-700">
                        <span>Base Cost:</span>
                        <span>${costEstimate.baseCost}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Complexity Factor:</span>
                        <span>+${costEstimate.complexityAdjustment}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-green-200 pt-2 text-green-800">
                        <span>Total Estimate:</span>
                        <span>${costEstimate.total}</span>
                      </div>
                      <p className="text-xs text-green-600">{costEstimate.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading States */}
              {isLoadingSchedule && (
                <Card className="bg-white border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">AI is analyzing optimal scheduling...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingCost && (
                <Card className="bg-white border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">AI is calculating cost estimate...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {!confirmationMessage && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!selectedService || !selectedTime || !description}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Book Service
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
