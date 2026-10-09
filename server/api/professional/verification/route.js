import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"

// Helper function to verify JWT token
async function verifyToken(request) {
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
    
    if (!user) {
      return { error: "User not found", status: 404 }
    }

    if (user.type !== "professional") {
      return { error: "Only professionals can submit verification", status: 403 }
    }

    return { user, db }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

// Helper function to save uploaded files (mock implementation)
async function saveUploadedFile(file, folder) {
  // In a real application, you would save to cloud storage (AWS S3, Cloudinary, etc.)
  // For now, we'll just return a mock URL
  const fileName = `${Date.now()}-${file.name}`
  const mockUrl = `/uploads/${folder}/${fileName}`
  
  console.log(`📁 Mock file saved: ${mockUrl}`)
  return mockUrl
}

// POST - Submit professional verification
export async function POST(request) {
  try {
    console.log("🔍 Professional verification submission started")
    
    const tokenCheck = await verifyToken(request)
    if (tokenCheck.error) {
      return NextResponse.json({ error: tokenCheck.error }, { status: tokenCheck.status })
    }

    const { user, db } = tokenCheck
    console.log(`👤 Professional verification for: ${user.name} (${user.email})`)

    // Parse form data
    const formData = await request.formData()
    
    // Extract form fields
    const verificationData = {
      // Personal Information
      fullName: formData.get('fullName'),
      dateOfBirth: formData.get('dateOfBirth'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      
      // Professional Information
      businessName: formData.get('businessName'),
      serviceCategory: formData.get('serviceCategory'),
      specializations: JSON.parse(formData.get('specializations') || '[]'),
      yearsExperience: parseInt(formData.get('yearsExperience')),
      description: formData.get('description'),
      
      // Emergency Contact
      emergencyContact: formData.get('emergencyContact'),
      emergencyPhone: formData.get('emergencyPhone'),
      workingHours: formData.get('workingHours'),
      serviceAreas: JSON.parse(formData.get('serviceAreas') || '[]'),
      pricing: JSON.parse(formData.get('pricing') || '{}'),
      
      // Submission metadata
      submittedAt: new Date(),
      submittedBy: user._id.toString(),
      verificationStatus: 'pending_admin_review'
    }

    // Handle file uploads
    const documents = {}
    
    // Single file uploads
    const singleFiles = ['profilePhoto', 'idProof', 'addressProof', 'businessLicense']
    for (const fileField of singleFiles) {
      const file = formData.get(fileField)
      if (file && file.size > 0) {
        documents[fileField] = await saveUploadedFile(file, fileField)
        console.log(`📄 ${fileField} uploaded: ${documents[fileField]}`)
      }
    }

    // Multiple file uploads (certifications, portfolio)
    const multipleFileFields = ['certifications', 'portfolioImages']
    for (const fileField of multipleFileFields) {
      const files = formData.getAll(fileField)
      if (files.length > 0) {
        documents[fileField] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file && file.size > 0) {
            const url = await saveUploadedFile(file, fileField)
            documents[fileField].push(url)
            console.log(`📄 ${fileField}[${i}] uploaded: ${url}`)
          }
        }
      }
    }

    verificationData.documents = documents

    // Save verification data to database
    const verificationResult = await db.collection("professional_verifications").insertOne(verificationData)
    console.log(`💾 Verification data saved with ID: ${verificationResult.insertedId}`)

    // Update user's verification status and core profile fields used for search & profile
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          verificationStatus: 'pending_admin_review',
          verificationSubmittedAt: new Date(),
          verificationDocuments: documents,
          businessName: verificationData.businessName,
          serviceCategory: verificationData.serviceCategory,
          yearsExperience: verificationData.yearsExperience,
          // Store a human-readable experience string for profile views
          experience: verificationData.yearsExperience
            ? `${verificationData.yearsExperience} years`
            : user.experience,
          pricing: verificationData.pricing,
          documentsSubmitted: true,
          // Location and service info used for matching
          state: verificationData.state,
          city: verificationData.city,
          serviceArea: Array.isArray(verificationData.serviceAreas) && verificationData.serviceAreas.length
            ? verificationData.serviceAreas
            : [verificationData.city].filter(Boolean),
          serviceAreas: Array.isArray(verificationData.serviceAreas) && verificationData.serviceAreas.length
            ? verificationData.serviceAreas
            : [verificationData.city].filter(Boolean),
          // Normalize main profession / services for search
          profession: verificationData.serviceCategory || user.profession,
          services: verificationData.serviceCategory ? [verificationData.serviceCategory] : user.services,
          // Profile display fields
          profileImage: documents.profilePhoto || user.profileImage,
          description: verificationData.description || user.description,
          workingHours: verificationData.workingHours || user.workingHours,
        }
      }
    )

    console.log(`✅ User verification status updated to: pending_admin_review`)

    // Log activity for admin dashboard
    await db.collection("admin_activities").insertOne({
      type: 'verification_submission',
      message: `${verificationData.fullName} submitted verification documents`,
      professionalId: user._id.toString(),
      professionalName: verificationData.fullName,
      serviceCategory: verificationData.serviceCategory,
      timestamp: new Date(),
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      message: "Verification submitted successfully",
      verificationId: verificationResult.insertedId.toString(),
      status: 'pending_admin_review'
    })

  } catch (error) {
    console.error("❌ Professional verification error:", error)
    return NextResponse.json({ 
      error: "Failed to submit verification", 
      details: error.message 
    }, { status: 500 })
  }
}

// GET - Get verification status
export async function GET(request) {
  try {
    const tokenCheck = await verifyToken(request)
    if (tokenCheck.error) {
      return NextResponse.json({ error: tokenCheck.error }, { status: tokenCheck.status })
    }

    const { user, db } = tokenCheck

    // Get verification data
    const verification = await db.collection("professional_verifications")
      .findOne({ submittedBy: user._id.toString() }, { sort: { submittedAt: -1 } })

    if (!verification) {
      return NextResponse.json({
        success: true,
        hasSubmitted: false,
        message: "No verification submitted yet"
      })
    }

    return NextResponse.json({
      success: true,
      hasSubmitted: true,
      verification: {
        id: verification._id.toString(),
        status: verification.verificationStatus,
        submittedAt: verification.submittedAt,
        reviewedAt: verification.reviewedAt,
        reviewNotes: verification.reviewNotes,
        documents: verification.documents
      }
    })

  } catch (error) {
    console.error("❌ Get verification status error:", error)
    return NextResponse.json({ 
      error: "Failed to get verification status", 
      details: error.message 
    }, { status: 500 })
  }
}
