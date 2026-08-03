import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validateDeckReferences,
  validateStoryReferences,
} from "@/lib/utils";

/**
 * Feature: astro-migration, Property 3: Referential Integrity
 * Validates: Requirements 3.12
 *
 * Verifies that referential integrity validators correctly detect
 * orphaned deck→collection and story→book references, and accept
 * valid references.
 */

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Generates a random alphanumeric ID string (1-20 chars) */
const idArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,19}$/);

/** Generates a set of unique collection IDs */
const collectionIdsArb = fc.uniqueArray(idArb, { minLength: 1, maxLength: 10 });

/** Generates a set of unique book IDs */
const bookIdsArb = fc.uniqueArray(idArb, { minLength: 1, maxLength: 10 });

describe("Feature: astro-migration, Property 3: Referential Integrity", () => {
  // -------------------------------------------------------------------------
  // Property: All valid deck references → valid result
  // -------------------------------------------------------------------------
  describe("Deck → Collection references", () => {
    it("returns valid when all deck collectionIds match existing collections", () => {
      fc.assert(
        fc.property(
          collectionIdsArb,
          fc.array(idArb, { minLength: 1, maxLength: 10 }),
          (collectionIds, deckIds) => {
            // Build collections from the generated IDs
            const collections = collectionIds.map((id) => ({ collectionId: id }));

            // Build decks that only reference existing collections
            const decks = deckIds.map((deckId, i) => ({
              deckId,
              collectionId: collectionIds[i % collectionIds.length],
            }));

            const result = validateDeckReferences(decks, collections);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("returns errors when a deck references a non-existent collection", () => {
      fc.assert(
        fc.property(
          collectionIdsArb,
          fc.uniqueArray(idArb, { minLength: 1, maxLength: 5 }),
          (collectionIds, orphanIds) => {
            // Ensure orphan IDs are not in the collection set
            const collectionSet = new Set(collectionIds);
            const actualOrphans = orphanIds.filter((id) => !collectionSet.has(id));

            // Skip if all "orphan" IDs happened to collide with collection IDs
            fc.pre(actualOrphans.length > 0);

            const collections = collectionIds.map((id) => ({ collectionId: id }));

            // Build decks: some valid, some orphaned
            const validDecks = collectionIds.slice(0, 2).map((colId, i) => ({
              deckId: `valid-deck-${i}`,
              collectionId: colId,
            }));

            const orphanDecks = actualOrphans.map((orphanColId, i) => ({
              deckId: `orphan-deck-${i}`,
              collectionId: orphanColId,
            }));

            const allDecks = [...validDecks, ...orphanDecks];
            const result = validateDeckReferences(allDecks, collections);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(actualOrphans.length);

            // Each error identifies the orphaned deck
            for (const error of result.errors) {
              expect(error.type).toBe("orphaned-deck");
              expect(error.field).toBe("collectionId");
              expect(collectionSet.has(error.referencedId)).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("error count equals number of orphaned deck references", () => {
      fc.assert(
        fc.property(
          collectionIdsArb,
          fc.array(idArb, { minLength: 1, maxLength: 10 }),
          (collectionIds, deckColRefs) => {
            const collections = collectionIds.map((id) => ({ collectionId: id }));
            const collectionSet = new Set(collectionIds);

            // Build decks with arbitrary collectionId references
            const decks = deckColRefs.map((colRef, i) => ({
              deckId: `deck-${i}`,
              collectionId: colRef,
            }));

            const expectedOrphanCount = deckColRefs.filter(
              (ref) => !collectionSet.has(ref),
            ).length;

            const result = validateDeckReferences(decks, collections);

            expect(result.errors.length).toBe(expectedOrphanCount);
            expect(result.valid).toBe(expectedOrphanCount === 0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("returns valid for empty decks input", () => {
      fc.assert(
        fc.property(collectionIdsArb, (collectionIds) => {
          const collections = collectionIds.map((id) => ({ collectionId: id }));
          const result = validateDeckReferences([], collections);

          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 },
      );
    });

    it("returns valid for empty inputs (no decks, no collections)", () => {
      const result = validateDeckReferences([], []);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Property: Story → Book references (same pattern)
  // -------------------------------------------------------------------------
  describe("Story → Book references", () => {
    it("returns valid when all story bookIds match existing books", () => {
      fc.assert(
        fc.property(
          bookIdsArb,
          fc.array(idArb, { minLength: 1, maxLength: 10 }),
          (bookIds, storyIds) => {
            const books = bookIds.map((id) => ({ bookId: id }));

            // Build stories that only reference existing books
            const stories = storyIds.map((storyId, i) => ({
              storyId,
              bookId: bookIds[i % bookIds.length],
            }));

            const result = validateStoryReferences(stories, books);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("returns errors when a story references a non-existent book", () => {
      fc.assert(
        fc.property(
          bookIdsArb,
          fc.uniqueArray(idArb, { minLength: 1, maxLength: 5 }),
          (bookIds, orphanIds) => {
            const bookSet = new Set(bookIds);
            const actualOrphans = orphanIds.filter((id) => !bookSet.has(id));

            fc.pre(actualOrphans.length > 0);

            const books = bookIds.map((id) => ({ bookId: id }));

            const validStories = bookIds.slice(0, 2).map((bId, i) => ({
              storyId: `valid-story-${i}`,
              bookId: bId,
            }));

            const orphanStories = actualOrphans.map((orphanBookId, i) => ({
              storyId: `orphan-story-${i}`,
              bookId: orphanBookId,
            }));

            const allStories = [...validStories, ...orphanStories];
            const result = validateStoryReferences(allStories, books);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(actualOrphans.length);

            for (const error of result.errors) {
              expect(error.type).toBe("orphaned-story");
              expect(error.field).toBe("bookId");
              expect(bookSet.has(error.referencedId)).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("error count equals number of orphaned story references", () => {
      fc.assert(
        fc.property(
          bookIdsArb,
          fc.array(idArb, { minLength: 1, maxLength: 10 }),
          (bookIds, storyBookRefs) => {
            const books = bookIds.map((id) => ({ bookId: id }));
            const bookSet = new Set(bookIds);

            const stories = storyBookRefs.map((bookRef, i) => ({
              storyId: `story-${i}`,
              bookId: bookRef,
            }));

            const expectedOrphanCount = storyBookRefs.filter(
              (ref) => !bookSet.has(ref),
            ).length;

            const result = validateStoryReferences(stories, books);

            expect(result.errors.length).toBe(expectedOrphanCount);
            expect(result.valid).toBe(expectedOrphanCount === 0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("returns valid for empty stories input", () => {
      fc.assert(
        fc.property(bookIdsArb, (bookIds) => {
          const books = bookIds.map((id) => ({ bookId: id }));
          const result = validateStoryReferences([], books);

          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 },
      );
    });

    it("returns valid for empty inputs (no stories, no books)", () => {
      const result = validateStoryReferences([], []);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
