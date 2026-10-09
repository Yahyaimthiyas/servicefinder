import { ObjectId } from "mongodb"

export class Review {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.bookingId = data.bookingId
    this.customerId = data.customerId
    this.professionalId = data.professionalId
    this.rating = data.rating
    this.comment = data.comment
    this.images = data.images || []
    this.isVerified = data.isVerified || false
    this.isPublic = data.isPublic || true
    this.helpfulCount = data.helpfulCount || 0
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static async create(db, reviewData) {
    const review = new Review(reviewData)
    const result = await db.collection("reviews").insertOne(review)

    // Update professional's rating
    await this.updateProfessionalRating(db, reviewData.professionalId)

    return { ...review, _id: result.insertedId }
  }

  static async findByProfessional(db, professionalId, limit = 10) {
    const reviews = await db
      .collection("reviews")
      .find({ professionalId: new ObjectId(professionalId), isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return reviews.map((r) => new Review(r))
  }

  static async updateProfessionalRating(db, professionalId) {
    const pipeline = [
      { $match: { professionalId: new ObjectId(professionalId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]

    const result = await db.collection("reviews").aggregate(pipeline).toArray()

    if (result.length > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(professionalId) },
        {
          $set: {
            rating: Math.round(result[0].averageRating * 10) / 10,
            totalReviews: result[0].totalReviews,
            updatedAt: new Date(),
          },
        },
      )
    }
  }
}
