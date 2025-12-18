import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

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
