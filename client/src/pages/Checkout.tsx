import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Coins,
  ArrowLeft,
  ShoppingBag,
  Tag,
  CheckCircle,
  AlertCircle,
  Gift,
  Sparkles,
  LogOut,
  Settings
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Product, Coupon } from "@shared/schema";

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to proceed with checkout.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const { data: userCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/user"],
    enabled: isAuthenticated,
  });

  const unredeemedCoupons = userCoupons.filter(c => !c.isRedeemed);
  const selectedCoupon = unredeemedCoupons.find(c => c.id.toString() === selectedCouponId);
  
  const originalPrice = product?.totalPrice || 0;
  const discountAmount = selectedCoupon ? Math.min(selectedCoupon.value, originalPrice) : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const isFree = finalPrice === 0;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        productId: parseInt(id!),
        couponId: selectedCoupon?.id || null,
      });
      return res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/user"] });
      toast({
        title: isFree ? "Order Claimed!" : "Order Placed!",
        description: isFree 
          ? "Your free item has been claimed successfully!"
          : "Your order has been placed. Payment will be processed.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">GPT</span>
          </Link>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <a href="/api/logout">
                    <LogOut className="w-4 h-4" />
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <div className="relative h-64 bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-20 h-20 text-muted-foreground/30" />
                )}
                <Badge
                  className="absolute top-3 right-3"
                  variant={product.category === "gold" ? "default" : "secondary"}
                >
                  {product.category}
                </Badge>
              </div>
              <CardTitle className="font-display text-2xl">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="text-foreground">{product.weightGrams}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per gram</span>
                  <span className="text-foreground">Rs {product.pricePerGram}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coupon Selection */}
              {unredeemedCoupons.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Apply Coupon
                  </label>
                  <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                    <SelectTrigger data-testid="select-coupon">
                      <SelectValue placeholder="Select a coupon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No coupon</SelectItem>
                      {unredeemedCoupons.map((coupon) => (
                        <SelectItem key={coupon.id} value={coupon.id.toString()}>
                          {coupon.code} - Rs {coupon.value} off
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Original Price</span>
                  <span>Rs {originalPrice.toLocaleString()}</span>
                </div>
                {selectedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Coupon Discount
                    </span>
                    <span>- Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  {isFree ? (
                    <span className="text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      FREE!
                    </span>
                  ) : (
                    <span className="text-primary">Rs {finalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {isFree && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Your coupon covers the full price!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    No payment required
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending}
                data-testid="button-place-order"
              >
                {createOrderMutation.isPending
                  ? "Processing..."
                  : isFree
                  ? "Claim Free Item"
                  : `Pay Rs ${finalPrice.toLocaleString()}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
