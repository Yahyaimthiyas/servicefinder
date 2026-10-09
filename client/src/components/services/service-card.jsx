 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Shield, Phone, MessageCircle, Calendar } from "lucide-react"
import { Link } from "@/components/link"
import { useState } from "react"
import { BookingModal } from "@/components/booking/booking-modal"






export function ServiceCard({ professional, viewMode = 'grid' }) {
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  // Safely extract and convert all values to prevent React rendering errors
  const name = String(professional.name || "Professional")
  const rating = Number(professional.rating || 0)
  const totalReviews = Number(professional.totalReviews || 0)
  const rawLocation =
    professional.address ||
    professional.location ||
    [professional.city, professional.state].filter(Boolean).join(", ") ||
    "Location not specified"
  const location = String(rawLocation)
  const description = String(professional.bio || professional.description || "Professional service provider")
  const services = Array.isArray(professional.services) ? professional.services : []
  const hourlyRate = Number(
    _nullishCoalesce(_nullishCoalesce(_optionalChain([professional, 'access', _2 => _2.pricing, 'optionalAccess', _3 => _3.hourlyRate]), () => ( professional.hourlyRate)), () => ( 0))
  )
  const availability = typeof professional.availability === 'string' ? professional.availability : "Contact for availability"
  const completedJobs = Number(professional.completedJobs || professional.totalJobs || 0)
  const responseTime = typeof professional.responseTime === 'string' ? professional.responseTime : "Within 24h"
  const experience = typeof professional.experience === 'string' ? professional.experience : String(professional.yearsExperience || "N/A")
  const isVerified = Boolean(professional.isVerified || professional.verified || false)
  const avatar = professional.avatar || professional.profileImage

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Avatar and Basic Info */}
            <div className="flex items-start space-x-4 md:w-1/3">
              <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                  {isVerified && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </div>
              </div>
            </div>

            {/* Middle: Services and Description */}
            <div className="md:w-1/3">
              <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
              {services.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {services.slice(0, 2).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {String(service)}
                    </Badge>
                  ))}
                  {services.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{services.length - 2}</Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-green-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {String(availability)}
                </div>
                <span className="text-gray-500">{String(experience)} exp</span>
              </div>
            </div>

            {/* Right: Pricing and Actions */}
            <div className="md:w-1/3 flex flex-col justify-between">
              <div className="text-right mb-4">
                <div className="text-sm text-gray-500 mb-1">Starting at</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{hourlyRate > 0 ? String(hourlyRate) : "—"}
                </div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowBookingModal(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/professionals/${professional._id}`}>View Profile</Link>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid View (Default) - Clean Design like Reference
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="bg-blue-600 text-white font-medium">
              {name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
              {isVerified && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 mb-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Service Category */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium">
            {services.length > 0 ? services[0] : "Professional Service"}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{hourlyRate > 0 ? String(hourlyRate) : "—"}
            </div>
            <div className="text-sm text-gray-500">per hour</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{String(experience)} experience</div>
            <div className="flex items-center text-green-600 text-sm">
              <Clock className="w-3 h-3 mr-1" />
              Available now
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBookingModal(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Book Now
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => window.open(`tel:${professional.phone || ''}`)}
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => setShowBookingModal(true)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm">
          <span className="text-gray-500">Response time: {String(responseTime)}</span>
          <span className="text-green-600 font-medium">Available now</span>
        </div>
      </CardContent>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        professional={professional}
      />
    </Card>
  )
}
