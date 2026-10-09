import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../../config/mongodb.js"
import { User } from "../../../../models/User.js"

// Middleware to verify admin access
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production")
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)
    
    if (!user || user.type !== "admin") {
      return { error: "Admin access required", status: 403 }
    }

    return { user, db }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// GET - Get detailed verification requests with all submitted data
export async function GET(request) {
  try {
    console.log("🔍 Fetching detailed verification requests...")
    
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck

    // Get detailed verification data from professional_verifications collection
    const detailedVerifications = await db.collection("professional_verifications")
      .find({ verificationStatus: { $in: ["pending_admin_review", "approved", "rejected"] } })
      .sort({ submittedAt: -1 })
      .toArray()

    console.log(`📋 Found ${detailedVerifications.length} detailed verification requests`)

    // Also get basic user data and merge
    const userIds = detailedVerifications.map(v => v.submittedBy)
    const users = await db.collection("users")
      .find({ 
        _id: { $in: userIds.map(id => ({ $oid: id })) },
        type: "professional" 
      })
      .toArray()

    // Create a map of user data
    const userMap = {}
    users.forEach(user => {
      userMap[user._id.toString()] = user
    })

    // Merge verification data with user data
    const mergedRequests = detailedVerifications.map(verification => {
      const user = userMap[verification.submittedBy]
      
      return {
        _id: verification._id.toString(),
        professionalId: verification.submittedBy,
        
        // Personal Information (from verification form)
        name: verification.fullName || user?.name || 'Unknown',
        fullName: verification.fullName,
        email: verification.email || user?.email,
        phone: verification.phone || user?.phone,
        dateOfBirth: verification.dateOfBirth,
        address: verification.address,
        city: verification.city,
        state: verification.state,
        pincode: verification.pincode,
        
        // Professional Information
        businessName: verification.businessName,
        serviceCategory: verification.serviceCategory,
        profession: verification.serviceCategory || user?.profession || 'Not specified',
        specializations: verification.specializations || [],
        yearsExperience: verification.yearsExperience,
        experience: `${verification.yearsExperience || 0} years`,
        description: verification.description,
        
        // Pricing Information
        pricing: verification.pricing || {},
        
        // Emergency Contact
        emergencyContact: verification.emergencyContact,
        emergencyPhone: verification.emergencyPhone,
        workingHours: verification.workingHours,
        serviceAreas: verification.serviceAreas || [],
        
        // Documents and Photos
        documents: verification.documents || {},
        verificationDocuments: verification.documents || {},
        
        // Status and Timestamps
        verificationStatus: verification.verificationStatus || user?.verificationStatus,
        status: verification.verificationStatus || user?.verificationStatus,
        submittedAt: verification.submittedAt,
        createdAt: user?.createdAt || verification.submittedAt,
        verificationSubmittedAt: verification.submittedAt,
        verifiedAt: verification.verifiedAt,
        verifiedBy: verification.verifiedBy,
        verificationNotes: verification.verificationNotes,
        rejectionReason: verification.rejectionReason,
        
        // Additional user data
        location: `${verification.city || ''}, ${verification.state || ''}`.trim().replace(/^,\s*|,\s*$/, '') || 'Not specified',
        mobileVerified: user?.mobileVerified || false,
        documentsSubmitted: user?.documentsSubmitted || true,
        
        // Personal Info structure for compatibility
        personalInfo: {
          fullName: verification.fullName,
          dateOfBirth: verification.dateOfBirth,
          address: verification.address,
          city: verification.city,
          state: verification.state,
          pincode: verification.pincode
        },
        
        // Professional Info structure for compatibility
        professionalInfo: {
          profession: verification.serviceCategory,
          specialization: verification.specializations?.join(', ') || 'Not specified',
          experience: `${verification.yearsExperience || 0} years`,
          qualification: 'Pending verification',
          businessName: verification.businessName
        },
        
        // Additional Info structure for compatibility
        additionalInfo: {
          workingHours: verification.workingHours || 'Not specified',
          serviceAreas: verification.serviceAreas?.join(', ') || 'Not specified',
          emergencyContact: verification.emergencyContact || 'Not provided',
          references: 'Not provided'
        }
      }
    })

    // If no detailed verifications found, fall back to basic user data
    if (mergedRequests.length === 0) {
      console.log("📋 No detailed verifications found, falling back to basic user data...")
      
      const basicProfessionals = await db.collection("users")
        .find({ 
          type: "professional",
          verificationStatus: { $in: ["pending_admin_review", "approved", "rejected"] }
        })
        .sort({ createdAt: -1 })
        .toArray()

      const basicRequests = basicProfessionals.map(user => ({
        _id: user._id.toString(),
        professionalId: user._id.toString(),
        name: user.name,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        profession: user.profession || 'Not specified',
        serviceCategory: user.serviceCategory || user.profession,
        experience: user.experience || 'Not specified',
        location: user.location || 'Not specified',
        verificationStatus: user.verificationStatus,
        status: user.verificationStatus,
        submittedAt: user.createdAt,
        createdAt: user.createdAt,
        documents: user.verificationDocuments || {},
        verificationDocuments: user.verificationDocuments || {},
        
        // Default structures
        personalInfo: {
          fullName: user.name,
          dateOfBirth: 'Not provided',
          address: user.address || 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          pincode: 'Not provided'
        },
        professionalInfo: {
          profession: user.profession || 'Not specified',
          specialization: 'Not specified',
          experience: user.experience || 'Not specified',
          qualification: 'Pending verification',
          businessName: user.businessName || 'Not provided'
        },
        additionalInfo: {
          workingHours: 'Not specified',
          serviceAreas: 'Not specified',
          emergencyContact: 'Not provided',
          references: 'Not provided'
        }
      }))

      return NextResponse.json({
        success: true,
        requests: basicRequests,
        total: basicRequests.length,
        message: "Using basic user data (no detailed verifications found)"
      })
    }

    console.log(`✅ Returning ${mergedRequests.length} detailed verification requests`)

    return NextResponse.json({
      success: true,
      requests: mergedRequests,
      total: mergedRequests.length,
      message: "Detailed verification data loaded successfully"
    })

  } catch (error) {
    console.error("❌ Error fetching detailed verification requests:", error)
    return NextResponse.json({ 
      error: "Failed to fetch verification requests", 
      details: error.message 
    }, { status: 500 })
  }
}
