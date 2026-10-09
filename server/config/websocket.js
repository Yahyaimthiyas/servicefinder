// Simple WebSocket implementation for real-time chat
// This is a basic implementation - in production, you'd use Socket.io or similar

class ChatWebSocket {
  constructor() {
    this.connections = new Map() // userId -> WebSocket connection
    this.rooms = new Map() // conversationId -> Set of userIds
  }

  addConnection(userId, ws) {
    this.connections.set(userId, ws)
    console.log(`User ${userId} connected to chat`)
    
    ws.on('close', () => {
      this.removeConnection(userId)
    })
  }

  removeConnection(userId) {
    this.connections.delete(userId)
    // Remove user from all rooms
    for (const [conversationId, users] of this.rooms.entries()) {
      users.delete(userId)
      if (users.size === 0) {
        this.rooms.delete(conversationId)
      }
    }
    console.log(`User ${userId} disconnected from chat`)
  }

  joinRoom(userId, conversationId) {
    if (!this.rooms.has(conversationId)) {
      this.rooms.set(conversationId, new Set())
    }
    this.rooms.get(conversationId).add(userId)
    console.log(`User ${userId} joined conversation ${conversationId}`)
  }

  leaveRoom(userId, conversationId) {
    if (this.rooms.has(conversationId)) {
      this.rooms.get(conversationId).delete(userId)
      if (this.rooms.get(conversationId).size === 0) {
        this.rooms.delete(conversationId)
      }
    }
    console.log(`User ${userId} left conversation ${conversationId}`)
  }

  sendToUser(userId, message) {
    const connection = this.connections.get(userId)
    if (connection && connection.readyState === 1) { // WebSocket.OPEN
      connection.send(JSON.stringify(message))
      return true
    }
    return false
  }

  sendToRoom(conversationId, message, excludeUserId = null) {
    const room = this.rooms.get(conversationId)
    if (!room) return

    let sentCount = 0
    for (const userId of room) {
      if (userId !== excludeUserId) {
        if (this.sendToUser(userId, message)) {
          sentCount++
        }
      }
    }
    return sentCount
  }

  broadcastNewMessage(conversationId, message, senderId) {
    const notification = {
      type: 'new_message',
      conversationId,
      message,
      timestamp: new Date().toISOString()
    }

    return this.sendToRoom(conversationId, notification, senderId)
  }

  broadcastTyping(conversationId, userId, isTyping) {
    const notification = {
      type: 'typing',
      conversationId,
      userId,
      isTyping,
      timestamp: new Date().toISOString()
    }

    return this.sendToRoom(conversationId, notification, userId)
  }

  broadcastUserOnline(userId, isOnline) {
    const notification = {
      type: 'user_status',
      userId,
      isOnline,
      timestamp: new Date().toISOString()
    }

    // Send to all connected users
    let sentCount = 0
    for (const [connectedUserId, connection] of this.connections.entries()) {
      if (connectedUserId !== userId && connection.readyState === 1) {
        connection.send(JSON.stringify(notification))
        sentCount++
      }
    }
    return sentCount
  }

  getOnlineUsers() {
    return Array.from(this.connections.keys())
  }

  getRoomUsers(conversationId) {
    const room = this.rooms.get(conversationId)
    return room ? Array.from(room) : []
  }

  isUserOnline(userId) {
    return this.connections.has(userId)
  }
}

// Export singleton instance
export const chatWebSocket = new ChatWebSocket()

import { WebSocketServer } from "ws"

// Helper function to initialize WebSocket server (for Next.js API routes)
export function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, request) => {
    let userId = null

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        
        switch (message.type) {
          case 'auth':
            userId = message.userId
            chatWebSocket.addConnection(userId, ws)
            chatWebSocket.broadcastUserOnline(userId, true)
            ws.send(JSON.stringify({ type: 'auth_success', userId }))
            break

          case 'join_room':
            if (userId) {
              chatWebSocket.joinRoom(userId, message.conversationId)
            }
            break

          case 'leave_room':
            if (userId) {
              chatWebSocket.leaveRoom(userId, message.conversationId)
            }
            break

          case 'typing':
            if (userId) {
              chatWebSocket.broadcastTyping(message.conversationId, userId, message.isTyping)
            }
            break

          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      if (userId) {
        chatWebSocket.broadcastUserOnline(userId, false)
        chatWebSocket.removeConnection(userId)
      }
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })

  console.log('WebSocket server initialized')
  return wss
}
