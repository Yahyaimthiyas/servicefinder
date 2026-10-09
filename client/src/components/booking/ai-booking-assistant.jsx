import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Sparkles, MapPin, Clock, DollarSign, Star, CheckCircle } from "lucide-react"
import { aiService, } from "@/lib/ai-service"
import { mockProfessionals } from "@/lib/mock-data"





export function AIBookingAssistant({ onBookingSelect }) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceRequest, setServiceRequest] = useState({
    description: "",
    location: "",
    urgency: "medium",
  })
  const [recommendations, setRecommendations] = useState([])
  const [enhancedDescription, setEnhancedDescription] = useState("")

  const handleDescriptionEnhancement = async () => {
    if (!serviceRequest.description.trim()) return

    setIsLoading(true)
    try {
      const enhanced = await aiService.generateServiceDescription(serviceRequest.description)
      setEnhancedDescription(enhanced)
    } catch (error) {
      console.error("Failed to enhance description:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    try {
      const recs = await aiService.getServiceRecommendations(
        {
          ...serviceRequest,
          description: enhancedDescription || serviceRequest.description,
        },
        mockProfessionals,
      )
      setRecommendations(recs)
      setStep(3)
    } catch (error) {
      console.error("Failed to get recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProfessionalById = (id) => {
    return mockProfessionals.find((p) => p.id === id)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>AI Booking Assistant</span>
          </CardTitle>
          <CardDescription>Let AI help you find the perfect professional for your needs</CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Service Description */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Describe Your Service Need</CardTitle>
            <CardDescription>Tell us what you need help with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., I need a plumber to fix a leaky kitchen faucet that's been dripping for a week..."
                value={serviceRequest.description}
                onChange={(e) => setServiceRequest({ ...serviceRequest, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="location"
                    placeholder="Enter your location"
                    value={serviceRequest.location}
                    onChange={(e) => setServiceRequest({ ...serviceRequest, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <div className="flex space-x-2">
                  {["low", "medium", "high"].map((level) => (
                    <Button
                      key={level}
                      variant={serviceRequest.urgency === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setServiceRequest({ ...serviceRequest, urgency: level  })}
                      className="flex-1 capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleDescriptionEnhancement}
                variant="outline"
                disabled={!serviceRequest.description.trim() || isLoading}
                className="flex-1 bg-transparent"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Description
                  </>
                )}
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!serviceRequest.description.trim() || !serviceRequest.location.trim()}
                className="flex-1"
              >
                Continue
              </Button>
            </div>

            {enhancedDescription && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  AI Enhanced Description
                </h4>
                <p className="text-sm text-muted-foreground">{enhancedDescription}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setServiceRequest({ ...serviceRequest, description: enhancedDescription })}
                  className="mt-2"
                >
                  Use This Description
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Additional Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Additional Details (Optional)</CardTitle>
            <CardDescription>Help us find the best match for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 200"
                    value={serviceRequest.budget || ""}
                    onChange={(e) =>
                      setServiceRequest({
                        ...serviceRequest,
                        budget: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="preferredTime"
                    placeholder="e.g., Tomorrow morning"
                    value={serviceRequest.preferredTime || ""}
                    onChange={(e) => setServiceRequest({ ...serviceRequest, preferredTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Your Request Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong>Service:</strong> {enhancedDescription || serviceRequest.description}
                </p>
                <p>
                  <strong>Location:</strong> {serviceRequest.location}
                </p>
                <p>
                  <strong>Urgency:</strong> {serviceRequest.urgency}
                </p>
                {serviceRequest.budget && (
                  <p>
                    <strong>Budget:</strong> ${serviceRequest.budget}
                  </p>
                )}
                {serviceRequest.preferredTime && (
                  <p>
                    <strong>Preferred Time:</strong> {serviceRequest.preferredTime}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleGetRecommendations} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Professionals...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: AI Recommendations */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Based on your requirements, here are the best matches</CardDescription>
            </CardHeader>
          </Card>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>AI is analyzing professionals...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const professional = getProfessionalById(rec.professionalId)
                if (!professional) return null

                return (
                  <Card key={rec.professionalId} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={professional.avatar || "/placeholder.svg"} alt={professional.name} />
                          <AvatarFallback>
                            {professional.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{professional.name}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="bg-green-600">
                                  {rec.score}% Match
                                </Badge>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 fill-primary text-primary" />
                                  <span className="text-sm ml-1">{professional.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">${professional.hourlyRate}/hr</div>
                              <div className="text-sm text-muted-foreground">{rec.estimatedDuration}</div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Why This Professional?
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {rec.reasons.map((reason, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {professional.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {rec.suggestedTime}
                              </div>
                            </div>
                            <Button onClick={() => onBookingSelect(professional.id, rec)}>
                              Book This Professional
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => {
                setStep(1)
                setRecommendations([])
                setEnhancedDescription("")
              }}
              variant="outline"
              className="bg-transparent"
            >
              Start New Search
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
