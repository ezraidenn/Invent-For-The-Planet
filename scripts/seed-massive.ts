import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import {
  users,
  listings,
  batches,
  centers,
  centerPrices,
  priceHistory,
  transactions,
  transactionItems,
  notifications,
} from "../lib/db/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL!;
const client = neon(DATABASE_URL);
const db = drizzle(client);

// ═══════════════════════════════════════════════════════════════
// Helper utilities
// ═══════════════════════════════════════════════════════════════

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}
function uuid() {
  return crypto.randomUUID();
}

// ═══════════════════════════════════════════════════════════════
// Real Yucatán / Mexico coordinates
// ═══════════════════════════════════════════════════════════════

const MERIDA_CENTER = { lat: 20.9674, lng: -89.5926 };

const ZONES = [
  { name: "Centro Histórico", lat: 20.9674, lng: -89.5926, r: 0.015 },
  { name: "Altabrisa", lat: 20.9891, lng: -89.5805, r: 0.012 },
  { name: "Gran Plaza", lat: 20.9520, lng: -89.6200, r: 0.015 },
  { name: "Caucel", lat: 20.9700, lng: -89.6680, r: 0.020 },
  { name: "Kanasín", lat: 20.9330, lng: -89.5600, r: 0.018 },
  { name: "Chuburná", lat: 20.9550, lng: -89.5800, r: 0.010 },
  { name: "García Ginerés", lat: 20.9750, lng: -89.6100, r: 0.010 },
  { name: "Montecristo", lat: 20.9950, lng: -89.6050, r: 0.008 },
  { name: "Progreso", lat: 21.2820, lng: -89.6630, r: 0.015 },
  { name: "Uman", lat: 20.8890, lng: -89.7440, r: 0.012 },
  { name: "Conkal", lat: 21.0730, lng: -89.5230, r: 0.010 },
  { name: "Tizimín", lat: 21.1428, lng: -88.1650, r: 0.012 },
  { name: "Valladolid", lat: 20.6894, lng: -88.2014, r: 0.010 },
  { name: "Cancún Centro", lat: 21.1619, lng: -86.8515, r: 0.020 },
  { name: "Cancún Hotel Zone", lat: 21.1344, lng: -86.7488, r: 0.015 },
  { name: "Playa del Carmen", lat: 20.6296, lng: -87.0739, r: 0.012 },
];

function coordInZone(zone: typeof ZONES[0]) {
  return {
    lat: zone.lat + (Math.random() - 0.5) * 2 * zone.r,
    lng: zone.lng + (Math.random() - 0.5) * 2 * zone.r,
  };
}

// ═══════════════════════════════════════════════════════════════
// Material types and realistic MXN prices (researched)
// ═══════════════════════════════════════════════════════════════

type MatType = "cardboard" | "pet" | "aluminum" | "glass" | "paper" | "cooking_oil" | "electronics" | "metal_scrap" | "wood" | "other";

const MATERIALS: { type: MatType; basePrice: number; volatility: number; trend: number }[] = [
  { type: "aluminum",    basePrice: 25,  volatility: 3.0, trend: 0.02 },
  { type: "pet",         basePrice: 7,   volatility: 1.5, trend: 0.01 },
  { type: "cardboard",   basePrice: 2.5, volatility: 0.5, trend: -0.005 },
  { type: "glass",       basePrice: 1.0, volatility: 0.3, trend: 0.003 },
  { type: "paper",       basePrice: 3.0, volatility: 0.8, trend: 0.008 },
  { type: "cooking_oil", basePrice: 8.0, volatility: 2.0, trend: 0.015 },
  { type: "electronics", basePrice: 20,  volatility: 5.0, trend: 0.03 },
  { type: "metal_scrap", basePrice: 12,  volatility: 2.5, trend: 0.01 },
  { type: "wood",        basePrice: 1.5, volatility: 0.4, trend: 0.002 },
  { type: "other",       basePrice: 0.5, volatility: 0.2, trend: 0 },
];

// Generate realistic price series with random walk + trend + seasonality
function generatePriceSeries(mat: typeof MATERIALS[0], days: number): number[] {
  const prices: number[] = [];
  let price = mat.basePrice;
  for (let d = 0; d < days; d++) {
    // Add trend
    price += mat.trend;
    // Add random walk (Brownian motion)
    price += (Math.random() - 0.48) * mat.volatility * 0.3;
    // Add weekly seasonality (higher on Fri, lower on Mon)
    const dayOfWeek = new Date(Date.now() - (days - d) * 86400000).getDay();
    if (dayOfWeek === 5) price += mat.volatility * 0.05;
    if (dayOfWeek === 1) price -= mat.volatility * 0.03;
    // Add occasional spikes (news events)
    if (Math.random() < 0.03) price += (Math.random() - 0.3) * mat.volatility;
    // Floor
    price = Math.max(mat.basePrice * 0.3, price);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

// ═══════════════════════════════════════════════════════════════
// People names (Mexican)
// ═══════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  "María", "José", "Juan", "Ana", "Luis", "Carlos", "Pedro", "Rosa",
  "Miguel", "Lupita", "Fernando", "Gabriela", "Alejandro", "Sofía",
  "Diego", "Valentina", "Ricardo", "Isabella", "Andrés", "Camila",
  "Roberto", "Daniela", "Francisco", "Mariana", "Eduardo", "Paola",
  "Arturo", "Natalia", "Sergio", "Ximena", "Rafael", "Claudia",
  "Jorge", "Adriana", "Marco", "Lucía", "Enrique", "Fernanda",
  "Oscar", "Patricia",
];

const LAST_NAMES = [
  "García", "Hernández", "López", "Martínez", "González", "Rodríguez",
  "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera",
  "Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez",
  "Ortiz", "Castillo", "Jiménez", "Mendoza", "Aguilar", "Vargas",
];

const BUSINESS_NAMES = [
  "Taquería El Sol", "Restaurant Los Abuelos", "Hotel Mérida Palace",
  "OXXO Montejo", "Cafetería La Parroquia", "Panadería La Estrella",
  "Hotel Hacienda Yucatán", "Restaurant El Patio", "Bar La Negrita",
  "Tortillería Don Pedro", "Farmacia Yza Centro", "Tienda San Francisco",
  "Carnicería El Toro", "Frutería La Fresca", "Papelería Central",
  "Ferretería El Martillo", "Restaurant La Pigua", "Hotel Gran Mundo",
  "Café Impala", "Cocina Económica Doña Rosa",
];

const CENTER_NAMES = [
  "EcoRecicla Yucatán", "ReciPen Centro", "Verde Limpio Altabrisa",
  "ReciclaYa Gran Plaza", "Centro Ecológico Caucel", "Recicladora Kanasín",
  "EcoPoint Chuburná", "RecycleTech Mérida", "Green Center Progreso",
  "AlumiRecicla Uman", "PET Express Conkal", "EcoHub Valladolid",
  "Recicladora Cancún", "Verde Playa", "ReciclaMax Tizimín",
];

const STREETS = [
  "Calle 60", "Calle 59", "Paseo de Montejo", "Av. Itzáes", "Av. Colón",
  "Calle 62", "Av. Cupules", "Calle 47", "Av. García Lavín",
  "Periférico de Mérida", "Calle 21", "Av. Yucatán", "Calle 50",
  "Av. Canek", "Blvd. Nuevo Yucatán", "Calle 33-A", "Av. Tecnológico",
  "Calle 7", "Av. Prolongación Montejo", "Calle 23",
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function seed() {
  console.log("🌱 Starting MASSIVE seed...\n");

  // Clean existing data
  console.log("🗑️  Cleaning existing data...");
  await db.execute(sql`TRUNCATE TABLE notifications, transaction_items, transactions, center_prices, price_history, listings, batches, centers, users CASCADE`);

  const passwordHash = await hash("demo123", 10);
  const now = new Date();

  // ═══════════ 1. USERS (40+ users) ═══════════
  console.log("👥 Creating users...");

  const userRecords: { id: string; email: string; name: string; role: "business" | "household" | "recycler" | "center"; lat: number; lng: number }[] = [];

  // Center operators (15)
  for (let i = 0; i < 15; i++) {
    const zone = ZONES[i % ZONES.length];
    const coord = coordInZone(zone);
    const name = i < CENTER_NAMES.length ? `Operador ${CENTER_NAMES[i]}` : `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const id = uuid();
    userRecords.push({ id, email: `center${i + 1}@demo.com`, name, role: "center", lat: coord.lat, lng: coord.lng });
  }

  // Recyclers (10)
  for (let i = 0; i < 10; i++) {
    const zone = pick(ZONES.slice(0, 8));
    const coord = coordInZone(zone);
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const id = uuid();
    userRecords.push({ id, email: `recycler${i + 1}@demo.com`, name, role: "recycler", lat: coord.lat, lng: coord.lng });
  }

  // Businesses (20)
  for (let i = 0; i < 20; i++) {
    const zone = pick(ZONES.slice(0, 10));
    const coord = coordInZone(zone);
    const name = i < BUSINESS_NAMES.length ? BUSINESS_NAMES[i] : `${pick(FIRST_NAMES)}'s ${pick(["Store", "Shop", "Market"])}`;
    const id = uuid();
    userRecords.push({ id, email: `business${i + 1}@demo.com`, name, role: "business", lat: coord.lat, lng: coord.lng });
  }

  // Households (30)
  for (let i = 0; i < 30; i++) {
    const zone = pick(ZONES);
    const coord = coordInZone(zone);
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const id = uuid();
    userRecords.push({ id, email: `user${i + 1}@demo.com`, name: `${first} ${last}`, role: "household", lat: coord.lat, lng: coord.lng });
  }

  // Also add the original demo accounts for backward compat
  const demoAccounts = [
    { id: uuid(), email: "restaurant@demo.com", name: "Taquería El Sol", role: "business" as const, lat: 20.9674, lng: -89.5926 },
    { id: uuid(), email: "maria@demo.com", name: "María García", role: "household" as const, lat: 20.9750, lng: -89.5850 },
    { id: uuid(), email: "recycler@demo.com", name: "Juan Recolector", role: "recycler" as const, lat: 20.9600, lng: -89.6000 },
    { id: uuid(), email: "center@demo.com", name: "EcoRecicla Yucatán", role: "center" as const, lat: 20.9800, lng: -89.6100 },
  ];
  userRecords.push(...demoAccounts);

  // Insert all users
  for (const u of userRecords) {
    await db.insert(users).values({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash,
      latitude: u.lat,
      longitude: u.lng,
      address: `${pick(STREETS)} ${randInt(100, 999)}, ${pick(ZONES.slice(0, 8)).name}, Mérida, Yucatán`,
      isVerified: Math.random() > 0.3,
      rating: Math.round(rand(3.5, 5.0) * 10) / 10,
      totalRatings: randInt(0, 120),
      ecoPoints: randInt(0, 15000),
      totalKg: Math.round(rand(0, 2000) * 10) / 10,
      level: pick(["bronze", "silver", "gold", "platinum"]),
      createdAt: daysAgo(randInt(10, 180)),
    });
  }

  console.log(`   ✅ ${userRecords.length} users created`);

  const centerUsers = userRecords.filter(u => u.role === "center");
  const recyclerUsers = userRecords.filter(u => u.role === "recycler");
  const generatorUsers = userRecords.filter(u => u.role === "business" || u.role === "household");

  // ═══════════ 2. CENTERS (15) ═══════════
  console.log("🏭 Creating centers...");

  const centerRecords: { id: string; userId: string; lat: number; lng: number }[] = [];

  for (let i = 0; i < centerUsers.length; i++) {
    const u = centerUsers[i];
    const centerName = i < CENTER_NAMES.length ? CENTER_NAMES[i] : `Centro Reciclaje ${i + 1}`;
    const id = uuid();
    centerRecords.push({ id, userId: u.id, lat: u.lat, lng: u.lng });

    await db.insert(centers).values({
      id,
      userId: u.id,
      name: centerName,
      description: `Collection center specialized in multiple recyclable materials. Operating in the ${pick(ZONES).name} area.`,
      latitude: u.lat,
      longitude: u.lng,
      address: `${pick(STREETS)} ${randInt(100, 999)}, ${pick(ZONES.slice(0, 8)).name}, Mérida`,
      phone: `999${randInt(1000000, 9999999)}`,
      openHours: {
        mon: "08:00-18:00", tue: "08:00-18:00", wed: "08:00-18:00",
        thu: "08:00-18:00", fri: "08:00-18:00", sat: "09:00-14:00",
      },
      isVerified: Math.random() > 0.2,
      totalKgReceived: Math.round(rand(500, 50000) * 10) / 10,
      createdAt: daysAgo(randInt(30, 180)),
    });
  }

  console.log(`   ✅ ${centerRecords.length} centers created`);

  // ═══════════ 3. CENTER PRICES + 90-DAY PRICE HISTORY ═══════════
  console.log("💰 Creating prices and 90-day price history...");

  let priceCount = 0;
  let historyCount = 0;
  const HISTORY_DAYS = 90;

  for (const center of centerRecords) {
    // Each center buys 5-9 materials
    const numMaterials = randInt(5, 9);
    const shuffled = [...MATERIALS].sort(() => Math.random() - 0.5).slice(0, numMaterials);

    for (const mat of shuffled) {
      const priceSeries = generatePriceSeries(mat, HISTORY_DAYS);
      const currentPrice = priceSeries[priceSeries.length - 1];

      // Current price
      await db.insert(centerPrices).values({
        centerId: center.id,
        materialType: mat.type,
        pricePerKg: currentPrice,
        currency: "MXN",
      });
      priceCount++;

      // Historical prices (every day for 90 days)
      const histBatch: any[] = [];
      for (let d = 0; d < HISTORY_DAYS; d++) {
        histBatch.push({
          centerId: center.id,
          materialType: mat.type,
          pricePerKg: priceSeries[d],
          recordedAt: daysAgo(HISTORY_DAYS - d),
        });
      }

      // Insert in chunks of 30 to avoid query size limits
      for (let i = 0; i < histBatch.length; i += 30) {
        await db.insert(priceHistory).values(histBatch.slice(i, i + 30));
      }
      historyCount += histBatch.length;
    }
  }

  console.log(`   ✅ ${priceCount} current prices, ${historyCount} history records (${HISTORY_DAYS} days)`);

  // ═══════════ 4. LISTINGS (200+) ═══════════
  console.log("📦 Creating listings...");

  const listingRecords: { id: string; userId: string; materialType: MatType; kg: number; lat: number; lng: number; status: string; createdAt: Date }[] = [];
  const listingStatuses = ["scheduled", "scheduled", "scheduled", "batched", "assigned", "picked_up", "delivered", "verified", "verified", "verified"] as const;

  for (let i = 0; i < 250; i++) {
    const user = pick(generatorUsers);
    const mat = pick(MATERIALS);
    const zone = pick(ZONES);
    const coord = coordInZone(zone);
    const status = pick(listingStatuses);
    const kg = Math.round(rand(0.5, 80) * 10) / 10;
    const createdAt = daysAgo(randInt(0, 60));
    const id = uuid();

    listingRecords.push({ id, userId: user.id, materialType: mat.type, kg, lat: coord.lat, lng: coord.lng, status, createdAt });

    await db.insert(listings).values({
      id,
      userId: user.id,
      materialType: mat.type,
      estimatedKg: kg,
      actualKg: status === "verified" ? Math.round(kg * rand(0.85, 1.15) * 10) / 10 : null,
      description: `${pick(["Recyclable", "Clean", "Sorted", "Mixed", "Bulk"])} ${mat.type.replace("_", " ")} - ${pick(["ready for pickup", "available now", "needs collection", "weekly recurring"])}`,
      pricingMode: Math.random() > 0.3 ? "for_sale" : "free",
      pricePerKg: Math.random() > 0.3 ? Math.round(mat.basePrice * rand(0.6, 1.1) * 100) / 100 : null,
      latitude: coord.lat,
      longitude: coord.lng,
      address: `${pick(STREETS)} ${randInt(100, 999)}, ${zone.name}`,
      status,
      scheduledAt: createdAt,
      createdAt,
    });
  }

  console.log(`   ✅ ${listingRecords.length} listings created`);

  // ═══════════ 5. BATCHES (30+) ═══════════
  console.log("🚚 Creating batches...");

  const batchRecords: { id: string; recyclerId: string; status: string }[] = [];
  const batchStatuses = ["available", "available", "assigned", "in_progress", "completed", "completed", "completed"] as const;

  for (let i = 0; i < 35; i++) {
    const zone = pick(ZONES.slice(0, 10));
    const status = pick(batchStatuses);
    const recycler = pick(recyclerUsers);
    const id = uuid();
    const batchListings = listingRecords
      .filter(l => l.status !== "scheduled" && l.status !== "cancelled")
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(3, 8));

    const totalKg = batchListings.reduce((s, l) => s + l.kg, 0);

    batchRecords.push({ id, recyclerId: recycler.id, status });

    await db.insert(batches).values({
      id,
      zone: zone.name,
      status,
      recyclerId: status !== "available" ? recycler.id : null,
      totalEstimatedKg: Math.round(totalKg * 10) / 10,
      totalActualKg: status === "completed" ? Math.round(totalKg * rand(0.9, 1.1) * 10) / 10 : null,
      estimatedEarnings: Math.round(totalKg * rand(3, 12) * 100) / 100,
      stopsCount: batchListings.length,
      radiusMeters: randInt(500, 5000),
      optimizedRoute: batchListings.map((l, idx) => ({
        lat: l.lat,
        lng: l.lng,
        listingId: l.id,
        order: idx,
      })),
      scheduledDate: daysAgo(randInt(0, 30)).toISOString().split("T")[0],
      startedAt: status === "in_progress" || status === "completed" ? hoursAgo(randInt(1, 48)) : null,
      completedAt: status === "completed" ? hoursAgo(randInt(0, 24)) : null,
      createdAt: daysAgo(randInt(0, 30)),
    });
  }

  console.log(`   ✅ ${batchRecords.length} batches created`);

  // ═══════════ 6. TRANSACTIONS (80+) ═══════════
  console.log("💵 Creating transactions...");

  const completedBatches = batchRecords.filter(b => b.status === "completed");
  let txCount = 0;

  // Transactions from completed batches
  for (const batch of completedBatches) {
    const center = pick(centerRecords);
    const totalKg = Math.round(rand(10, 200) * 10) / 10;
    const txId = uuid();

    await db.insert(transactions).values({
      id: txId,
      batchId: batch.id,
      recyclerId: batch.recyclerId,
      centerId: center.id,
      totalKg,
      totalAmount: Math.round(totalKg * rand(3, 15) * 100) / 100,
      ecoPointsAwarded: Math.round(totalKg * 10),
      recyclerRating: randInt(3, 5),
      centerRating: randInt(3, 5),
      completedAt: hoursAgo(randInt(0, 72 * 30)),
      createdAt: daysAgo(randInt(0, 60)),
    });
    txCount++;
  }

  // Additional standalone transactions to fill history
  for (let i = 0; i < 60; i++) {
    const center = pick(centerRecords);
    const recycler = pick(recyclerUsers);
    const totalKg = Math.round(rand(5, 150) * 10) / 10;
    const txId = uuid();
    const createdAt = daysAgo(randInt(0, 90));

    await db.insert(transactions).values({
      id: txId,
      recyclerId: recycler.id,
      centerId: center.id,
      totalKg,
      totalAmount: Math.round(totalKg * rand(3, 15) * 100) / 100,
      ecoPointsAwarded: Math.round(totalKg * 10),
      recyclerRating: randInt(3, 5),
      centerRating: randInt(3, 5),
      completedAt: createdAt,
      createdAt,
    });
    txCount++;
  }

  console.log(`   ✅ ${txCount} transactions created`);

  // ═══════════ 7. NOTIFICATIONS (100+) ═══════════
  console.log("🔔 Creating notifications...");

  const notifTypes = [
    { type: "listing", title: "New listing nearby", body: "A new {material} listing is available in {zone}." },
    { type: "price", title: "Price update", body: "{material} prices updated at {center}." },
    { type: "batch", title: "Batch available", body: "New collection batch in {zone} with {stops} stops." },
    { type: "alert", title: "Route completed", body: "Your batch has been completed. Check your earnings!" },
    { type: "reward", title: "EcoPoints earned!", body: "You earned {points} EcoPoints for recycling {kg} kg." },
    { type: "system", title: "Welcome to ReciMap!", body: "Start listing your recyclable materials today." },
    { type: "price", title: "Price alert", body: "{material} prices are trending {trend} — check the analytics." },
    { type: "batch", title: "Batch claimed", body: "A recycler has claimed your batch. Pickup is on the way!" },
  ];

  let notifCount = 0;
  for (const user of userRecords) {
    const numNotifs = randInt(2, 8);
    for (let i = 0; i < numNotifs; i++) {
      const tmpl = pick(notifTypes);
      const zone = pick(ZONES);
      const mat = pick(MATERIALS);
      const body = tmpl.body
        .replace("{material}", mat.type.replace("_", " "))
        .replace("{zone}", zone.name)
        .replace("{center}", pick(CENTER_NAMES))
        .replace("{stops}", randInt(3, 8).toString())
        .replace("{points}", randInt(50, 500).toString())
        .replace("{kg}", randInt(5, 50).toString())
        .replace("{trend}", pick(["up", "down"]));

      await db.insert(notifications).values({
        userId: user.id,
        type: tmpl.type,
        title: tmpl.title,
        body,
        isRead: Math.random() > 0.4,
        createdAt: hoursAgo(randInt(0, 72 * 15)),
      });
      notifCount++;
    }
  }

  console.log(`   ✅ ${notifCount} notifications created`);

  // ═══════════ SUMMARY ═══════════
  console.log("\n" + "═".repeat(50));
  console.log("🎉 MASSIVE SEED COMPLETE!");
  console.log("═".repeat(50));
  console.log(`   👥 ${userRecords.length} users (${centerUsers.length} centers, ${recyclerUsers.length} recyclers, ${generatorUsers.filter(u => u.role === "business").length} businesses, ${generatorUsers.filter(u => u.role === "household").length} households)`);
  console.log(`   🏭 ${centerRecords.length} collection centers`);
  console.log(`   💰 ${priceCount} current prices`);
  console.log(`   📈 ${historyCount} price history records (${HISTORY_DAYS} days)`);
  console.log(`   📦 ${listingRecords.length} listings`);
  console.log(`   🚚 ${batchRecords.length} batches`);
  console.log(`   💵 ${txCount} transactions`);
  console.log(`   🔔 ${notifCount} notifications`);
  console.log("\n   Demo login: any *@demo.com / demo123");
  console.log("   Quick access: restaurant@demo.com, maria@demo.com, recycler@demo.com, center@demo.com\n");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
