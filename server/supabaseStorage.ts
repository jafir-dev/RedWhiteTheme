import { supabase } from "./lib/supabase";
import type {
  User,
  UpsertUser,
  Prize,
  InsertPrize,
  Coupon,
  InsertCoupon,
  Product,
  InsertProduct,
  Order,
  InsertOrder,
  WheelSpin,
  InsertWheelSpin,
  LoanRequest,
  InsertLoanRequest,
  WheelConfig,
  InsertWheelConfig,
} from "@shared/schema";

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
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  redeemCoupon(id: number): Promise<boolean>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getInStockProducts(): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Wheel operations
  createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin>;
  getUserSpins(userId: string): Promise<WheelSpin[]>;
  getAllSpins(): Promise<WheelSpin[]>;

  // Loan operations
  createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest>;
  getUserLoanRequests(userId: string): Promise<LoanRequest[]>;
  getAllLoanRequests(): Promise<LoanRequest[]>;
  updateLoanRequestStatus(id: number, status: string, adminNotes?: string): Promise<LoanRequest | undefined>;

  // Wheel config
  getWheelConfig(): Promise<WheelConfig | undefined>;
  updateWheelConfig(config: Partial<InsertWheelConfig>): Promise<WheelConfig>;
}

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data as User;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl,
        is_admin: user.isAdmin || false
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to upsert user: ${error?.message}`);
    }

    return this.mapUserFromSupabase(data);
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return (data || []).map(this.mapUserFromSupabase);
  }

  async updateUserSpins(id: string, spinsRemaining: number, totalSpinsUsed: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({
        spins_remaining: spinsRemaining,
        total_spins_used: totalSpinsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromSupabase(data);
  }

  // Prize operations
  async getPrize(id: number): Promise<Prize | undefined> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapPrizeFromSupabase(data);
  }

  async getAllPrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch prizes: ${error.message}`);
    return (data || []).map(this.mapPrizeFromSupabase);
  }

  async getActivePrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active prizes: ${error.message}`);
    return (data || []).map(this.mapPrizeFromSupabase);
  }

  async createPrize(prize: InsertPrize): Promise<Prize> {
    const { data, error } = await supabase
      .from('prizes')
      .insert({
        name: prize.name,
        description: prize.description,
        gold_grams: prize.goldGrams,
        silver_grams: prize.silverGrams,
        value: prize.value,
        probability: prize.probability,
        is_active: prize.isActive
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create prize: ${error?.message}`);
    }

    return this.mapPrizeFromSupabase(data);
  }

  async updatePrize(id: number, prize: Partial<InsertPrize>): Promise<Prize | undefined> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (prize.name !== undefined) updateData.name = prize.name;
    if (prize.description !== undefined) updateData.description = prize.description;
    if (prize.goldGrams !== undefined) updateData.gold_grams = prize.goldGrams;
    if (prize.silverGrams !== undefined) updateData.silver_grams = prize.silverGrams;
    if (prize.value !== undefined) updateData.value = prize.value;
    if (prize.probability !== undefined) updateData.probability = prize.probability;
    if (prize.isActive !== undefined) updateData.is_active = prize.isActive;

    const { data, error } = await supabase
      .from('prizes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapPrizeFromSupabase(data);
  }

  async deletePrize(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('prizes')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Coupon operations
  async getCoupon(id: number): Promise<Coupon | undefined> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapCouponFromSupabase(data);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return undefined;
    return this.mapCouponFromSupabase(data);
  }

  async getUserCoupons(userId: string): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user coupons: ${error.message}`);
    return (data || []).map(this.mapCouponFromSupabase);
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch all coupons: ${error.message}`);
    return (data || []).map(this.mapCouponFromSupabase);
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: coupon.code,
        user_id: coupon.userId,
        prize_id: coupon.prizeId,
        value: coupon.value,
        gold_grams: coupon.goldGrams,
        silver_grams: coupon.silverGrams,
        is_redeemed: coupon.isRedeemed,
        expires_at: coupon.expiresAt?.toISOString()
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create coupon: ${error?.message}`);
    }

    return this.mapCouponFromSupabase(data);
  }

  async redeemCoupon(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('coupons')
      .update({
        is_redeemed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return !error;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapProductFromSupabase(data);
  }

  async getInStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_in_stock', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch in-stock products: ${error.message}`);
    return (data || []).map(this.mapProductFromSupabase);
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch all products: ${error.message}`);
    return (data || []).map(this.mapProductFromSupabase);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        base_price: product.basePrice,
        making_charge: product.makingCharge,
        gst_rate: product.gstRate,
        weight: product.weight,
        purity: product.purity,
        stock_quantity: product.stockQuantity,
        is_in_stock: product.isInStock,
        image_url: product.imageUrl,
        category: product.category
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create product: ${error?.message}`);
    }

    return this.mapProductFromSupabase(data);
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.basePrice !== undefined) updateData.base_price = product.basePrice;
    if (product.makingCharge !== undefined) updateData.making_charge = product.makingCharge;
    if (product.gstRate !== undefined) updateData.gst_rate = product.gstRate;
    if (product.weight !== undefined) updateData.weight = product.weight;
    if (product.purity !== undefined) updateData.purity = product.purity;
    if (product.stockQuantity !== undefined) updateData.stock_quantity = product.stockQuantity;
    if (product.isInStock !== undefined) updateData.is_in_stock = product.isInStock;
    if (product.imageUrl !== undefined) updateData.image_url = product.imageUrl;
    if (product.category !== undefined) updateData.category = product.category;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapProductFromSupabase(data);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapOrderFromSupabase(data);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user orders: ${error.message}`);
    return (data || []).map(this.mapOrderFromSupabase);
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch all orders: ${error.message}`);
    return (data || []).map(this.mapOrderFromSupabase);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        product_id: order.productId,
        coupon_id: order.couponId,
        original_price: order.originalPrice,
        discount_amount: order.discountAmount,
        final_price: order.finalPrice,
        status: order.status,
        shipping_address: order.shippingAddress,
        tracking_number: order.trackingNumber
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create order: ${error?.message}`);
    }

    return this.mapOrderFromSupabase(data);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapOrderFromSupabase(data);
  }

  // Wheel operations
  async createWheelSpin(spin: InsertWheelSpin): Promise<WheelSpin> {
    const { data, error } = await supabase
      .from('wheel_spins')
      .insert({
        user_id: spin.userId,
        prize_id: spin.prizeId,
        coupon_id: spin.couponId,
        spin_result: spin.spinResult
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create wheel spin: ${error?.message}`);
    }

    return this.mapWheelSpinFromSupabase(data);
  }

  async getUserSpins(userId: string): Promise<WheelSpin[]> {
    const { data, error } = await supabase
      .from('wheel_spins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user spins: ${error.message}`);
    return (data || []).map(this.mapWheelSpinFromSupabase);
  }

  async getAllSpins(): Promise<WheelSpin[]> {
    const { data, error } = await supabase
      .from('wheel_spins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch all spins: ${error.message}`);
    return (data || []).map(this.mapWheelSpinFromSupabase);
  }

  // Loan operations
  async createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest> {
    const { data, error } = await supabase
      .from('loan_requests')
      .insert({
        user_id: request.userId,
        gold_weight: request.goldWeight,
        gold_purity: request.goldPurity,
        requested_amount: request.requestedAmount,
        purpose: request.purpose,
        status: request.status,
        admin_notes: request.adminNotes
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create loan request: ${error?.message}`);
    }

    return this.mapLoanRequestFromSupabase(data);
  }

  async getUserLoanRequests(userId: string): Promise<LoanRequest[]> {
    const { data, error } = await supabase
      .from('loan_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user loan requests: ${error.message}`);
    return (data || []).map(this.mapLoanRequestFromSupabase);
  }

  async getAllLoanRequests(): Promise<LoanRequest[]> {
    const { data, error } = await supabase
      .from('loan_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch all loan requests: ${error.message}`);
    return (data || []).map(this.mapLoanRequestFromSupabase);
  }

  async updateLoanRequestStatus(id: number, status: string, adminNotes?: string): Promise<LoanRequest | undefined> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('loan_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapLoanRequestFromSupabase(data);
  }

  // Wheel config
  async getWheelConfig(): Promise<WheelConfig | undefined> {
    const { data, error } = await supabase
      .from('wheel_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) return undefined;
    return this.mapWheelConfigFromSupabase(data);
  }

  async updateWheelConfig(config: Partial<InsertWheelConfig>): Promise<WheelConfig> {
    const { data, error } = await supabase
      .from('wheel_config')
      .update({
        entry_price: config.entryPrice,
        spins_per_entry: config.spinsPerEntry,
        is_active: config.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update wheel config: ${error?.message}`);
    }

    return this.mapWheelConfigFromSupabase(data);
  }

  // Helper mapping functions
  private mapUserFromSupabase(data: any): User {
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      profileImageUrl: data.profile_image_url,
      isAdmin: data.is_admin || false,
      spinsRemaining: data.spins_remaining || 0,
      totalSpinsUsed: data.total_spins_used || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapPrizeFromSupabase(data: any): Prize {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      goldGrams: parseFloat(data.gold_grams) || 0,
      silverGrams: parseFloat(data.silver_grams) || 0,
      value: parseFloat(data.value) || 0,
      probability: parseFloat(data.probability) || 0,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapCouponFromSupabase(data: any): Coupon {
    return {
      id: data.id,
      code: data.code,
      userId: data.user_id,
      prizeId: data.prize_id,
      value: parseFloat(data.value) || 0,
      goldGrams: parseFloat(data.gold_grams) || 0,
      silverGrams: parseFloat(data.silver_grams) || 0,
      isRedeemed: data.is_redeemed,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapProductFromSupabase(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      basePrice: parseFloat(data.base_price) || 0,
      makingCharge: parseFloat(data.making_charge) || 0,
      gstRate: parseFloat(data.gst_rate) || 0,
      totalPrice: parseFloat(data.total_price) || 0,
      weight: parseFloat(data.weight) || 0,
      purity: data.purity || '22K',
      stockQuantity: data.stock_quantity || 0,
      isInStock: data.is_in_stock,
      imageUrl: data.image_url,
      category: data.category || 'gold',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapOrderFromSupabase(data: any): Order {
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      couponId: data.coupon_id,
      originalPrice: parseFloat(data.original_price) || 0,
      discountAmount: parseFloat(data.discount_amount) || 0,
      finalPrice: parseFloat(data.final_price) || 0,
      status: data.status,
      shippingAddress: data.shipping_address,
      trackingNumber: data.tracking_number,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapWheelSpinFromSupabase(data: any): WheelSpin {
    return {
      id: data.id,
      userId: data.user_id,
      prizeId: data.prize_id,
      couponId: data.coupon_id,
      spinResult: data.spin_result,
      createdAt: new Date(data.created_at)
    };
  }

  private mapLoanRequestFromSupabase(data: any): LoanRequest {
    return {
      id: data.id,
      userId: data.user_id,
      goldWeight: parseFloat(data.gold_weight) || 0,
      goldPurity: data.gold_purity || '22K',
      requestedAmount: parseFloat(data.requested_amount) || 0,
      purpose: data.purpose,
      status: data.status,
      adminNotes: data.admin_notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapWheelConfigFromSupabase(data: any): WheelConfig {
    return {
      id: data.id,
      entryPrice: parseFloat(data.entry_price) || 10,
      spinsPerEntry: data.spins_per_entry || 2,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const storage = new SupabaseStorage();