import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPayment: (paymentMethod: string) => void;
  isProcessing?: boolean;
}

export default function PaymentModal({
  open,
  onOpenChange,
  onConfirmPayment,
  isProcessing = false,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleConfirm = () => {
    if (selectedMethod) {
      setPaymentComplete(true);
      setTimeout(() => {
        onConfirmPayment(selectedMethod);
        setPaymentComplete(false);
        setSelectedMethod("");
        onOpenChange(false);
      }, 1500);
    }
  };

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      description: "Pay via Google Pay, PhonePe, Paytm",
      icon: "📱",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      icon: "💳",
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      description: "PayPal, Apple Pay, Samsung Pay",
      icon: "👛",
    },
    {
      id: "bank",
      name: "Net Banking",
      description: "Direct bank transfer",
      icon: "🏦",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Purchase Spins</DialogTitle>
          <DialogDescription>
            Get 2 more spins on the Fortune Wheel
          </DialogDescription>
        </DialogHeader>

        {paymentComplete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-green-600">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">
                2 spins have been added to your account
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Amount to Pay</span>
                  <Badge variant="secondary">2 Spins</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-primary">₹10</span>
                  <span className="text-sm text-muted-foreground">Only</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <p className="text-sm font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Your payment is secure and encrypted
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || paymentComplete}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod || isProcessing || paymentComplete}
          >
            {isProcessing ? "Processing..." : "Pay ₹10"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
