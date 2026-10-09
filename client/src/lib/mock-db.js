// Mock database for testing without MongoDB
let users = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    type: "customer",
    phone: "123-456-7890",
    isVerified: true,
    isActive: true,
    rating: 0,
    totalReviews: 0,
    joinedAt: new Date(),
  },
  {
    _id: "2", 
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    type: "professional",
    phone: "098-765-4321",
    isVerified: true,
    isActive: true,
    rating: 4.8,
    totalReviews: 25,
    joinedAt: new Date(),
    services: ["Plumbing", "Electrical"],
    experience: "5 years",
    serviceArea: ["Downtown", "Suburbs"],
    pricing: { hourlyRate: 75 },
  },
  {
    _id: "3",
    name: "Admin User",
    email: "admin@example.com", 
    password: "",
    type: "admin",
    phone: "555-000-0000",
    isVerified: true,
    isActive: true,
    rating: 0,
    totalReviews: 0,
    joinedAt: new Date(),
  }
]

let services = [
  {
    _id: "1",
    name: "Plumbing Repair",
    category: "Home Maintenance",
    description: "Professional plumbing services",
    basePrice: 50,
    duration: 60,
    isActive: true,
  },
  {
    _id: "2", 
    name: "Electrical Work",
    category: "Home Maintenance",
    description: "Licensed electrical services",
    basePrice: 80,
    duration: 90,
    isActive: true,
  },
  {
    _id: "3",
    name: "House Cleaning",
    category: "Cleaning",
    description: "Professional house cleaning",
    basePrice: 40,
    duration: 120,
    isActive: true,
  }
]

export const mockDb = {
  users: {
    findByEmail: (email) => {
      return users.find(user => user.email === email) || null
    },
    findById: (id) => {
      return users.find(user => user._id === id) || null
    },
    create: (userData) => {
      const newUser = {
        _id: (users.length + 1).toString(),
        ...userData,
        isVerified: userData.type === "admin",
        isActive: true,
        rating: 0,
        totalReviews: 0,
        joinedAt: new Date(),
      }
      users.push(newUser)
      return newUser
    },
    findProfessionals: (filters = {}) => {
      return users.filter(user => user.type === "professional" && user.isActive)
    },
    update: (id, updateData) => {
      const userIndex = users.findIndex(user => user._id === id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date() }
        return true
      }
      return false
    }
  },
  services: {
    findAll: (filters = {}) => {
      let filteredServices = services.filter(service => service.isActive)
      
      if (filters.category && filters.category !== "All Services") {
        filteredServices = filteredServices.filter(service => service.category === filters.category)
      }
      
      if (filters.search) {
        filteredServices = filteredServices.filter(service => 
          service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          service.description.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      return filteredServices
    },
    create: (serviceData) => {
      const newService = {
        _id: (services.length + 1).toString(),
        ...serviceData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      services.push(newService)
      return newService
    }
  }
}

export default mockDb
