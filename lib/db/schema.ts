import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  date,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
  "business",
  "household",
  "recycler",
  "center",
]);

export const materialTypeEnum = pgEnum("material_type", [
  "cardboard",
  "pet",
  "aluminum",
  "glass",
  "paper",
  "cooking_oil",
  "electronics",
  "metal_scrap",
  "wood",
  "other",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "scheduled",
  "batched",
  "assigned",
  "en_route",
  "picked_up",
  "in_transit",
  "delivered",
  "verified",
  "cancelled",
]);

export const batchStatusEnum = pgEnum("batch_status", [
  "available",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const pricingModeEnum = pgEnum("pricing_mode", ["free", "for_sale"]);

// ==================== TABLES ====================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  rating: doublePrecision("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  ecoPoints: integer("eco_points").default(0),
  totalKg: doublePrecision("total_kg").default(0),
  level: varchar("level", { length: 20 }).default("bronze"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  materialType: materialTypeEnum("material_type").notNull(),
  estimatedKg: doublePrecision("estimated_kg").notNull(),
  actualKg: doublePrecision("actual_kg"),
  photoUrl: text("photo_url"),
  pickupPhotoUrl: text("pickup_photo_url"),
  description: text("description"),
  pricingMode: pricingModeEnum("pricing_mode").notNull(),
  pricePerKg: doublePrecision("price_per_kg"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address"),
  status: listingStatusEnum("status").default("scheduled"),
  batchId: uuid("batch_id").references(() => batches.id),
  scheduledAt: timestamp("scheduled_at"),
  isRecurring: boolean("is_recurring").default(false),
  recurringDays: json("recurring_days").$type<string[]>(),
  recurringTime: varchar("recurring_time", { length: 5 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  zone: varchar("zone", { length: 100 }),
  status: batchStatusEnum("status").default("available"),
  recyclerId: uuid("recycler_id").references(() => users.id),
  totalEstimatedKg: doublePrecision("total_estimated_kg").default(0),
  totalActualKg: doublePrecision("total_actual_kg"),
  estimatedEarnings: doublePrecision("estimated_earnings"),
  actualEarnings: doublePrecision("actual_earnings"),
  stopsCount: integer("stops_count").default(0),
  radiusMeters: integer("radius_meters"),
  optimizedRoute: json("optimized_route").$type<
    { lat: number; lng: number; listingId: string; order: number }[]
  >(),
  scheduledDate: date("scheduled_date"),
  scheduledTime: varchar("scheduled_time", { length: 5 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const centers = pgTable("centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }),
  openHours: json("open_hours").$type<Record<string, string>>(),
  isVerified: boolean("is_verified").default(false),
  totalKgReceived: doublePrecision("total_kg_received").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerPrices = pgTable("center_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  centerId: uuid("center_id")
    .references(() => centers.id)
    .notNull(),
  materialType: materialTypeEnum("material_type").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  currency: varchar("currency", { length: 3 }).default("MXN"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  centerId: uuid("center_id").references(() => centers.id),
  materialType: materialTypeEnum("material_type"),
  pricePerKg: doublePrecision("price_per_kg"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id").references(() => batches.id),
  recyclerId: uuid("recycler_id")
    .references(() => users.id)
    .notNull(),
  centerId: uuid("center_id")
    .references(() => centers.id)
    .notNull(),
  totalKg: doublePrecision("total_kg").notNull(),
  totalAmount: doublePrecision("total_amount"),
  ecoPointsAwarded: integer("eco_points_awarded"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  recyclerRating: integer("recycler_rating"),
  centerRating: integer("center_rating"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  listingId: uuid("listing_id").references(() => listings.id),
  materialType: materialTypeEnum("material_type"),
  kg: doublePrecision("kg").notNull(),
  pricePerKg: doublePrecision("price_per_kg"),
  subtotal: doublePrecision("subtotal"),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  data: json("data").$type<Record<string, string>>(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  batchesAsRecycler: many(batches),
  centers: many(centers),
  transactionsAsRecycler: many(transactions),
  notifications: many(notifications),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id] }),
  batch: one(batches, { fields: [listings.batchId], references: [batches.id] }),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  recycler: one(users, { fields: [batches.recyclerId], references: [users.id] }),
  listings: many(listings),
  transactions: many(transactions),
}));

export const centersRelations = relations(centers, ({ one, many }) => ({
  user: one(users, { fields: [centers.userId], references: [users.id] }),
  prices: many(centerPrices),
  priceHistory: many(priceHistory),
  transactions: many(transactions),
}));

export const centerPricesRelations = relations(centerPrices, ({ one }) => ({
  center: one(centers, {
    fields: [centerPrices.centerId],
    references: [centers.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  center: one(centers, {
    fields: [priceHistory.centerId],
    references: [centers.id],
  }),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    batch: one(batches, {
      fields: [transactions.batchId],
      references: [batches.id],
    }),
    recycler: one(users, {
      fields: [transactions.recyclerId],
      references: [users.id],
    }),
    center: one(centers, {
      fields: [transactions.centerId],
      references: [centers.id],
    }),
    items: many(transactionItems),
  })
);

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id],
    }),
    listing: one(listings, {
      fields: [transactionItems.listingId],
      references: [listings.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
