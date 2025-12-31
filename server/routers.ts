import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { 
  getAllBreeds, 
  getBreedBySlug, 
  getBreedById,
  searchBreeds, 
  getBreedsByCategory,
  getPopularBreeds,
  getAllFacts,
  getFactsByCategory,
  getFactsByAudienceLevel,
  getRandomFacts,
  saveIdentificationHistory,
  getUserIdentificationHistory,
  // Stables
  createStable,
  getUserStables,
  getStableById,
  updateStable,
  deleteStable,
  getStableWithHorseCount,
  // Horses
  createHorse,
  getUserHorses,
  getStableHorses,
  getHorseById,
  updateHorse,
  deleteHorse,
  getHorseWithBreed,
  // Search History
  addSearchHistory,
  getUserSearchHistory,
  getSearchHistoryByType,
  clearUserSearchHistory,
  // User Preferences
  getUserPreferences,
  createOrUpdateUserPreferences,
  // Saved Breeds
  saveBreed,
  getUserSavedBreeds,
  isBreedSaved,
  removeSavedBreed,
  // Care Logs
  createCareLog,
  getHorseCareLogs,
  getCareLogsByType,
  getUpcomingCareReminders,
  deleteCareLog,
  // Newsletter
  createNewsletterSubscription,
  getUserNewsletterSubscriptions,
  updateNewsletterSubscription,
  deleteNewsletterSubscription,
  // Dashboard
  getUserDashboardStats,
  getRecentIdentifications
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  breeds: router({
    list: publicProcedure.query(async () => {
      return getAllBreeds();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getBreedBySlug(input.slug);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBreedById(input.id);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        if (!input.query.trim()) {
          return getAllBreeds();
        }
        return searchBreeds(input.query);
      }),
    
    byCategory: publicProcedure
      .input(z.object({ 
        category: z.enum(["light", "draft", "pony", "gaited", "warmblood"]) 
      }))
      .query(async ({ input }) => {
        return getBreedsByCategory(input.category);
      }),
    
    popular: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getPopularBreeds(input?.limit ?? 10);
      }),
  }),

  facts: router({
    list: publicProcedure.query(async () => {
      return getAllFacts();
    }),
    
    byCategory: publicProcedure
      .input(z.object({ 
        category: z.enum(["general", "health", "behavior", "nutrition", "training", "history", "care"]) 
      }))
      .query(async ({ input }) => {
        return getFactsByCategory(input.category);
      }),
    
    byLevel: publicProcedure
      .input(z.object({ 
        level: z.enum(["beginner", "intermediate", "advanced", "all"]) 
      }))
      .query(async ({ input }) => {
        return getFactsByAudienceLevel(input.level);
      }),
    
    random: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getRandomFacts(input?.limit ?? 5);
      }),
  }),

  identify: router({
    analyze: publicProcedure
      .input(z.object({
        description: z.string().min(10, "Please provide more details about your horse"),
        size: z.string().optional(),
        color: z.string().optional(),
        build: z.string().optional(),
        distinctiveFeatures: z.string().optional(),
        horseId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get all breeds for context
        const allBreeds = await getAllBreeds();
        
        // Build the prompt for breed identification
        const breedContext = allBreeds.map(b => 
          `${b.name}: ${b.category} breed, ${b.heightMin}-${b.heightMax} hands, colors: ${(b.colors as string[])?.join(', ')}, features: ${b.distinctiveFeatures}`
        ).join('\n');
        
        const userDescription = [
          input.description,
          input.size ? `Size: ${input.size}` : '',
          input.color ? `Color: ${input.color}` : '',
          input.build ? `Build: ${input.build}` : '',
          input.distinctiveFeatures ? `Distinctive features: ${input.distinctiveFeatures}` : '',
        ].filter(Boolean).join('\n');

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert equine specialist helping identify horse breeds. Based on the user's description, analyze which breed(s) their horse might be. Consider physical characteristics, size, color, build, and any distinctive features.

Here are the breeds in our database:
${breedContext}

Respond with a JSON object containing:
- matches: array of up to 3 most likely breeds, each with:
  - breedName: exact name from the database
  - confidence: number 0-100 representing how confident you are
  - reasoning: brief explanation of why this breed matches
- additionalNotes: any helpful observations or suggestions for the owner`
            },
            {
              role: "user",
              content: `Please identify the breed of my horse based on this description:\n\n${userDescription}`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "breed_identification",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        breedName: { type: "string" },
                        confidence: { type: "number" },
                        reasoning: { type: "string" }
                      },
                      required: ["breedName", "confidence", "reasoning"],
                      additionalProperties: false
                    }
                  },
                  additionalNotes: { type: "string" }
                },
                required: ["matches", "additionalNotes"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error("Failed to get AI response");
        }

        const result = JSON.parse(content) as {
          matches: { breedName: string; confidence: number; reasoning: string }[];
          additionalNotes: string;
        };

        // Enrich matches with full breed data
        const enrichedMatches = await Promise.all(
          result.matches.map(async (match) => {
            const breed = allBreeds.find(b => 
              b.name.toLowerCase() === match.breedName.toLowerCase()
            );
            return {
              ...match,
              breed: breed || null,
              breedId: breed?.id || null
            };
          })
        );

        // Save to history if user is logged in
        if (ctx.user) {
          await saveIdentificationHistory({
            userId: ctx.user.id,
            description: userDescription,
            matchedBreeds: enrichedMatches.map(m => ({
              breedId: m.breedId || 0,
              confidence: m.confidence,
              breedName: m.breedName
            }))
          });
        }

        return {
          matches: enrichedMatches,
          additionalNotes: result.additionalNotes
        };
      }),
    
    history: protectedProcedure.query(async ({ ctx }) => {
      return getUserIdentificationHistory(ctx.user.id);
    }),
  }),

  // ==================== Stables Router ====================
  stables: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Stable name is required").max(255),
        description: z.string().optional(),
        location: z.string().optional(),
        capacity: z.number().min(1).max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createStable({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          location: input.location,
          capacity: input.capacity,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getStableWithHorseCount(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return getStableById(input.id, ctx.user.id);
      }),

    getWithHorses: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const stable = await getStableById(input.id, ctx.user.id);
        if (!stable) return null;
        
        const stableHorses = await getStableHorses(input.id, ctx.user.id);
        return { ...stable, horses: stableHorses };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        capacity: z.number().min(1).max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return updateStable(id, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return deleteStable(input.id, ctx.user.id);
      }),
  }),

  // ==================== Horses Router ====================
  horses: router({
    create: protectedProcedure
      .input(z.object({
        stableId: z.number(),
        name: z.string().min(1, "Horse name is required").max(255),
        breedId: z.number().optional(),
        age: z.number().min(0).max(50).optional(),
        gender: z.enum(["mare", "stallion", "gelding", "colt", "filly", "unknown"]).optional(),
        color: z.string().optional(),
        markings: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        notes: z.string().optional(),
        specialNeeds: z.string().optional(),
        feedingSchedule: z.string().optional(),
        veterinarian: z.string().optional(),
        farrier: z.string().optional(),
        dateOfBirth: z.date().optional(),
        dateAcquired: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify stable belongs to user
        const stable = await getStableById(input.stableId, ctx.user.id);
        if (!stable) {
          throw new Error("Stable not found");
        }
        
        return createHorse({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserHorses(ctx.user.id);
    }),

    listByStable: protectedProcedure
      .input(z.object({ stableId: z.number() }))
      .query(async ({ input, ctx }) => {
        return getStableHorses(input.stableId, ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return getHorseWithBreed(input.id, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        breedId: z.number().optional(),
        age: z.number().min(0).max(50).optional(),
        gender: z.enum(["mare", "stallion", "gelding", "colt", "filly", "unknown"]).optional(),
        color: z.string().optional(),
        markings: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        notes: z.string().optional(),
        specialNeeds: z.string().optional(),
        feedingSchedule: z.string().optional(),
        veterinarian: z.string().optional(),
        farrier: z.string().optional(),
        matchedBreedId: z.number().optional(),
        matchConfidence: z.number().optional(),
        identificationDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return updateHorse(id, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return deleteHorse(input.id, ctx.user.id);
      }),

    // Link breed identification to a horse
    linkIdentification: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        breedId: z.number(),
        confidence: z.number(),
        description: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return updateHorse(input.horseId, ctx.user.id, {
          matchedBreedId: input.breedId,
          matchConfidence: input.confidence,
          identificationDescription: input.description,
        });
      }),
  }),

  // ==================== Search History Router ====================
  searchHistory: router({
    add: protectedProcedure
      .input(z.object({
        searchType: z.enum(["breed_search", "identification", "browse"]),
        query: z.string().optional(),
        category: z.string().optional(),
        filters: z.record(z.string(), z.unknown()).optional(),
        resultsCount: z.number().optional(),
        selectedBreedId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return addSearchHistory({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        return getUserSearchHistory(ctx.user.id, input?.limit ?? 20);
      }),

    listByType: protectedProcedure
      .input(z.object({
        searchType: z.enum(["breed_search", "identification", "browse"]),
        limit: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return getSearchHistoryByType(ctx.user.id, input.searchType, input.limit ?? 10);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return clearUserSearchHistory(ctx.user.id);
    }),

    recent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        return getRecentIdentifications(ctx.user.id, input?.limit ?? 5);
      }),
  }),

  // ==================== User Preferences Router ====================
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserPreferences(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        emailNotifications: z.boolean().optional(),
        newsletterFrequency: z.enum(["daily", "weekly", "monthly", "never"]).optional(),
        careReminders: z.boolean().optional(),
        newsAlerts: z.boolean().optional(),
        favoriteCategories: z.array(z.string()).optional(),
        experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        measurementUnit: z.enum(["imperial", "metric"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createOrUpdateUserPreferences(ctx.user.id, input);
      }),
  }),

  // ==================== Saved Breeds Router ====================
  savedBreeds: router({
    save: protectedProcedure
      .input(z.object({
        breedId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return saveBreed(ctx.user.id, input.breedId, input.notes);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserSavedBreeds(ctx.user.id);
    }),

    isSaved: protectedProcedure
      .input(z.object({ breedId: z.number() }))
      .query(async ({ input, ctx }) => {
        return isBreedSaved(ctx.user.id, input.breedId);
      }),

    remove: protectedProcedure
      .input(z.object({ breedId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return removeSavedBreed(ctx.user.id, input.breedId);
      }),
  }),

  // ==================== Care Logs Router ====================
  careLogs: router({
    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        careType: z.enum(["feeding", "grooming", "exercise", "veterinary", "farrier", "medication", "other"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        date: z.date(),
        cost: z.number().optional(),
        nextDueDate: z.date().optional(),
        reminderSet: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify horse belongs to user
        const horse = await getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new Error("Horse not found");
        }
        
        return createCareLog({
          ...input,
          userId: ctx.user.id,
        });
      }),

    listByHorse: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return getHorseCareLogs(input.horseId, ctx.user.id, input.limit ?? 50);
      }),

    listByType: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        careType: z.enum(["feeding", "grooming", "exercise", "veterinary", "farrier", "medication", "other"]),
      }))
      .query(async ({ input, ctx }) => {
        return getCareLogsByType(input.horseId, ctx.user.id, input.careType);
      }),

    upcomingReminders: protectedProcedure.query(async ({ ctx }) => {
      return getUpcomingCareReminders(ctx.user.id);
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return deleteCareLog(input.id, ctx.user.id);
      }),
  }),

  // ==================== Newsletter Subscriptions Router ====================
  newsletter: router({
    subscribe: protectedProcedure
      .input(z.object({
        breedId: z.number().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createNewsletterSubscription({
          userId: ctx.user.id,
          breedId: input.breedId,
          category: input.category,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserNewsletterSubscriptions(ctx.user.id);
    }),

    toggle: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        return updateNewsletterSubscription(input.id, ctx.user.id, input.isActive);
      }),

    unsubscribe: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return deleteNewsletterSubscription(input.id, ctx.user.id);
      }),
  }),

  // ==================== Dashboard Router ====================
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return getUserDashboardStats(ctx.user.id);
    }),
  }),

  // ==================== Admin Newsletter Router ====================
  adminNewsletter: router({
    preview: protectedProcedure.query(async ({ ctx }) => {
      // Only allow admin users
      if (ctx.user.role !== 'admin') {
        throw new Error('Admin access required');
      }
      const { getNewsletterRecipients, generateNewsletterContent } = await import('./newsletter');
      const recipients = await getNewsletterRecipients();
      return recipients.map(r => ({
        userId: r.userId,
        email: r.email,
        name: r.name,
        horseCount: r.horses.length,
        preview: generateNewsletterContent(r),
      }));
    }),

    getRecipientCount: protectedProcedure
      .input(z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Admin access required');
        }
        const { getNewsletterRecipients } = await import('./newsletter');
        const recipients = await getNewsletterRecipients(input?.frequency);
        return {
          total: recipients.length,
          withHorses: recipients.filter(r => r.horses.length > 0).length,
          withSubscriptions: recipients.filter(r => r.subscribedBreeds.length > 0).length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
