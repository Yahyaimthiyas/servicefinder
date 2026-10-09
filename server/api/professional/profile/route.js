import { NextResponse } from "next/server"
import { verifyProfessionalAccess } from "../../../lib/auth-utils.js"
import { User } from "../../../models/User.js"

// GET /api/professional/profile
export async function GET(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user } = authResult

    // Normalize service areas into a display string
    const serviceAreasArray = Array.isArray(user.serviceAreas) && user.serviceAreas.length > 0
      ? user.serviceAreas
      : Array.isArray(user.businessInfo?.serviceAreas)
        ? user.businessInfo.serviceAreas
        : []

    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profession: user.profession || user.serviceCategory || "Service Provider",
      verificationStatus: user.verificationStatus || "pending_documents",
      subscriptionPlan: user.subscriptionPlan || "basic",
      profileImage: user.profileImage || user.verificationDocuments?.profilePhoto || null,
      address: user.address || user.personalDetails?.address,
      city: user.city || user.personalDetails?.city,
      state: user.state || user.personalDetails?.state,
      pincode: user.pincode || user.personalDetails?.pincode,
      experience: user.experience,
      specialization: user.specialization || user.professionalDetails?.specialization,
      workingHours: user.workingHours || user.businessInfo?.workingHours,
      serviceAreas: serviceAreasArray.join(", "),
      emergencyContact: user.emergencyContact,
      businessName: user.businessName || user.businessInfo?.businessName,
      description: user.description,
      hourlyRate: user.pricing?.hourlyRate,
      fixedRate: user.pricing?.minimumCharge,
      skills: user.skills || [],
      certifications: user.certifications || [],
      portfolio: user.portfolio || user.verificationDocuments?.portfolioImages || [],
      createdAt: user.joinedAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      success: true,
      professional: profileData,
    })
  } catch (error) {
    console.error("❌ Error fetching professional profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT /api/professional/profile
export async function PUT(request) {
  try {
    const authResult = await verifyProfessionalAccess(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { user, db } = authResult

    const formData = await request.formData()
    const get = (key) => formData.get(key)

    const updateData = {}

    const name = get("name")
    if (name !== null) updateData.name = name.toString()

    const businessName = get("businessName")
    if (businessName !== null) updateData.businessName = businessName.toString()

    const email = get("email")
    if (email !== null) updateData.email = email.toString()

    const phone = get("phone")
    if (phone !== null) updateData.phone = phone.toString()

    const profession = get("profession")
    if (profession !== null) updateData.profession = profession.toString()

    const experience = get("experience")
    if (experience !== null) updateData.experience = experience.toString()

    const city = get("city")
    if (city !== null) updateData.city = city.toString()

    const state = get("state")
    if (state !== null) updateData.state = state.toString()

    const description = get("description")
    if (description !== null) updateData.description = description.toString()

    const specialization = get("specialization")
    if (specialization !== null) updateData.specialization = specialization.toString()

    const workingHours = get("workingHours")
    if (workingHours !== null) updateData.workingHours = workingHours.toString()

    const serviceAreasStr = get("serviceAreas")
    if (serviceAreasStr !== null) {
      const areas = serviceAreasStr
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      updateData.serviceAreas = areas
      updateData.serviceArea = areas
    }

    // Skills and certifications are sent as JSON strings
    const skillsJson = get("skills")
    if (skillsJson) {
      try {
        updateData.skills = JSON.parse(skillsJson.toString())
      } catch (e) {
        console.warn("Failed to parse skills JSON")
      }
    }

    const certsJson = get("certifications")
    if (certsJson) {
      try {
        updateData.certifications = JSON.parse(certsJson.toString())
      } catch (e) {
        console.warn("Failed to parse certifications JSON")
      }
    }

    // Pricing (hourlyRate / fixedRate) -> pricing object
    const pricingUpdate = { ...user.pricing }
    const hourlyRate = get("hourlyRate")
    if (hourlyRate) {
      const hr = Number.parseFloat(hourlyRate.toString())
      if (!Number.isNaN(hr)) {
        pricingUpdate.hourlyRate = hr
      }
    }

    const fixedRate = get("fixedRate")
    if (fixedRate) {
      const fr = Number.parseFloat(fixedRate.toString())
      if (!Number.isNaN(fr)) {
        pricingUpdate.minimumCharge = fr
      }
    }

    if (Object.keys(pricingUpdate).length > 0) {
      updateData.pricing = pricingUpdate
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        professional: user,
        message: "No changes to update",
      })
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    const updatedDoc = await db.collection("users").findOne({ _id: user._id })
    const updatedUser = new User(updatedDoc)

    const serviceAreasArray = Array.isArray(updatedUser.serviceAreas) && updatedUser.serviceAreas.length > 0
      ? updatedUser.serviceAreas
      : Array.isArray(updatedUser.businessInfo?.serviceAreas)
        ? updatedUser.businessInfo.serviceAreas
        : []

    const updatedProfile = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profession: updatedUser.profession || updatedUser.serviceCategory || "Service Provider",
      verificationStatus: updatedUser.verificationStatus || "pending_documents",
      subscriptionPlan: updatedUser.subscriptionPlan || "basic",
      profileImage: updatedUser.profileImage || updatedUser.verificationDocuments?.profilePhoto || null,
      address: updatedUser.address || updatedUser.personalDetails?.address,
      city: updatedUser.city || updatedUser.personalDetails?.city,
      state: updatedUser.state || updatedUser.personalDetails?.state,
      pincode: updatedUser.pincode || updatedUser.personalDetails?.pincode,
      experience: updatedUser.experience,
      specialization: updatedUser.specialization || updatedUser.professionalDetails?.specialization,
      workingHours: updatedUser.workingHours || updatedUser.businessInfo?.workingHours,
      serviceAreas: serviceAreasArray.join(", "),
      emergencyContact: updatedUser.emergencyContact,
      businessName: updatedUser.businessName || updatedUser.businessInfo?.businessName,
      description: updatedUser.description,
      hourlyRate: updatedUser.pricing?.hourlyRate,
      fixedRate: updatedUser.pricing?.minimumCharge,
      skills: updatedUser.skills || [],
      certifications: updatedUser.certifications || [],
      portfolio: updatedUser.portfolio || updatedUser.verificationDocuments?.portfolioImages || [],
      createdAt: updatedUser.joinedAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json({
      success: true,
      professional: updatedProfile,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating professional profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
