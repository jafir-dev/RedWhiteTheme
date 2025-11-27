import type { Express, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./supabaseStorage";
import { setupSupabaseAuth, isSupabaseAuthenticated } from "./supabaseAuth";
import { insertPrizeSchema, insertProductSchema, insertLoanRequestSchema, insertOrderSchema } from "@shared/schema";

// Generate a random coupon code
function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GF"; // Golden Fortune prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Select a prize based on probability
function selectPrizeByProbability(prizes: any[]): any {
  const activePrizes = prizes.filter(p => p.isActive);
  if (activePrizes.length === 0) return null;

  const totalProb = activePrizes.reduce((sum, p) => sum + (p.probability || 0), 0);
  let random = Math.random() * totalProb;

  for (const prize of activePrizes) {
    random -= prize.probability || 0;
    if (random <= 0) return prize;
  }

  return activePrizes[activePrizes.length - 1];
}

// Helper to get authenticated user
function getAuthUser(req: any): any {
  return req.user;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Supabase Auth
  setupSupabaseAuth(app);

  // ============ AUTH ROUTES ARE NOW IN supabaseAuth.ts ============

  // ============ PRIZE ROUTES ============

  app.get("/api/prizes", async (req, res) => {
    try {
      const prizes = await storage.getAllPrizes();
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/prizes/active", async (req, res) => {
    try {
      const prizes = await storage.getActivePrizes();
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Prize seeding endpoint
  app.post("/api/prizes/seed", async (req, res) => {
    try {
      // Check if prizes already exist
      const existingPrizes = await storage.getAllPrizes();
      if (existingPrizes.length > 0) {
        return res.json({ message: "Prizes already exist", count: existingPrizes.length });
      }

      const samplePrizes = [
        {
          name: "Gold 1 Gram",
          description: "Win 1 gram of pure 24K gold",
          type: "free_gold",
          value: 500,
          goldGrams: 1.0,
          silverGrams: 0,
          probability: 5, // 5% chance
          color: "#DC2626",
          isActive: true
        },
        {
          name: "Silver 5 Grams",
          description: "Win 5 grams of pure silver",
          type: "free_silver",
          value: 300,
          goldGrams: 0,
          silverGrams: 5.0,
          probability: 10, // 10% chance
          color: "#991B1B",
          isActive: true
        },
        {
          name: "Rs 100 Off",
          description: "Get Rs 100 discount on any purchase",
          type: "discount",
          value: 100,
          goldGrams: 0,
          silverGrams: 0,
          probability: 25, // 25% chance
          color: "#FFFFFF",
          isActive: true
        },
        {
          name: "Rs 50 Off",
          description: "Get Rs 50 discount on any purchase",
          type: "discount",
          value: 50,
          goldGrams: 0,
          silverGrams: 0,
          probability: 20, // 20% chance
          color: "#FEE2E2",
          isActive: true
        },
        {
          name: "Gold 0.5 Gram",
          description: "Win 0.5 gram of pure 24K gold",
          type: "free_gold",
          value: 250,
          goldGrams: 0.5,
          silverGrams: 0,
          probability: 8, // 8% chance
          color: "#B91C1C",
          isActive: true
        },
        {
          name: "Silver 2 Grams",
          description: "Win 2 grams of pure silver",
          type: "free_silver",
          value: 120,
          goldGrams: 0,
          silverGrams: 2.0,
          probability: 15, // 15% chance
          color: "#FECACA",
          isActive: true
        },
        {
          name: "Rs 200 Off",
          description: "Get Rs 200 discount on gold items",
          type: "combo",
          value: 200,
          goldGrams: 0,
          silverGrams: 0,
          probability: 3, // 3% chance
          color: "#7F1D1D",
          isActive: true
        },
        {
          name: "Rs 25 Off",
          description: "Get Rs 25 discount on any purchase",
          type: "discount",
          value: 25,
          goldGrams: 0,
          silverGrams: 0,
          probability: 14, // 14% chance
          color: "#FEF2F2",
          isActive: true
        }
      ];

      const createdPrizes = [];
      for (const prize of samplePrizes) {
        const created = await storage.createPrize(prize);
        createdPrizes.push(created);
      }

      res.json({
        message: "Sample prizes created successfully",
        count: createdPrizes.length,
        prizes: createdPrizes
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product seeding endpoint
  app.post("/api/products/seed", async (req, res) => {
    try {
      // Check if products already exist
      const existingProducts = await storage.getAllProducts();
      if (existingProducts.length > 0) {
        return res.json({ message: "Products already exist", count: existingProducts.length });
      }

      const sampleProducts = [
        {
          name: "24K Gold Coin - 1 Gram",
          description: "Pure 24 karat gold coin with elegant design, perfect for investment and gifting",
          category: "gold",
          pricePerGram: 5500,
          weightGrams: 1.0,
          totalPrice: 5500,
          imageUrl: null,
          inStock: true
        },
        {
          name: "22K Gold Necklace - 10 Grams",
          description: "Traditional 22 karat gold necklace with intricate craftsmanship",
          category: "jewelry",
          pricePerGram: 5200,
          weightGrams: 10.0,
          totalPrice: 52000,
          imageUrl: null,
          inStock: true
        },
        {
          name: "24K Gold Bangle - 15 Grams",
          description: "Elegant gold bangle with modern design, suitable for daily wear",
          category: "jewelry",
          pricePerGram: 5400,
          weightGrams: 15.0,
          totalPrice: 81000,
          imageUrl: null,
          inStock: true
        },
        {
          name: "Silver Coin - 50 Grams",
          description: "Pure silver coin with antique finish, excellent investment choice",
          category: "silver",
          pricePerGram: 75,
          weightGrams: 50.0,
          totalPrice: 3750,
          imageUrl: null,
          inStock: true
        },
        {
          name: "925 Silver Chain - 25 Grams",
          description: "Sterling silver chain with durable links and polished finish",
          category: "jewelry",
          pricePerGram: 85,
          weightGrams: 25.0,
          totalPrice: 2125,
          imageUrl: null,
          inStock: true
        },
        {
          name: "24K Gold Ring - 5 Grams",
          description: "Classic gold ring with comfortable fit and timeless design",
          category: "jewelry",
          pricePerGram: 5600,
          weightGrams: 5.0,
          totalPrice: 28000,
          imageUrl: null,
          inStock: true
        },
        {
          name: "Silver Anklet - 20 Grams",
          description: "Traditional silver anklet with beautiful patterns",
          category: "jewelry",
          pricePerGram: 80,
          weightGrams: 20.0,
          totalPrice: 1600,
          imageUrl: null,
          inStock: true
        },
        {
          name: "24K Gold Bar - 50 Grams",
          description: "Investment grade gold bar with purity certification",
          category: "gold",
          pricePerGram: 5450,
          weightGrams: 50.0,
          totalPrice: 272500,
          imageUrl: null,
          inStock: true
        }
      ];

      const createdProducts = [];
      for (const product of sampleProducts) {
        const created = await storage.createProduct(product);
        createdProducts.push(created);
      }

      res.json({
        message: "Sample products created successfully",
        count: createdProducts.length,
        products: createdProducts
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ WHEEL CONFIG ROUTES ============

  app.get("/api/wheel/config", async (req, res) => {
    try {
      let config = await storage.getWheelConfig();
      if (!config) {
        config = await storage.updateWheelConfig({ entryPrice: 10, spinsPerEntry: 2, isActive: true });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ WHEEL SPIN ROUTES ============

  app.post("/api/wheel/buy-spins", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const user = await storage.getUser(claims.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Mock payment processing - in real app, verify payment with Stripe/Razorpay
      const spinsToAdd = 2;
      await storage.updateUserSpins(
        user.id,
        (user.spinsRemaining || 0) + spinsToAdd,
        user.totalSpinsUsed || 0
      );

      res.json({ 
        success: true, 
        message: "Spins purchased successfully",
        spinsAdded: spinsToAdd,
        newSpinCount: (user.spinsRemaining || 0) + spinsToAdd
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wheel/spin", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const user = await storage.getUser(claims.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if ((user.spinsRemaining || 0) <= 0) {
        return res.status(400).json({ message: "No spins remaining. Please purchase more spins." });
      }

      const prizes = await storage.getActivePrizes();
      if (prizes.length === 0) {
        return res.status(400).json({ message: "No prizes available" });
      }

      const selectedPrize = selectPrizeByProbability(prizes);
      if (!selectedPrize) {
        return res.status(400).json({ message: "Failed to select prize" });
      }

      // Generate coupon
      const couponCode = generateCouponCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const coupon = await storage.createCoupon({
        code: couponCode,
        userId: user.id,
        prizeId: selectedPrize.id,
        value: selectedPrize.value,
        goldGrams: selectedPrize.goldGrams || 0,
        silverGrams: selectedPrize.silverGrams || 0,
        isRedeemed: false,
        expiresAt,
      });

      // Record the spin
      await storage.createWheelSpin({
        userId: user.id,
        prizeId: selectedPrize.id,
        couponId: coupon.id,
      });

      // Update user spins
      await storage.updateUserSpins(
        user.id,
        (user.spinsRemaining || 0) - 1,
        (user.totalSpinsUsed || 0) + 1
      );

      res.json({ prize: selectedPrize, coupon });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ COUPON ROUTES ============

  app.get("/api/coupons/user", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const coupons = await storage.getUserCoupons(claims.id);
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/coupons/validate/:code", isSupabaseAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      if (coupon.isRedeemed) {
        return res.status(400).json({ message: "Coupon already redeemed" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Coupon expired" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ PRODUCT ROUTES ============

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getInStockProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ORDER ROUTES ============

  app.post("/api/orders", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const { productId, couponId } = req.body;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let discountAmount = 0;
      if (couponId) {
        const coupon = await storage.getCoupon(couponId);
        if (coupon && !coupon.isRedeemed && coupon.userId === claims.id) {
          discountAmount = Math.min(coupon.value, product.totalPrice);
          await storage.redeemCoupon(couponId);
        }
      }

      const finalPrice = Math.max(0, product.totalPrice - discountAmount);

      const order = await storage.createOrder({
        userId: claims.id,
        productId,
        couponId: couponId || null,
        originalPrice: product.totalPrice,
        discountAmount,
        finalPrice,
        status: finalPrice === 0 ? "paid" : "pending", // Free orders are auto-paid
      });

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/user", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const orders = await storage.getUserOrders(claims.sub);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ LOAN REQUEST ROUTES ============

  app.post("/api/loan-requests", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const validated = insertLoanRequestSchema.parse({
        ...req.body,
        userId: claims.id,
      });
      const request = await storage.createLoanRequest(validated);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/loan-requests/user", isSupabaseAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const requests = await storage.getUserLoanRequests(claims.sub);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ADMIN ROUTES ============

  // Admin middleware
  const isAdmin = async (req: any, res: Response, next: NextFunction) => {
    const claims = getAuthUser(req);
    if (!claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(claims.id);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Admin Users
  app.get("/api/admin/users", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Prizes
  app.post("/api/admin/prizes", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertPrizeSchema.parse(req.body);
      const prize = await storage.createPrize(validated);
      res.json(prize);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/prizes/:id", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const prize = await storage.updatePrize(parseInt(req.params.id), req.body);
      res.json(prize);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/prizes/:id", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePrize(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Products
  app.post("/api/admin/products", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/products/:id", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/products/:id", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Orders
  app.get("/api/admin/orders", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(parseInt(req.params.id), req.body.status);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Coupons
  app.get("/api/admin/coupons", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Spins
  app.get("/api/admin/spins", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const spins = await storage.getAllSpins();
      res.json(spins);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Loan Requests
  app.get("/api/admin/loan-requests", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllLoanRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/loan-requests/:id/status", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const request = await storage.updateLoanRequestStatus(
        parseInt(req.params.id),
        req.body.status,
        req.body.adminNotes
      );
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Wheel Config
  app.patch("/api/admin/wheel/config", isSupabaseAuthenticated, isAdmin, async (req, res) => {
    try {
      const config = await storage.updateWheelConfig(req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
