/**
 * Newsletter Service
 * 
 * This module provides newsletter functionality for Equine Wisdom.
 * It integrates with the Gmail MCP connector to send personalized emails
 * about horses, breeds, and care reminders.
 * 
 * Note: In production, this would be triggered by a scheduled job.
 * For now, it provides the infrastructure for manual newsletter sending.
 */

import { getDb } from "./db";
import { users, horses, stables, breeds, newsletterSubscriptions, userPreferences } from "../drizzle/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";

export interface NewsletterRecipient {
  userId: number;
  email: string;
  name: string | null;
  preferences: {
    frequency: "daily" | "weekly" | "monthly" | "never";
    careReminders: boolean;
    newsAlerts: boolean;
  };
  horses: {
    id: number;
    name: string;
    breedName: string | null;
    stableName: string;
  }[];
  subscribedBreeds: {
    breedId: number;
    breedName: string;
  }[];
}

/**
 * Get all users who should receive newsletters
 */
export async function getNewsletterRecipients(frequency?: "daily" | "weekly" | "monthly"): Promise<NewsletterRecipient[]> {
  const db = await getDb();
  if (!db) return [];

  // Get users with email and newsletter preferences
  const usersWithPrefs = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      frequency: userPreferences.newsletterFrequency,
      careReminders: userPreferences.careReminders,
      newsAlerts: userPreferences.newsAlerts,
    })
    .from(users)
    .leftJoin(userPreferences, eq(users.id, userPreferences.userId))
    .where(
      and(
        isNotNull(users.email),
        frequency ? eq(userPreferences.newsletterFrequency, frequency) : undefined
      )
    );

  const recipients: NewsletterRecipient[] = [];

  for (const user of usersWithPrefs) {
    if (!user.email) continue;
    
    // Skip users who have opted out
    const userFreq = user.frequency || "weekly";
    if (userFreq === "never") continue;
    if (frequency && userFreq !== frequency) continue;

    // Get user's horses with breed info
    const userHorses = await db
      .select({
        id: horses.id,
        name: horses.name,
        breedName: breeds.name,
        stableName: stables.name,
      })
      .from(horses)
      .leftJoin(breeds, eq(horses.breedId, breeds.id))
      .innerJoin(stables, eq(horses.stableId, stables.id))
      .where(eq(horses.userId, user.userId));

    // Get user's subscribed breeds
    const subscriptions = await db
      .select({
        breedId: newsletterSubscriptions.breedId,
        breedName: breeds.name,
      })
      .from(newsletterSubscriptions)
      .leftJoin(breeds, eq(newsletterSubscriptions.breedId, breeds.id))
      .where(
        and(
          eq(newsletterSubscriptions.userId, user.userId),
          eq(newsletterSubscriptions.isActive, true)
        )
      );

    recipients.push({
      userId: user.userId,
      email: user.email,
      name: user.name,
      preferences: {
        frequency: userFreq as "daily" | "weekly" | "monthly" | "never",
        careReminders: user.careReminders ?? true,
        newsAlerts: user.newsAlerts ?? true,
      },
      horses: userHorses.map(h => ({
        id: h.id,
        name: h.name,
        breedName: h.breedName,
        stableName: h.stableName,
      })),
      subscribedBreeds: subscriptions
        .filter(s => s.breedId !== null)
        .map(s => ({
          breedId: s.breedId!,
          breedName: s.breedName || "Unknown Breed",
        })),
    });
  }

  return recipients;
}

/**
 * Generate personalized newsletter content for a user
 */
export function generateNewsletterContent(recipient: NewsletterRecipient): {
  subject: string;
  content: string;
} {
  const greeting = recipient.name ? `Hello ${recipient.name}` : "Hello";
  const horseCount = recipient.horses.length;
  
  let content = `${greeting},\n\n`;
  content += `Welcome to your Equine Wisdom newsletter!\n\n`;

  // Horse summary
  if (horseCount > 0) {
    content += `YOUR STABLES\n`;
    content += `============\n`;
    content += `You have ${horseCount} horse${horseCount > 1 ? "s" : ""} in your virtual stables:\n\n`;
    
    for (const horse of recipient.horses) {
      content += `- ${horse.name}`;
      if (horse.breedName) {
        content += ` (${horse.breedName})`;
      }
      content += ` at ${horse.stableName}\n`;
    }
    content += `\n`;
  }

  // Breed subscriptions
  if (recipient.subscribedBreeds.length > 0) {
    content += `BREED UPDATES\n`;
    content += `=============\n`;
    content += `You're subscribed to updates about:\n`;
    for (const breed of recipient.subscribedBreeds) {
      content += `- ${breed.breedName}\n`;
    }
    content += `\n`;
  }

  // Care reminders section
  if (recipient.preferences.careReminders && horseCount > 0) {
    content += `CARE REMINDERS\n`;
    content += `==============\n`;
    content += `Don't forget to:\n`;
    content += `- Check your horses' water and feed daily\n`;
    content += `- Schedule regular farrier visits (every 6-8 weeks)\n`;
    content += `- Keep up with deworming schedules\n`;
    content += `- Monitor for any changes in behavior or health\n\n`;
  }

  // Educational tip
  content += `DID YOU KNOW?\n`;
  content += `=============\n`;
  content += `Horses can sleep both lying down and standing up! They have a special `;
  content += `"stay apparatus" in their legs that allows them to lock their joints `;
  content += `and rest while standing without falling over.\n\n`;

  // Footer
  content += `---\n`;
  content += `Visit Equine Wisdom to explore more breeds, identify your horse, `;
  content += `and learn natural horse care tips.\n\n`;
  content += `To update your newsletter preferences, visit your account settings.\n`;
  content += `\nHappy trails!\nThe Equine Wisdom Team`;

  const subject = horseCount > 0 
    ? `Your Equine Wisdom Update - ${horseCount} Horse${horseCount > 1 ? "s" : ""} in Your Stable`
    : `Your Equine Wisdom Newsletter`;

  return { subject, content };
}

/**
 * Format newsletter data for Gmail MCP sending
 */
export function formatForGmailMCP(
  recipients: NewsletterRecipient[]
): { to: string[]; subject: string; content: string }[] {
  return recipients.map(recipient => {
    const { subject, content } = generateNewsletterContent(recipient);
    return {
      to: [recipient.email],
      subject,
      content,
    };
  });
}
