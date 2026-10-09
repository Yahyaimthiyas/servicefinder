


























export const mockProfessionals = [
  {
    id: "1",
    name: "Mike Johnson",
    avatar: "/man-business.jpg",
    rating: 4.9,
    reviewCount: 127,
    location: "Downtown, San Francisco",
    services: ["Plumbing", "Emergency Repairs", "Installation"],
    hourlyRate: 85,
    description:
      "Licensed plumber with 15+ years of experience. Specializing in residential and commercial plumbing solutions.",
    isVerified: true,
    availability: "Today",
    completedJobs: 342,
    responseTime: "< 1hr",
    yearsExperience: 15,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    avatar: "/professional-woman.png",
    rating: 4.8,
    reviewCount: 89,
    location: "Mission District, San Francisco",
    services: ["House Cleaning", "Deep Cleaning", "Office Cleaning"],
    hourlyRate: 45,
    description: "Professional cleaning service with eco-friendly products. Reliable, thorough, and detail-oriented.",
    isVerified: true,
    availability: "Tomorrow",
    completedJobs: 256,
    responseTime: "< 2hr",
    yearsExperience: 8,
  },
  {
    id: "3",
    name: "David Chen",
    avatar: "/man-homeowner.jpg",
    rating: 4.7,
    reviewCount: 156,
    location: "SOMA, San Francisco",
    services: ["Electrical", "Wiring", "Smart Home Installation"],
    hourlyRate: 95,
    description: "Certified electrician specializing in modern electrical systems and smart home technology.",
    isVerified: true,
    availability: "This Week",
    completedJobs: 198,
    responseTime: "< 3hr",
    yearsExperience: 12,
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    avatar: "/woman-manager.jpg",
    rating: 4.9,
    reviewCount: 203,
    location: "Castro, San Francisco",
    services: ["Handyman", "Home Repairs", "Furniture Assembly"],
    hourlyRate: 65,
    description: "Skilled handywoman offering comprehensive home repair and maintenance services.",
    isVerified: true,
    availability: "Today",
    completedJobs: 445,
    responseTime: "< 1hr",
    yearsExperience: 10,
  },
  {
    id: "5",
    name: "Robert Taylor",
    avatar: "/man-contractor.jpg",
    rating: 4.6,
    reviewCount: 78,
    location: "Richmond, San Francisco",
    services: ["Painting", "Interior Design", "Wall Repairs"],
    hourlyRate: 55,
    description:
      "Professional painter with an eye for detail and color. Transform your space with quality workmanship.",
    isVerified: true,
    availability: "Next Week",
    completedJobs: 167,
    responseTime: "< 4hr",
    yearsExperience: 7,
  },
  {
    id: "6",
    name: "Jennifer Kim",
    avatar: "/woman-entrepreneur.jpg",
    rating: 4.8,
    reviewCount: 134,
    location: "Sunset, San Francisco",
    services: ["Tech Support", "Computer Repair", "Network Setup"],
    hourlyRate: 75,
    description: "IT professional providing computer repair, network setup, and technical support services.",
    isVerified: true,
    availability: "Today",
    completedJobs: 289,
    responseTime: "< 2hr",
    yearsExperience: 9,
  },
]

export const mockReviews = [
  {
    id: "1",
    professionalId: "1",
    customerName: "John Smith",
    rating: 5,
    comment:
      "Mike did an excellent job fixing our kitchen sink. Very professional and cleaned up after himself. Highly recommend!",
    service: "Plumbing",
    date: "2024-01-15",
  },
  {
    id: "2",
    professionalId: "1",
    customerName: "Emily Davis",
    rating: 5,
    comment: "Quick response time and fair pricing. Mike explained everything clearly and the work was done perfectly.",
    service: "Emergency Repairs",
    date: "2024-01-10",
  },
  {
    id: "3",
    professionalId: "2",
    customerName: "Michael Brown",
    rating: 5,
    comment: "Sarah's cleaning service is amazing! Our house has never looked better. Very thorough and professional.",
    service: "House Cleaning",
    date: "2024-01-12",
  },
  {
    id: "4",
    professionalId: "2",
    customerName: "Amanda Wilson",
    rating: 4,
    comment: "Great service overall. Sarah was punctual and did a thorough job. Will definitely book again.",
    service: "Deep Cleaning",
    date: "2024-01-08",
  },
]
