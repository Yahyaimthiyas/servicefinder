import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Shield, DollarSign, Calendar, Lock } from "lucide-react"








export function PaymentProcessing({
  amount,
  serviceName,
  professionalName,
  onPaymentComplete,
}) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  const platformFee = Math.round(amount * 0.12 * 100) / 100 // 12% platform fee
  const processingFee = Math.round(amount * 0.029 * 100) / 100 // 2.9% processing fee
  const totalAmount = amount + platformFee + processingFee

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`
      onPaymentComplete(paymentId)
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{serviceName}</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Professional: {professionalName}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Amount</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee (12%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee (2.9%)</span>
                <span>${processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="apple-pay">Apple Pay</SelectItem>
                <SelectItem value="google-pay">Google Pay</SelectItem>
              </SelectContent>
            </Select>

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardholder-name">Cardholder Name</Label>
                  <Input
                    id="cardholder-name"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-green-500/20 bg-green-500/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-400">
            <Shield className="h-5 w-5" />
            <div>
              <p className="font-medium">Secure Payment</p>
              <p className="text-sm text-green-300">Your payment information is encrypted and secure</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Protection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Lock className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-medium text-sm">256-bit SSL</p>
            <p className="text-xs text-muted-foreground">Bank-level encryption</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium text-sm">Money-back Guarantee</p>
            <p className="text-xs text-muted-foreground">100% satisfaction</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-500" />
          <div>
            <p className="font-medium text-sm">Flexible Scheduling</p>
            <p className="text-xs text-muted-foreground">Easy rescheduling</p>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handlePayment}
        disabled={isProcessing || (paymentMethod === "card" && (!cardNumber || !expiryDate || !cvv || !cardholderName))}
      >
        {isProcessing ? "Processing Payment..." : `Pay $${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  )
}
