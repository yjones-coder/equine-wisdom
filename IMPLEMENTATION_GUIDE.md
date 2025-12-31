# Implementation Guide: Virtual Stables & User Features

## Overview
This guide provides step-by-step instructions for implementing the next phase of Equine Wisdom features, focusing on user accounts, virtual stables, and scalability.

---

## Part 1: Database Schema Updates

### Step 1: Create Stables Table

```sql
CREATE TABLE stables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  capacity INT DEFAULT 10,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  UNIQUE KEY unique_user_stable_name (userId, name)
);
```

### Step 2: Create Horses Table

```sql
CREATE TABLE horses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stableId INT NOT NULL,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  breedId INT,
  age INT,
  color VARCHAR(100),
  markings TEXT,
  notes TEXT,
  identificationDescription TEXT,
  matchedBreedId INT,
  matchConfidence INT,
  photoUrls JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stableId) REFERENCES stables(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (breedId) REFERENCES breeds(id),
  FOREIGN KEY (matchedBreedId) REFERENCES breeds(id),
  INDEX idx_userId (userId),
  INDEX idx_stableId (stableId),
  INDEX idx_breedId (breedId),
  INDEX idx_createdAt (createdAt DESC)
);
```

### Step 3: Create Search History Table

```sql
CREATE TABLE searchHistory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  query VARCHAR(500),
  category VARCHAR(50),
  resultsCount INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId_createdAt (userId, createdAt DESC),
  INDEX idx_createdAt (createdAt DESC)
);
```

### Step 4: Create User Preferences Table

```sql
CREATE TABLE userPreferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  emailNotifications BOOLEAN DEFAULT TRUE,
  newsletterFrequency ENUM('daily', 'weekly', 'monthly', 'never') DEFAULT 'weekly',
  favoriteCategories JSON,
  favoriteBreeds JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 5: Create Saved Breeds Table

```sql
CREATE TABLE savedBreeds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  breedId INT NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (breedId) REFERENCES breeds(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_breed (userId, breedId),
  INDEX idx_userId (userId)
);
```

---

## Part 2: Backend Implementation

### Step 1: Update Drizzle Schema

Create `drizzle/schema.ts` updates:

```typescript
import { int, text, timestamp, varchar, boolean, json, enum as dbEnum, mysqlTable, unique } from "drizzle-orm/mysql-core";

export const stables = mysqlTable("stables", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  capacity: int("capacity").default(10),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  uniqueUserStableName: unique("unique_user_stable_name").on(table.userId, table.name),
}));

export const horses = mysqlTable("horses", {
  id: int("id").autoincrement().primaryKey(),
  stableId: int("stableId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  breedId: int("breedId"),
  age: int("age"),
  color: varchar("color", { length: 100 }),
  markings: text("markings"),
  notes: text("notes"),
  identificationDescription: text("identificationDescription"),
  matchedBreedId: int("matchedBreedId"),
  matchConfidence: int("matchConfidence"),
  photoUrls: json("photoUrls"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  stableIdIdx: index("idx_stableId").on(table.stableId),
  breedIdIdx: index("idx_breedId").on(table.breedId),
}));

export const searchHistory = mysqlTable("searchHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: varchar("query", { length: 500 }),
  category: varchar("category", { length: 50 }),
  resultsCount: int("resultsCount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdCreatedAtIdx: index("idx_userId_createdAt").on(table.userId, table.createdAt),
}));

export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailNotifications: boolean("emailNotifications").default(true),
  newsletterFrequency: dbEnum("newsletterFrequency", ["daily", "weekly", "monthly", "never"]).default("weekly"),
  favoriteCategories: json("favoriteCategories"),
  favoriteBreeds: json("favoriteBreeds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const savedBreeds = mysqlTable("savedBreeds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  breedId: int("breedId").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  uniqueUserBreed: unique("unique_user_breed").on(table.userId, table.breedId),
}));

// Types
export type Stable = typeof stables.$inferSelect;
export type InsertStable = typeof stables.$inferInsert;
export type Horse = typeof horses.$inferSelect;
export type InsertHorse = typeof horses.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type SavedBreed = typeof savedBreeds.$inferSelect;
```

### Step 2: Add Database Query Helpers

Add to `server/db.ts`:

```typescript
// Stables
export async function createStable(data: InsertStable) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(stables).values(data);
  return result;
}

export async function getUserStables(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stables).where(eq(stables.userId, userId));
}

export async function getStableById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(stables)
    .where(and(eq(stables.id, id), eq(stables.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Horses
export async function addHorse(data: InsertHorse) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(horses).values(data);
  return result;
}

export async function getUserHorses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(horses).where(eq(horses.userId, userId));
}

export async function getStableHorses(stableId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(horses).where(eq(horses.stableId, stableId));
}

export async function getHorseById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(horses)
    .where(and(eq(horses.id, id), eq(horses.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Search History
export async function addSearchHistory(data: any) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(searchHistory).values(data);
}

export async function getUserSearchHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
}

// User Preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateUserPreferences(userId: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) return null;
  
  return db.update(userPreferences)
    .set(data)
    .where(eq(userPreferences.userId, userId));
}

// Saved Breeds
export async function saveBreed(userId: number, breedId: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(savedBreeds).values({
    userId,
    breedId,
    notes,
  }).onDuplicateKeyUpdate({
    set: { notes },
  });
}

export async function getUserSavedBreeds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(savedBreeds).where(eq(savedBreeds.userId, userId));
}

export async function removeSavedBreed(userId: number, breedId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return db.delete(savedBreeds)
    .where(and(eq(savedBreeds.userId, userId), eq(savedBreeds.breedId, breedId)));
}
```

### Step 3: Add tRPC Procedures

Add to `server/routers.ts`:

```typescript
stables: router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Stable name required"),
      description: z.string().optional(),
      location: z.string().optional(),
      capacity: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return createStable({
        userId: ctx.user.id,
        ...input,
      });
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return getUserStables(ctx.user.id);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return getStableById(input.id, ctx.user.id);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stable = await getStableById(input.id, ctx.user.id);
      if (!stable) throw new Error("Stable not found");
      
      const { id, ...updateData } = input;
      return db.update(stables).set(updateData).where(eq(stables.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const stable = await getStableById(input.id, ctx.user.id);
      if (!stable) throw new Error("Stable not found");
      
      return db.delete(stables).where(eq(stables.id, input.id));
    }),
}),

horses: router({
  add: protectedProcedure
    .input(z.object({
      stableId: z.number(),
      name: z.string().min(1),
      breedId: z.number().optional(),
      age: z.number().optional(),
      color: z.string().optional(),
      markings: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stable = await getStableById(input.stableId, ctx.user.id);
      if (!stable) throw new Error("Stable not found");
      
      return addHorse({
        userId: ctx.user.id,
        ...input,
      });
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return getUserHorses(ctx.user.id);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return getHorseById(input.id, ctx.user.id);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      age: z.number().optional(),
      color: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const horse = await getHorseById(input.id, ctx.user.id);
      if (!horse) throw new Error("Horse not found");
      
      const { id, ...updateData } = input;
      return db.update(horses).set(updateData).where(eq(horses.id, id));
    }),
}),

searchHistory: router({
  add: protectedProcedure
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
      resultsCount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return addSearchHistory({
        userId: ctx.user.id,
        ...input,
      });
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return getUserSearchHistory(ctx.user.id);
    }),
}),

preferences: router({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      return getUserPreferences(ctx.user.id);
    }),

  update: protectedProcedure
    .input(z.object({
      emailNotifications: z.boolean().optional(),
      newsletterFrequency: z.enum(["daily", "weekly", "monthly", "never"]).optional(),
      favoriteCategories: z.array(z.string()).optional(),
      favoriteBreeds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return updateUserPreferences(ctx.user.id, input);
    }),
}),

savedBreeds: router({
  save: protectedProcedure
    .input(z.object({
      breedId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return saveBreed(ctx.user.id, input.breedId, input.notes);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return getUserSavedBreeds(ctx.user.id);
    }),

  remove: protectedProcedure
    .input(z.object({ breedId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return removeSavedBreed(ctx.user.id, input.breedId);
    }),
}),
```

---

## Part 3: Frontend Implementation

### Step 1: Create Dashboard Page

Create `client/src/pages/Dashboard.tsx` with user's stables and horses overview.

### Step 2: Create Stable Management Pages

- `client/src/pages/StableList.tsx` - List all stables
- `client/src/pages/StableDetail.tsx` - View stable and horses
- `client/src/pages/AddStable.tsx` - Create new stable

### Step 3: Create Horse Management Pages

- `client/src/pages/HorseProfile.tsx` - View/edit horse details
- `client/src/pages/AddHorse.tsx` - Add new horse to stable

### Step 4: Create User Profile Page

- `client/src/pages/UserProfile.tsx` - User settings and preferences

---

## Part 4: Scalability Implementation

### Caching Strategy

```typescript
// server/_core/cache.ts
import { KVNamespace } from "@cloudflare/workers-types";

export class CacheManager {
  private kv: KVNamespace;
  
  async getBreed(breedId: number) {
    const cacheKey = `breed:${breedId}`;
    const cached = await this.kv.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const breed = await getBreedById(breedId);
    await this.kv.put(cacheKey, JSON.stringify(breed), {
      expirationTtl: 86400, // 24 hours
    });
    
    return breed;
  }
  
  async getPopularBreeds() {
    const cacheKey = "popular_breeds";
    const cached = await this.kv.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const breeds = await getPopularBreeds(100);
    await this.kv.put(cacheKey, JSON.stringify(breeds), {
      expirationTtl: 3600, // 1 hour
    });
    
    return breeds;
  }
}
```

### Database Connection Pooling

```typescript
// server/_core/db-pool.ts
import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});
```

---

## Deployment Checklist

- [ ] Update database schema
- [ ] Run migrations
- [ ] Implement backend procedures
- [ ] Create frontend pages
- [ ] Set up caching layer
- [ ] Configure connection pooling
- [ ] Add monitoring
- [ ] Test with load testing
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
