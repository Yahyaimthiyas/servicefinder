import { NextResponse } from "next/server"
import clientPromise from "../../config/mongodb.js"
import { User } from "../../models/User.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // customer, professional, admin
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 50
    const skip = searchParams.get("skip") ? parseInt(searchParams.get("skip")) : 0
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const query = { isActive: true }
    if (type) query.type = type
    
    const users = await db.collection("users")
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ joinedAt: -1 })
      .toArray()
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user
      return safeUser
    })
    
    const total = await db.collection("users").countDocuments(query)
    
    return NextResponse.json({
      success: true,
      users: safeUsers,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    })
    
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userData = await request.json()
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    // Check if user already exists
    const existingUser = await User.findByEmail(db, userData.email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }
    
    const user = await User.create(db, userData)
    
    // Remove password from response
    const { password, ...safeUser } = user
    
    return NextResponse.json({
      success: true,
      user: safeUser
    }, { status: 201 })
    
  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
