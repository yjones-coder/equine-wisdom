/**
 * Breed Image Generator Service
 * 
 * Uses the Z-Image Turbo model via Hugging Face MCP to generate
 * representative illustrations for horse breeds.
 * 
 * This provides a consistent visual style across all breed pages
 * without relying on stock photography.
 */

import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Breed-specific prompt templates for consistent, high-quality illustrations
const BREED_PROMPT_TEMPLATE = `A beautiful, photorealistic portrait of a {breedName} horse, {characteristics}. 
Professional equine photography style, soft natural lighting, detailed coat texture, 
noble stance, pastoral background with rolling green hills. 
High quality, 8k resolution, award-winning photography.`;

// Characteristic descriptions for different breed types
const BREED_CHARACTERISTICS: Record<string, string> = {
  // Light horses
  "Arabian": "elegant dished face, high-set tail, refined features, grey or bay coat",
  "Thoroughbred": "athletic build, long legs, muscular hindquarters, bay or chestnut coat",
  "Quarter Horse": "compact muscular body, broad chest, powerful hindquarters, sorrel coat",
  "Morgan": "compact body, arched neck, expressive eyes, bay or black coat",
  "Appaloosa": "distinctive spotted coat pattern, striped hooves, mottled skin",
  "Paint Horse": "colorful coat with large patches of white and dark colors",
  "Tennessee Walking Horse": "elegant long neck, smooth gait stance, black or chestnut coat",
  "Standardbred": "powerful build, long body, strong legs, bay or brown coat",
  "Andalusian": "thick flowing mane, arched neck, compact body, grey or white coat",
  "Friesian": "jet black coat, long flowing mane and tail, feathered feet",
  "Lipizzan": "compact muscular body, convex profile, grey or white coat",
  "Akhal-Teke": "metallic golden coat sheen, slender build, almond-shaped eyes",
  "Mustang": "hardy compact build, varied colors, wild spirit in eyes",
  "Hanoverian": "elegant warmblood build, powerful hindquarters, bay coat",
  "Dutch Warmblood": "athletic build, expressive head, bay or chestnut coat",
  "Trakehner": "refined elegant build, long neck, bay or grey coat",
  "Irish Sport Horse": "athletic build, kind eye, bay or grey coat",
  "Selle Français": "powerful athletic build, noble head, bay or chestnut coat",
  
  // Draft horses
  "Clydesdale": "massive build, feathered feet, bay coat with white markings",
  "Percheron": "muscular grey or black coat, elegant for draft breed",
  "Belgian": "massive chestnut body, flaxen mane and tail, gentle expression",
  "Shire": "enormous build, heavy feathering, black or bay coat",
  "Suffolk Punch": "round compact body, chestnut coat, no feathering",
  
  // Ponies
  "Shetland Pony": "small sturdy build, thick coat, various colors",
  "Welsh Pony": "refined pony build, dished face, various colors",
  "Connemara Pony": "athletic pony build, grey or dun coat",
  "Haflinger": "golden chestnut coat, flaxen mane and tail, sturdy build",
  "Icelandic Horse": "thick double coat, compact build, various colors including dun",
  "Fjord": "distinctive dun coat with dorsal stripe, upright mane",
  
  // Default for unknown breeds
  "default": "beautiful coat, noble stance, expressive eyes"
};

/**
 * Generate a prompt for a specific horse breed
 */
export function generateBreedPrompt(breedName: string): string {
  const characteristics = BREED_CHARACTERISTICS[breedName] || BREED_CHARACTERISTICS["default"];
  return BREED_PROMPT_TEMPLATE
    .replace("{breedName}", breedName)
    .replace("{characteristics}", characteristics);
}

/**
 * Generate breed image using Z-Image Turbo
 * Note: This would be called via the MCP tool in production
 * Returns the parameters needed for the MCP call
 */
export function getImageGenerationParams(breedName: string): {
  prompt: string;
  resolution: string;
  steps: number;
  seed?: number;
} {
  return {
    prompt: generateBreedPrompt(breedName),
    resolution: "1024x1024 ( 1:1 )",
    steps: 8, // Turbo model works well with fewer steps
  };
}

/**
 * Store generated image to S3 and return URL
 */
export async function storeBreedImage(
  breedSlug: string,
  imageBuffer: Buffer
): Promise<{ url: string; key: string }> {
  const fileKey = `breed-images/${breedSlug}-${nanoid(8)}.png`;
  const result = await storagePut(fileKey, imageBuffer, "image/png");
  return {
    url: result.url,
    key: fileKey,
  };
}

/**
 * Get all breeds that need images generated
 */
export function getBreedsNeedingImages(
  breeds: Array<{ id: number; name: string; slug: string; imageUrl: string | null }>
): Array<{ id: number; name: string; slug: string }> {
  return breeds
    .filter(breed => !breed.imageUrl)
    .map(({ id, name, slug }) => ({ id, name, slug }));
}

/**
 * Batch generate prompts for multiple breeds
 */
export function generateBatchPrompts(
  breeds: Array<{ name: string; slug: string }>
): Array<{ slug: string; prompt: string; params: ReturnType<typeof getImageGenerationParams> }> {
  return breeds.map(breed => ({
    slug: breed.slug,
    prompt: generateBreedPrompt(breed.name),
    params: getImageGenerationParams(breed.name),
  }));
}
