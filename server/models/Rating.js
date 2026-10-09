import { ObjectId } from "mongodb"

export class Rating {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.bookingId = data.bookingId
    this.customerId = data.customerId
    this.professionalId = data.professionalId
    this.raterType = data.raterType // "customer" or "professional"
    this.rateeType = data.rateeType // "professional" or "customer"
    this.rating = data.rating // 1-5 stars
    this.review = data.review || ""
    this.serviceQuality = data.serviceQuality || null // 1-5 (for professional rating)
    this.communication = data.communication || null // 1-5
    this.punctuality = data.punctuality || null // 1-5 (for professional rating)
    this.professionalism = data.professionalism || null // 1-5
    this.paymentOnTime = data.paymentOnTime || null // 1-5 (for customer rating)
    this.respectful = data.respectful || null // 1-5
    this.wouldRecommend = data.wouldRecommend || null // boolean
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static async create(db, ratingData) {
    // Ensure proper ObjectId conversion
    const processedData = {
      ...ratingData,
      bookingId: typeof ratingData.bookingId === 'string' ? new ObjectId(ratingData.bookingId) : ratingData.bookingId,
      customerId: typeof ratingData.customerId === 'string' ? new ObjectId(ratingData.customerId) : ratingData.customerId,
      professionalId: typeof ratingData.professionalId === 'string' ? new ObjectId(ratingData.professionalId) : ratingData.professionalId
    }
    
    const rating = new Rating(processedData)
    const result = await db.collection("ratings").insertOne(rating)
    return { ...rating, _id: result.insertedId }
  }

  static async findByBooking(db, bookingId) {
    const bookingObjectId = typeof bookingId === 'string' ? new ObjectId(bookingId) : bookingId
    const ratings = await db.collection("ratings").find({ bookingId: bookingObjectId }).toArray()
    return ratings.map(rating => new Rating(rating))
  }

  static async findByUser(db, userId, userType) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    const field = userType === "customer" ? "customerId" : "professionalId"
    
    const ratings = await db.collection("ratings")
      .aggregate([
        {
          $match: { [field]: userObjectId }
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
            bookingId: 1,
            customerId: 1,
            professionalId: 1,
            raterType: 1,
            rateeType: 1,
            rating: 1,
            review: 1,
            serviceQuality: 1,
            communication: 1,
            punctuality: 1,
            professionalism: 1,
            paymentOnTime: 1,
            respectful: 1,
            wouldRecommend: 1,
            createdAt: 1,
            otherUserName: { $arrayElemAt: ["$otherUser.name", 0] },
            otherUserAvatar: { $arrayElemAt: ["$otherUser.profileImage", 0] },
            serviceName: { $arrayElemAt: ["$booking.serviceName", 0] },
            serviceDate: { $arrayElemAt: ["$booking.scheduledDate", 0] }
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return ratings.map(rating => new Rating(rating))
  }

  static async getAverageRating(db, userId, userType) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    const field = userType === "customer" ? "customerId" : "professionalId"
    
    const result = await db.collection("ratings").aggregate([
      {
        $match: { 
          [field]: userObjectId,
          rateeType: userType
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          averageServiceQuality: { $avg: "$serviceQuality" },
          averageCommunication: { $avg: "$communication" },
          averagePunctuality: { $avg: "$punctuality" },
          averageProfessionalism: { $avg: "$professionalism" },
          averagePaymentOnTime: { $avg: "$paymentOnTime" },
          averageRespectful: { $avg: "$respectful" }
        }
      }
    ]).toArray()

    return result.length > 0 ? result[0] : {
      averageRating: 0,
      totalRatings: 0,
      averageServiceQuality: 0,
      averageCommunication: 0,
      averagePunctuality: 0,
      averageProfessionalism: 0,
      averagePaymentOnTime: 0,
      averageRespectful: 0
    }
  }

  static async hasUserRated(db, bookingId, userId, userType) {
    const bookingObjectId = typeof bookingId === 'string' ? new ObjectId(bookingId) : bookingId
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    
    const rating = await db.collection("ratings").findOne({
      bookingId: bookingObjectId,
      raterType: userType,
      [userType === "customer" ? "customerId" : "professionalId"]: userObjectId
    })
    
    return rating !== null
  }

  async update(db, updateData) {
    const result = await db.collection("ratings").updateOne(
      { _id: this._id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )
    return result.modifiedCount > 0
  }
}
