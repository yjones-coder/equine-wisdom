import { eq, like, or, sql, desc, asc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, breeds, horseFacts, identificationHistory,
  stables, horses, searchHistory, userPreferences, savedBreeds, careLogs, newsletterSubscriptions,
  type Breed, type HorseFact, type InsertBreed, type InsertHorseFact, type InsertIdentificationHistory,
  type Stable, type InsertStable, type Horse, type InsertHorse,
  type SearchHistory, type InsertSearchHistory,
  type UserPreferences, type InsertUserPreferences,
  type SavedBreed, type InsertSavedBreed,
  type CareLog, type InsertCareLog,
  type NewsletterSubscription, type InsertNewsletterSubscription
} from "../drizzle/schema";
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

// ==================== User Queries ====================

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

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== Breed Queries ====================

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

// ==================== Horse Facts Queries ====================

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

// ==================== Identification History Queries ====================

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

// ==================== Stable Queries ====================

export async function createStable(data: InsertStable) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(stables).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getUserStables(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(stables)
    .where(eq(stables.userId, userId))
    .orderBy(desc(stables.createdAt));
  return result;
}

export async function getStableById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(stables)
    .where(and(eq(stables.id, id), eq(stables.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateStable(id: number, userId: number, data: Partial<InsertStable>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(stables)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(stables.id, id), eq(stables.userId, userId)));
  
  return getStableById(id, userId);
}

export async function deleteStable(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(stables).where(and(eq(stables.id, id), eq(stables.userId, userId)));
  return true;
}

export async function getStableWithHorseCount(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const userStables = await getUserStables(userId);
  const stablesWithCounts = await Promise.all(
    userStables.map(async (stable) => {
      const horseCount = await db.select({ count: sql<number>`count(*)` })
        .from(horses)
        .where(eq(horses.stableId, stable.id));
      return {
        ...stable,
        horseCount: horseCount[0]?.count || 0
      };
    })
  );
  
  return stablesWithCounts;
}

// ==================== Horse Queries ====================

export async function createHorse(data: InsertHorse) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(horses).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getUserHorses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horses)
    .where(eq(horses.userId, userId))
    .orderBy(desc(horses.createdAt));
  return result;
}

export async function getStableHorses(stableId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(horses)
    .where(and(eq(horses.stableId, stableId), eq(horses.userId, userId)))
    .orderBy(asc(horses.name));
  return result;
}

export async function getHorseById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(horses)
    .where(and(eq(horses.id, id), eq(horses.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateHorse(id: number, userId: number, data: Partial<InsertHorse>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(horses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(horses.id, id), eq(horses.userId, userId)));
  
  return getHorseById(id, userId);
}

export async function deleteHorse(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(horses).where(and(eq(horses.id, id), eq(horses.userId, userId)));
  return true;
}

export async function getHorseWithBreed(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const horse = await getHorseById(id, userId);
  if (!horse) return null;
  
  let breed = null;
  let matchedBreed = null;
  
  if (horse.breedId) {
    breed = await getBreedById(horse.breedId);
  }
  if (horse.matchedBreedId) {
    matchedBreed = await getBreedById(horse.matchedBreedId);
  }
  
  return { ...horse, breed, matchedBreed };
}

// ==================== Search History Queries ====================

export async function addSearchHistory(data: InsertSearchHistory) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(searchHistory).values(data);
  return result;
}

export async function getUserSearchHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
  return result;
}

export async function getSearchHistoryByType(userId: number, searchType: SearchHistory['searchType'], limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(searchHistory)
    .where(and(eq(searchHistory.userId, userId), eq(searchHistory.searchType, searchType)))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
  return result;
}

export async function clearUserSearchHistory(userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
  return true;
}

// ==================== User Preferences Queries ====================

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateUserPreferences(userId: number, data: Partial<InsertUserPreferences>) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getUserPreferences(userId);
  
  if (existing) {
    await db.update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({ userId, ...data });
  }
  
  return getUserPreferences(userId);
}

// ==================== Saved Breeds Queries ====================

export async function saveBreed(userId: number, breedId: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(savedBreeds)
    .values({ userId, breedId, notes })
    .onDuplicateKeyUpdate({ set: { notes } });
  
  return { userId, breedId, notes };
}

export async function getUserSavedBreeds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const saved = await db.select().from(savedBreeds)
    .where(eq(savedBreeds.userId, userId))
    .orderBy(desc(savedBreeds.createdAt));
  
  // Get full breed details
  const breedsWithDetails = await Promise.all(
    saved.map(async (s) => {
      const breed = await getBreedById(s.breedId);
      return { ...s, breed };
    })
  );
  
  return breedsWithDetails;
}

export async function isBreedSaved(userId: number, breedId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(savedBreeds)
    .where(and(eq(savedBreeds.userId, userId), eq(savedBreeds.breedId, breedId)))
    .limit(1);
  
  return result.length > 0;
}

export async function removeSavedBreed(userId: number, breedId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(savedBreeds)
    .where(and(eq(savedBreeds.userId, userId), eq(savedBreeds.breedId, breedId)));
  return true;
}

// ==================== Care Log Queries ====================

export async function createCareLog(data: InsertCareLog) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(careLogs).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getHorseCareLogs(horseId: number, userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(careLogs)
    .where(and(eq(careLogs.horseId, horseId), eq(careLogs.userId, userId)))
    .orderBy(desc(careLogs.date))
    .limit(limit);
  return result;
}

export async function getCareLogsByType(horseId: number, userId: number, careType: CareLog['careType']) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(careLogs)
    .where(and(
      eq(careLogs.horseId, horseId),
      eq(careLogs.userId, userId),
      eq(careLogs.careType, careType)
    ))
    .orderBy(desc(careLogs.date));
  return result;
}

export async function getUpcomingCareReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(careLogs)
    .where(and(
      eq(careLogs.userId, userId),
      eq(careLogs.reminderSet, true),
      sql`${careLogs.nextDueDate} >= NOW()`
    ))
    .orderBy(asc(careLogs.nextDueDate))
    .limit(20);
  return result;
}

export async function deleteCareLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(careLogs).where(and(eq(careLogs.id, id), eq(careLogs.userId, userId)));
  return true;
}

// ==================== Newsletter Subscription Queries ====================

export async function createNewsletterSubscription(data: InsertNewsletterSubscription) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(newsletterSubscriptions).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getUserNewsletterSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.userId, userId));
  return result;
}

export async function updateNewsletterSubscription(id: number, userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(newsletterSubscriptions)
    .set({ isActive })
    .where(and(eq(newsletterSubscriptions.id, id), eq(newsletterSubscriptions.userId, userId)));
  
  return true;
}

export async function deleteNewsletterSubscription(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(newsletterSubscriptions)
    .where(and(eq(newsletterSubscriptions.id, id), eq(newsletterSubscriptions.userId, userId)));
  return true;
}

// ==================== Dashboard Stats Queries ====================

export async function getUserDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [stableCount] = await db.select({ count: sql<number>`count(*)` })
    .from(stables)
    .where(eq(stables.userId, userId));
  
  const [horseCount] = await db.select({ count: sql<number>`count(*)` })
    .from(horses)
    .where(eq(horses.userId, userId));
  
  const [savedBreedCount] = await db.select({ count: sql<number>`count(*)` })
    .from(savedBreeds)
    .where(eq(savedBreeds.userId, userId));
  
  const [identificationCount] = await db.select({ count: sql<number>`count(*)` })
    .from(identificationHistory)
    .where(eq(identificationHistory.userId, userId));
  
  const recentIdentifications = await db.select().from(identificationHistory)
    .where(eq(identificationHistory.userId, userId))
    .orderBy(desc(identificationHistory.createdAt))
    .limit(5);
  
  const upcomingReminders = await getUpcomingCareReminders(userId);
  
  return {
    stableCount: stableCount?.count || 0,
    horseCount: horseCount?.count || 0,
    savedBreedCount: savedBreedCount?.count || 0,
    identificationCount: identificationCount?.count || 0,
    recentIdentifications,
    upcomingReminders
  };
}


// ==================== Recent Identifications for Search History ====================

export async function getRecentIdentifications(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select({
    id: identificationHistory.id,
    description: identificationHistory.description,
    matchedBreeds: identificationHistory.matchedBreeds,
    createdAt: identificationHistory.createdAt,
  }).from(identificationHistory)
    .where(eq(identificationHistory.userId, userId))
    .orderBy(desc(identificationHistory.createdAt))
    .limit(limit);
  
  // Transform to include top breed match name
  return results.map(r => ({
    id: r.id,
    description: r.description,
    topBreedMatch: (r.matchedBreeds as { breedId: number; confidence: number; breedName: string }[])?.[0]?.breedName || null,
    createdAt: r.createdAt,
    // Include form fields for re-running (extracted from description if available)
    size: null,
    color: null,
    build: null,
    distinctiveFeatures: null,
  }));
}
