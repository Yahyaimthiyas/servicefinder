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

// POST - Create test verification data
export async function POST(request) {
  try {
    console.log("🧪 Creating test verification data...")
    
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck

    // Create sample professional verification data
    const testVerifications = [
      {
        fullName: "Rajesh Kumar",
        email: "rajesh.plumber@gmail.com",
        phone: "9876543210",
        dateOfBirth: "1985-03-15",
        address: "123 Main Street, Anna Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600040",
        
        businessName: "Kumar Plumbing Services",
        serviceCategory: "plumbing",
        specializations: ["Residential Plumbing", "Pipe Repair", "Bathroom Fitting"],
        yearsExperience: 8,
        description: "Professional plumbing services with 8+ years experience. Specializing in residential plumbing, pipe repairs, and bathroom fittings. Available for emergency calls.",
        
        pricing: {
          hourlyRate: 500,
          calloutFee: 200,
          minimumCharge: 800
        },
        
        workingHours: "Mon-Sat 8AM-8PM",
        serviceAreas: ["Anna Nagar", "T Nagar", "Adyar", "Velachery"],
        emergencyContact: "Kumar's Brother",
        emergencyPhone: "9876543211",
        
        documents: {
          profilePhoto: "/uploads/profilePhoto/1703123456-rajesh-profile.jpg",
          idProof: "/uploads/idProof/1703123456-rajesh-aadhar.pdf",
          addressProof: "/uploads/addressProof/1703123456-rajesh-utility-bill.pdf",
          businessLicense: "/uploads/businessLicense/1703123456-rajesh-license.pdf",
          portfolioImages: [
            "/uploads/portfolioImages/1703123456-rajesh-work1.jpg",
            "/uploads/portfolioImages/1703123456-rajesh-work2.jpg",
            "/uploads/portfolioImages/1703123456-rajesh-work3.jpg"
          ]
        },
        
        submittedAt: new Date(),
        verificationStatus: 'pending_admin_review',
        submittedBy: "test-professional-1"
      },
      {
        fullName: "Priya Sharma",
        email: "priya.electrician@gmail.com",
        phone: "9876543220",
        dateOfBirth: "1990-07-22",
        address: "456 Second Street, Koramangala",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560034",
        
        businessName: "Sharma Electrical Works",
        serviceCategory: "electrical",
        specializations: ["Home Wiring", "AC Installation", "Electrical Repairs"],
        yearsExperience: 6,
        description: "Licensed electrician with expertise in home wiring, AC installations, and electrical repairs. Certified and insured professional.",
        
        pricing: {
          hourlyRate: 600,
          calloutFee: 250,
          minimumCharge: 1000
        },
        
        workingHours: "Mon-Fri 9AM-7PM, Sat 9AM-5PM",
        serviceAreas: ["Koramangala", "BTM Layout", "HSR Layout", "Electronic City"],
        emergencyContact: "Priya's Husband",
        emergencyPhone: "9876543221",
        
        documents: {
          profilePhoto: "/uploads/profilePhoto/1703123457-priya-profile.jpg",
          idProof: "/uploads/idProof/1703123457-priya-pan.pdf",
          addressProof: "/uploads/addressProof/1703123457-priya-lease.pdf",
          businessLicense: "/uploads/businessLicense/1703123457-priya-electrical-license.pdf",
          certifications: [
            "/uploads/certifications/1703123457-priya-electrical-cert.pdf"
          ],
          portfolioImages: [
            "/uploads/portfolioImages/1703123457-priya-wiring1.jpg",
            "/uploads/portfolioImages/1703123457-priya-ac-install.jpg",
            "/uploads/portfolioImages/1703123457-priya-panel-work.jpg",
            "/uploads/portfolioImages/1703123457-priya-repair-work.jpg"
          ]
        },
        
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        verificationStatus: 'pending_admin_review',
        submittedBy: "test-professional-2"
      },
      {
        fullName: "Mohammed Ali",
        email: "mohammed.cleaner@gmail.com",
        phone: "9876543230",
        dateOfBirth: "1988-12-10",
        address: "789 Third Avenue, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        
        businessName: "Ali Cleaning Services",
        serviceCategory: "cleaning",
        specializations: ["Deep Cleaning", "Office Cleaning", "Post-Construction Cleaning"],
        yearsExperience: 5,
        description: "Professional cleaning services for homes and offices. Eco-friendly products used. Deep cleaning and post-construction cleaning specialist.",
        
        pricing: {
          hourlyRate: 300,
          calloutFee: 150,
          minimumCharge: 600
        },
        
        workingHours: "Mon-Sun 7AM-9PM",
        serviceAreas: ["Bandra", "Khar", "Santacruz", "Juhu"],
        emergencyContact: "Ali's Father",
        emergencyPhone: "9876543231",
        
        documents: {
          profilePhoto: "/uploads/profilePhoto/1703123458-mohammed-profile.jpg",
          idProof: "/uploads/idProof/1703123458-mohammed-driving-license.pdf",
          addressProof: "/uploads/addressProof/1703123458-mohammed-rent-agreement.pdf",
          portfolioImages: [
            "/uploads/portfolioImages/1703123458-mohammed-before-after1.jpg",
            "/uploads/portfolioImages/1703123458-mohammed-office-clean.jpg",
            "/uploads/portfolioImages/1703123458-mohammed-deep-clean.jpg"
          ]
        },
        
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        verificationStatus: 'pending_admin_review',
        submittedBy: "test-professional-3"
      }
    ]

    // Insert test verification data
    const results = []
    for (const verification of testVerifications) {
      const result = await db.collection("professional_verifications").insertOne(verification)
      results.push({
        id: result.insertedId.toString(),
        name: verification.fullName,
        serviceCategory: verification.serviceCategory
      })
      
      console.log(`✅ Created test verification for: ${verification.fullName}`)
    }

    // Also create corresponding users if they don't exist
    for (const verification of testVerifications) {
      const existingUser = await db.collection("users").findOne({ email: verification.email })
      
      if (!existingUser) {
        await db.collection("users").insertOne({
          name: verification.fullName,
          email: verification.email,
          phone: verification.phone,
          type: "professional",
          verificationStatus: "pending_admin_review",
          serviceCategory: verification.serviceCategory,
          businessName: verification.businessName,
          pricing: verification.pricing,
          documentsSubmitted: true,
          verificationSubmittedAt: verification.submittedAt,
          createdAt: verification.submittedAt,
          mobileVerified: true
        })
        
        console.log(`✅ Created test user for: ${verification.fullName}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test verification data created successfully",
      created: results,
      total: testVerifications.length
    })

  } catch (error) {
    console.error("❌ Error creating test data:", error)
    return NextResponse.json({ 
      error: "Failed to create test data", 
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Clear test data
export async function DELETE(request) {
  try {
    console.log("🧹 Clearing test verification data...")
    
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck

    // Delete test verification data
    const verificationResult = await db.collection("professional_verifications").deleteMany({
      submittedBy: { $in: ["test-professional-1", "test-professional-2", "test-professional-3"] }
    })

    // Delete test users
    const userResult = await db.collection("users").deleteMany({
      email: { $in: [
        "rajesh.plumber@gmail.com",
        "priya.electrician@gmail.com", 
        "mohammed.cleaner@gmail.com"
      ]}
    })

    console.log(`🗑️ Deleted ${verificationResult.deletedCount} verification records`)
    console.log(`🗑️ Deleted ${userResult.deletedCount} user records`)

    return NextResponse.json({
      success: true,
      message: "Test data cleared successfully",
      deleted: {
        verifications: verificationResult.deletedCount,
        users: userResult.deletedCount
      }
    })

  } catch (error) {
    console.error("❌ Error clearing test data:", error)
    return NextResponse.json({ 
      error: "Failed to clear test data", 
      details: error.message 
    }, { status: 500 })
  }
}
