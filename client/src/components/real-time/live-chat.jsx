 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, Video, MoreHorizontal, Paperclip, Smile } from "lucide-react"























export function LiveChat({ chatId, currentUserId, otherUser }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderId: otherUser.id,
      senderName: otherUser.name,
      senderAvatar: otherUser.avatar,
      content:
        "Hi! I saw your booking request for plumbing repair. I'm available this afternoon if that works for you.",
      timestamp: new Date(Date.now() - 300000),
      type: "text",
      status: "read",
    },
    {
      id: "2",
      senderId: currentUserId,
      senderName: "You",
      content: "That sounds perfect! What time would work best?",
      timestamp: new Date(Date.now() - 240000),
      type: "text",
      status: "read",
    },
    {
      id: "3",
      senderId: otherUser.id,
      senderName: otherUser.name,
      senderAvatar: otherUser.avatar,
      content: "How about 2:00 PM? I can be there for about 2 hours to assess and fix the issue.",
      timestamp: new Date(Date.now() - 180000),
      type: "text",
      status: "read",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    _optionalChain([messagesEndRef, 'access', _ => _.current, 'optionalAccess', _2 => _2.scrollIntoView, 'call', _3 => _3({ behavior: "smooth" })])
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (Math.random() > 0.7) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      type: "text",
      status: "sent",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)

    // Simulate auto-reply
    setTimeout(() => {
      const autoReply = {
        id: (Date.now() + 1).toString(),
        senderId: otherUser.id,
        senderName: otherUser.name,
        senderAvatar: otherUser.avatar,
        content: "Sounds good! I'll see you at 2:00 PM. I'll bring all the necessary tools.",
        timestamp: new Date(),
        type: "text",
        status: "sent",
      }
      setMessages((prev) => [...prev, autoReply])
    }, 2000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return "✓✓"
      default:
        return ""
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "read":
        return "text-blue-500"
      case "delivered":
        return "text-gray-400"
      default:
        return "text-gray-300"
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser.name}</CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    otherUser.status === "online"
                      ? "bg-green-500"
                      : otherUser.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground capitalize">{otherUser.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${message.senderId === currentUserId ? "flex-row-reverse" : ""}`}
                >
                  {message.senderId !== currentUserId && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.senderId === currentUserId ? "bg-blue-500 text-white" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        message.senderId === currentUserId ? "text-blue-100" : "text-muted-foreground"
                      }`}
                    >
                      <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {message.senderId === currentUserId && (
                        <span className={getStatusColor(message.status)}>{getStatusIcon(message.status)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[70%]">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="pr-10"
              />
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
