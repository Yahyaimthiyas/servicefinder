import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables (.env.local, .env from root or server directory)
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") })
dotenv.config({ path: path.resolve(__dirname, "../../.env") })
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import clientPromise from "../config/mongodb.js"

export default async function seedDatabase() {
  const client = await clientPromise
  const db = client.db("servicefinder")
  
  console.log("🌱 Clearing existing data...")
  await db.collection("users").deleteMany({})
  await db.collection("services").deleteMany({})
  await db.collection("bookings").deleteMany({})
  await db.collection("chats").deleteMany({})
  await db.collection("reviews").deleteMany({})
  await db.collection("ratings").deleteMany({})
  await db.collection("professional_verifications").deleteMany({})

  console.log("🌱 Seeding services...")
  const defaultServices = [
    { name: "Plumbing Repair", category: "Plumber", description: "All plumbing repairs and installation services", basePrice: 500, duration: 60, isActive: true },
    { name: "Electrical Fault Repair", category: "Electrician", description: "Home electrical repairs, wiring and fittings", basePrice: 600, duration: 60, isActive: true },
    { name: "AC Maintenance & Gas Filling", category: "AC Technician", description: "Complete service, repairs and gas filling for split/window ACs", basePrice: 800, duration: 90, isActive: true },
    { name: "Furniture Assembly & Repair", category: "Carpenter", description: "Custom woodwork, furniture repairs and assembly services", basePrice: 700, duration: 120, isActive: true },
    { name: "Full House Cleaning", category: "House Cleaner", description: "Deep cleaning services for apartments and houses", basePrice: 1500, duration: 240, isActive: true },
    { name: "Home Interior Painting", category: "Painter", description: "Professional painting services for walls and ceilings", basePrice: 3000, duration: 480, isActive: true },
    { name: "Car & Bike Repair", category: "Mechanic", description: "On-site inspection and basic repair services for two/four wheelers", basePrice: 500, duration: 90, isActive: true },
    { name: "Garden Cleanup & Maintenance", category: "Gardener", description: "Trimming, weeding and general garden maintenance", basePrice: 400, duration: 120, isActive: true },
    { name: "Primary School Tutoring", category: "Tutor", description: "Home tutoring services for subjects like Math and Science", basePrice: 500, duration: 60, isActive: true }
  ]
  const insertedServices = await db.collection("services").insertMany(defaultServices)
  console.log(`✅ Seeded ${Object.keys(insertedServices.insertedIds).length} services`)

  console.log("🌱 Seeding users...")
  // Add a default customer
  const defaultCustomer = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // Plain text password as per login route check
    type: "customer",
    phone: "9876543210",
    isVerified: true,
    isActive: true,
    rating: 0,
    totalReviews: 0,
    joinedAt: new Date()
  }
  await db.collection("users").insertOne(defaultCustomer)

  // Add a default admin
  const defaultAdmin = {
    name: "Admin User",
    email: "admin@servicefinder.com",
    password: "admin123",
    type: "admin",
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: null
  }
  await db.collection("users").insertOne(defaultAdmin)

  // Read and seed professionals
  let professionalsCount = 0
  const seedFile = path.resolve(__dirname, "../data/seed-professionals.json")
  if (fs.existsSync(seedFile)) {
    const rawData = fs.readFileSync(seedFile, "utf-8")
    const professionals = JSON.parse(rawData)
    
    const formattedProfessionals = professionals.map(prof => ({
      ...prof,
      password: "password123", // Set a default password
      joinedAt: new Date(),
      createdAt: new Date()
    }))

    if (formattedProfessionals.length > 0) {
      await db.collection("users").insertMany(formattedProfessionals)
      professionalsCount = formattedProfessionals.length
      console.log(`✅ Seeded ${formattedProfessionals.length} professionals`)
    }
  } else {
    console.warn("⚠️ seed-professionals.json not found at " + seedFile)
  }

  // Create indexes for performance
  try {
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ type: 1 })
    await db.collection("users").createIndex({ city: 1 })
    await db.collection("users").createIndex({ state: 1 })
    await db.collection("services").createIndex({ category: 1 })
    console.log("📊 Indexes created successfully")
  } catch (error) {
    console.warn("⚠️ Indexes already exist or failed to create", error.message)
  }

  return {
    seededServices: Object.keys(insertedServices.insertedIds).length,
    seededProfessionals: professionalsCount,
    seededCustomers: 1
  }
}

// Auto-run if executed directly from CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then((result) => {
      console.log("🎉 Seeding complete:", result)
      process.exit(0)
    })
    .catch((err) => {
      console.error("❌ Seeding failed:", err)
      process.exit(1)
    })
}
