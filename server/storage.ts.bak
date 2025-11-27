import {
  users,
  prizes,
  coupons,
  products,
  orders,
  wheelSpins,
  loanRequests,
  wheelConfig,
  type User,
  type UpsertUser,
  type Prize,
  type InsertPrize,
  type Coupon,
  type InsertCoupon,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type WheelSpin,
  type InsertWheelSpin,
  type LoanRequest,
  type InsertLoanRequest,
  type WheelConfig,
  type InsertWheelConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserSpins(id: string, spinsRemaining: number, totalSpinsUsed: number): Promise<User | undefined>;

  // Prize operations
  getPrize(id: number): Promise<Prize | undefined>;
  getAllPrizes(): Promise<Prize[]>;
  getActivePrizes(): Promise<Prize[]>;
  createPrize(prize: InsertPrize): Promise<Prize>;
  updatePrize(id: number, prize: Partial<InsertPrize>): Promise<Prize | undefined>;
  deletePrize(id: number): Promise<boolean>;

  // Coupon operations
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getUserCoupons(userId: string): Promise<Coupon[]>;
  getUnredeemedUserCoupons(userId: string): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  redeemCoupon(id: number): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getInStockProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Wheel Spin operations
  createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin>;
  getUserSpins(userId: string): Promise<WheelSpin[]>;
  getAllSpins(): Promise<WheelSpin[]>;

  // Loan Request operations
  getLoanRequest(id: number): Promise<LoanRequest | undefined>;
  getUserLoanRequests(userId: string): Promise<LoanRequest[]>;
  getAllLoanRequests(): Promise<LoanRequest[]>;
  createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest>;
  updateLoanRequestStatus(id: number, status: string, adminNotes?: string): Promise<LoanRequest | undefined>;

  // Wheel Config operations
  getWheelConfig(): Promise<WheelConfig | undefined>;
  updateWheelConfig(config: Partial<InsertWheelConfig>): Promise<WheelConfig>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserSpins(id: string, spinsRemaining: number, totalSpinsUsed: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ spinsRemaining, totalSpinsUsed, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Prize operations
  async getPrize(id: number): Promise<Prize | undefined> {
    const [prize] = await db.select().from(prizes).where(eq(prizes.id, id));
    return prize;
  }

  async getAllPrizes(): Promise<Prize[]> {
    return await db.select().from(prizes).orderBy(desc(prizes.createdAt));
  }

  async getActivePrizes(): Promise<Prize[]> {
    return await db.select().from(prizes).where(eq(prizes.isActive, true));
  }

  async createPrize(prize: InsertPrize): Promise<Prize> {
    const [newPrize] = await db.insert(prizes).values(prize).returning();
    return newPrize;
  }

  async updatePrize(id: number, prize: Partial<InsertPrize>): Promise<Prize | undefined> {
    const [updatedPrize] = await db
      .update(prizes)
      .set({ ...prize, updatedAt: new Date() })
      .where(eq(prizes.id, id))
      .returning();
    return updatedPrize;
  }

  async deletePrize(id: number): Promise<boolean> {
    const result = await db.delete(prizes).where(eq(prizes.id, id));
    return true;
  }

  // Coupon operations
  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async getUserCoupons(userId: string): Promise<Coupon[]> {
    return await db.select().from(coupons).where(eq(coupons.userId, userId)).orderBy(desc(coupons.createdAt));
  }

  async getUnredeemedUserCoupons(userId: string): Promise<Coupon[]> {
    return await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.userId, userId), eq(coupons.isRedeemed, false)))
      .orderBy(desc(coupons.createdAt));
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async redeemCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db
      .update(coupons)
      .set({ isRedeemed: true, redeemedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getInStockProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.inStock, true));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Wheel Spin operations
  async createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin> {
    const [newSpin] = await db.insert(wheelSpins).values(spin).returning();
    return newSpin;
  }

  async getUserSpins(userId: string): Promise<WheelSpin[]> {
    return await db.select().from(wheelSpins).where(eq(wheelSpins.userId, userId)).orderBy(desc(wheelSpins.createdAt));
  }

  async getAllSpins(): Promise<WheelSpin[]> {
    return await db.select().from(wheelSpins).orderBy(desc(wheelSpins.createdAt));
  }

  // Loan Request operations
  async getLoanRequest(id: number): Promise<LoanRequest | undefined> {
    const [request] = await db.select().from(loanRequests).where(eq(loanRequests.id, id));
    return request;
  }

  async getUserLoanRequests(userId: string): Promise<LoanRequest[]> {
    return await db.select().from(loanRequests).where(eq(loanRequests.userId, userId)).orderBy(desc(loanRequests.createdAt));
  }

  async getAllLoanRequests(): Promise<LoanRequest[]> {
    return await db.select().from(loanRequests).orderBy(desc(loanRequests.createdAt));
  }

  async createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest> {
    const [newRequest] = await db.insert(loanRequests).values(request).returning();
    return newRequest;
  }

  async updateLoanRequestStatus(id: number, status: string, adminNotes?: string): Promise<LoanRequest | undefined> {
    const [request] = await db
      .update(loanRequests)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(loanRequests.id, id))
      .returning();
    return request;
  }

  // Wheel Config operations
  async getWheelConfig(): Promise<WheelConfig | undefined> {
    const [config] = await db.select().from(wheelConfig).limit(1);
    return config;
  }

  async updateWheelConfig(config: Partial<InsertWheelConfig>): Promise<WheelConfig> {
    const existing = await this.getWheelConfig();
    if (existing) {
      const [updated] = await db
        .update(wheelConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(wheelConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newConfig] = await db.insert(wheelConfig).values(config as InsertWheelConfig).returning();
      return newConfig;
    }
  }
}

export const storage = new DatabaseStorage();
