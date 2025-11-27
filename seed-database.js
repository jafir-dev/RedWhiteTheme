// Complete database seeding script
// Run with: node seed-database.js

// Sample prizes for fortune wheel
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

// Sample products
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

console.log("🏆 Complete Database Seeding Script");
console.log("===================================");
console.log();
console.log("This script provides SQL commands to seed your Supabase database with:");
console.log("✅ 8 Fortune wheel prizes");
console.log("✅ 8 Sample products");
console.log("✅ Default wheel configuration");
console.log("✅ Admin account creation instructions");
console.log();

console.log("🎰 FORTUNE WHEEL PRIZES");
console.log("========================");
samplePrizes.forEach((prize, index) => {
  console.log(`-- Prize ${index + 1}: ${prize.name}`);
  console.log(`INSERT INTO prizes (name, description, type, value, gold_grams, silver_grams, probability, color, is_active, created_at, updated_at)`);
  console.log(`VALUES ('${prize.name}', '${prize.description}', '${prize.type}', ${prize.value}, ${prize.goldGrams}, ${prize.silverGrams}, ${prize.probability}, '${prize.color}', ${prize.isActive}, NOW(), NOW());`);
  console.log();
});

console.log("🛍️ SAMPLE PRODUCTS");
console.log("===================");
sampleProducts.forEach((product, index) => {
  console.log(`-- Product ${index + 1}: ${product.name}`);
  console.log(`INSERT INTO products (name, description, category, price_per_gram, weight_grams, total_price, image_url, in_stock, created_at, updated_at)`);
  console.log(`VALUES ('${product.name}', '${product.description}', '${product.category}', ${product.pricePerGram}, ${product.weightGrams}, ${product.totalPrice}, ${product.imageUrl}, ${product.inStock}, NOW(), NOW());`);
  console.log();
});

console.log("⚙️ WHEEL CONFIGURATION");
console.log("=====================");
console.log(`-- Default wheel configuration`);
console.log(`INSERT INTO wheel_config (entry_price, spins_per_entry, is_active, updated_at)`);
console.log(`VALUES (10, 2, true, NOW());`);
console.log();

console.log("👑 ADMIN ACCOUNT CREATION");
console.log("=========================");
console.log();
console.log("To create an admin account, you have two options:");
console.log();
console.log("OPTION 1: Through Supabase Dashboard (Recommended)");
console.log("1. Go to your Supabase dashboard → Table Editor");
console.log("2. Open the 'users' table");
console.log("3. Click 'Insert row' and add:");
console.log("   email: admin@gptjewels.com");
console.log("   first_name: Admin");
console.log("   last_name: User");
console.log("   is_admin: true");
console.log("   spins_remaining: 10");
console.log("   total_spins_used: 0");
console.log();
console.log("OPTION 2: SQL Command");
console.log("INSERT INTO users (email, first_name, last_name, is_admin, spins_remaining, total_spins_used, created_at, updated_at)");
console.log("VALUES ('admin@gptjewels.com', 'Admin', 'User', true, 10, 0, NOW(), NOW());");
console.log();
console.log("🔐 ADMIN LOGIN DETAILS");
console.log("=======================");
console.log("Email: admin@gptjewels.com");
console.log("Password: (Set through Supabase Auth or your app's registration)");
console.log();
console.log("After creating the admin account:");
console.log("1. Register this email through your app's signup process");
console.log("2. Or set the password directly in Supabase Auth dashboard");
console.log();
console.log("🚀 API ENDPOINTS FOR SEEDING");
console.log("=============================");
console.log("If your server is running, you can also use these API endpoints:");
console.log();
console.log("POST /api/prizes/seed");
console.log("POST /api/products/seed");
console.log();
console.log("Use curl or Postman to call these endpoints.");
console.log();
console.log("✅ Seeding instructions complete!");