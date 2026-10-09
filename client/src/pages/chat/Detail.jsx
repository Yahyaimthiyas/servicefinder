import { LiveChat } from "@/components/real-time/live-chat"

export default function ChatPage({ params }) {
  // Mock data - in real app, fetch from API
  const otherUser = {
    id: "prof_123",
    name: "John Smith",
    avatar: "/professional-teamwork.png",
    status: "online" ,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <LiveChat chatId={params.id} currentUserId="user_456" otherUser={otherUser} />
        </div>
      </div>
    </div>
  )
}
