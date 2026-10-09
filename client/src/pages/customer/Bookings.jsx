import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Phone,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@/hooks/use-router";
import RatingModal from "@/components/rating/rating-modal";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("/api/bookings?userType=customer", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterBookings = (status) => {
    if (status === "all") return bookings;

    // Handle both in-progress and in_progress formats
    if (status === "in-progress") {
      return bookings.filter(
        (booking) =>
          booking.status === "in-progress" || booking.status === "in_progress",
      );
    }

    return bookings.filter((booking) => booking.status === status);
  };

  const startChat = async (booking) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId: booking.professionalId,
          bookingId: booking._id,
          initialMessage: `Hi! I'd like to discuss my booking for ${booking.serviceName} scheduled for ${booking.scheduledDate}.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push("/customer/chat");
      } else {
        console.error("Failed to start chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const openRatingModal = (booking) => {
    setSelectedBooking(booking);
    setRatingModalOpen(true);
  };

  const handleRatingSubmitted = () => {
    // Refresh bookings to update the UI
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Bookings
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your service appointments
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterBookings("pending").length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({filterBookings("confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({filterBookings("in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterBookings("completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({filterBookings("cancelled").length})
            </TabsTrigger>
          </TabsList>

          {[
            "all",
            "pending",
            "confirmed",
            "in-progress",
            "completed",
            "cancelled",
          ].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="grid gap-6">
                {filterBookings(status).length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No bookings found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {status === "all"
                          ? "You haven't made any bookings yet."
                          : `No ${status} bookings.`}
                      </p>
                      <Button asChild>
                        <a href="/services">Find Services</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filterBookings(status).map((booking) => (
                    <Card
                      key={booking._id}
                      className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(
                                  booking.professionalName ||
                                  booking.customerName ||
                                  "P"
                                ).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {booking.serviceName || booking.service}
                              </h3>
                              <p className="text-muted-foreground">
                                {booking.professionalName &&
                                  `Professional: ${booking.professionalName} • `}
                                Booking ID: {booking.bookingId}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(
                                    booking.scheduledDate || booking.date,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {booking.scheduledTime || booking.time}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {booking.address}
                                </div>
                              </div>
                              {(booking.description || booking.notes) && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {booking.description || booking.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-3">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Price
                              </p>
                              <p className="font-semibold text-lg">
                                ₹{booking.price || booking.estimatedPrice}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startChat(booking)}
                                title="Chat with Professional"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              {booking.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRatingModal(booking)}
                                  title="Rate Professional"
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Rating Modal */}
      {selectedBooking && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          booking={selectedBooking}
          userType="customer"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
