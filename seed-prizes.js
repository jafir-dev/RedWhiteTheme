// Prize seeding script for the fortune wheel
// Run this with: node seed-prizes.js

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

console.log("🎰 Fortune Wheel Prize Seeding Script");
console.log("=====================================");
console.log();
console.log("This script will seed the prizes table with sample data for the fortune wheel.");
console.log("You can use the following API endpoint to seed prizes:");
console.log();
console.log("POST /api/prizes/seed");
console.log();
console.log("Sample JSON response:");
console.log(JSON.stringify({
  message: "Sample prizes created successfully",
  count: 8,
  prizes: samplePrizes
}, null, 2));
console.log();
console.log("Alternatively, you can run this SQL directly in your Supabase dashboard:");
console.log();
samplePrizes.forEach((prize, index) => {
  console.log(`-- Prize ${index + 1}: ${prize.name}`);
  console.log(`INSERT INTO prizes (name, description, type, value, gold_grams, silver_grams, probability, color, is_active, created_at, updated_at)`);
  console.log(`VALUES ('${prize.name}', '${prize.description}', '${prize.type}', ${prize.value}, ${prize.goldGrams}, ${prize.silverGrams}, ${prize.probability}, '${prize.color}', ${prize.isActive}, NOW(), NOW());`);
  console.log();
});

console.log("✅ Prize seeding instructions complete!");
console.log("💡 Tip: Make sure your Supabase connection is properly configured in the server environment variables.");