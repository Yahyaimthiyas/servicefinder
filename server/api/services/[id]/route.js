import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"
import { Service } from "../../../models/Service.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const service = await Service.findById(db, id)
    
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      service
    })
    
  } catch (error) {
    console.error("Service fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const service = await Service.findById(db, id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    const updated = await service.update(db, updateData)
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update service" }, { status: 400 })
    }
    
    const updatedService = await Service.findById(db, id)
    
    return NextResponse.json({
      success: true,
      service: updatedService
    })
    
  } catch (error) {
    console.error("Service update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    const service = await Service.findById(db, id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    const deleted = await service.delete(db)
    
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete service" }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Service deleted successfully"
    })
    
  } catch (error) {
    console.error("Service deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
