import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"









export default function RatingModal({ 
  isOpen, 
  onClose, 
  booking, 
  userType, 
  onRatingSubmitted 
}) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [serviceQuality, setServiceQuality] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [professionalism, setProfessionalism] = useState(0)
  const [paymentOnTime, setPaymentOnTime] = useState(0)
  const [respectful, setRespectful] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isCustomerRating = userType === "customer"
  const targetName = isCustomerRating ? booking.professionalName : booking.customerName

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }



) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please provide an overall rating")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          rating,
          review,
          serviceQuality: isCustomerRating ? serviceQuality : null,
          communication,
          punctuality: isCustomerRating ? punctuality : null,
          professionalism,
          paymentOnTime: !isCustomerRating ? paymentOnTime : null,
          respectful,
          wouldRecommend
        })
      })

      if (response.ok) {
        onRatingSubmitted()
        onClose()
        // Reset form
        setRating(0)
        setReview("")
        setServiceQuality(0)
        setCommunication(0)
        setPunctuality(0)
        setProfessionalism(0)
        setPaymentOnTime(0)
        setRespectful(0)
        setWouldRecommend(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit rating")
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert("Failed to submit rating")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Rate {isCustomerRating ? "Professional" : "Customer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Info */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">{targetName}</h3>
            <p className="text-sm text-gray-600">{booking.serviceName || booking.serviceType}</p>
            <p className="text-xs text-gray-500">
              {new Date(booking.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating *"
          />

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Detailed Ratings</h4>
            
            <StarRating
              value={communication}
              onChange={setCommunication}
              label="Communication"
            />

            <StarRating
              value={professionalism}
              onChange={setProfessionalism}
              label="Professionalism"
            />

            <StarRating
              value={respectful}
              onChange={setRespectful}
              label="Respectful Behavior"
            />

            {isCustomerRating ? (
              <>
                <StarRating
                  value={serviceQuality}
                  onChange={setServiceQuality}
                  label="Service Quality"
                />
                <StarRating
                  value={punctuality}
                  onChange={setPunctuality}
                  label="Punctuality"
                />
              </>
            ) : (
              <StarRating
                value={paymentOnTime}
                onChange={setPaymentOnTime}
                label="Payment On Time"
              />
            )}
          </div>

          {/* Would Recommend */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Would you recommend {isCustomerRating ? "this professional" : "this customer"}?
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(true)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(false)}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                No
              </Button>
            </div>
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review" className="text-sm font-medium">
              Write a Review (Optional)
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Share your experience with ${targetName}...`}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
