import { eq, like, or, sql, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, breeds, horseFacts, identificationHistory, type Breed, type HorseFact, type InsertBreed, type InsertHorseFact, type InsertIdentificationHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User queries
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Breed queries
export async function getAllBreeds() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(breeds).orderBy(asc(breeds.name));
  return result;
}

export async function getBreedBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(breeds).where(eq(breeds.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBreedById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(breeds).where(eq(breeds.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchBreeds(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchTerm = `%${query}%`;
  const result = await db.select().from(breeds).where(
    or(
      like(breeds.name, searchTerm),
      like(breeds.overview, searchTerm),
      like(breeds.distinctiveFeatures, searchTerm)
    )
  ).orderBy(asc(breeds.name));
  
  return result;
}

export async function getBreedsByCategory(category: Breed['category']) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(breeds).where(eq(breeds.category, category)).orderBy(asc(breeds.name));
  return result;
}

export async function getPopularBreeds(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(breeds)
    .where(eq(breeds.popularity, 'common'))
    .orderBy(asc(breeds.name))
    .limit(limit);
  return result;
}

// Horse facts queries
export async function getAllFacts() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horseFacts).orderBy(desc(horseFacts.createdAt));
  return result;
}

export async function getFactsByCategory(category: HorseFact['category']) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horseFacts).where(eq(horseFacts.category, category));
  return result;
}

export async function getFactsByAudienceLevel(level: HorseFact['audienceLevel']) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horseFacts).where(
    or(
      eq(horseFacts.audienceLevel, level),
      eq(horseFacts.audienceLevel, 'all')
    )
  );
  return result;
}

export async function getRandomFacts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horseFacts).orderBy(sql`RAND()`).limit(limit);
  return result;
}

// Identification history queries
export async function saveIdentificationHistory(data: InsertIdentificationHistory) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(identificationHistory).values(data);
  return result;
}

export async function getUserIdentificationHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(identificationHistory)
    .where(eq(identificationHistory.userId, userId))
    .orderBy(desc(identificationHistory.createdAt));
  return result;
}
