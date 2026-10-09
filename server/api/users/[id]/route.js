import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { User } from "../../../models/User.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const user = await User.findById(db, id)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Remove password from response
    const { password, ...safeUser } = user
    
    return NextResponse.json({
      success: true,
      user: safeUser
    })
    
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const user = await User.findById(db, id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Don't allow password updates through this endpoint
    delete updateData.password
    
    const updated = await user.update(db, updateData)
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 400 })
    }
    
    const updatedUser = await User.findById(db, id)
    const { password, ...safeUser } = updatedUser
    
    return NextResponse.json({
      success: true,
      user: safeUser
    })
    
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const user = await User.findById(db, id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const deleted = await user.delete(db)
    
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })
    
  } catch (error) {
    console.error("User deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
