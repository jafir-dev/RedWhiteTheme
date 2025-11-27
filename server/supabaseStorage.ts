import { supabase } from "./lib/supabase";
import type { User, Prize, Product, Coupon, Order, JewelryRequest, WheelSpin, WheelConfig } from "@shared/schema";

export interface Storage {
  // User operations
  upsertUser(user: Partial<User> & { id: string }): Promise<void>;
  getUser(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;

  // Prize operations
  getAllPrizes(): Promise<Prize[]>;
  getActivePrizes(): Promise<Prize[]>;
  createPrize(prize: Omit<Prize, "id" | "createdAt">): Promise<Prize>;
  updatePrize(id: number, updates: Partial<Prize>): Promise<Prize>;
  deletePrize(id: number): Promise<void>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getInStockProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Coupon operations
  createCoupon(coupon: Omit<Coupon, "id" | "createdAt">): Promise<Coupon>;
  getCoupon(id: number): Promise<Coupon | null>;
  getCouponByCode(code: string): Promise<Coupon | null>;
  getUserCoupons(userId: string): Promise<Coupon[]>;
  getAllCoupons(): Promise<Coupon[]>;
  redeemCoupon(id: number): Promise<void>;

  // Order operations
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  getOrder(id: number): Promise<Order | null>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Jewelry request operations
  createJewelryRequest(request: Omit<JewelryRequest, "id" | "createdAt">): Promise<JewelryRequest>;
  getUserJewelryRequests(userId: string): Promise<JewelryRequest[]>;
  getAllJewelryRequests(): Promise<JewelryRequest[]>;
  updateJewelryRequestStatus(id: number, status: string, adminNotes?: string): Promise<JewelryRequest>;

  // Wheel operations
  createWheelSpin(spin: Omit<WheelSpin, "id" | "createdAt">): Promise<WheelSpin>;
  getAllSpins(): Promise<WheelSpin[]>;
  updateUserSpins(userId: string, spinsRemaining: number, totalSpinsUsed: number): Promise<void>;

  // Wheel config operations
  getWheelConfig(): Promise<WheelConfig | null>;
  updateWheelConfig(config: Partial<WheelConfig>): Promise<WheelConfig>;
}

class SupabaseStorage implements Storage {
  async upsertUser(user: Partial<User> & { id: string }): Promise<void> {
    // Check if user exists first to handle new user spin allocation
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, spins_remaining')
      .eq('id', user.id)
      .single();

    const isNewUser = !existingUser;

    // For new users, always give 2 free spins
    // For existing users, preserve their current spins unless explicitly provided
    let spinsToSet;
    if (isNewUser) {
      spinsToSet = 2; // New users get 2 free spins
    } else if (user.spinsRemaining !== undefined) {
      spinsToSet = user.spinsRemaining; // Explicit update
    } else {
      spinsToSet = existingUser?.spins_remaining || 0; // Preserve existing
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl,
        is_admin: user.isAdmin || false,
        spins_remaining: spinsToSet,
        total_spins_used: user.totalSpinsUsed || (isNewUser ? 0 : existingUser?.total_spins_used || 0),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url,
      isAdmin: data.is_admin,
      spinsRemaining: data.spins_remaining,
      totalSpinsUsed: data.total_spins_used,
      createdAt: new Date(data.created_at)
    };
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImageUrl: user.profile_image_url,
      isAdmin: user.is_admin,
      spinsRemaining: user.spins_remaining,
      totalSpinsUsed: user.total_spins_used,
      createdAt: new Date(user.created_at)
    }));
  }

  async getAllPrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(prize => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      type: prize.type,
      value: prize.value,
      goldGrams: prize.gold_grams,
      silverGrams: prize.silver_grams,
      probability: prize.probability,
      isActive: prize.is_active,
      createdAt: new Date(prize.created_at)
    }));
  }

  async getActivePrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(prize => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      type: prize.type,
      value: prize.value,
      goldGrams: prize.gold_grams,
      silverGrams: prize.silver_grams,
      probability: prize.probability,
      isActive: prize.is_active,
      createdAt: new Date(prize.created_at)
    }));
  }

  async createPrize(prize: Omit<Prize, "id" | "createdAt">): Promise<Prize> {
    const { data, error } = await supabase
      .from('prizes')
      .insert({
        name: prize.name,
        description: prize.description,
        type: prize.type,
        value: prize.value,
        gold_grams: prize.goldGrams,
        silver_grams: prize.silverGrams,
        probability: prize.probability,
        is_active: prize.isActive
      })
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      goldGrams: data.gold_grams,
      silverGrams: data.silver_grams,
      probability: data.probability,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async updatePrize(id: number, updates: Partial<Prize>): Promise<Prize> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.goldGrams !== undefined) updateData.gold_grams = updates.goldGrams;
    if (updates.silverGrams !== undefined) updateData.silver_grams = updates.silverGrams;
    if (updates.probability !== undefined) updateData.probability = updates.probability;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('prizes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      goldGrams: data.gold_grams,
      silverGrams: data.silver_grams,
      probability: data.probability,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async deletePrize(id: number): Promise<void> {
    const { error } = await supabase
      .from('prizes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.base_price,
      makingCharge: product.making_charge,
      totalPrice: product.total_price,
      weight: product.weight,
      purity: product.purity,
      stock: product.stock,
      imageUrl: product.image_url,
      isActive: product.is_active,
      createdAt: new Date(product.created_at)
    }));
  }

  async getInStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.base_price,
      makingCharge: product.making_charge,
      totalPrice: product.total_price,
      weight: product.weight,
      purity: product.purity,
      stock: product.stock,
      imageUrl: product.image_url,
      isActive: product.is_active,
      createdAt: new Date(product.created_at)
    }));
  }

  async getProduct(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      basePrice: data.base_price,
      makingCharge: data.making_charge,
      totalPrice: data.total_price,
      weight: data.weight,
      purity: data.purity,
      stock: data.stock,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        category: product.category,
        base_price: product.basePrice,
        making_charge: product.makingCharge,
        total_price: product.totalPrice,
        weight: product.weight,
        purity: product.purity,
        stock: product.stock,
        image_url: product.imageUrl,
        is_active: product.isActive
      })
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      basePrice: data.base_price,
      makingCharge: data.making_charge,
      totalPrice: data.total_price,
      weight: data.weight,
      purity: data.purity,
      stock: data.stock,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice;
    if (updates.makingCharge !== undefined) updateData.making_charge = updates.makingCharge;
    if (updates.totalPrice !== undefined) updateData.total_price = updates.totalPrice;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.purity !== undefined) updateData.purity = updates.purity;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      basePrice: data.base_price,
      makingCharge: data.making_charge,
      totalPrice: data.total_price,
      weight: data.weight,
      purity: data.purity,
      stock: data.stock,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createCoupon(coupon: Omit<Coupon, "id" | "createdAt">): Promise<Coupon> {
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

    if (error || !data) throw error;

    return {
      id: data.id,
      code: data.code,
      userId: data.user_id,
      prizeId: data.prize_id,
      value: data.value,
      goldGrams: data.gold_grams,
      silverGrams: data.silver_grams,
      isRedeemed: data.is_redeemed,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async getCoupon(id: number): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      code: data.code,
      userId: data.user_id,
      prizeId: data.prize_id,
      value: data.value,
      goldGrams: data.gold_grams,
      silverGrams: data.silver_grams,
      isRedeemed: data.is_redeemed,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      code: data.code,
      userId: data.user_id,
      prizeId: data.prize_id,
      value: data.value,
      goldGrams: data.gold_grams,
      silverGrams: data.silver_grams,
      isRedeemed: data.is_redeemed,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async getUserCoupons(userId: string): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      userId: coupon.user_id,
      prizeId: coupon.prize_id,
      value: coupon.value,
      goldGrams: coupon.gold_grams,
      silverGrams: coupon.silver_grams,
      isRedeemed: coupon.is_redeemed,
      expiresAt: coupon.expires_at ? new Date(coupon.expires_at) : undefined,
      createdAt: new Date(coupon.created_at)
    }));
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      userId: coupon.user_id,
      prizeId: coupon.prize_id,
      value: coupon.value,
      goldGrams: coupon.gold_grams,
      silverGrams: coupon.silver_grams,
      isRedeemed: coupon.is_redeemed,
      expiresAt: coupon.expires_at ? new Date(coupon.expires_at) : undefined,
      createdAt: new Date(coupon.created_at)
    }));
  }

  async redeemCoupon(id: number): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .update({ is_redeemed: true })
      .eq('id', id);

    if (error) throw error;
  }

  async createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        product_id: order.productId,
        coupon_id: order.couponId,
        original_price: order.originalPrice,
        discount_amount: order.discountAmount,
        final_price: order.finalPrice,
        status: order.status
      })
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      couponId: data.coupon_id,
      originalPrice: data.original_price,
      discountAmount: data.discount_amount,
      finalPrice: data.final_price,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }

  async getOrder(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      couponId: data.coupon_id,
      originalPrice: data.original_price,
      discountAmount: data.discount_amount,
      finalPrice: data.final_price,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(order => ({
      id: order.id,
      userId: order.user_id,
      productId: order.product_id,
      couponId: order.coupon_id,
      originalPrice: order.original_price,
      discountAmount: order.discount_amount,
      finalPrice: order.final_price,
      status: order.status,
      createdAt: new Date(order.created_at)
    }));
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(order => ({
      id: order.id,
      userId: order.user_id,
      productId: order.product_id,
      couponId: order.coupon_id,
      originalPrice: order.original_price,
      discountAmount: order.discount_amount,
      finalPrice: order.final_price,
      status: order.status,
      createdAt: new Date(order.created_at)
    }));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      couponId: data.coupon_id,
      originalPrice: data.original_price,
      discountAmount: data.discount_amount,
      finalPrice: data.final_price,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }

  async createJewelryRequest(request: Omit<JewelryRequest, "id" | "createdAt">): Promise<JewelryRequest> {
    const { data, error } = await supabase
      .from('jewelry_requests')
      .insert({
        user_id: request.userId,
        type: request.type || 'customization',
        image_url: request.imageUrl,
        description: request.description,
        gold_weight_estimate: request.goldWeightEstimate,
        contact_phone: request.contactPhone,
        status: request.status || 'pending',
        admin_notes: request.adminNotes
      })
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      imageUrl: data.image_url,
      description: data.description,
      goldWeightEstimate: data.gold_weight_estimate,
      contactPhone: data.contact_phone,
      status: data.status,
      adminNotes: data.admin_notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async getUserJewelryRequests(userId: string): Promise<JewelryRequest[]> {
    const { data, error } = await supabase
      .from('jewelry_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(request => ({
      id: request.id,
      userId: request.user_id,
      type: request.type,
      imageUrl: request.image_url,
      description: request.description,
      goldWeightEstimate: request.gold_weight_estimate,
      contactPhone: request.contact_phone,
      status: request.status,
      adminNotes: request.admin_notes,
      createdAt: new Date(request.created_at),
      updatedAt: new Date(request.updated_at)
    }));
  }

  async getAllJewelryRequests(): Promise<JewelryRequest[]> {
    const { data, error } = await supabase
      .from('jewelry_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(request => ({
      id: request.id,
      userId: request.user_id,
      type: request.type,
      imageUrl: request.image_url,
      description: request.description,
      goldWeightEstimate: request.gold_weight_estimate,
      contactPhone: request.contact_phone,
      status: request.status,
      adminNotes: request.admin_notes,
      createdAt: new Date(request.created_at),
      updatedAt: new Date(request.updated_at)
    }));
  }

  async updateJewelryRequestStatus(id: number, status: string, adminNotes?: string): Promise<JewelryRequest> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from('jewelry_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      imageUrl: data.image_url,
      description: data.description,
      goldWeightEstimate: data.gold_weight_estimate,
      contactPhone: data.contact_phone,
      status: data.status,
      adminNotes: data.admin_notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async createWheelSpin(spin: Omit<WheelSpin, "id" | "createdAt">): Promise<WheelSpin> {
    const { data, error } = await supabase
      .from('wheel_spins')
      .insert({
        user_id: spin.userId,
        prize_id: spin.prizeId,
        coupon_id: spin.couponId
      })
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      prizeId: data.prize_id,
      couponId: data.coupon_id,
      createdAt: new Date(data.created_at)
    };
  }

  async getAllSpins(): Promise<WheelSpin[]> {
    const { data, error } = await supabase
      .from('wheel_spins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(spin => ({
      id: spin.id,
      userId: spin.user_id,
      prizeId: spin.prize_id,
      couponId: spin.coupon_id,
      createdAt: new Date(spin.created_at)
    }));
  }

  async updateUserSpins(userId: string, spinsRemaining: number, totalSpinsUsed: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        spins_remaining: spinsRemaining,
        total_spins_used: totalSpinsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }

  async getWheelConfig(): Promise<WheelConfig | null> {
    const { data, error } = await supabase
      .from('wheel_config')
      .select('*')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      entryPrice: data.entry_price,
      spinsPerEntry: data.spins_per_entry,
      isActive: data.is_active
    };
  }

  async updateWheelConfig(config: Partial<WheelConfig>): Promise<WheelConfig> {
    const updateData: any = {};
    if (config.entryPrice !== undefined) updateData.entry_price = config.entryPrice;
    if (config.spinsPerEntry !== undefined) updateData.spins_per_entry = config.spinsPerEntry;
    if (config.isActive !== undefined) updateData.is_active = config.isActive;

    // First try to update existing config
    let { data, error } = await supabase
      .from('wheel_config')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    // If no existing config, create one
    if (error && error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('wheel_config')
        .insert({
          entry_price: config.entryPrice || 10,
          spins_per_entry: config.spinsPerEntry || 2,
          is_active: config.isActive !== undefined ? config.isActive : true
        })
        .select()
        .single();

      if (insertError || !newData) throw insertError;
      data = newData;
    } else if (error) {
      throw error;
    }

    return {
      id: data.id,
      entryPrice: data.entry_price,
      spinsPerEntry: data.spins_per_entry,
      isActive: data.is_active
    };
  }
}

export const storage = new SupabaseStorage();