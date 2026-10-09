import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../../../config/mongodb.js"
import { User } from "../../../../../models/User.js"
import { ObjectId } from "mongodb"

async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get("authorization")

    let token = null
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      // Fallback for browser GETs using ?token= in the URL
      const url = new URL(request.url)
      const tokenParam = url.searchParams.get("token")
      if (tokenParam) {
        token = tokenParam
      }
    }

    if (!token) {
      return { error: "No token provided", status: 401 }
    }
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

export async function GET(request, { params }) {
  try {
    const adminCheck = await verifyAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { db } = adminCheck
    const { id } = params || {}

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const record = await db
      .collection("verification_documents")
      .findOne({ _id: new ObjectId(id) })

    if (!record || !record.data) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const mimeType = record.mimeType || "application/octet-stream"
    const filename = record.filename || "document"

    // record.data is a Mongo Binary; use its underlying Buffer when available
    const buffer = record.data && record.data.buffer ? record.data.buffer : record.data

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error("Admin document fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}
