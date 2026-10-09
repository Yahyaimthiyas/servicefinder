import { MongoClient } from "mongodb"

// Fallback to local MongoDB if environment variable is not set
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/servicefinder"

if (!uri) {
  console.warn("MongoDB URI not found. Using default local connection.")
}
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Export connectDB function for compatibility
export async function connectDB() {
  try {
    const client = await clientPromise
    return client.db("servicefinder")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}
