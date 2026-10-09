import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { Binary } from "mongodb"

// Middleware to verify professional access
async function verifyProfessional(request) {
  try {
    console.log("🔍 Verifying professional access...")
    
    const authHeader = request.headers.get("authorization")
    console.log("📋 Auth header:", authHeader ? "Present" : "Missing")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid auth header")
      return { error: "No token provided", status: 401 }
    }

    const token = authHeader.substring(7)
    console.log("🎫 Token length:", token.length)
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-in-production")
    console.log("🔓 Token decoded for user:", decoded.userId)
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    const user = await User.findById(db, decoded.userId)
    
    console.log("👤 User found:", user ? `${user.name} (${user.type})` : "Not found")
    
    if (!user || user.type !== "professional") {
      console.log("❌ User not professional or not found")
      return { error: "Professional access required", status: 403 }
    }

    console.log("✅ Professional access verified")
    return { user, db }
  } catch (error) {
    console.error("❌ Token verification error:", error.message)
    return { error: "Invalid token: " + error.message, status: 401 }
  }
}

// POST - Submit verification documents
export async function POST(request) {
  try {
    const professionalCheck = await verifyProfessional(request)
    if (professionalCheck.error) {
      return NextResponse.json({ error: professionalCheck.error }, { status: professionalCheck.status })
    }

    const { user: professional, db } = professionalCheck
    const contentType = request.headers.get("content-type") || ""

    let documentsData

    if (contentType.includes("multipart/form-data")) {
      // New flow: receive structured JSON payload plus real files
      const formData = await request.formData()
      const payload = formData.get("payload")

      if (!payload || typeof payload !== "string") {
        return NextResponse.json({ error: "Missing verification data" }, { status: 400 })
      }

      try {
        documentsData = JSON.parse(payload)
      } catch (error) {
        console.error("Failed to parse verification payload:", error)
        return NextResponse.json({ error: "Invalid verification data" }, { status: 400 })
      }

      const docs = documentsData.documents || {}

      const saveDocumentFile = async (fileEntry, fieldName, type) => {
        if (!fileEntry || typeof fileEntry === "string" || fileEntry.size === 0) return null

        const arrayBuffer = await fileEntry.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const record = {
          professionalId: professional._id,
          fieldName,
          type,
          filename: fileEntry.name,
          mimeType: fileEntry.type || "application/octet-stream",
          data: new Binary(buffer),
          uploadedAt: new Date()
        }

        const result = await db.collection("verification_documents").insertOne(record)

        return {
          id: result.insertedId.toString(),
          filename: fileEntry.name,
          mimeType: fileEntry.type || "application/octet-stream"
        }
      }

      const governmentIdFile = formData.get("governmentIdFile")
      const governmentIdMeta = await saveDocumentFile(governmentIdFile, "governmentId", "governmentId")
      if (governmentIdMeta) {
        docs.governmentId = governmentIdMeta
      }

      const professionalLicenseFile = formData.get("professionalLicenseFile")
      const professionalLicenseMeta = await saveDocumentFile(professionalLicenseFile, "professionalLicense", "professionalLicense")
      if (professionalLicenseMeta) {
        docs.professionalLicense = professionalLicenseMeta
      }

      const businessRegistrationFile = formData.get("businessRegistrationFile")
      const businessRegistrationMeta = await saveDocumentFile(businessRegistrationFile, "businessRegistration", "businessRegistration")
      if (businessRegistrationMeta) {
        docs.businessRegistration = businessRegistrationMeta
      }

      const experienceCertificateFile = formData.get("experienceCertificateFile")
      const experienceCertificateMeta = await saveDocumentFile(experienceCertificateFile, "experienceCertificate", "experienceCertificate")
      if (experienceCertificateMeta) {
        docs.experienceCertificate = experienceCertificateMeta
      }

      const portfolioEntries = formData.getAll("portfolioImages")
      const portfolioMeta = []
      for (const entry of portfolioEntries) {
        const meta = await saveDocumentFile(entry, "portfolioImages", "portfolioImage")
        if (meta) {
          portfolioMeta.push(meta)
        }
      }
      if (portfolioMeta.length > 0) {
        docs.portfolioImages = portfolioMeta
      }

      documentsData.documents = docs
    } else {
      // Fallback: older JSON-only submissions (no binary data)
      documentsData = await request.json()
    }

    console.log("📄 Received documents data:", JSON.stringify(documentsData, null, 2))

    // Validate required documents - check nested structure
    const hasGovernmentId = documentsData.documents?.governmentId || documentsData.governmentId
    const hasProfessionalLicense = documentsData.documents?.professionalLicense || documentsData.professionalLicense
    
    if (!hasGovernmentId || !hasProfessionalLicense) {
      return NextResponse.json({ 
        error: `Missing required documents. Please upload Government ID and Professional License.` 
      }, { status: 400 })
    }

    // Submit documents for admin review
    const updated = await professional.submitDocuments(db, documentsData)

    if (!updated) {
      return NextResponse.json({ error: "Failed to submit documents" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Documents submitted successfully for admin review",
      verificationStatus: "pending_admin_review"
    })

  } catch (error) {
    console.error("Document submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get current document status
export async function GET(request) {
  try {
    const professionalCheck = await verifyProfessional(request)
    if (professionalCheck.error) {
      return NextResponse.json({ error: professionalCheck.error }, { status: professionalCheck.status })
    }

    const { user: professional } = professionalCheck

    return NextResponse.json({
      success: true,
      verificationStatus: professional.verificationStatus,
      documentsSubmitted: professional.documentsSubmitted,
      mobileVerified: professional.mobileVerified,
      canReceiveBookings: professional.canReceiveBookings,
      verificationNotes: professional.verificationNotes,
      rejectionReason: professional.rejectionReason
    })

  } catch (error) {
    console.error("Document status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
