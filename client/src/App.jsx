import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/hooks/use-auth"
import { ToastProvider } from "@/components/toast-provider"
import { ErrorBoundary } from "@/components/error-boundary"

// Lazy load page components for better client-side performance
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Services = lazy(() => import("./pages/Services"))
const Settings = lazy(() => import("./pages/Settings"))
const Subscription = lazy(() => import("./pages/Subscription"))
const Notifications = lazy(() => import("./pages/Notifications"))

// Customer pages
const CustomerDashboard = lazy(() => import("./pages/customer/Dashboard"))
const CustomerBookings = lazy(() => import("./pages/customer/Bookings"))
const CustomerProfile = lazy(() => import("./pages/customer/Profile"))
const CustomerFavorites = lazy(() => import("./pages/customer/Favorites"))
const CustomerChat = lazy(() => import("./pages/customer/Chat"))

// Professional pages
const ProfessionalDashboard = lazy(() => import("./pages/professional/Dashboard"))
const ProfessionalVerification = lazy(() => import("./pages/professional/Verification"))
const ProfessionalChat = lazy(() => import("./pages/professional/Chat"))
const ProfessionalProfile = lazy(() => import("./pages/professional/ProfileView"))

// Chat and Tracking pages
const ChatDetail = lazy(() => import("./pages/chat/Detail"))
const BookingTracking = lazy(() => import("./pages/tracking/Detail"))

const QuickLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<QuickLoader />}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Navigation />
                <main className="flex-grow">
                  <Suspense fallback={<QuickLoader />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/notifications" element={<Notifications />} />

                      {/* Customer routes */}
                      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                      <Route path="/customer/bookings" element={<CustomerBookings />} />
                      <Route path="/customer/profile" element={<CustomerProfile />} />
                      <Route path="/customer/favorites" element={<CustomerFavorites />} />
                      <Route path="/customer/chat" element={<CustomerChat />} />

                      {/* Professional routes */}
                      <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
                      <Route path="/professional/verification" element={<ProfessionalVerification />} />
                      <Route path="/professional/chat" element={<ProfessionalChat />} />
                      <Route path="/professionals/:id" element={<ProfessionalProfile />} />

                      {/* Detail routes */}
                      <Route path="/chat/:id" element={<ChatDetail />} />
                      <Route path="/tracking/:bookingId" element={<BookingTracking />} />

                      {/* Fallback redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  )
}
