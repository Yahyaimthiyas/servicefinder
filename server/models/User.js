import { ObjectId } from "mongodb"

export class User {
  constructor(data) {
    this._id = data._id || new ObjectId()
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.type = data.type || "customer" // customer, professional, admin
    this.phone = data.phone
    this.address = data.address
    this.profileImage = data.profileImage
    this.isVerified = data.isVerified || false
    this.isActive = data.isActive || true
    this.rating = data.rating || 0
    this.totalReviews = data.totalReviews || 0
    this.joinedAt = data.joinedAt || new Date()
    this.lastLoginAt = data.lastLoginAt
    this.subscription = data.subscription || null
    this.preferences = data.preferences || {}

    // Common profile/location fields used across the app
    this.city = data.city
    this.state = data.state
    this.pincode = data.pincode
    this.businessName = data.businessName
    this.description = data.description
    this.serviceAreas = data.serviceAreas || []
    this.skills = data.skills || []

    // Professional specific fields
    if (this.type === "professional") {
      this.services = data.services || []
      this.experience = data.experience
      this.certifications = data.certifications || []
      this.portfolio = data.portfolio || []
      this.availability = data.availability || {}
      this.serviceArea = data.serviceArea || []
      this.pricing = data.pricing || {}
      this.businessInfo = data.businessInfo || {}
      
      // Multi-stage verification system
      this.verificationStatus = data.verificationStatus || "pending_documents" 
      // Statuses: pending_documents, pending_admin_review, verified, rejected, needs_more_info
      
      this.mobileVerified = data.mobileVerified || false
      this.documentsSubmitted = data.documentsSubmitted || false
      
      // Document verification
      this.verificationDocuments = data.verificationDocuments || {
        governmentId: null,        // Aadhaar/Passport
        professionalLicense: null, // License/Certificate
        businessRegistration: null, // Business docs
        portfolio: [],             // Work photos
        experienceCertificates: [] // Experience proof
      }
      
      this.verificationNotes = data.verificationNotes || ""
      this.verifiedAt = data.verifiedAt || null
      this.verifiedBy = data.verifiedBy || null
      this.rejectionReason = data.rejectionReason || ""
      
      // Professional access control
      this.canReceiveBookings = data.canReceiveBookings || false
      this.profileCompleteness = data.profileCompleteness || 0
      
      // Subscription management - all new professionals start with basic plan
      this.subscriptionPlan = data.subscriptionPlan || "basic"
      this.subscriptionStatus = data.subscriptionStatus || "active"
      this.subscriptionStartDate = data.subscriptionStartDate || new Date()
      this.subscriptionEndDate = data.subscriptionEndDate || null // null for free plan
    }
  }

  static async create(db, userData) {
    const user = new User(userData)
    const result = await db.collection("users").insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async findById(db, id) {
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
    return user ? new User(user) : null
  }

  static async findByEmail(db, email) {
    const user = await db.collection("users").findOne({ email })
    return user ? new User(user) : null
  }

  static async findProfessionals(db, filters = {}) {
    const query = {
      type: "professional",
      isActive: true,
      verificationStatus: { $in: ["verified", "approved"] }, // Support both statuses
      $or: [
        { canReceiveBookings: true },
        { isVerified: true },
      ],
    }

    if (filters.services) {
      query.services = { $in: filters.services }
    }

    // Location-based filtering: match on city/district and state/service areas
    if (filters.location || filters.state) {
      const locationConditions = []

      if (filters.location) {
        const loc = filters.location
        locationConditions.push(
          { city: loc },
          { "personalDetails.city": loc },
          { serviceArea: { $in: [loc] } },
          { serviceAreas: { $in: [loc] } },
          { "businessInfo.serviceAreas": { $in: [loc] } },
        )
      }

      if (filters.state) {
        const st = filters.state
        locationConditions.push(
          { state: st },
          { "personalDetails.state": st },
        )
      }

      if (locationConditions.length > 0) {
        query.$and = [...(query.$and || []), { $or: locationConditions }]
      }
    }

    if (filters.rating) {
      query.rating = { $gte: filters.rating }
    }

    // Allow admin to see all professionals regardless of verification
    if (filters.includeUnverified) {
      delete query.verificationStatus
    }

    const professionals = await db
      .collection("users")
      .find(query)
      .sort({ rating: -1, totalReviews: -1 })
      .limit(filters.limit || 20)
      .toArray()

    return professionals.map((p) => new User(p))
  }

  static async findPendingVerification(db) {
    const professionals = await db
      .collection("users")
      .find({ 
        type: "professional", 
        verificationStatus: "pending_admin_review",
        isActive: true,
        documentsSubmitted: true
      })
      .sort({ joinedAt: -1 })
      .toArray()

    return professionals.map((p) => new User(p))
  }

  static async findByVerificationStatus(db, status) {
    const professionals = await db
      .collection("users")
      .find({ 
        type: "professional", 
        verificationStatus: status,
        isActive: true 
      })
      .sort({ joinedAt: -1 })
      .toArray()

    return professionals.map((p) => new User(p))
  }

  async updateVerificationStatus(db, status, adminId, notes = "", rejectionReason = "") {
    const updateData = {
      verificationStatus: status,
      verificationNotes: notes,
      updatedAt: new Date()
    }

    if (status === "verified") {
      updateData.verifiedAt = new Date()
      updateData.verifiedBy = adminId
      updateData.isVerified = true
      updateData.canReceiveBookings = true
    } else if (status === "rejected") {
      updateData.rejectionReason = rejectionReason
      updateData.canReceiveBookings = false
    } else {
      updateData.canReceiveBookings = false
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: updateData })
    
    return result.modifiedCount > 0
  }

  async submitDocuments(db, documents) {
    const updateData = {
      verificationDocuments: documents,
      documentsSubmitted: true,
      verificationStatus: "pending_admin_review",
      updatedAt: new Date(),
      
      // Also update user fields directly for easier access
      name: documents.fullName || this.name,
      profession: documents.profession || this.profession,
      experience: documents.experience || this.experience,
      businessInfo: {
        ...this.businessInfo,
        businessName: documents.businessName,
        serviceAreas: documents.serviceAreas,
        workingHours: documents.workingHours
      },
      
      // Personal details
      personalDetails: {
        fullName: documents.fullName,
        dateOfBirth: documents.dateOfBirth,
        address: documents.address,
        city: documents.city,
        state: documents.state,
        pincode: documents.pincode
      },
      
      // Professional details
      professionalDetails: {
        profession: documents.profession,
        specialization: documents.specialization,
        experience: documents.experience,
        qualification: documents.qualification,
        businessName: documents.businessName
      },
      
      // Contact and additional info
      emergencyContact: documents.emergencyContact,
      references: documents.references,
      verificationSubmittedAt: new Date()
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: updateData })
    
    return result.modifiedCount > 0
  }

  async update(db, updateData) {
    const result = await db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { ...updateData, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async delete(db) {
    const result = await db.collection("users").deleteOne({ _id: this._id })
    return result.deletedCount > 0
  }
}
