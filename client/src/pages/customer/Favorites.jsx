import { useState, useEffect } from "react"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, MapPin, Phone, MessageCircle, Calendar, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/use-router"

export default function CustomerFavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.type !== "customer") {
      router.push('/dashboard')
      return
    }

    // Mock favorites data - in real app, fetch from API
    const mockFavorites = [
      {
        id: "1",
        name: "John Smith",
        service: "Plumbing Services",
        rating: 4.9,
        totalReviews: 127,
        location: "Downtown Area",
        hourlyRate: 75,
        avatar: null,
        isVerified: true,
        lastBooked: "2024-01-15"
      },
      {
        id: "2", 
        name: "Sarah Wilson",
        service: "House Cleaning",
        rating: 4.8,
        totalReviews: 89,
        location: "Uptown District",
        hourlyRate: 45,
        avatar: null,
        isVerified: true,
        lastBooked: "2024-01-10"
      }
    ]

    setTimeout(() => {
      setFavorites(mockFavorites)
      setLoading(false)
    }, 1000)
  }, [user, router])

  const removeFavorite = (professionalId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== professionalId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/customer/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
              <p className="text-muted-foreground mt-1">Your saved professionals for quick booking</p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding professionals to your favorites for quick access and easy booking.
              </p>
              <Button asChild>
                <a href="/services">
                  <Heart className="w-4 h-4 mr-2" />
                  Find Professionals
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {favorites.map((professional) => (
              <Card key={professional.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {professional.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-xl">{professional.name}</h3>
                          {professional.isVerified && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{professional.service}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">{professional.rating}</span>
                            <span className="ml-1">({professional.totalReviews} reviews)</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {professional.location}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Last booked: {new Date(professional.lastBooked).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Starting at</p>
                        <p className="font-semibold text-xl text-primary">₹{professional.hourlyRate}/hr</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/professionals/${professional.id}`)}
                        >
                          View Profile
                        </Button>
                        <Button size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFavorite(professional.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <a href="/services">
                Find More Professionals
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
