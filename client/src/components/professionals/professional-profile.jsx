 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, Shield, Phone, MessageCircle, Calendar, Award, Users, CheckCircle, Loader2 } from "lucide-react"
import { BookingModal } from "@/components/booking/booking-modal"





export function ProfessionalProfile({ professionalId }) {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [professional, setProfessional] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/professionals/${professionalId}`)
        
        if (!response.ok) {
          throw new Error("Professional not found")
        }

        const data = await response.json()
        setProfessional(data.professional)
        setReviews(data.reviews || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load professional")
      } finally {
        setLoading(false)
      }
    }

    if (professionalId) {
      fetchProfessional()
    }
  }, [professionalId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading professional profile...</p>
        </div>
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-2">Professional Not Found</h2>
            <p className="text-muted-foreground">{error || "The professional you're looking for doesn't exist."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-2">Professional Not Found</h2>
            <p className="text-muted-foreground">The professional you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-8 bg-card/50 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32 mx-auto md:mx-0">
                <AvatarImage src={professional.avatar || "/placeholder.svg"} alt={professional.name} />
                <AvatarFallback className="text-2xl">
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{professional.name}</h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 mb-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-medium ml-1">{professional.rating}</span>
                        <span className="text-muted-foreground ml-1">({professional.reviewCount} reviews)</span>
                      </div>
                      {professional.isVerified && (
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="w-4 h-4 mr-1" />
                          Verified Professional
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {professional.location}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => setShowBookingModal(true)} size="lg">
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg mb-6 text-pretty">{professional.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{professional.completedJobs}</div>
                    <div className="text-sm text-muted-foreground">Jobs Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{professional.yearsExperience}</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{professional.responseTime}</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ₹{Number(_nullishCoalesce(_nullishCoalesce(_optionalChain([professional, 'access', _2 => _2.pricing, 'optionalAccess', _3 => _3.hourlyRate]), () => ( professional.hourlyRate)), () => ( 0))).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Starting Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>Professional services and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {professional.services.map((service, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{service}</h3>
                        <Badge variant="outline">
                          ₹{Number(_nullishCoalesce(_nullishCoalesce(_optionalChain([professional, 'access', _4 => _4.pricing, 'optionalAccess', _5 => _5.hourlyRate]), () => ( professional.hourlyRate)), () => ( 0))).toLocaleString()}/hr
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Professional {service.toLowerCase()} services with quality guarantee
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Available {professional.availability}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                          Insured
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>{reviews.length} reviews from verified customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {review.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{review.customerName}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{review.service}</Badge>
                          </div>
                          <p className="text-muted-foreground text-pretty">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Work Portfolio</CardTitle>
                <CardDescription>Recent projects and completed work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">Project Image {item}</span>
                      </div>
                      <h4 className="font-medium">Kitchen Renovation</h4>
                      <p className="text-sm text-muted-foreground">Complete kitchen plumbing installation</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {professional.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    With {professional.yearsExperience} years of experience in the industry, I provide reliable and
                    professional services to homeowners and businesses. I take pride in delivering quality work and
                    excellent customer service.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Specializations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Licensed Professional</p>
                      <p className="text-sm text-muted-foreground">State certified and insured</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Background Verified</p>
                      <p className="text-sm text-muted-foreground">Passed comprehensive background check</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Customer Satisfaction</p>
                      <p className="text-sm text-muted-foreground">98% customer satisfaction rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} professional={professional} />
    </div>
  )
}
