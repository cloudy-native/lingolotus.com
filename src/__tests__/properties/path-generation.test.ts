import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getCollectionPath,
  getDeckPath,
  getStudyPath,
  getBookPath,
  getStoryPath,
  getUnitPath,
  withUnitQuery,
  readUnitIdFromSearch,
} from "@/lib/utils";

/**
 * Feature: astro-migration, Property 2: Path Generation Correctness
 *
 * For any valid content identifier string(s), the URL path generation functions
 * SHALL produce a string that starts with `/`, contains each identifier as a path
 * segment in the correct position, and matches the pattern defined in the URL Structure.
 *
 * **Validates: Requirements 3.3, 3.4, 3.5, 3.7, 3.8**
 */

/** Generator for valid ID strings: non-empty, lowercase alphanumeric with hyphens */
const validId = fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/).filter(
  (s) => s.length >= 2,
);

describe("Feature: astro-migration, Property 2: Path Generation Correctness", () => {
  describe("getCollectionPath(collectionId)", () => {
    it("starts with `/`", () => {
      fc.assert(
        fc.property(validId, (collectionId) => {
          const result = getCollectionPath(collectionId);
          expect(result.startsWith("/")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("contains collectionId in correct position", () => {
      fc.assert(
        fc.property(validId, (collectionId) => {
          const result = getCollectionPath(collectionId);
          const segments = result.split("/").filter(Boolean);
          expect(segments[0]).toBe("flash-cards");
          expect(segments[1]).toBe(collectionId);
        }),
        { numRuns: 100 },
      );
    });

    it("matches expected pattern `/flash-cards/{collectionId}`", () => {
      fc.assert(
        fc.property(validId, (collectionId) => {
          const result = getCollectionPath(collectionId);
          expect(result).toBe(`/flash-cards/${collectionId}`);
        }),
        { numRuns: 100 },
      );
    });

    it("has no double slashes", () => {
      fc.assert(
        fc.property(validId, (collectionId) => {
          const result = getCollectionPath(collectionId);
          expect(result).not.toMatch(/\/\//);
        }),
        { numRuns: 100 },
      );
    });

    it("has no trailing slash", () => {
      fc.assert(
        fc.property(validId, (collectionId) => {
          const result = getCollectionPath(collectionId);
          expect(result.endsWith("/")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("getDeckPath(collectionId, deckId)", () => {
    it("starts with `/`", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getDeckPath(collectionId, deckId);
          expect(result.startsWith("/")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("contains IDs in correct positions", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getDeckPath(collectionId, deckId);
          const segments = result.split("/").filter(Boolean);
          expect(segments[0]).toBe("flash-cards");
          expect(segments[1]).toBe(collectionId);
          expect(segments[2]).toBe("decks");
          expect(segments[3]).toBe(deckId);
        }),
        { numRuns: 100 },
      );
    });

    it("matches expected pattern `/flash-cards/{collectionId}/decks/{deckId}`", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getDeckPath(collectionId, deckId);
          expect(result).toBe(`/flash-cards/${collectionId}/decks/${deckId}`);
        }),
        { numRuns: 100 },
      );
    });

    it("has no double slashes", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getDeckPath(collectionId, deckId);
          expect(result).not.toMatch(/\/\//);
        }),
        { numRuns: 100 },
      );
    });

    it("has no trailing slash", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getDeckPath(collectionId, deckId);
          expect(result.endsWith("/")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("getStudyPath(collectionId, deckId)", () => {
    it("starts with `/`", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getStudyPath(collectionId, deckId);
          expect(result.startsWith("/")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("contains IDs in correct positions", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getStudyPath(collectionId, deckId);
          const segments = result.split("/").filter(Boolean);
          expect(segments[0]).toBe("flash-cards");
          expect(segments[1]).toBe(collectionId);
          expect(segments[2]).toBe("decks");
          expect(segments[3]).toBe(deckId);
          expect(segments[4]).toBe("study");
        }),
        { numRuns: 100 },
      );
    });

    it("matches expected pattern `/flash-cards/{collectionId}/decks/{deckId}/study`", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getStudyPath(collectionId, deckId);
          expect(result).toBe(
            `/flash-cards/${collectionId}/decks/${deckId}/study`,
          );
        }),
        { numRuns: 100 },
      );
    });

    it("has no double slashes", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getStudyPath(collectionId, deckId);
          expect(result).not.toMatch(/\/\//);
        }),
        { numRuns: 100 },
      );
    });

    it("has no trailing slash", () => {
      fc.assert(
        fc.property(validId, validId, (collectionId, deckId) => {
          const result = getStudyPath(collectionId, deckId);
          expect(result.endsWith("/")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("getBookPath(bookId)", () => {
    it("starts with `/`", () => {
      fc.assert(
        fc.property(validId, (bookId) => {
          const result = getBookPath(bookId);
          expect(result.startsWith("/")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("contains bookId in correct position", () => {
      fc.assert(
        fc.property(validId, (bookId) => {
          const result = getBookPath(bookId);
          const segments = result.split("/").filter(Boolean);
          expect(segments[0]).toBe("reading");
          expect(segments[1]).toBe(bookId);
        }),
        { numRuns: 100 },
      );
    });

    it("matches expected pattern `/reading/{bookId}`", () => {
      fc.assert(
        fc.property(validId, (bookId) => {
          const result = getBookPath(bookId);
          expect(result).toBe(`/reading/${bookId}`);
        }),
        { numRuns: 100 },
      );
    });

    it("has no double slashes", () => {
      fc.assert(
        fc.property(validId, (bookId) => {
          const result = getBookPath(bookId);
          expect(result).not.toMatch(/\/\//);
        }),
        { numRuns: 100 },
      );
    });

    it("has no trailing slash", () => {
      fc.assert(
        fc.property(validId, (bookId) => {
          const result = getBookPath(bookId);
          expect(result.endsWith("/")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("getStoryPath(bookId, storyId)", () => {
    it("starts with `/`", () => {
      fc.assert(
        fc.property(validId, validId, (bookId, storyId) => {
          const result = getStoryPath(bookId, storyId);
          expect(result.startsWith("/")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("contains IDs in correct positions", () => {
      fc.assert(
        fc.property(validId, validId, (bookId, storyId) => {
          const result = getStoryPath(bookId, storyId);
          const segments = result.split("/").filter(Boolean);
          expect(segments[0]).toBe("reading");
          expect(segments[1]).toBe(bookId);
          expect(segments[2]).toBe(storyId);
        }),
        { numRuns: 100 },
      );
    });

    it("matches expected pattern `/reading/{bookId}/{storyId}`", () => {
      fc.assert(
        fc.property(validId, validId, (bookId, storyId) => {
          const result = getStoryPath(bookId, storyId);
          expect(result).toBe(`/reading/${bookId}/${storyId}`);
        }),
        { numRuns: 100 },
      );
    });

    it("has no double slashes", () => {
      fc.assert(
        fc.property(validId, validId, (bookId, storyId) => {
          const result = getStoryPath(bookId, storyId);
          expect(result).not.toMatch(/\/\//);
        }),
        { numRuns: 100 },
      );
    });

    it("has no trailing slash", () => {
      fc.assert(
        fc.property(validId, validId, (bookId, storyId) => {
          const result = getStoryPath(bookId, storyId);
          expect(result.endsWith("/")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("getUnitPath(unitId)", () => {
    it("matches /unit/{unitId}", () => {
      fc.assert(
        fc.property(validId, (unitId) => {
          const result = getUnitPath(unitId);
          expect(result).toBe(`/unit/${unitId}`);
        }),
        { numRuns: 100 },
      );
    });
  });


  describe("withUnitQuery / readUnitIdFromSearch", () => {
    it("appends unit query", () => {
      expect(withUnitQuery("/flash-cards/a/decks/b/study", "beginner-greetings")).toBe(
        "/flash-cards/a/decks/b/study?unit=beginner-greetings",
      );
      expect(withUnitQuery("/x?y=1", "u")).toBe("/x?y=1&unit=u");
      expect(withUnitQuery("/x", null)).toBe("/x");
    });
    it("reads unit from search", () => {
      expect(readUnitIdFromSearch("?unit=beginner-greetings")).toBe("beginner-greetings");
      expect(readUnitIdFromSearch("")).toBe(null);
    });
  });

});
