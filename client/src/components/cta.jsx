import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Clock, Star } from "lucide-react"
import { Link } from "@/components/link"

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card/50 backdrop-blur border-primary/20 p-8 lg:p-12">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Find Your Perfect Professional?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ServiceFinder for all their service needs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/signup">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
                <Link href="/professionals/join">Join as Professional</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Star className="w-5 h-5 text-primary" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
