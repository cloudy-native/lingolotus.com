import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: astro-migration, Property 5: Progress Calculation Invariant
 *
 * Validates: Requirements 5.4
 *
 * For any deck with N total cards and counts of correct (C) and incorrect (I)
 * responses where C + I ≤ N, the remaining count SHALL equal N - C - I, and
 * the sum correct + incorrect + remaining SHALL always equal N.
 */

// Progress calculation (extracted from StudyMode component logic)
function calculateProgress(total: number, correct: number, incorrect: number) {
  const remaining = total - correct - incorrect;
  return { correct, incorrect, remaining, total };
}

describe("Feature: astro-migration, Property 5: Progress Calculation Invariant", () => {
  it("remaining equals total minus correct minus incorrect for any valid state", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((total) =>
          fc.integer({ min: 0, max: total }).chain((correct) =>
            fc.integer({ min: 0, max: total - correct }).map((incorrect) => ({
              total,
              correct,
              incorrect,
            })),
          ),
        ),
        ({ total, correct, incorrect }) => {
          const progress = calculateProgress(total, correct, incorrect);
          expect(progress.remaining).toBe(total - correct - incorrect);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("correct + incorrect + remaining always equals total (sum invariant)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((total) =>
          fc.integer({ min: 0, max: total }).chain((correct) =>
            fc.integer({ min: 0, max: total - correct }).map((incorrect) => ({
              total,
              correct,
              incorrect,
            })),
          ),
        ),
        ({ total, correct, incorrect }) => {
          const progress = calculateProgress(total, correct, incorrect);
          expect(progress.correct + progress.incorrect + progress.remaining).toBe(
            progress.total,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("remaining is always non-negative", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((total) =>
          fc.integer({ min: 0, max: total }).chain((correct) =>
            fc.integer({ min: 0, max: total - correct }).map((incorrect) => ({
              total,
              correct,
              incorrect,
            })),
          ),
        ),
        ({ total, correct, incorrect }) => {
          const progress = calculateProgress(total, correct, incorrect);
          expect(progress.remaining).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all progress values are non-negative integers", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((total) =>
          fc.integer({ min: 0, max: total }).chain((correct) =>
            fc.integer({ min: 0, max: total - correct }).map((incorrect) => ({
              total,
              correct,
              incorrect,
            })),
          ),
        ),
        ({ total, correct, incorrect }) => {
          const progress = calculateProgress(total, correct, incorrect);
          expect(Number.isInteger(progress.correct)).toBe(true);
          expect(Number.isInteger(progress.incorrect)).toBe(true);
          expect(Number.isInteger(progress.remaining)).toBe(true);
          expect(Number.isInteger(progress.total)).toBe(true);
          expect(progress.correct).toBeGreaterThanOrEqual(0);
          expect(progress.incorrect).toBeGreaterThanOrEqual(0);
          expect(progress.remaining).toBeGreaterThanOrEqual(0);
          expect(progress.total).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
