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
  getUserIdentificationHistory
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
});

export type AppRouter = typeof appRouter;
