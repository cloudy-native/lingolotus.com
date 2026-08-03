import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { z } from "zod";

/**
 * Feature: astro-migration, Property 1: Schema Validation Round-Trip
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 *
 * For any valid data object conforming to a content collection schema,
 * serializing it to JSON and parsing it through the Zod schema SHALL produce
 * an equivalent object with all fields preserved. For any object missing a
 * required field or containing an invalid type, the schema SHALL reject it
 * with a validation error.
 */

// ---------------------------------------------------------------------------
// Schema Definitions (mirroring src/content/config.ts without astro:content)
// ---------------------------------------------------------------------------

const flashcardCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string(),
  description: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  imageUrl: z.string().optional(),
});

const flashcardDeckSchema = z.object({
  collectionId: z.string(),
  deckId: z.string(),
  name: z.string(),
  description: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  cards: z
    .array(
      z.object({
        frontContent: z.object({ type: z.literal("text"), text: z.string() }),
        backContent: z.object({ type: z.literal("text"), text: z.string() }),
        tags: z.array(z.string()),
        difficulty: z.string(),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
        phonetic: z.string().optional(),
        partOfSpeech: z.string().optional(),
        context: z.string().optional(),
        examples: z
          .array(
            z.object({
              original: z.string(),
              translation: z.string(),
              phonetic: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  theme: z.string(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
});

const bookSchema = z.object({
  bookId: z.string(),
  name: z.string(),
  description: z.string(),
  sourceLanguage: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  targetLanguage: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  imageUrl: z.string().optional(),
});

const storySchema = z.object({
  storyId: z.string(),
  bookId: z.string(),
  language: z.string(),
  title: z.object({ source: z.string(), target: z.string() }),
  sentences: z
    .array(
      z.object({
        source: z.string(),
        target: z.string(),
        phonetic: z.string(),
        breakdown: z
          .array(
            z.object({
              source: z.string(),
              target: z.string(),
              phonetic: z.string(),
              partOfSpeech: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  difficulty: z.string().optional(),
  summary: z.object({ source: z.string(), target: z.string() }).optional(),
});

const languageSchema = z.object({
  languageCode: z.string(),
  language: z.string(),
  english: z.string(),
  flag: z.string(),
});

// ---------------------------------------------------------------------------
// Arbitraries (generators for valid objects)
// ---------------------------------------------------------------------------

/** Non-empty string arbitrary for required fields */
const nonEmptyStr = fc.string({ minLength: 1, maxLength: 50 });

/** Arbitrary for optional string fields */
const optionalStr = fc.option(nonEmptyStr, { nil: undefined });

/** Arbitrary for optional boolean fields */
const optionalBool = fc.option(fc.boolean(), { nil: undefined });

const flashcardCollectionArb = fc.record({
  collectionId: nonEmptyStr,
  name: nonEmptyStr,
  description: nonEmptyStr,
  sourceLanguage: nonEmptyStr,
  targetLanguage: nonEmptyStr,
  createdAt: nonEmptyStr,
  updatedAt: nonEmptyStr,
  category: optionalStr,
  difficulty: optionalStr,
  imageUrl: optionalStr,
});

const exampleArb = fc.record({
  original: nonEmptyStr,
  translation: nonEmptyStr,
  phonetic: optionalStr,
});

const cardArb = fc.record({
  frontContent: fc.record({
    type: fc.constant("text" as const),
    text: nonEmptyStr,
  }),
  backContent: fc.record({
    type: fc.constant("text" as const),
    text: nonEmptyStr,
  }),
  tags: fc.array(nonEmptyStr, { minLength: 0, maxLength: 5 }),
  difficulty: nonEmptyStr,
  sourceLanguage: nonEmptyStr,
  targetLanguage: nonEmptyStr,
  phonetic: optionalStr,
  partOfSpeech: optionalStr,
  context: optionalStr,
  examples: fc.option(fc.array(exampleArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined,
  }),
});

const flashcardDeckArb = fc.record({
  collectionId: nonEmptyStr,
  deckId: nonEmptyStr,
  name: nonEmptyStr,
  description: nonEmptyStr,
  sourceLanguage: nonEmptyStr,
  targetLanguage: nonEmptyStr,
  cards: fc.array(cardArb, { minLength: 1, maxLength: 3 }),
  createdAt: nonEmptyStr,
  updatedAt: nonEmptyStr,
  theme: nonEmptyStr,
  category: optionalStr,
  difficulty: optionalStr,
});

const bookArb = fc.record({
  bookId: nonEmptyStr,
  name: nonEmptyStr,
  description: nonEmptyStr,
  sourceLanguage: nonEmptyStr,
  createdAt: nonEmptyStr,
  updatedAt: nonEmptyStr,
  targetLanguage: optionalStr,
  category: optionalStr,
  difficulty: optionalStr,
  imageUrl: optionalStr,
});

const breakdownArb = fc.record({
  source: nonEmptyStr,
  target: nonEmptyStr,
  phonetic: nonEmptyStr,
  partOfSpeech: optionalStr,
});

const sentenceArb = fc.record({
  source: nonEmptyStr,
  target: nonEmptyStr,
  phonetic: nonEmptyStr,
  breakdown: fc.option(fc.array(breakdownArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined,
  }),
});

const storyArb = fc.record({
  storyId: nonEmptyStr,
  bookId: nonEmptyStr,
  language: nonEmptyStr,
  title: fc.record({ source: nonEmptyStr, target: nonEmptyStr }),
  sentences: fc.array(sentenceArb, { minLength: 1, maxLength: 3 }),
  createdAt: nonEmptyStr,
  updatedAt: nonEmptyStr,
  difficulty: optionalStr,
  summary: fc.option(
    fc.record({ source: nonEmptyStr, target: nonEmptyStr }),
    { nil: undefined },
  ),
});

const languageArb = fc.record({
  languageCode: nonEmptyStr,
  language: nonEmptyStr,
  english: nonEmptyStr,
  flag: nonEmptyStr,
});

// ---------------------------------------------------------------------------
// Helper: strip undefined keys for comparison after JSON round-trip
// ---------------------------------------------------------------------------

function stripUndefined(obj: unknown): unknown {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Property Tests
// ---------------------------------------------------------------------------

describe("Feature: astro-migration, Property 1: Schema Validation Round-Trip", () => {
  describe("Valid objects: parse → serialize → parse identity", () => {
    it("flashcardCollections: round-trip preserves all fields", () => {
      fc.assert(
        fc.property(flashcardCollectionArb, (obj) => {
          // Parse with Zod
          const parsed = flashcardCollectionSchema.parse(obj);
          // Serialize to JSON and parse again
          const serialized = JSON.stringify(parsed);
          const reparsed = flashcardCollectionSchema.parse(JSON.parse(serialized));
          // Round-trip should preserve all fields
          expect(reparsed).toEqual(stripUndefined(parsed));
        }),
        { numRuns: 100 },
      );
    });

    it("flashcardDecks: round-trip preserves all fields", () => {
      fc.assert(
        fc.property(flashcardDeckArb, (obj) => {
          const parsed = flashcardDeckSchema.parse(obj);
          const serialized = JSON.stringify(parsed);
          const reparsed = flashcardDeckSchema.parse(JSON.parse(serialized));
          expect(reparsed).toEqual(stripUndefined(parsed));
        }),
        { numRuns: 100 },
      );
    });

    it("books: round-trip preserves all fields", () => {
      fc.assert(
        fc.property(bookArb, (obj) => {
          const parsed = bookSchema.parse(obj);
          const serialized = JSON.stringify(parsed);
          const reparsed = bookSchema.parse(JSON.parse(serialized));
          expect(reparsed).toEqual(stripUndefined(parsed));
        }),
        { numRuns: 100 },
      );
    });

    it("stories: round-trip preserves all fields", () => {
      fc.assert(
        fc.property(storyArb, (obj) => {
          const parsed = storySchema.parse(obj);
          const serialized = JSON.stringify(parsed);
          const reparsed = storySchema.parse(JSON.parse(serialized));
          expect(reparsed).toEqual(stripUndefined(parsed));
        }),
        { numRuns: 100 },
      );
    });

    it("languages: round-trip preserves all fields", () => {
      fc.assert(
        fc.property(languageArb, (obj) => {
          const parsed = languageSchema.parse(obj);
          const serialized = JSON.stringify(parsed);
          const reparsed = languageSchema.parse(JSON.parse(serialized));
          expect(reparsed).toEqual(stripUndefined(parsed));
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("Invalid objects: schema rejects missing required fields", () => {
    it("flashcardCollections: rejects objects missing required fields", () => {
      const requiredFields = [
        "collectionId",
        "name",
        "description",
        "sourceLanguage",
        "targetLanguage",
        "createdAt",
        "updatedAt",
      ];

      fc.assert(
        fc.property(
          flashcardCollectionArb,
          fc.constantFrom(...requiredFields),
          (obj, fieldToRemove) => {
            const invalid = { ...obj } as Record<string, unknown>;
            delete invalid[fieldToRemove];
            const result = flashcardCollectionSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("flashcardDecks: rejects objects missing required fields", () => {
      const requiredFields = [
        "collectionId",
        "deckId",
        "name",
        "description",
        "sourceLanguage",
        "targetLanguage",
        "cards",
        "createdAt",
        "updatedAt",
        "theme",
      ];

      fc.assert(
        fc.property(
          flashcardDeckArb,
          fc.constantFrom(...requiredFields),
          (obj, fieldToRemove) => {
            const invalid = { ...obj } as Record<string, unknown>;
            delete invalid[fieldToRemove];
            const result = flashcardDeckSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("books: rejects objects missing required fields", () => {
      const requiredFields = [
        "bookId",
        "name",
        "description",
        "sourceLanguage",
        "createdAt",
        "updatedAt",
      ];

      fc.assert(
        fc.property(
          bookArb,
          fc.constantFrom(...requiredFields),
          (obj, fieldToRemove) => {
            const invalid = { ...obj } as Record<string, unknown>;
            delete invalid[fieldToRemove];
            const result = bookSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("stories: rejects objects missing required fields", () => {
      const requiredFields = [
        "storyId",
        "bookId",
        "language",
        "title",
        "sentences",
        "createdAt",
        "updatedAt",
      ];

      fc.assert(
        fc.property(
          storyArb,
          fc.constantFrom(...requiredFields),
          (obj, fieldToRemove) => {
            const invalid = { ...obj } as Record<string, unknown>;
            delete invalid[fieldToRemove];
            const result = storySchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("languages: rejects objects missing required fields", () => {
      const requiredFields = ["languageCode", "language", "english", "flag"];

      fc.assert(
        fc.property(
          languageArb,
          fc.constantFrom(...requiredFields),
          (obj, fieldToRemove) => {
            const invalid = { ...obj } as Record<string, unknown>;
            delete invalid[fieldToRemove];
            const result = languageSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("Invalid objects: schema rejects wrong types", () => {
    it("flashcardCollections: rejects when string fields have wrong type", () => {
      const stringFields = [
        "collectionId",
        "name",
        "description",
        "sourceLanguage",
        "targetLanguage",
        "createdAt",
        "updatedAt",
      ];

      fc.assert(
        fc.property(
          flashcardCollectionArb,
          fc.constantFrom(...stringFields),
          fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
          (obj, fieldToCorrupt, wrongValue) => {
            const invalid = { ...obj, [fieldToCorrupt]: wrongValue };
            const result = flashcardCollectionSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("flashcardDecks: rejects when cards field is not an array", () => {
      fc.assert(
        fc.property(
          flashcardDeckArb,
          fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
          (obj, wrongValue) => {
            const invalid = { ...obj, cards: wrongValue };
            const result = flashcardDeckSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("flashcardDecks: rejects when cards array is empty", () => {
      fc.assert(
        fc.property(flashcardDeckArb, (obj) => {
          const invalid = { ...obj, cards: [] };
          const result = flashcardDeckSchema.safeParse(invalid);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("stories: rejects when sentences array is empty", () => {
      fc.assert(
        fc.property(storyArb, (obj) => {
          const invalid = { ...obj, sentences: [] };
          const result = storySchema.safeParse(invalid);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("stories: rejects when title has wrong structure", () => {
      fc.assert(
        fc.property(
          storyArb,
          fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
          (obj, wrongValue) => {
            const invalid = { ...obj, title: wrongValue };
            const result = storySchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("languages: rejects when any required field has wrong type", () => {
      const requiredFields = ["languageCode", "language", "english", "flag"];

      fc.assert(
        fc.property(
          languageArb,
          fc.constantFrom(...requiredFields),
          fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
          (obj, fieldToCorrupt, wrongValue) => {
            const invalid = { ...obj, [fieldToCorrupt]: wrongValue };
            const result = languageSchema.safeParse(invalid);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
