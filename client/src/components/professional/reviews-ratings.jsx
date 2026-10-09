 import { useState, useEffect } from "react"
import RatingDisplay from "@/components/rating/rating-display"

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please login to view your reviews</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RatingDisplay 
        userId={user._id} 
        userType="professional" 
        showTitle={false}
      />
    </div>
  )
}
