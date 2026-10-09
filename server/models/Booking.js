import { ObjectId } from "mongodb"

export class Booking {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.bookingId = data.bookingId || this.generateBookingId()
    this.customerId = data.customerId
    this.professionalId = data.professionalId
    this.serviceId = data.serviceId
    this.serviceName = data.serviceName
    this.description = data.description
    this.scheduledDate = data.scheduledDate
    this.scheduledTime = data.scheduledTime
    this.duration = data.duration
    this.address = data.address
    this.coordinates = data.coordinates
    this.status = data.status || "pending" // pending, confirmed, in-progress, completed, cancelled
    this.price = data.price
    this.paymentStatus = data.paymentStatus || "pending"
    this.paymentMethod = data.paymentMethod
    this.notes = data.notes
    this.requirements = data.requirements || []
    this.images = data.images || []
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.completedAt = data.completedAt
    this.cancelledAt = data.cancelledAt
    this.cancellationReason = data.cancellationReason
  }

  generateBookingId() {
    return "BK" + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase()
  }

  static async create(db, bookingData) {
    // Ensure proper ObjectId conversion for customer and professional IDs
    const processedData = {
      ...bookingData,
      customerId: typeof bookingData.customerId === 'string' ? new ObjectId(bookingData.customerId) : bookingData.customerId,
      professionalId: typeof bookingData.professionalId === 'string' ? new ObjectId(bookingData.professionalId) : bookingData.professionalId
    }
    
    const booking = new Booking(processedData)
    const result = await db.collection("bookings").insertOne(booking)
    return { ...booking, _id: result.insertedId }
  }

  static async findById(db, id) {
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) })
    return booking ? new Booking(booking) : null
  }

  static async findByBookingId(db, bookingId) {
    const booking = await db.collection("bookings").findOne({ bookingId })
    return booking ? new Booking(booking) : null
  }

  static async findByUser(db, userId, userType = "customer") {
    const field = userType === "customer" ? "customerId" : "professionalId"
    
    // Handle both string and ObjectId inputs
    let userObjectId
    try {
      userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    } catch (error) {
      console.error("Invalid userId format:", userId)
      return []
    }
    
    const bookings = await db
      .collection("bookings")
      .find({ [field]: userObjectId })
      .sort({ createdAt: -1 })
      .toArray()

    return bookings.map((b) => new Booking(b))
  }

  static async getStats(db, filters = {}) {
    const pipeline = [
      { $match: filters },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$price", 0] } },
        },
      },
    ]

    const result = await db.collection("bookings").aggregate(pipeline).toArray()
    return (
      result[0] || {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
      }
    )
  }

  async update(db, updateData) {
    const result = await db
      .collection("bookings")
      .updateOne({ _id: this._id }, { $set: { ...updateData, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async updateStatus(db, status, additionalData = {}) {
    const updateData = { status, ...additionalData }

    if (status === "completed") {
      updateData.completedAt = new Date()
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date()
    }

    return this.update(db, updateData)
  }
}
