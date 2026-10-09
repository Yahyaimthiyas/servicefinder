import { NotificationCenter } from "@/components/real-time/notifications"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <NotificationCenter />
        </div>
      </div>
    </div>
  )
}
