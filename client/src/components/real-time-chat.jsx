 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, X, Phone, Video } from "lucide-react"





















export function RealTimeChat({ isOpen, onClose, professional }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    _optionalChain([messagesEndRef, 'access', _ => _.current, 'optionalAccess', _2 => _2.scrollIntoView, 'call', _3 => _3({ behavior: "smooth" })])
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate receiving messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: "1",
        senderId: professional.id,
        senderName: professional.name,
        content: `Hi! I'm ${professional.name}. How can I help you today?`,
        timestamp: new Date(),
        type: "text",
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, professional, messages.length])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      senderId: "user",
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate professional response
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        senderId: professional.id,
        senderName: professional.name,
        content: "Thanks for your message! I'll get back to you shortly with more details.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, response])
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 z-50">
      <Card className="h-full flex flex-col bg-white border-gray-200 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={professional.avatar || "/placeholder.svg"} alt={professional.name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(professional.status)}`}
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{professional.name}</CardTitle>
              <p className="text-xs text-blue-100 capitalize">{professional.status}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-blue-700">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-blue-700">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-blue-700" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    message.senderId === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.senderId === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
                  {professional.name} is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-white border-gray-300"
              />
              <Button onClick={sendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
