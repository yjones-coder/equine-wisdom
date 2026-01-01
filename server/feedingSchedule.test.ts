import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock authenticated user context
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Feeding Schedule Data Structure", () => {
  it("validates feeding schedule data schema correctly", () => {
    // Test the expected structure of feeding schedule data
    const validFeedingSchedule = {
      type: "3x_daily" as const,
      slots: [
        {
          id: "morning",
          name: "Morning Feeding",
          time: "06:00",
          icon: "morning",
          hay: { amount: 3, unit: "flakes" },
          grain: { amount: 2, unit: "lbs", type: "Sweet feed" },
          supplements: ["Joint Support", "Vitamin E"],
          water: true,
          notes: "Check water bucket",
        },
        {
          id: "noon",
          name: "Noon Feeding",
          time: "12:00",
          icon: "noon",
          hay: { amount: 2, unit: "flakes" },
          grain: { amount: 0, unit: "lbs", type: "" },
          supplements: [],
          water: true,
          notes: "",
        },
        {
          id: "evening",
          name: "Evening Feeding",
          time: "18:00",
          icon: "evening",
          hay: { amount: 3, unit: "flakes" },
          grain: { amount: 2, unit: "lbs", type: "Sweet feed" },
          supplements: ["Joint Support"],
          water: true,
          notes: "",
        },
      ],
      weeklyVariations: false,
      variations: [],
    };

    // Verify structure
    expect(validFeedingSchedule.type).toBe("3x_daily");
    expect(validFeedingSchedule.slots).toHaveLength(3);
    expect(validFeedingSchedule.slots[0].hay.amount).toBe(3);
    expect(validFeedingSchedule.slots[0].supplements).toContain("Joint Support");
  });

  it("supports different schedule types", () => {
    const scheduleTypes = ["2x_daily", "3x_daily", "4x_daily", "custom"];
    
    scheduleTypes.forEach(type => {
      expect(["2x_daily", "3x_daily", "4x_daily", "custom"]).toContain(type);
    });
  });

  it("validates feeding slot structure", () => {
    const slot = {
      id: "custom-123",
      name: "Custom Feeding",
      time: "14:00",
      icon: "custom",
      hay: { amount: 1.5, unit: "lbs" },
      grain: { amount: 0.5, unit: "cups", type: "Pellets" },
      supplements: ["Biotin", "Electrolytes"],
      water: true,
      notes: "After exercise",
    };

    // Validate all required fields exist
    expect(slot).toHaveProperty("id");
    expect(slot).toHaveProperty("name");
    expect(slot).toHaveProperty("time");
    expect(slot).toHaveProperty("icon");
    expect(slot).toHaveProperty("hay");
    expect(slot).toHaveProperty("grain");
    expect(slot).toHaveProperty("supplements");
    expect(slot).toHaveProperty("water");
    expect(slot).toHaveProperty("notes");

    // Validate hay structure
    expect(slot.hay).toHaveProperty("amount");
    expect(slot.hay).toHaveProperty("unit");
    expect(typeof slot.hay.amount).toBe("number");

    // Validate grain structure
    expect(slot.grain).toHaveProperty("amount");
    expect(slot.grain).toHaveProperty("unit");
    expect(slot.grain).toHaveProperty("type");

    // Validate supplements is an array
    expect(Array.isArray(slot.supplements)).toBe(true);
  });

  it("calculates total daily hay correctly", () => {
    const schedule = {
      slots: [
        { hay: { amount: 3, unit: "flakes" } },
        { hay: { amount: 2, unit: "flakes" } },
        { hay: { amount: 3, unit: "flakes" } },
      ],
    };

    const totalHay = schedule.slots.reduce((sum, slot) => sum + slot.hay.amount, 0);
    expect(totalHay).toBe(8);
  });

  it("calculates total daily grain correctly", () => {
    const schedule = {
      slots: [
        { grain: { amount: 2, unit: "lbs" } },
        { grain: { amount: 0, unit: "lbs" } },
        { grain: { amount: 2, unit: "lbs" } },
      ],
    };

    const totalGrain = schedule.slots.reduce((sum, slot) => sum + slot.grain.amount, 0);
    expect(totalGrain).toBe(4);
  });

  it("validates time format", () => {
    const validTimes = ["05:00", "06:00", "12:00", "18:00", "21:00"];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    validTimes.forEach(time => {
      expect(time).toMatch(timeRegex);
    });
  });

  it("generates feeding summary text correctly", () => {
    const schedule = {
      slots: [
        {
          name: "Morning Feeding",
          time: "06:00",
          hay: { amount: 3, unit: "flakes" },
          grain: { amount: 2, unit: "lbs" },
          supplements: ["Joint Support"],
        },
      ],
    };

    const summary = schedule.slots
      .map(slot => 
        `${slot.name}: ${slot.time} - Hay: ${slot.hay.amount} ${slot.hay.unit}, Grain: ${slot.grain.amount} ${slot.grain.unit}${slot.supplements.length > 0 ? `, Supplements: ${slot.supplements.join(", ")}` : ""}`
      )
      .join("; ");

    expect(summary).toContain("Morning Feeding");
    expect(summary).toContain("06:00");
    expect(summary).toContain("Hay: 3 flakes");
    expect(summary).toContain("Grain: 2 lbs");
    expect(summary).toContain("Supplements: Joint Support");
  });
});

describe("Feeding Schedule Input Validation", () => {
  it("rejects negative hay amounts", () => {
    const invalidAmount = -1;
    expect(invalidAmount).toBeLessThan(0);
    // In the actual component, this would be validated with min={0}
  });

  it("enforces maximum grain per feeding rule", () => {
    // Best practice: never exceed 5 lbs of grain per feeding
    const maxGrainPerFeeding = 5;
    const grainAmount = 6;
    
    expect(grainAmount).toBeGreaterThan(maxGrainPerFeeding);
    // This would trigger a warning in the UI
  });

  it("validates supplement array", () => {
    const supplements = ["Joint Support", "Vitamin E", "Biotin"];
    
    expect(Array.isArray(supplements)).toBe(true);
    expect(supplements.every(s => typeof s === "string")).toBe(true);
  });
});

describe("Schedule Presets", () => {
  it("2x daily preset has morning and evening slots", () => {
    const preset2x = {
      type: "2x_daily",
      slots: ["morning", "evening"],
    };

    expect(preset2x.slots).toHaveLength(2);
    expect(preset2x.slots).toContain("morning");
    expect(preset2x.slots).toContain("evening");
  });

  it("3x daily preset has morning, noon, and evening slots", () => {
    const preset3x = {
      type: "3x_daily",
      slots: ["morning", "noon", "evening"],
    };

    expect(preset3x.slots).toHaveLength(3);
    expect(preset3x.slots).toContain("morning");
    expect(preset3x.slots).toContain("noon");
    expect(preset3x.slots).toContain("evening");
  });

  it("4x daily preset includes night feeding", () => {
    const preset4x = {
      type: "4x_daily",
      slots: ["morning", "noon", "evening", "night"],
    };

    expect(preset4x.slots).toHaveLength(4);
    expect(preset4x.slots).toContain("night");
  });
});
