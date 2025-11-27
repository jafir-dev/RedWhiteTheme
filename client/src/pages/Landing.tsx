import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Gift, Shield, Coins, ChevronRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.1),transparent_50%)]" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Win Real Gold & Silver Prizes</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Spin the Fortune Wheel
            <span className="block text-primary mt-2">Win Amazing Prizes</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Pay just <span className="text-foreground font-semibold">Rs 10</span> for{" "}
            <span className="text-foreground font-semibold">2 spins</span> and unlock exclusive coupons 
            for gold jewelry, silver coins, and combo offers!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href="/api/login" data-testid="button-login-hero">
                Start Spinning Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <a href="#how-it-works" data-testid="link-how-it-works">
                How It Works
              </a>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span>Instant Coupons</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <span>Real Gold Prizes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to start winning gold and silver prizes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-visible">
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl">
                1
              </div>
              <CardContent className="pt-10 pb-8 px-6">
                <h3 className="font-display font-semibold text-xl mb-3">Sign Up & Pay</h3>
                <p className="text-muted-foreground">
                  Create your account and pay just Rs 10 to get 2 spins on our fortune wheel.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-visible">
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl">
                2
              </div>
              <CardContent className="pt-10 pb-8 px-6">
                <h3 className="font-display font-semibold text-xl mb-3">Spin the Wheel</h3>
                <p className="text-muted-foreground">
                  Use your 2 spins to win exciting prizes including free gold, silver coins, and combo offers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-visible">
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl">
                3
              </div>
              <CardContent className="pt-10 pb-8 px-6">
                <h3 className="font-display font-semibold text-xl mb-3">Redeem Your Prize</h3>
                <p className="text-muted-foreground">
                  Use your coupon code at checkout. If your coupon covers the full price, pay nothing!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Prize Examples Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Win These Prizes
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Our fortune wheel is loaded with valuable gold and silver prizes
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">1 Gram Gold</h3>
                <p className="text-muted-foreground text-sm">Free gold coin worth Rs 6,000+</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">1 Gram Silver</h3>
                <p className="text-muted-foreground text-sm">Free silver coin worth Rs 100+</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Combo Offers</h3>
                <p className="text-muted-foreground text-sm">Buy gold, get silver free!</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Discount Coupons</h3>
                <p className="text-muted-foreground text-sm">Save on your next purchase</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Win Gold & Silver?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of lucky winners. Sign up now and start your fortune wheel journey!
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6"
            asChild
          >
            <a href="/api/login" data-testid="button-login-cta">
              Get Started for Rs 10
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl">Golden Fortune</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Secure Payments</span>
              <span>100% Genuine Gold & Silver</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Golden Fortune. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
