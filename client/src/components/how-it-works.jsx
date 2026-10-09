import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, UserCheck, Calendar, Star } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search & Browse",
    description: "Find professionals in your area using our smart search and AI-powered recommendations",
    step: "01",
  },
  {
    icon: UserCheck,
    title: "Compare & Choose",
    description: "Review profiles, ratings, and prices to select the perfect professional for your needs",
    step: "02",
  },
  {
    icon: Calendar,
    title: "Book & Schedule",
    description: "Schedule your service at a convenient time with instant booking confirmation",
    step: "03",
  },
  {
    icon: Star,
    title: "Get Service & Review",
    description: "Receive quality service and share your experience to help others in the community",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting the help you need is simple with our streamlined process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <Card className="text-center h-full bg-card/30 backdrop-blur border-dashed">
                  <CardHeader className="pb-4">
                    <div className="relative mx-auto mb-4">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {step.step}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border z-0"
                    style={{ width: "calc(100% - 2rem)" }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
