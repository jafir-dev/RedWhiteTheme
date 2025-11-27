import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  spinsRemaining: integer("spins_remaining").default(0),
  totalSpinsUsed: integer("total_spins_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Wheel Prizes configuration
export const prizes = pgTable("prizes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'free_gold', 'free_silver', 'combo', 'discount'
  value: real("value").notNull(), // monetary value in rupees
  goldGrams: real("gold_grams").default(0),
  silverGrams: real("silver_grams").default(0),
  probability: real("probability").notNull().default(10), // percentage (0-100)
  isActive: boolean("is_active").default(true),
  color: varchar("color", { length: 20 }).default("#DC2626"), // wheel segment color
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrizeSchema = createInsertSchema(prizes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPrize = z.infer<typeof insertPrizeSchema>;
export type Prize = typeof prizes.$inferSelect;

// Coupons generated from wheel spins
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prizeId: integer("prize_id").notNull().references(() => prizes.id),
  value: real("value").notNull(),
  goldGrams: real("gold_grams").default(0),
  silverGrams: real("silver_grams").default(0),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
});
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// Products (gold/silver items)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'gold', 'silver', 'jewelry'
  pricePerGram: real("price_per_gram").notNull(),
  weightGrams: real("weight_grams").notNull(),
  totalPrice: real("total_price").notNull(),
  imageUrl: varchar("image_url"),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  couponId: integer("coupon_id").references(() => coupons.id),
  originalPrice: real("original_price").notNull(),
  discountAmount: real("discount_amount").default(0),
  finalPrice: real("final_price").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, completed, cancelled
  paymentIntentId: varchar("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Wheel Spin transactions
export const wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prizeId: integer("prize_id").notNull().references(() => prizes.id),
  couponId: integer("coupon_id").references(() => coupons.id),
  paymentIntentId: varchar("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWheelSpinSchema = createInsertSchema(wheelSpins).omit({
  id: true,
  createdAt: true,
});
export type InsertWheelSpin = z.infer<typeof insertWheelSpinSchema>;
export type WheelSpin = typeof wheelSpins.$inferSelect;

// Jewelry Customization Requests
export const jewelryRequests = pgTable("jewelry_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'customization', 'inquiry'
  imageUrl: text("image_url"),
  description: text("description"),
  goldWeightEstimate: real("gold_weight_estimate"),
  contactPhone: varchar("contact_phone", { length: 20 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, contacted, completed, cancelled
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJewelryRequestSchema = createInsertSchema(jewelryRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJewelryRequest = z.infer<typeof insertJewelryRequestSchema>;
export type JewelryRequest = typeof jewelryRequests.$inferSelect;

// Wheel configuration
export const wheelConfig = pgTable("wheel_config", {
  id: serial("id").primaryKey(),
  entryPrice: real("entry_price").default(10), // rupees
  spinsPerEntry: integer("spins_per_entry").default(2),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWheelConfigSchema = createInsertSchema(wheelConfig).omit({
  id: true,
  updatedAt: true,
});
export type InsertWheelConfig = z.infer<typeof insertWheelConfigSchema>;
export type WheelConfig = typeof wheelConfig.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  coupons: many(coupons),
  orders: many(orders),
  wheelSpins: many(wheelSpins),
  jewelryRequests: many(jewelryRequests),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  user: one(users, {
    fields: [coupons.userId],
    references: [users.id],
  }),
  prize: one(prizes, {
    fields: [coupons.prizeId],
    references: [prizes.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
}));

export const wheelSpinsRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id],
  }),
  prize: one(prizes, {
    fields: [wheelSpins.prizeId],
    references: [prizes.id],
  }),
  coupon: one(coupons, {
    fields: [wheelSpins.couponId],
    references: [coupons.id],
  }),
}));

export const jewelryRequestsRelations = relations(jewelryRequests, ({ one }) => ({
  user: one(users, {
    fields: [jewelryRequests.userId],
    references: [users.id],
  }),
}));
