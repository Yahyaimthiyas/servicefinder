 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"


























export default function RatingDisplay({ userId, userType, showTitle = true }) {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {
    fetchRatings()
  }, [userId, userType])

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔍 Fetching ratings for:", { userId, userType })
      
      const response = await fetch(`/api/ratings?userId=${userId}&userType=${userType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📡 Rating API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Rating API data:", data)
        setRatings(data.ratings || [])
        
        // Calculate average rating
        if (data.ratings && data.ratings.length > 0) {
          const avg = data.ratings.reduce((sum, rating) => sum + rating.rating, 0) / data.ratings.length
          setAverageRating(Math.round(avg * 10) / 10)
          setTotalRatings(data.ratings.length)
          console.log(`📊 Calculated average: ${avg}, total: ${data.ratings.length}`)
        } else {
          console.log("📊 No ratings found")
        }
      } else {
        const errorText = await response.text()
        console.error("❌ Rating API error:", response.status, errorText)
      }
    } catch (error) {
      console.error("❌ Error fetching ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ rating, size = "sm" }) => {
    const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4"
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ratings & Reviews</span>
              {totalRatings > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-sm text-gray-600">
                    {totalRatings} review{totalRatings !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {ratings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No ratings yet</p>
            <p className="text-sm text-gray-400">
              {userType === "professional" 
                ? "Complete some services to receive ratings from customers"
                : "Book some services to rate professionals"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={rating.otherUserAvatar} />
                    <AvatarFallback>
                      {_optionalChain([rating, 'access', _ => _.otherUserName, 'optionalAccess', _2 => _2.charAt, 'call', _3 => _3(0)]) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{rating.otherUserName}</h4>
                        <p className="text-sm text-gray-600">
                          {rating.serviceName} • {formatDate(rating.createdAt)}
                        </p>
                      </div>
                      <StarRating rating={rating.rating} />
                    </div>

                    {rating.review && (
                      <p className="text-gray-700 mb-3">{rating.review}</p>
                    )}

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      {rating.communication && (
                        <div className="text-sm">
                          <span className="text-gray-600">Communication:</span>
                          <StarRating rating={rating.communication} />
                        </div>
                      )}
                      {rating.professionalism && (
                        <div className="text-sm">
                          <span className="text-gray-600">Professionalism:</span>
                          <StarRating rating={rating.professionalism} />
                        </div>
                      )}
                      {rating.serviceQuality && (
                        <div className="text-sm">
                          <span className="text-gray-600">Service Quality:</span>
                          <StarRating rating={rating.serviceQuality} />
                        </div>
                      )}
                      {rating.punctuality && (
                        <div className="text-sm">
                          <span className="text-gray-600">Punctuality:</span>
                          <StarRating rating={rating.punctuality} />
                        </div>
                      )}
                      {rating.paymentOnTime && (
                        <div className="text-sm">
                          <span className="text-gray-600">Payment:</span>
                          <StarRating rating={rating.paymentOnTime} />
                        </div>
                      )}
                      {rating.respectful && (
                        <div className="text-sm">
                          <span className="text-gray-600">Respectful:</span>
                          <StarRating rating={rating.respectful} />
                        </div>
                      )}
                    </div>

                    {/* Recommendation */}
                    {rating.wouldRecommend !== null && (
                      <div className="flex items-center gap-2">
                        {rating.wouldRecommend ? (
                          <>
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Recommends</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">Does not recommend</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Rater Type Badge */}
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        Rated by {rating.raterType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
