import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    avatar: "/professional-woman.png",
    rating: 5,
    content:
      "Found an amazing electrician through ServiceFinder. The booking process was seamless and the work was completed perfectly. Highly recommend!",
    service: "Electrical Work",
  },
  {
    name: "Mike Chen",
    role: "Business Owner",
    avatar: "/man-business.jpg",
    rating: 5,
    content:
      "As a restaurant owner, I need reliable plumbing services. ServiceFinder connected me with professionals who understand commercial needs.",
    service: "Plumbing",
  },
  {
    name: "Emily Rodriguez",
    role: "Property Manager",
    avatar: "/woman-manager.jpg",
    rating: 5,
    content:
      "Managing multiple properties is challenging, but ServiceFinder makes finding trusted contractors so much easier. The AI recommendations are spot-on.",
    service: "General Contracting",
  },
  {
    name: "David Thompson",
    role: "Homeowner",
    avatar: "/man-homeowner.jpg",
    rating: 5,
    content:
      "The quality of professionals on this platform is outstanding. Every service I've booked has exceeded my expectations.",
    service: "Home Cleaning",
  },
  {
    name: "Lisa Park",
    role: "Small Business Owner",
    avatar: "/woman-entrepreneur.jpg",
    rating: 5,
    content:
      "ServiceFinder helped me find a reliable IT support professional for my startup. The verification process gives me confidence in the quality.",
    service: "Tech Support",
  },
  {
    name: "James Wilson",
    role: "Contractor",
    avatar: "/man-contractor.jpg",
    rating: 5,
    content:
      "As a professional on the platform, I love how it connects me with quality clients. The booking system is efficient and payments are secure.",
    service: "Professional Experience",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect service professional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 text-pretty">"{testimonial.content}"</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{testimonial.service}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
