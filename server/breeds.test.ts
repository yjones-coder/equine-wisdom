import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getAllBreeds: vi.fn(),
  getBreedBySlug: vi.fn(),
  getBreedById: vi.fn(),
  searchBreeds: vi.fn(),
  getBreedsByCategory: vi.fn(),
  getPopularBreeds: vi.fn(),
  getAllFacts: vi.fn(),
  getFactsByCategory: vi.fn(),
  getFactsByAudienceLevel: vi.fn(),
  getRandomFacts: vi.fn(),
  saveIdentificationHistory: vi.fn(),
  getUserIdentificationHistory: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

import * as db from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const mockBreeds = [
  {
    id: 1,
    name: "Arabian",
    slug: "arabian",
    category: "light",
    overview: "One of the oldest and most influential horse breeds",
    heightMin: 14,
    heightMax: 16,
    weightMin: 800,
    weightMax: 1000,
    origin: "Arabian Peninsula",
    temperament: "Intelligent, spirited, and loyal",
    colors: ["bay", "gray", "chestnut", "black"],
    distinctiveFeatures: "Dished face, high tail carriage",
    physicalDescription: "Refined head with large eyes",
    history: "Ancient breed from the Middle East",
    uses: "Endurance riding, showing",
    careRequirements: "Regular exercise needed",
    feedingNotes: "Easy keeper",
    healthConsiderations: "Generally healthy",
    lifespan: "25-30 years",
    popularity: "common",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Clydesdale",
    slug: "clydesdale",
    category: "draft",
    overview: "Large draft horse known for feathered legs",
    heightMin: 16,
    heightMax: 18,
    weightMin: 1800,
    weightMax: 2200,
    origin: "Scotland",
    temperament: "Gentle giant",
    colors: ["bay", "brown", "black"],
    distinctiveFeatures: "Feathered legs, white markings",
    physicalDescription: "Massive build with strong legs",
    history: "Developed in Scotland for farm work",
    uses: "Driving, showing",
    careRequirements: "Needs space and regular grooming",
    feedingNotes: "Requires more feed than light breeds",
    healthConsiderations: "Watch for leg issues",
    lifespan: "20-25 years",
    popularity: "common",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockFacts = [
  {
    id: 1,
    title: "Horses Sleep Standing Up",
    content: "Horses can sleep while standing due to a special locking mechanism in their legs.",
    category: "general",
    audienceLevel: "beginner",
    source: "Equine Research",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Understanding Colic",
    content: "Colic is a leading cause of death in horses and requires immediate veterinary attention.",
    category: "health",
    audienceLevel: "intermediate",
    source: "Veterinary Journal",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("breeds router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("breeds.list", () => {
    it("returns all breeds from the database", async () => {
      vi.mocked(db.getAllBreeds).mockResolvedValue(mockBreeds);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.list();
      
      expect(db.getAllBreeds).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Arabian");
    });
  });

  describe("breeds.getBySlug", () => {
    it("returns a breed by its slug", async () => {
      vi.mocked(db.getBreedBySlug).mockResolvedValue(mockBreeds[0]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.getBySlug({ slug: "arabian" });
      
      expect(db.getBreedBySlug).toHaveBeenCalledWith("arabian");
      expect(result?.name).toBe("Arabian");
    });

    it("returns null for non-existent slug", async () => {
      vi.mocked(db.getBreedBySlug).mockResolvedValue(null);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.getBySlug({ slug: "nonexistent" });
      
      expect(result).toBeNull();
    });
  });

  describe("breeds.search", () => {
    it("searches breeds by query", async () => {
      vi.mocked(db.searchBreeds).mockResolvedValue([mockBreeds[0]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.search({ query: "arabian" });
      
      expect(db.searchBreeds).toHaveBeenCalledWith("arabian");
      expect(result).toHaveLength(1);
    });

    it("returns all breeds when query is empty", async () => {
      vi.mocked(db.getAllBreeds).mockResolvedValue(mockBreeds);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.search({ query: "" });
      
      expect(db.getAllBreeds).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe("breeds.byCategory", () => {
    it("filters breeds by category", async () => {
      vi.mocked(db.getBreedsByCategory).mockResolvedValue([mockBreeds[1]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.byCategory({ category: "draft" });
      
      expect(db.getBreedsByCategory).toHaveBeenCalledWith("draft");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Clydesdale");
    });
  });

  describe("breeds.popular", () => {
    it("returns popular breeds with default limit", async () => {
      vi.mocked(db.getPopularBreeds).mockResolvedValue(mockBreeds);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.popular();
      
      expect(db.getPopularBreeds).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
    });

    it("respects custom limit", async () => {
      vi.mocked(db.getPopularBreeds).mockResolvedValue([mockBreeds[0]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.breeds.popular({ limit: 1 });
      
      expect(db.getPopularBreeds).toHaveBeenCalledWith(1);
    });
  });
});

describe("facts router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("facts.list", () => {
    it("returns all facts", async () => {
      vi.mocked(db.getAllFacts).mockResolvedValue(mockFacts);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.facts.list();
      
      expect(db.getAllFacts).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe("facts.byCategory", () => {
    it("filters facts by category", async () => {
      vi.mocked(db.getFactsByCategory).mockResolvedValue([mockFacts[1]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.facts.byCategory({ category: "health" });
      
      expect(db.getFactsByCategory).toHaveBeenCalledWith("health");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Understanding Colic");
    });
  });

  describe("facts.byLevel", () => {
    it("filters facts by audience level", async () => {
      vi.mocked(db.getFactsByAudienceLevel).mockResolvedValue([mockFacts[0]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.facts.byLevel({ level: "beginner" });
      
      expect(db.getFactsByAudienceLevel).toHaveBeenCalledWith("beginner");
      expect(result).toHaveLength(1);
    });
  });

  describe("facts.random", () => {
    it("returns random facts with default limit", async () => {
      vi.mocked(db.getRandomFacts).mockResolvedValue(mockFacts);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.facts.random();
      
      expect(db.getRandomFacts).toHaveBeenCalledWith(5);
    });

    it("respects custom limit", async () => {
      vi.mocked(db.getRandomFacts).mockResolvedValue([mockFacts[0]]);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.facts.random({ limit: 1 });
      
      expect(db.getRandomFacts).toHaveBeenCalledWith(1);
    });
  });
});
