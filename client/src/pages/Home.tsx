import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import FortuneWheel from "@/components/FortuneWheel";
import { Link } from "wouter";
import { 
  Sparkles, 
  Gift, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Ticket,
  ArrowRight,
  Crown,
  Coins
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Prize, Coupon, User } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);

  const { data: prizes = [], isLoading: prizesLoading } = useQuery<Prize[]>({
    queryKey: ["/api/prizes"],
  });

  const { data: userCoupons = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/user"],
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wheel/spin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Spin Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const buySpinsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wheel/buy-spins", { amount: 10 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "2 spins have been added to your account!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      const result = await spinMutation.mutateAsync();
      return result;
    } finally {
      setTimeout(() => setIsSpinning(false), 4100);
    }
  };

  const handleBuySpins = async () => {
    // Show payment prompt
    const confirmed = window.confirm(
      "Buy 2 Spins for ₹10?\n\n(This is a demo - no real payment required)"
    );
    if (confirmed) {
      await buySpinsMutation.mutateAsync();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const activePrizes = prizes.filter(p => p.isActive);
  const unredeemedCoupons = userCoupons.filter(c => !c.isRedeemed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">Golden Fortune</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Products
            </Link>
            <Link href="/customize" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Customize
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin" data-testid="link-admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block" data-testid="text-user-name">
                {user?.firstName || user?.email || "User"}
              </span>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href="/api/logout" data-testid="button-logout">
                <LogOut className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            <span>Welcome back, {user?.firstName || "Champion"}!</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Win Some Gold?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Spin the fortune wheel to unlock exclusive coupons and win amazing gold & silver prizes!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Fortune Wheel Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Fortune Wheel
                </CardTitle>
                <CardDescription>
                  Each spin gives you a chance to win gold, silver, and combo offers!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                {prizesLoading ? (
                  <Skeleton className="w-[400px] h-[400px] rounded-full" />
                ) : (
                  <FortuneWheel
                    prizes={activePrizes}
                    spinsRemaining={user?.spinsRemaining || 0}
                    onSpin={handleSpin}
                    onBuySpins={handleBuySpins}
                    isSpinning={isSpinning}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Coupons */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Your Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {couponsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : unredeemedCoupons.length > 0 ? (
                  <div className="space-y-3">
                    {unredeemedCoupons.slice(0, 3).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`coupon-card-${coupon.id}`}
                      >
                        <div>
                          <code className="font-mono font-semibold text-sm">
                            {coupon.code}
                          </code>
                          <p className="text-xs text-muted-foreground">
                            Rs {coupon.value} off
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                    {unredeemedCoupons.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{unredeemedCoupons.length - 3} more coupons
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Spin the wheel to win coupons!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between" variant="outline" asChild>
                  <Link href="/products" data-testid="link-browse-products">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Browse Products
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button className="w-full justify-between" variant="outline" asChild>
                  <Link href="/customize" data-testid="link-customize-jewelry">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Customize Jewelry
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="font-display text-2xl font-bold text-primary">
                      {user?.totalSpinsUsed || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Spins</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="font-display text-2xl font-bold text-primary">
                      {userCoupons.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Coupons Won</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
