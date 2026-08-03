import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateImageReferences } from "@/lib/image-validation";

/**
 * Feature: astro-migration, Property 9: Image Reference Validation
 * Validates: Requirements 11.4
 *
 * Verifies that validateImageReferences correctly identifies missing image
 * files and reports success for existing ones.
 */

// ---------------------------------------------------------------------------
// Test setup: temporary directory with known files
// ---------------------------------------------------------------------------

let tempPublicDir: string;
const EXISTING_FILES = [
  "images/photo.jpg",
  "images/cover.png",
  "images/cards/deck1.webp",
  "assets/logo.svg",
  "images/books/thai-beginner.jpg",
];

beforeAll(() => {
  tempPublicDir = fs.mkdtempSync(path.join(os.tmpdir(), "img-validation-"));

  // Create the known existing files
  for (const filePath of EXISTING_FILES) {
    const fullPath = path.join(tempPublicDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, "test-content");
  }
});

afterAll(() => {
  fs.rmSync(tempPublicDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Generates a random entry ID */
const entryIdArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

/** Generates a random collection name */
const collectionArb = fc.constantFrom(
  "flashcard-collections",
  "books",
  "flashcard-decks",
  "stories",
);

/** Picks one of the known existing file paths (with leading slash) */
const existingImageUrlArb = fc.constantFrom(
  ...EXISTING_FILES.map((f) => `/${f}`),
);

/** Generates a random non-existing image path */
const missingImageUrlArb = fc
  .stringMatching(/^[a-z][a-z0-9/_-]{1,30}\.(png|jpg|webp|svg)$/)
  .filter((p) => !EXISTING_FILES.includes(p));

describe("Feature: astro-migration, Property 9: Image Reference Validation", () => {
  // -------------------------------------------------------------------------
  // Property: Entries with no imageUrl → always valid, no errors
  // -------------------------------------------------------------------------
  it("entries with no imageUrl are always valid", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
          }),
          { minLength: 0, maxLength: 20 },
        ),
        (entries) => {
          // Entries without imageUrl field
          const result = validateImageReferences(entries, tempPublicDir);

          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property: Entries with imageUrl pointing to existing files → valid
  // -------------------------------------------------------------------------
  it("entries with imageUrl pointing to existing files are valid", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: existingImageUrlArb,
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (entries) => {
          const result = validateImageReferences(entries, tempPublicDir);

          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property: Entries with imageUrl pointing to non-existing files → error
  // with correct entryId and imageUrl
  // -------------------------------------------------------------------------
  it("entries with imageUrl pointing to non-existing files produce errors with correct entryId and imageUrl", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: missingImageUrlArb,
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (entries) => {
          const result = validateImageReferences(entries, tempPublicDir);

          expect(result.valid).toBe(false);
          expect(result.errors.length).toBe(entries.length);

          // Each error correctly identifies the entry and the missing image
          for (let i = 0; i < entries.length; i++) {
            const error = result.errors[i];
            expect(error.entryId).toBe(entries[i].id);
            expect(error.imageUrl).toBe(entries[i].imageUrl);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property: Error count equals number of entries with missing image references
  // -------------------------------------------------------------------------
  it("error count equals number of entries with missing image references", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: existingImageUrlArb,
          }),
          { minLength: 0, maxLength: 5 },
        ),
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: missingImageUrlArb,
          }),
          { minLength: 0, maxLength: 5 },
        ),
        (validEntries, invalidEntries) => {
          const allEntries = [...validEntries, ...invalidEntries];
          const result = validateImageReferences(allEntries, tempPublicDir);

          expect(result.errors.length).toBe(invalidEntries.length);
          expect(result.valid).toBe(invalidEntries.length === 0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property: Mixed valid/invalid entries → errors only for invalid ones
  // -------------------------------------------------------------------------
  it("mixed valid/invalid entries produce errors only for invalid ones", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: existingImageUrlArb,
          }),
          { minLength: 1, maxLength: 5 },
        ),
        fc.array(
          fc.record({
            id: entryIdArb,
            collection: collectionArb,
            imageUrl: missingImageUrlArb,
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (validEntries, invalidEntries) => {
          // Interleave valid and invalid entries
          const allEntries = [...validEntries, ...invalidEntries];
          const result = validateImageReferences(allEntries, tempPublicDir);

          expect(result.valid).toBe(false);
          expect(result.errors.length).toBe(invalidEntries.length);

          // All errors should reference invalid entry IDs
          const invalidIds = new Set(invalidEntries.map((e) => e.id));
          const invalidUrls = new Set(invalidEntries.map((e) => e.imageUrl));

          for (const error of result.errors) {
            expect(invalidIds.has(error.entryId)).toBe(true);
            expect(invalidUrls.has(error.imageUrl)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
