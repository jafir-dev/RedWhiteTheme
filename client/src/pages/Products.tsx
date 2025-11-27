import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { 
  Coins, 
  ShoppingBag, 
  Search, 
  Filter,
  ArrowLeft,
  Sparkles,
  Tag,
  LogOut,
  Settings
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Product, Coupon } from "@shared/schema";

export default function Products() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: userCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/user"],
    enabled: !!user,
  });

  const unredeemedCoupons = userCoupons.filter(c => !c.isRedeemed);
  
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory && product.inStock;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const getBestCouponForProduct = (product: Product) => {
    return unredeemedCoupons
      .filter(c => c.value <= product.totalPrice)
      .sort((a, b) => b.value - a.value)[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">GPT</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium bg-primary/10 text-primary px-3 py-2 rounded-md">
              Products
            </Link>
            <Link href="/customize" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Customize
            </Link>
          </nav>

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
            {!user && (
              <Button asChild>
                <a href="/api/login">Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Gold & Silver Products</h1>
            <p className="text-muted-foreground">
              Browse our collection of premium gold and silver items
            </p>
          </div>

          {unredeemedCoupons.length > 0 && (
            <Badge variant="secondary" className="self-start md:self-auto px-4 py-2">
              <Tag className="w-4 h-4 mr-2" />
              {unredeemedCoupons.length} coupon{unredeemedCoupons.length > 1 ? "s" : ""} available
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Products will be available soon!"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const applicableCoupon = getBestCouponForProduct(product);
              const discountedPrice = applicableCoupon
                ? Math.max(0, product.totalPrice - applicableCoupon.value)
                : product.totalPrice;
              const isFree = discountedPrice === 0;

              return (
                <Card key={product.id} className="group overflow-hidden" data-testid={`product-card-${product.id}`}>
                  <CardHeader className="p-0">
                    <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Sparkles className="w-16 h-16 text-muted-foreground/30" />
                      )}
                      <Badge 
                        className="absolute top-3 right-3"
                        variant={product.category === "gold" ? "default" : "secondary"}
                      >
                        {product.category}
                      </Badge>
                      {applicableCoupon && (
                        <Badge className="absolute top-3 left-3 bg-green-600">
                          {isFree ? "FREE!" : `Rs ${applicableCoupon.value} off`}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="font-display text-lg mb-1">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {product.weightGrams}g @ Rs {product.pricePerGram}/g
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {applicableCoupon ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {isFree ? "FREE" : `Rs ${discountedPrice.toLocaleString()}`}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            Rs {product.totalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">
                          Rs {product.totalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      asChild
                      data-testid={`button-buy-${product.id}`}
                    >
                      <Link href={`/checkout/${product.id}`}>
                        {isFree ? "Claim Free" : "Buy Now"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
