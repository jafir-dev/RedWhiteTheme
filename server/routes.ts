import type { Express, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupMockAuth, isMockAuthenticated } from "./mockAuth";
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
  
  // Setup Mock Auth
  setupMockAuth(app);

  // ============ AUTH ROUTES ARE NOW IN mockAuth.ts ============

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

  app.post("/api/wheel/buy-spins", isMockAuthenticated, async (req, res) => {
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

  app.post("/api/wheel/spin", isMockAuthenticated, async (req, res) => {
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

  app.get("/api/coupons/user", isMockAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const coupons = await storage.getUserCoupons(claims.sub);
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/coupons/validate/:code", isMockAuthenticated, async (req, res) => {
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

  app.post("/api/orders", isMockAuthenticated, async (req, res) => {
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

  app.get("/api/orders/user", isMockAuthenticated, async (req, res) => {
    try {
      const claims = getAuthUser(req);
      const orders = await storage.getUserOrders(claims.sub);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ LOAN REQUEST ROUTES ============

  app.post("/api/loan-requests", isMockAuthenticated, async (req, res) => {
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

  app.get("/api/loan-requests/user", isMockAuthenticated, async (req, res) => {
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
  app.get("/api/admin/users", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Prizes
  app.post("/api/admin/prizes", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertPrizeSchema.parse(req.body);
      const prize = await storage.createPrize(validated);
      res.json(prize);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/prizes/:id", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const prize = await storage.updatePrize(parseInt(req.params.id), req.body);
      res.json(prize);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/prizes/:id", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePrize(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Products
  app.post("/api/admin/products", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/products/:id", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/products/:id", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Orders
  app.get("/api/admin/orders", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(parseInt(req.params.id), req.body.status);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Coupons
  app.get("/api/admin/coupons", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Spins
  app.get("/api/admin/spins", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const spins = await storage.getAllSpins();
      res.json(spins);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Loan Requests
  app.get("/api/admin/loan-requests", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllLoanRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/loan-requests/:id/status", isMockAuthenticated, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/wheel/config", isMockAuthenticated, isAdmin, async (req, res) => {
    try {
      const config = await storage.updateWheelConfig(req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
