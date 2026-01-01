import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, index, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Horse breeds table with comprehensive breed information
 */
export const breeds = mysqlTable("breeds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["light", "draft", "pony", "gaited", "warmblood"]).notNull(),
  
  // Physical characteristics
  heightMin: int("heightMin"), // in hands (e.g., 14 = 14 hands)
  heightMax: int("heightMax"),
  weightMin: int("weightMin"), // in pounds
  weightMax: int("weightMax"),
  colors: json("colors").$type<string[]>(), // common colors
  distinctiveFeatures: text("distinctiveFeatures"), // unique physical traits
  
  // Descriptions
  overview: text("overview").notNull(),
  physicalDescription: text("physicalDescription"),
  temperament: text("temperament"),
  history: text("history"),
  uses: text("uses"), // common uses/disciplines
  
  // Care information
  careRequirements: text("careRequirements"),
  healthConsiderations: text("healthConsiderations"),
  feedingNotes: text("feedingNotes"),
  
  // Additional info
  lifespan: varchar("lifespan", { length: 50 }),
  origin: varchar("origin", { length: 100 }),
  popularity: mysqlEnum("popularity", ["common", "moderate", "rare"]).default("moderate"),
  
  // For matching algorithm
  keywords: json("keywords").$type<string[]>(), // searchable keywords
  
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Breed = typeof breeds.$inferSelect;
export type InsertBreed = typeof breeds.$inferInsert;

/**
 * Horse facts and educational content
 */
export const horseFacts = mysqlTable("horseFacts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["general", "health", "behavior", "nutrition", "training", "history", "care"]).notNull(),
  audienceLevel: mysqlEnum("audienceLevel", ["beginner", "intermediate", "advanced", "all"]).default("all").notNull(),
  source: varchar("source", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HorseFact = typeof horseFacts.$inferSelect;
export type InsertHorseFact = typeof horseFacts.$inferInsert;

/**
 * User's breed identification history (optional, for logged-in users)
 */
export const identificationHistory = mysqlTable("identificationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  description: text("description").notNull(),
  matchedBreeds: json("matchedBreeds").$type<{ breedId: number; confidence: number; breedName: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdentificationHistory = typeof identificationHistory.$inferSelect;
export type InsertIdentificationHistory = typeof identificationHistory.$inferInsert;

/**
 * Virtual stables - users can create multiple stables to organize their horses
 */
export const stables = mysqlTable("stables", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  capacity: int("capacity").default(10),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("stables_userId_idx").on(table.userId),
  uniqueUserStableName: unique("unique_user_stable_name").on(table.userId, table.name),
}));

export type Stable = typeof stables.$inferSelect;
export type InsertStable = typeof stables.$inferInsert;

/**
 * Horses - individual horses belonging to stables
 */
export const horses = mysqlTable("horses", {
  id: int("id").autoincrement().primaryKey(),
  stableId: int("stableId").notNull().references(() => stables.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  
  // Breed information
  breedId: int("breedId").references(() => breeds.id),
  matchedBreedId: int("matchedBreedId").references(() => breeds.id),
  matchConfidence: int("matchConfidence"),
  identificationDescription: text("identificationDescription"),
  
  // Horse details
  age: int("age"),
  gender: mysqlEnum("gender", ["mare", "stallion", "gelding", "colt", "filly", "unknown"]).default("unknown"),
  color: varchar("color", { length: 100 }),
  markings: text("markings"),
  height: int("height"), // in hands
  weight: int("weight"), // in pounds
  
  // Care information
  notes: text("notes"),
  specialNeeds: text("specialNeeds"),
  feedingSchedule: text("feedingSchedule"), // Legacy text field
  feedingScheduleData: json("feedingScheduleData").$type<{
    type: "2x_daily" | "3x_daily" | "4x_daily" | "custom";
    slots: {
      id: string;
      name: string;
      time: string;
      icon: string;
      hay: { amount: number; unit: string };
      grain: { amount: number; unit: string; type: string };
      supplements: string[];
      water: boolean;
      notes: string;
    }[];
    weeklyVariations: boolean;
    variations: unknown[];
  }>(),
  veterinarian: varchar("veterinarian", { length: 255 }),
  farrier: varchar("farrier", { length: 255 }),
  
  // Photos (stored as S3 URLs)
  photoUrls: json("photoUrls").$type<string[]>(),
  profilePhotoUrl: text("profilePhotoUrl"),
  
  // Dates
  dateOfBirth: timestamp("dateOfBirth"),
  dateAcquired: timestamp("dateAcquired"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("horses_userId_idx").on(table.userId),
  stableIdIdx: index("horses_stableId_idx").on(table.stableId),
  breedIdIdx: index("horses_breedId_idx").on(table.breedId),
}));

export type Horse = typeof horses.$inferSelect;
export type InsertHorse = typeof horses.$inferInsert;

/**
 * Search history - tracks user's breed searches and identifications
 */
export const searchHistory = mysqlTable("searchHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  searchType: mysqlEnum("searchType", ["breed_search", "identification", "browse"]).notNull(),
  query: varchar("query", { length: 500 }),
  category: varchar("category", { length: 50 }),
  filters: json("filters").$type<Record<string, unknown>>(),
  resultsCount: int("resultsCount"),
  selectedBreedId: int("selectedBreedId").references(() => breeds.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdCreatedAtIdx: index("searchHistory_userId_createdAt_idx").on(table.userId, table.createdAt),
}));

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

/**
 * User preferences - notification settings, favorites, and personalization
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  
  // Notification preferences
  emailNotifications: boolean("emailNotifications").default(true),
  newsletterFrequency: mysqlEnum("newsletterFrequency", ["daily", "weekly", "monthly", "never"]).default("weekly"),
  careReminders: boolean("careReminders").default(true),
  newsAlerts: boolean("newsAlerts").default(true),
  
  // Content preferences
  favoriteCategories: json("favoriteCategories").$type<string[]>(),
  experienceLevel: mysqlEnum("experienceLevel", ["beginner", "intermediate", "advanced"]).default("beginner"),
  
  // Display preferences
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("system"),
  measurementUnit: mysqlEnum("measurementUnit", ["imperial", "metric"]).default("imperial"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * Saved breeds - users can save breeds they're interested in
 */
export const savedBreeds = mysqlTable("savedBreeds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  breedId: int("breedId").notNull().references(() => breeds.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("savedBreeds_userId_idx").on(table.userId),
  uniqueUserBreed: unique("unique_user_breed").on(table.userId, table.breedId),
}));

export type SavedBreed = typeof savedBreeds.$inferSelect;
export type InsertSavedBreed = typeof savedBreeds.$inferInsert;

/**
 * Horse care logs - track care activities for horses
 */
export const careLogs = mysqlTable("careLogs", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull().references(() => horses.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  careType: mysqlEnum("careType", ["feeding", "grooming", "exercise", "veterinary", "farrier", "medication", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  cost: int("cost"), // in cents
  nextDueDate: timestamp("nextDueDate"),
  reminderSet: boolean("reminderSet").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  horseIdIdx: index("careLogs_horseId_idx").on(table.horseId),
  userIdIdx: index("careLogs_userId_idx").on(table.userId),
  dateIdx: index("careLogs_date_idx").on(table.date),
}));

export type CareLog = typeof careLogs.$inferSelect;
export type InsertCareLog = typeof careLogs.$inferInsert;

/**
 * Newsletter subscriptions - track breed-specific newsletter preferences
 */
export const newsletterSubscriptions = mysqlTable("newsletterSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  breedId: int("breedId").references(() => breeds.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }), // general, health, training, etc.
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("newsletterSubs_userId_idx").on(table.userId),
}));

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
