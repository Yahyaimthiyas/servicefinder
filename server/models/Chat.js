import { ObjectId } from "mongodb"

export class Chat {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.conversationId = data.conversationId || this.generateConversationId()
    this.customerId = data.customerId
    this.professionalId = data.professionalId
    this.bookingId = data.bookingId || null // Optional: link to specific booking
    this.participants = data.participants || [data.customerId, data.professionalId]
    this.lastMessage = data.lastMessage || null
    this.lastMessageTime = data.lastMessageTime || new Date()
    this.unreadCount = data.unreadCount || { customer: 0, professional: 0 }
    this.status = data.status || "active" // active, archived, blocked
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  generateConversationId() {
    return "conv_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9)
  }

  static async create(db, chatData) {
    // Ensure proper ObjectId conversion
    const processedData = {
      ...chatData,
      customerId: typeof chatData.customerId === 'string' ? new ObjectId(chatData.customerId) : chatData.customerId,
      professionalId: typeof chatData.professionalId === 'string' ? new ObjectId(chatData.professionalId) : chatData.professionalId,
      bookingId: chatData.bookingId ? (typeof chatData.bookingId === 'string' ? new ObjectId(chatData.bookingId) : chatData.bookingId) : null
    }
    
    const chat = new Chat(processedData)
    const result = await db.collection("chats").insertOne(chat)
    return { ...chat, _id: result.insertedId }
  }

  static async findByParticipants(db, customerId, professionalId) {
    const customerObjectId = typeof customerId === 'string' ? new ObjectId(customerId) : customerId
    const professionalObjectId = typeof professionalId === 'string' ? new ObjectId(professionalId) : professionalId
    
    const chat = await db.collection("chats").findOne({
      customerId: customerObjectId,
      professionalId: professionalObjectId,
      status: "active"
    })
    
    return chat ? new Chat(chat) : null
  }

  static async findByUser(db, userId, userType) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    const field = userType === "customer" ? "customerId" : "professionalId"
    
    const chats = await db.collection("chats")
      .aggregate([
        {
          $match: {
            [field]: userObjectId,
            status: "active"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: userType === "customer" ? "professionalId" : "customerId",
            foreignField: "_id",
            as: "otherUser"
          }
        },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking"
          }
        },
        {
          $project: {
            _id: 1,
            conversationId: 1,
            customerId: 1,
            professionalId: 1,
            bookingId: 1,
            lastMessage: 1,
            lastMessageTime: 1,
            unreadCount: 1,
            status: 1,
            createdAt: 1,
            otherUserName: { $arrayElemAt: ["$otherUser.name", 0] },
            otherUserAvatar: { $arrayElemAt: ["$otherUser.profileImage", 0] },
            otherUserPhone: { $arrayElemAt: ["$otherUser.phone", 0] },
            serviceType: { $arrayElemAt: ["$booking.serviceName", 0] }
          }
        },
        { $sort: { lastMessageTime: -1 } }
      ])
      .toArray()

    return chats.map(chat => new Chat(chat))
  }

  static async findById(db, chatId) {
    const chat = await db.collection("chats").findOne({ _id: new ObjectId(chatId) })
    return chat ? new Chat(chat) : null
  }

  static async findByConversationId(db, conversationId) {
    const chat = await db.collection("chats").findOne({ conversationId })
    return chat ? new Chat(chat) : null
  }

  async updateLastMessage(db, message, messageTime = new Date()) {
    const result = await db.collection("chats").updateOne(
      { _id: this._id },
      {
        $set: {
          lastMessage: message,
          lastMessageTime: messageTime,
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  async incrementUnreadCount(db, userType) {
    const field = userType === "customer" ? "unreadCount.customer" : "unreadCount.professional"
    const result = await db.collection("chats").updateOne(
      { _id: this._id },
      {
        $inc: { [field]: 1 },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  async markAsRead(db, userType) {
    const field = userType === "customer" ? "unreadCount.customer" : "unreadCount.professional"
    const result = await db.collection("chats").updateOne(
      { _id: this._id },
      {
        $set: {
          [field]: 0,
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }
}

export class Message {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.conversationId = data.conversationId
    this.senderId = data.senderId
    this.senderType = data.senderType // "customer" or "professional"
    this.message = data.message
    this.messageType = data.messageType || "text" // text, image, file, location, booking_update
    this.attachments = data.attachments || []
    this.metadata = data.metadata || {} // For additional data like file info, location coords, etc.
    this.readBy = data.readBy || []
    this.deliveredAt = data.deliveredAt || null
    this.readAt = data.readAt || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static async create(db, messageData) {
    // Ensure proper ObjectId conversion
    const processedData = {
      ...messageData,
      senderId: typeof messageData.senderId === 'string' ? new ObjectId(messageData.senderId) : messageData.senderId
    }
    
    const message = new Message(processedData)
    const result = await db.collection("messages").insertOne(message)
    return { ...message, _id: result.insertedId }
  }

  static async findByConversation(db, conversationId, limit = 50, offset = 0) {
    const messages = await db.collection("messages")
      .aggregate([
        {
          $match: { conversationId }
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "sender"
          }
        },
        {
          $project: {
            _id: 1,
            conversationId: 1,
            senderId: 1,
            senderType: 1,
            message: 1,
            messageType: 1,
            attachments: 1,
            metadata: 1,
            readBy: 1,
            deliveredAt: 1,
            readAt: 1,
            createdAt: 1,
            senderName: { $arrayElemAt: ["$sender.name", 0] },
            senderAvatar: { $arrayElemAt: ["$sender.profileImage", 0] }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: limit }
      ])
      .toArray()

    return messages.reverse() // Return in chronological order
  }

  async markAsRead(db, userId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    const result = await db.collection("messages").updateOne(
      { _id: this._id },
      {
        $addToSet: { readBy: userObjectId },
        $set: {
          readAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }

  async markAsDelivered(db) {
    const result = await db.collection("messages").updateOne(
      { _id: this._id },
      {
        $set: {
          deliveredAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }
}
