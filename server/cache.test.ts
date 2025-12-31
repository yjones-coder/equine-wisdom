import { describe, expect, it, beforeEach } from "vitest";
import { 
  cacheGet, 
  cacheSet, 
  cacheDelete, 
  cacheDeleteByPrefix,
  getCachedBreed,
  getCachedBreedList,
  getCachedFacts,
  getCacheStats,
  CACHE_KEYS,
  CACHE_TTL
} from "./cache";

describe("cache service", () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheDeleteByPrefix("");
  });

  describe("basic cache operations", () => {
    it("stores and retrieves values", async () => {
      await cacheSet("test:key", { foo: "bar" }, 60);
      const result = await cacheGet<{ foo: string }>("test:key");
      expect(result).toEqual({ foo: "bar" });
    });

    it("returns null for missing keys", async () => {
      const result = await cacheGet("nonexistent:key");
      expect(result).toBeNull();
    });

    it("deletes values", async () => {
      await cacheSet("test:delete", "value", 60);
      await cacheDelete("test:delete");
      const result = await cacheGet("test:delete");
      expect(result).toBeNull();
    });

    it("deletes values by prefix", async () => {
      await cacheSet("prefix:one", "1", 60);
      await cacheSet("prefix:two", "2", 60);
      await cacheSet("other:key", "3", 60);
      
      await cacheDeleteByPrefix("prefix:");
      
      expect(await cacheGet("prefix:one")).toBeNull();
      expect(await cacheGet("prefix:two")).toBeNull();
      expect(await cacheGet("other:key")).toBe("3");
    });
  });

  describe("getCachedBreed", () => {
    it("fetches from database on cache miss", async () => {
      let fetchCount = 0;
      const fetchFn = async () => {
        fetchCount++;
        return { id: 1, name: "Arabian" };
      };

      const result = await getCachedBreed(1, fetchFn);
      expect(result).toEqual({ id: 1, name: "Arabian" });
      expect(fetchCount).toBe(1);
    });

    it("returns cached value on cache hit", async () => {
      let fetchCount = 0;
      const fetchFn = async () => {
        fetchCount++;
        return { id: 1, name: "Arabian" };
      };

      // First call - cache miss
      await getCachedBreed(1, fetchFn);
      expect(fetchCount).toBe(1);

      // Second call - cache hit
      const result = await getCachedBreed(1, fetchFn);
      expect(result).toEqual({ id: 1, name: "Arabian" });
      expect(fetchCount).toBe(1); // Still 1, no additional fetch
    });
  });

  describe("getCachedBreedList", () => {
    it("caches breed list without category", async () => {
      let fetchCount = 0;
      const fetchFn = async () => {
        fetchCount++;
        return [{ id: 1, name: "Arabian" }, { id: 2, name: "Quarter Horse" }];
      };

      await getCachedBreedList(null, fetchFn);
      await getCachedBreedList(null, fetchFn);
      
      expect(fetchCount).toBe(1);
    });

    it("caches breed list with category", async () => {
      let lightFetchCount = 0;
      let draftFetchCount = 0;

      const lightFetch = async () => {
        lightFetchCount++;
        return [{ id: 1, name: "Arabian" }];
      };

      const draftFetch = async () => {
        draftFetchCount++;
        return [{ id: 2, name: "Clydesdale" }];
      };

      await getCachedBreedList("light", lightFetch);
      await getCachedBreedList("draft", draftFetch);
      await getCachedBreedList("light", lightFetch);
      
      expect(lightFetchCount).toBe(1);
      expect(draftFetchCount).toBe(1);
    });
  });

  describe("getCachedFacts", () => {
    it("caches facts by category", async () => {
      let fetchCount = 0;
      const fetchFn = async () => {
        fetchCount++;
        return [{ id: 1, title: "Horse Fact" }];
      };

      await getCachedFacts("health", fetchFn);
      await getCachedFacts("health", fetchFn);
      
      expect(fetchCount).toBe(1);
    });
  });

  describe("getCacheStats", () => {
    it("returns cache statistics", async () => {
      await cacheSet("stat:test1", "value1", 60);
      await cacheSet("stat:test2", "value2", 60);
      
      const stats = getCacheStats();
      
      expect(stats.size).toBeGreaterThanOrEqual(2);
      expect(stats.keys).toContain("stat:test1");
      expect(stats.keys).toContain("stat:test2");
    });
  });

  describe("CACHE_KEYS constants", () => {
    it("has expected key prefixes", () => {
      expect(CACHE_KEYS.BREED).toBe("breed:");
      expect(CACHE_KEYS.BREED_LIST).toBe("breeds:list");
      expect(CACHE_KEYS.FACTS).toBe("facts:");
    });
  });

  describe("CACHE_TTL constants", () => {
    it("has expected TTL values", () => {
      expect(CACHE_TTL.BREED).toBe(86400); // 24 hours
      expect(CACHE_TTL.BREED_LIST).toBe(3600); // 1 hour
      expect(CACHE_TTL.FACTS).toBe(86400); // 24 hours
    });
  });
});
