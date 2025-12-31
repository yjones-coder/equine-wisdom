import { describe, expect, it } from "vitest";
import { 
  generateBreedPrompt, 
  getImageGenerationParams, 
  generateBatchPrompts,
  getBreedsNeedingImages
} from "./breedImageGenerator";

describe("breedImageGenerator service", () => {
  describe("generateBreedPrompt", () => {
    it("generates prompt for known breed", () => {
      const prompt = generateBreedPrompt("Arabian");
      
      expect(prompt).toContain("Arabian horse");
      expect(prompt).toContain("elegant dished face");
      expect(prompt).toContain("high-set tail");
      expect(prompt).toContain("Professional equine photography");
    });

    it("generates prompt for Clydesdale", () => {
      const prompt = generateBreedPrompt("Clydesdale");
      
      expect(prompt).toContain("Clydesdale horse");
      expect(prompt).toContain("massive build");
      expect(prompt).toContain("feathered feet");
    });

    it("generates prompt for Friesian", () => {
      const prompt = generateBreedPrompt("Friesian");
      
      expect(prompt).toContain("Friesian horse");
      expect(prompt).toContain("jet black coat");
      expect(prompt).toContain("flowing mane");
    });

    it("uses default characteristics for unknown breed", () => {
      const prompt = generateBreedPrompt("Unknown Breed");
      
      expect(prompt).toContain("Unknown Breed horse");
      expect(prompt).toContain("beautiful coat");
      expect(prompt).toContain("noble stance");
    });

    it("includes quality keywords in all prompts", () => {
      const prompt = generateBreedPrompt("Quarter Horse");
      
      expect(prompt).toContain("8k resolution");
      expect(prompt).toContain("award-winning photography");
      expect(prompt).toContain("pastoral background");
    });
  });

  describe("getImageGenerationParams", () => {
    it("returns correct parameters for breed", () => {
      const params = getImageGenerationParams("Thoroughbred");
      
      expect(params.prompt).toContain("Thoroughbred horse");
      expect(params.resolution).toBe("1024x1024 ( 1:1 )");
      expect(params.steps).toBe(8);
    });

    it("returns consistent resolution for all breeds", () => {
      const arabianParams = getImageGenerationParams("Arabian");
      const clydesdaleParams = getImageGenerationParams("Clydesdale");
      
      expect(arabianParams.resolution).toBe(clydesdaleParams.resolution);
    });
  });

  describe("generateBatchPrompts", () => {
    it("generates prompts for multiple breeds", () => {
      const breeds = [
        { name: "Arabian", slug: "arabian" },
        { name: "Quarter Horse", slug: "quarter-horse" },
        { name: "Friesian", slug: "friesian" },
      ];
      
      const results = generateBatchPrompts(breeds);
      
      expect(results).toHaveLength(3);
      expect(results[0].slug).toBe("arabian");
      expect(results[0].prompt).toContain("Arabian horse");
      expect(results[1].slug).toBe("quarter-horse");
      expect(results[2].slug).toBe("friesian");
    });

    it("returns empty array for empty input", () => {
      const results = generateBatchPrompts([]);
      expect(results).toEqual([]);
    });

    it("includes params for each breed", () => {
      const breeds = [{ name: "Morgan", slug: "morgan" }];
      const results = generateBatchPrompts(breeds);
      
      expect(results[0].params).toBeDefined();
      expect(results[0].params.resolution).toBe("1024x1024 ( 1:1 )");
      expect(results[0].params.steps).toBe(8);
    });
  });

  describe("getBreedsNeedingImages", () => {
    it("filters breeds without images", () => {
      const breeds = [
        { id: 1, name: "Arabian", slug: "arabian", imageUrl: "https://example.com/arabian.jpg" },
        { id: 2, name: "Quarter Horse", slug: "quarter-horse", imageUrl: null },
        { id: 3, name: "Friesian", slug: "friesian", imageUrl: null },
      ];
      
      const needsImages = getBreedsNeedingImages(breeds);
      
      expect(needsImages).toHaveLength(2);
      expect(needsImages[0].name).toBe("Quarter Horse");
      expect(needsImages[1].name).toBe("Friesian");
    });

    it("returns empty array when all breeds have images", () => {
      const breeds = [
        { id: 1, name: "Arabian", slug: "arabian", imageUrl: "https://example.com/arabian.jpg" },
      ];
      
      const needsImages = getBreedsNeedingImages(breeds);
      
      expect(needsImages).toHaveLength(0);
    });

    it("returns all breeds when none have images", () => {
      const breeds = [
        { id: 1, name: "Arabian", slug: "arabian", imageUrl: null },
        { id: 2, name: "Quarter Horse", slug: "quarter-horse", imageUrl: null },
      ];
      
      const needsImages = getBreedsNeedingImages(breeds);
      
      expect(needsImages).toHaveLength(2);
    });
  });
});
