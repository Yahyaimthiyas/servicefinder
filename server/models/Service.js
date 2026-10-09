import { ObjectId } from "mongodb"

export class Service {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.name = data.name
    this.category = data.category
    this.description = data.description
    this.basePrice = data.basePrice
    this.duration = data.duration
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static async create(db, serviceData) {
    const service = new Service(serviceData)
    const result = await db.collection("services").insertOne(service)
    return { ...service, _id: result.insertedId }
  }

  static async findAll(db, filters = {}) {
    const query = { isActive: true }

    if (filters.category && filters.category !== "All Services") {
      query.category = filters.category
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ]
    }

    const services = await db.collection("services").find(query).sort({ name: 1 }).toArray()

    return services.map((s) => new Service(s))
  }

  static async findById(db, id) {
    const service = await db.collection("services").findOne({ _id: new ObjectId(id) })
    return service ? new Service(service) : null
  }

  static async findByCategory(db, category) {
    const query = { isActive: true }
    if (category && category !== "All Services") {
      query.category = category
    }
    
    const services = await db.collection("services").find(query).sort({ name: 1 }).toArray()
    return services.map((s) => new Service(s))
  }

  async update(db, updateData) {
    const result = await db
      .collection("services")
      .updateOne({ _id: this._id }, { $set: { ...updateData, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async delete(db) {
    const result = await db.collection("services").deleteOne({ _id: this._id })
    return result.deletedCount > 0
  }
}
