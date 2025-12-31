import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("stables router", () => {
  describe("stables.list", () => {
    it("returns empty array for user with no stables", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stables.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.stables.list()).rejects.toThrow();
    });
  });

  describe("stables.create", () => {
    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.stables.create({
          name: "Test Stable",
          location: "Test Location",
        })
      ).rejects.toThrow();
    });

    it("validates required name field", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Empty name should fail validation
      await expect(
        caller.stables.create({
          name: "",
        })
      ).rejects.toThrow();
    });
  });
});

describe("horses router", () => {
  describe("horses.list", () => {
    it("returns empty array for user with no horses", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.horses.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.horses.list()).rejects.toThrow();
    });
  });
});

describe("savedBreeds router", () => {
  describe("savedBreeds.list", () => {
    it("returns empty array for user with no saved breeds", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.savedBreeds.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.savedBreeds.list()).rejects.toThrow();
    });
  });

  describe("savedBreeds.isSaved", () => {
    it("returns false for unsaved breed", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.savedBreeds.isSaved({ breedId: 999 });

      expect(result).toBe(false);
    });
  });
});

describe("preferences router", () => {
  describe("preferences.get", () => {
    it("returns null for user with no preferences set", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.preferences.get();

      // Should return null or the default preferences
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.preferences.get()).rejects.toThrow();
    });
  });
});

describe("dashboard router", () => {
  describe("dashboard.stats", () => {
    it("returns stats object with expected fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.stats();

      expect(result).toHaveProperty("stableCount");
      expect(result).toHaveProperty("horseCount");
      expect(result).toHaveProperty("savedBreedCount");
      expect(result).toHaveProperty("identificationCount");
      expect(typeof result.stableCount).toBe("number");
      expect(typeof result.horseCount).toBe("number");
      expect(typeof result.savedBreedCount).toBe("number");
      expect(typeof result.identificationCount).toBe("number");
    });

    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.dashboard.stats()).rejects.toThrow();
    });
  });
});

describe("careLogs router", () => {
  describe("careLogs.listByHorse", () => {
    it("throws UNAUTHORIZED for unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.careLogs.listByHorse({ horseId: 1 })
      ).rejects.toThrow();
    });
  });
});
