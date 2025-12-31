import { describe, expect, it } from "vitest";
import { generateNewsletterContent, formatForGmailMCP, type NewsletterRecipient } from "./newsletter";

describe("newsletter service", () => {
  describe("generateNewsletterContent", () => {
    it("generates content for user with horses", () => {
      const recipient: NewsletterRecipient = {
        userId: 1,
        email: "test@example.com",
        name: "John",
        preferences: {
          frequency: "weekly",
          careReminders: true,
          newsAlerts: true,
        },
        horses: [
          { id: 1, name: "Thunder", breedName: "Arabian", stableName: "Sunny Meadows" },
          { id: 2, name: "Storm", breedName: "Quarter Horse", stableName: "Sunny Meadows" },
        ],
        subscribedBreeds: [
          { breedId: 1, breedName: "Arabian" },
        ],
      };

      const result = generateNewsletterContent(recipient);

      expect(result.subject).toContain("2 Horses");
      expect(result.content).toContain("Hello John");
      expect(result.content).toContain("Thunder");
      expect(result.content).toContain("Storm");
      expect(result.content).toContain("Arabian");
      expect(result.content).toContain("YOUR STABLES");
      expect(result.content).toContain("CARE REMINDERS");
    });

    it("generates content for user without horses", () => {
      const recipient: NewsletterRecipient = {
        userId: 2,
        email: "newuser@example.com",
        name: null,
        preferences: {
          frequency: "monthly",
          careReminders: false,
          newsAlerts: true,
        },
        horses: [],
        subscribedBreeds: [],
      };

      const result = generateNewsletterContent(recipient);

      expect(result.subject).toBe("Your Equine Wisdom Newsletter");
      expect(result.content).toContain("Hello,");
      expect(result.content).not.toContain("YOUR STABLES");
      expect(result.content).not.toContain("CARE REMINDERS");
    });

    it("includes breed subscriptions when present", () => {
      const recipient: NewsletterRecipient = {
        userId: 3,
        email: "breeder@example.com",
        name: "Sarah",
        preferences: {
          frequency: "weekly",
          careReminders: true,
          newsAlerts: true,
        },
        horses: [],
        subscribedBreeds: [
          { breedId: 1, breedName: "Thoroughbred" },
          { breedId: 2, breedName: "Friesian" },
        ],
      };

      const result = generateNewsletterContent(recipient);

      expect(result.content).toContain("BREED UPDATES");
      expect(result.content).toContain("Thoroughbred");
      expect(result.content).toContain("Friesian");
    });

    it("always includes educational content", () => {
      const recipient: NewsletterRecipient = {
        userId: 4,
        email: "minimal@example.com",
        name: null,
        preferences: {
          frequency: "weekly",
          careReminders: false,
          newsAlerts: false,
        },
        horses: [],
        subscribedBreeds: [],
      };

      const result = generateNewsletterContent(recipient);

      expect(result.content).toContain("DID YOU KNOW?");
      expect(result.content).toContain("Equine Wisdom Team");
    });
  });

  describe("formatForGmailMCP", () => {
    it("formats recipients for Gmail MCP sending", () => {
      const recipients: NewsletterRecipient[] = [
        {
          userId: 1,
          email: "user1@example.com",
          name: "User One",
          preferences: { frequency: "weekly", careReminders: true, newsAlerts: true },
          horses: [{ id: 1, name: "Horse1", breedName: "Arabian", stableName: "Stable1" }],
          subscribedBreeds: [],
        },
        {
          userId: 2,
          email: "user2@example.com",
          name: "User Two",
          preferences: { frequency: "weekly", careReminders: false, newsAlerts: false },
          horses: [],
          subscribedBreeds: [],
        },
      ];

      const result = formatForGmailMCP(recipients);

      expect(result).toHaveLength(2);
      expect(result[0].to).toEqual(["user1@example.com"]);
      expect(result[0].subject).toBeDefined();
      expect(result[0].content).toBeDefined();
      expect(result[1].to).toEqual(["user2@example.com"]);
    });

    it("returns empty array for no recipients", () => {
      const result = formatForGmailMCP([]);
      expect(result).toEqual([]);
    });
  });
});
