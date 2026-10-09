import { LocationTracking } from "@/components/real-time/location-tracking"
import { BookingUpdates } from "@/components/real-time/booking-updates"

export default function TrackingPage({ params }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Service</h1>
          <p className="text-muted-foreground">Real-time updates for booking #{params.bookingId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <LocationTracking
              bookingId={params.bookingId}
              professionalName="John Smith"
              estimatedArrival={new Date(Date.now() + 900000)}
              serviceAddress="123 Main St, New York, NY 10001"
            />
          </div>
          <div>
            <BookingUpdates bookingId={params.bookingId} initialStatus="in_progress" />
          </div>
        </div>
      </div>
    </div>
  )
}
