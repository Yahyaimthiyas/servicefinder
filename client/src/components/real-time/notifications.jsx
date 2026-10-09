 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, X, Calendar, MessageCircle, DollarSign, Star, AlertTriangle } from "lucide-react"












export function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/notifications?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error("Failed to load notifications")
        setLoading(false)
        return
      }

      const data = await response.json()
      const items = (data.notifications || []).map((n) => ({
        id: _optionalChain([n, 'access', _ => _._id, 'optionalAccess', _2 => _2.toString, 'call', _3 => _3()]) || n.id,
        type: (n.type || "system") ,
        title: n.title || "Notification",
        message: n.message || "",
        timestamp: new Date(n.createdAt || Date.now()),
        read: !!n.read,
        priority: (n.priority || "medium") ,
        actionUrl: n.actionUrl,
      })) 

      setNotifications(items)
      setLoading(false)
    } catch (error) {
      console.error("Notifications fetch error:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // poll every 15s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length)
  }, [notifications])

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) return

      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: [id], markAsRead: true }),
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id)
    if (ids.length === 0) return

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) return

      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const deleteNotification = (id) => {
    // For now, just remove from UI; server keeps history
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return Calendar
      case "message":
        return MessageCircle
      case "payment":
        return DollarSign
      case "review":
        return Star
      case "system":
        return AlertTriangle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "booking":
        return "text-blue-500"
      case "message":
        return "text-green-500"
      case "payment":
        return "text-yellow-500"
      case "review":
        return "text-purple-500"
      case "system":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Low</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                      !notification.read ? "bg-blue-500/5 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.timestamp.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
