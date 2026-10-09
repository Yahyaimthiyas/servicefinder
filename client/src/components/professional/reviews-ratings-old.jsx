import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { 
  Star,
  MessageSquare,
  ThumbsUp,

  TrendingUp,



  Search,
  Reply,
  Flag,
  Award,
  BarChart3
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"































export default function ReviewsRatings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReviews()
    fetchRatingStats()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, ratingFilter, searchQuery])

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      } else {
        console.error("Failed to fetch reviews:", response.statusText)
        // Keep empty reviews array - no mock data
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRatingStats = () => {
    // Calculate stats from actual reviews data
    if (reviews.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recentTrend: 'stable'
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating ] = (dist[review.rating ] || 0) + 1
      return dist
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

    setStats({
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: reviews.length,
      ratingDistribution,
      recentTrend: 'stable' // Would need historical data to calculate trend
    })
  }

  const filterReviews = () => {
    let filtered = reviews

    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter)
      filtered = filtered.filter(review => review.rating === rating)
    }

    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredReviews(filtered)
  }

  const respondToReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/professional/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: responseText }),
      })

      if (response.ok) {
        // Update local state
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                response: { 
                  message: responseText, 
                  createdAt: new Date().toISOString() 
                } 
              }
            : review
        ))
        setSelectedReview(null)
        setResponseText("")
      }
    } catch (error) {
      console.error("Error responding to review:", error)
    }
  }

  const renderStars = (rating, size = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4", 
      lg: "w-5 h-5"
    }
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    )
  }

  const getRatingPercentage = (count) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reviews...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Rating */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(Math.round(stats.averageRating), "lg")}
            </div>
            <p className="text-sm text-gray-600">
              Based on {stats.totalReviews} reviews
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {stats.recentTrend === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Trending up</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(stats.ratingDistribution[rating ])}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {stats.ratingDistribution[rating ]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reviews Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
          <CardDescription>
            Manage and respond to customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews by customer name, comment, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews found matching your criteria
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.customerAvatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {review.customerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{review.customerName}</h4>
                            {review.verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600">
                              • {review.serviceType}
                            </span>
                            <span className="text-sm text-gray-600">
                              • {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {review.helpful}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                      
                      {/* Professional Response */}
                      {review.response ? (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Reply className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-900">Your Response</span>
                            <span className="text-xs text-blue-600">
                              {new Date(review.response.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-blue-800 text-sm">{review.response.message}</p>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Reply className="w-4 h-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Review</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{selectedReview.customerName}</span>
                                    {renderStars(selectedReview.rating, "sm")}
                                  </div>
                                  <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Your Response</label>
                                  <Textarea
                                    placeholder="Write a professional response to this review..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => respondToReview(selectedReview._id)}
                                    disabled={!responseText.trim()}
                                  >
                                    Send Response
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setSelectedReview(null)
                                      setResponseText("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <MessageSquare className="w-5 h-5" />
            Tips for Better Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Respond Professionally</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Thank customers for positive feedback</li>
                <li>• Address concerns in negative reviews</li>
                <li>• Keep responses brief and professional</li>
                <li>• Show you value customer feedback</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Improve Your Rating</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Deliver quality work consistently</li>
                <li>• Communicate clearly with customers</li>
                <li>• Arrive on time for appointments</li>
                <li>• Follow up after job completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
