import { NextResponse } from "next/server"
import clientPromise from "../../../config/mongodb.js"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("servicefinder")
    
    // Get database statistics
    const stats = await db.stats()
    const collections = await db.listCollections().toArray()
    
    // Count documents in each collection
    const collectionCounts = {}
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      collectionCounts[collection.name] = count
    }
    
    // Test connection with a simple operation
    const connectionTest = await db.admin().ping()
    
    return NextResponse.json({
      success: true,
      status: "connected",
      database: {
        name: stats.db,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects
      },
      collections: collectionCounts,
      connectionTest: connectionTest.ok === 1 ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("Database status check failed:", error)
    return NextResponse.json({
      success: false,
      status: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
