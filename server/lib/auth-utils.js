import jwt from "jsonwebtoken"
import clientPromise from "../config/mongodb.js"
import { User } from "../models/User.js"

// Professional access helper backed by real MongoDB data
export async function verifyProfessionalAccess(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No valid authorization header", status: 401 }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    const client = await clientPromise
    const db = client.db("servicefinder")

    const user = await User.findById(db, decoded.userId)
    if (!user) {
      return { error: "User not found", status: 404 }
    }

    if (user.type !== "professional") {
      return { error: "Only professionals can access this resource", status: 403 }
    }

    return { user, db, status: 200 }
  } catch (error) {
    console.error("❌ Auth verification failed:", error.message)
    return { error: "Invalid token", status: 401 }
  }
}
