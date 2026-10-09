import { generateText } from "ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

















export class AIService {
   async callGemini(prompt) {
    try {
      const { text } = await generateText({
        model: "google/gemini-1.5-flash",
        prompt,
        apiKey: GEMINI_API_KEY,
      })
      return text
    } catch (error) {
      console.error("AI Service Error:", error)
      throw new Error("Failed to get AI response")
    }
  }

  async getServiceRecommendations(request, professionals) {
    const prompt = `
    As an AI assistant for a local service finder platform, analyze this service request and recommend the best professionals:

    Service Request:
    - Description: ${request.description}
    - Location: ${request.location}
    - Urgency: ${request.urgency}
    - Budget: ${request.budget ? `$${request.budget}` : "Not specified"}
    - Preferred Time: ${request.preferredTime || "Flexible"}

    Available Professionals:
    ${professionals
      .map(
        (p) => `
    - ID: ${p.id}
    - Name: ${p.name}
    - Services: ${p.services.join(", ")}
    - Location: ${p.location}
    - Rating: ${p.rating}/5 (${p.reviewCount} reviews)
    - Hourly Rate: $${p.hourlyRate}
    - Availability: ${p.availability}
    - Experience: ${p.yearsExperience} years
    - Response Time: ${p.responseTime}
    `,
      )
      .join("\n")}

    Please provide recommendations in this exact JSON format:
    {
      "recommendations": [
        {
          "professionalId": "string",
          "score": number (0-100),
          "reasons": ["reason1", "reason2", "reason3"],
          "estimatedDuration": "string (e.g., '2-3 hours')",
          "suggestedTime": "string (e.g., 'Tomorrow morning')"
        }
      ]
    }

    Consider factors like:
    - Service match and expertise
    - Location proximity
    - Availability and urgency
    - Rating and reviews
    - Price competitiveness
    - Response time
    `

    try {
      const response = await this.callGemini(prompt)
      const parsed = JSON.parse(response)
      return parsed.recommendations || []
    } catch (error) {
      console.error("Failed to parse AI recommendations:", error)
      return []
    }
  }

  async generateServiceDescription(userInput) {
    const prompt = `
    The user provided this service request: "${userInput}"

    Please rewrite this as a clear, professional service description that includes:
    1. What service is needed
    2. Any specific requirements or details
    3. Location or scope if mentioned
    4. Timeline if specified

    Keep it concise but comprehensive. Return only the improved description, no additional text.
    `

    try {
      return await this.callGemini(prompt)
    } catch (error) {
      console.error("Failed to generate service description:", error)
      return userInput
    }
  }

  async suggestOptimalScheduling(
    professionalId,
    serviceType,
    urgency,
  )


 {
    const prompt = `
    As a scheduling AI, suggest optimal booking times for:
    - Service: ${serviceType}
    - Urgency: ${urgency}
    - Professional ID: ${professionalId}

    Consider typical service patterns:
    - Plumbing: Best in morning/early afternoon
    - Electrical: Avoid peak hours, prefer morning
    - Cleaning: Flexible, often preferred morning or afternoon
    - Handyman: Flexible timing
    - Emergency services: ASAP

    Provide response in JSON format:
    {
      "suggestedTimes": ["time1", "time2", "time3"],
      "reasoning": "explanation of why these times are optimal"
    }
    `

    try {
      const response = await this.callGemini(prompt)
      const parsed = JSON.parse(response)
      return {
        suggestedTimes: parsed.suggestedTimes || ["9:00 AM", "1:00 PM", "3:00 PM"],
        reasoning: parsed.reasoning || "Standard business hours recommended",
      }
    } catch (error) {
      console.error("Failed to get scheduling suggestions:", error)
      return {
        suggestedTimes: ["9:00 AM", "1:00 PM", "3:00 PM"],
        reasoning: "Standard business hours recommended",
      }
    }
  }

  async estimateServiceCost(
    description,
    duration,
    hourlyRate,
  )



 {
    const prompt = `
    Estimate the cost for this service:
    - Description: ${description}
    - Estimated Duration: ${duration}
    - Professional Hourly Rate: $${hourlyRate}

    Consider:
    - Labor time
    - Potential materials (if applicable)
    - Service complexity
    - Travel time (typically 0.5-1 hour)

    Provide response in JSON format:
    {
      "estimatedCost": number,
      "breakdown": ["item1: $amount", "item2: $amount"],
      "confidence": "high|medium|low"
    }
    `

    try {
      const response = await this.callGemini(prompt)
      const parsed = JSON.parse(response)
      return {
        estimatedCost: parsed.estimatedCost || hourlyRate * 2,
        breakdown: parsed.breakdown || [`Labor: $${hourlyRate * 2}`, "Service fee: $5"],
        confidence: parsed.confidence || "medium",
      }
    } catch (error) {
      console.error("Failed to estimate cost:", error)
      return {
        estimatedCost: hourlyRate * 2,
        breakdown: [`Labor: $${hourlyRate * 2}`, "Service fee: $5"],
        confidence: "medium",
      }
    }
  }

  async generateBookingConfirmation(booking) {
    const prompt = `
    Generate a friendly booking confirmation message for:
    - Service: ${booking.service}
    - Professional: ${booking.professionalName}
    - Date: ${booking.date}
    - Time: ${booking.time}
    - Location: ${booking.address}

    Make it professional, reassuring, and include next steps. Keep it concise.
    `

    try {
      return await this.callGemini(prompt)
    } catch (error) {
      console.error("Failed to generate confirmation:", error)
      return `Your booking has been confirmed! ${booking.professionalName} will provide ${booking.service} service on ${booking.date} at ${booking.time}.`
    }
  }
}

export const aiService = new AIService()
