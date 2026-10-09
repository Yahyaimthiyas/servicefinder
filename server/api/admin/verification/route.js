import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"

// Normalize verification service category into a canonical service name
function normalizeServiceCategory(category) {
  if (!category) return null
  const value = String(category).toLowerCase()
  switch (value) {
    case "plumbing":
      return "plumber"
    case "electrical":
      return "electrician"
    case "cleaning":
      return "cleaner"
    case "hvac":
      return "ac_technician"
    case "landscaping":
      return "gardener"
    case "painting":
      return "painter"
    case "carpentry":
      return "carpenter"
    default:
      return value
  }
}

// Middleware to verify admin access
async function verifyAdmin(request) {
  try {
    console.log(" Verifying admin access...")
    
    const authHeader = request.headers.get("authorization")
    console.log(" Auth header:", authHeader ? "Present" : "Missing")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production")
    console.log(" Token decoded for user:", decoded.userId)
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)
    
    console.log(" User found:", user ? `${user.name} (${user.type})` : "Not found")
    
    if (!user || user.type !== "admin") {
      return { error: "Admin access required", status: 403 }
    }

    console.log(" Admin access verified")
    return { user, db }
  } catch (error) {
    console.error(" Admin verification error:", error.message)
    return { error: "Invalid token: " + error.message, status: 401 }
  }
}

// GET - Get pending verification requests with full details
export async function GET(request) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck

    console.log(" Fetching verification requests...")

    // Get professionals pending verification with their submitted documents
    const pendingProfessionals = await db.collection("users").aggregate([
      {
        $match: {
          type: "professional",
          verificationStatus: { $in: ["pending_documents", "pending_admin_review"] }
        }
      },
      {
        $lookup: {
          from: "verification_documents",
          localField: "_id",
          foreignField: "professionalId",
          as: "submittedDocuments"
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()

    console.log(` Found ${pendingProfessionals.length} pending verifications`)

    // Format the response with complete information
    const formattedRequests = pendingProfessionals.map(prof => {
      console.log(`📋 Processing professional: ${prof.name}`)
      console.log(`📄 Verification documents:`, prof.verificationDocuments)
      
      // Extract data from verificationDocuments if available
      const vDocs = prof.verificationDocuments || {}
      const personalDetails = prof.personalDetails || {}
      const professionalDetails = prof.professionalDetails || {}
      
      return {
        _id: prof._id.toString(),
        professionalId: prof._id.toString(),
        name: prof.name,
        email: prof.email,
        phone: prof.phone,
        profession: vDocs.profession || professionalDetails.profession || prof.profession || "Not specified",
        experience: vDocs.experience || professionalDetails.experience || prof.experience || "Not specified",
        location: `${vDocs.city || personalDetails.city || prof.city || "Unknown"}, ${vDocs.state || personalDetails.state || prof.state || "Unknown"}`,
        submittedAt: prof.verificationSubmittedAt || prof.updatedAt || prof.createdAt || new Date(),
        status: prof.verificationStatus,
        joinedAt: prof.createdAt,
        updatedAt: prof.updatedAt,
        verificationSubmittedAt: prof.verificationSubmittedAt,
        documentsSubmitted: prof.documentsSubmitted,
        mobileVerified: prof.mobileVerified,
        
        // Include the full verificationDocuments object
        verificationDocuments: prof.verificationDocuments,
        personalDetails: prof.personalDetails,
        professionalDetails: prof.professionalDetails,
        businessInfo: prof.businessInfo,
        emergencyContact: prof.emergencyContact,
        references: prof.references,
        
        documents: prof.submittedDocuments[0] || {},
        personalInfo: {
          fullName: vDocs.fullName || vDocs.personalInfo?.fullName || personalDetails.fullName || prof.name,
          dateOfBirth: vDocs.dateOfBirth || vDocs.personalInfo?.dateOfBirth || personalDetails.dateOfBirth || "Not provided",
          address: vDocs.address || vDocs.personalInfo?.address || personalDetails.address || "Not provided",
          city: vDocs.city || vDocs.personalInfo?.city || personalDetails.city || "Not provided",
          state: vDocs.state || vDocs.personalInfo?.state || personalDetails.state || "Not provided",
          pincode: vDocs.pincode || vDocs.personalInfo?.pincode || personalDetails.pincode || "Not provided"
        },
        professionalInfo: {
          profession: vDocs.profession || vDocs.professionalInfo?.profession || professionalDetails.profession || prof.profession || "Not specified",
          specialization: vDocs.specialization || vDocs.professionalInfo?.specialization || professionalDetails.specialization || "Not specified",
          experience: vDocs.experience || vDocs.professionalInfo?.experience || professionalDetails.experience || prof.experience || "Not specified",
          qualification: vDocs.qualification || vDocs.professionalInfo?.qualification || professionalDetails.qualification || "Not specified",
          businessName: vDocs.businessName || vDocs.professionalInfo?.businessName || professionalDetails.businessName || prof.businessInfo?.businessName || ""
        },
        additionalInfo: {
          workingHours: vDocs.workingHours || vDocs.additionalInfo?.workingHours || prof.businessInfo?.workingHours || "Not specified",
          serviceAreas: vDocs.serviceAreas || vDocs.additionalInfo?.serviceAreas || prof.businessInfo?.serviceAreas || "Not specified",
          emergencyContact: vDocs.emergencyContact || vDocs.additionalInfo?.emergencyContact || prof.emergencyContact || prof.phone,
          references: vDocs.references || vDocs.additionalInfo?.references || prof.references || ""
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      verificationRequests: formattedRequests,
      count: formattedRequests.length
    })

  } catch (error) {
    console.error(" Get verification requests error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch verification requests",
      details: error.message
    }, { status: 500 })
  }
}

// POST - Approve or reject professional verification
export async function POST(request) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { user: admin, db } = adminCheck
    const { professionalId, action, notes, rejectionReason } = await request.json()

    console.log(` Processing verification: ${action} for professional ${professionalId}`)

    if (!professionalId || !action) {
      return NextResponse.json({ 
        error: "Professional ID and action are required" 
      }, { status: 400 })
    }

    if (!["approve", "reject", "request_more_info"].includes(action)) {
      return NextResponse.json({ 
        error: "Action must be 'approve', 'reject', or 'request_more_info'" 
      }, { status: 400 })
    }

    // Determine new status based on action
    let newStatus
    switch (action) {
      case "approve":
        newStatus = "verified"
        break
      case "reject":
        newStatus = "rejected"
        break
      case "request_more_info":
        newStatus = "needs_more_info"
        break
    }

    // Update professional verification status
    const updateData = {
      verificationStatus: newStatus,
      verificationNotes: notes || "",
      rejectionReason: rejectionReason || "",
      verifiedAt: new Date(),
      verifiedBy: admin._id.toString(),
      // If approved, set additional fields
      ...(action === "approve" && {
        canReceiveBookings: true,
        documentsSubmitted: true,
        mobileVerified: true
      })
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(professionalId), type: "professional" },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: "Professional not found" 
      }, { status: 404 })
    }

    console.log(` Professional ${action}d successfully`)

    // If approved, sync core profile fields from the latest verification submission
    if (action === "approve") {
      try {
        const verification = await db.collection("professional_verifications")
          .findOne(
            { submittedBy: professionalId },
            { sort: { submittedAt: -1 } }
          )

        if (verification) {
          const v = verification
          const normalizedService = normalizeServiceCategory(
            v.serviceCategory || v.profession
          )

          const profileUpdate = {}

          if (v.businessName) profileUpdate.businessName = v.businessName
          if (v.description) profileUpdate.description = v.description
          if (v.state) profileUpdate.state = v.state
          if (v.city) profileUpdate.city = v.city

          if (Array.isArray(v.serviceAreas) && v.serviceAreas.length) {
            profileUpdate.serviceArea = v.serviceAreas
            profileUpdate.serviceAreas = v.serviceAreas
          } else if (v.city) {
            profileUpdate.serviceArea = [v.city]
            profileUpdate.serviceAreas = [v.city]
          }

          if (typeof v.yearsExperience === "number" && !Number.isNaN(v.yearsExperience)) {
            profileUpdate.yearsExperience = v.yearsExperience
            profileUpdate.experience = `${v.yearsExperience} years`
          }

          if (v.pricing && Object.keys(v.pricing || {}).length > 0) {
            profileUpdate.pricing = v.pricing
          }

          if (normalizedService) {
            profileUpdate.profession = normalizedService
            profileUpdate.services = [normalizedService]
          }

          if (verification.documents?.profilePhoto) {
            profileUpdate.profileImage = verification.documents.profilePhoto
          }

          if (v.workingHours) {
            profileUpdate.workingHours = v.workingHours
          }

          if (Object.keys(profileUpdate).length > 0) {
            await db.collection("users").updateOne(
              { _id: new ObjectId(professionalId), type: "professional" },
              { $set: profileUpdate }
            )
          }
        }
      } catch (syncError) {
        console.error(" Failed to sync verification data to user profile:", syncError)
      }
    }

    // Get updated professional data
    const updatedProfessional = await db.collection("users").findOne({
      _id: new ObjectId(professionalId)
    })

    return NextResponse.json({ 
      success: true, 
      message: `Professional ${action}d successfully`,
      action,
      professionalId,
      newStatus,
      professional: {
        _id: updatedProfessional._id,
        name: updatedProfessional.name,
        email: updatedProfessional.email,
        verificationStatus: updatedProfessional.verificationStatus,
        verifiedAt: updatedProfessional.verifiedAt
      }
    })

  } catch (error) {
    console.error(" Verification action error:", error)
    return NextResponse.json({ 
      error: "Failed to process verification",
      details: error.message
    }, { status: 500 })
  }
}
