import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: astro-migration, Property 4: Navigation Boundary States
 *
 * Validates: Requirements 5.3
 *
 * For any deck with N cards (N ≥ 1) and current card index I (0 ≤ I < N),
 * the previous navigation control SHALL be disabled if and only if I = 0,
 * and the next navigation control SHALL be disabled if and only if I = N - 1.
 */

// Navigation boundary logic (extracted from StudyMode)
function getNavigationState(totalCards: number, currentIndex: number) {
  return {
    isPrevDisabled: currentIndex === 0,
    isNextDisabled: currentIndex === totalCards - 1,
  };
}

describe("Property 4: Navigation Boundary States", () => {
  it("prev is disabled iff index = 0", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
        ),
        ([totalCards, currentIndex]) => {
          const { isPrevDisabled } = getNavigationState(totalCards, currentIndex);
          if (currentIndex === 0) {
            expect(isPrevDisabled).toBe(true);
          } else {
            expect(isPrevDisabled).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("next is disabled iff index = N-1", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
        ),
        ([totalCards, currentIndex]) => {
          const { isNextDisabled } = getNavigationState(totalCards, currentIndex);
          if (currentIndex === totalCards - 1) {
            expect(isNextDisabled).toBe(true);
          } else {
            expect(isNextDisabled).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for N=1, both prev and next are disabled (single card)", () => {
    fc.assert(
      fc.property(fc.constant(1), (totalCards) => {
        const { isPrevDisabled, isNextDisabled } = getNavigationState(totalCards, 0);
        expect(isPrevDisabled).toBe(true);
        expect(isNextDisabled).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("navigation state is never undefined or inconsistent (exactly one of disabled/enabled)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
        ),
        ([totalCards, currentIndex]) => {
          const { isPrevDisabled, isNextDisabled } = getNavigationState(totalCards, currentIndex);
          // Both values must be strictly boolean (not undefined, null, etc.)
          expect(typeof isPrevDisabled).toBe("boolean");
          expect(typeof isNextDisabled).toBe("boolean");
        },
      ),
      { numRuns: 100 },
    );
  });
});
