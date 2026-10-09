import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Zap, Paintbrush, Hammer, Car, Laptop, Scissors, Camera, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Wrench,
    title: "Plumbing",
    description: "Emergency repairs, installations, and maintenance",
    professionals: 1200,
    avgPrice: "$75/hr",
    rating: 4.8,
    popular: true,
  },
  {
    icon: Zap,
    title: "Electrical",
    description: "Wiring, repairs, and electrical installations",
    professionals: 890,
    avgPrice: "$85/hr",
    rating: 4.9,
    popular: true,
  },
  {
    icon: Paintbrush,
    title: "Painting",
    description: "Interior and exterior painting services",
    professionals: 650,
    avgPrice: "$45/hr",
    rating: 4.7,
    popular: false,
  },
  {
    icon: Hammer,
    title: "Handyman",
    description: "General repairs and home improvements",
    professionals: 1500,
    avgPrice: "$55/hr",
    rating: 4.6,
    popular: true,
  },
  {
    icon: Car,
    title: "Auto Repair",
    description: "Car maintenance and repair services",
    professionals: 420,
    avgPrice: "$95/hr",
    rating: 4.8,
    popular: false,
  },
  {
    icon: Laptop,
    title: "Tech Support",
    description: "Computer and device repair services",
    professionals: 380,
    avgPrice: "$65/hr",
    rating: 4.5,
    popular: false,
  },
  {
    icon: Scissors,
    title: "Cleaning",
    description: "Home and office cleaning services",
    professionals: 950,
    avgPrice: "$35/hr",
    rating: 4.7,
    popular: true,
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Event and portrait photography",
    professionals: 280,
    avgPrice: "$125/hr",
    rating: 4.9,
    popular: false,
  },
]

export function FeaturedServices() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Popular Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our most requested services and find the perfect professional for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {service.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Professionals:</span>
                      <span className="font-medium">{service.professionals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Price:</span>
                      <span className="font-medium">{service.avgPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">⭐ {service.rating}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary/10">
                    View Professionals
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline">
            View All Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
