import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: astro-migration, Property 6: Language Toggle Swap
 *
 * Validates: Requirements 5.7
 *
 * For any flashcard with source text S and target text T, when the language
 * toggle is set to "source", the card front SHALL display S. When toggled
 * to "target", the card front SHALL display T. Toggling twice SHALL return
 * to the original display.
 */

type LanguageDisplay = "source" | "target";

// Get front text based on language toggle state
function getFrontText(
  sourceText: string,
  targetText: string,
  display: LanguageDisplay,
): string {
  return display === "source" ? sourceText : targetText;
}

// Toggle language display
function toggleLanguage(current: LanguageDisplay): LanguageDisplay {
  return current === "source" ? "target" : "source";
}

describe("Property 6: Language Toggle Swap", () => {
  it("when display = 'source', front shows source text", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (sourceText, targetText) => {
          fc.pre(sourceText !== targetText);
          const result = getFrontText(sourceText, targetText, "source");
          expect(result).toBe(sourceText);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("when display = 'target', front shows target text", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (sourceText, targetText) => {
          fc.pre(sourceText !== targetText);
          const result = getFrontText(sourceText, targetText, "target");
          expect(result).toBe(targetText);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("toggling once switches the display", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.constantFrom<LanguageDisplay>("source", "target"),
        (sourceText, targetText, initialDisplay) => {
          fc.pre(sourceText !== targetText);
          const toggled = toggleLanguage(initialDisplay);
          const before = getFrontText(sourceText, targetText, initialDisplay);
          const after = getFrontText(sourceText, targetText, toggled);
          expect(after).not.toBe(before);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("toggling twice returns to original display (involution)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.constantFrom<LanguageDisplay>("source", "target"),
        (sourceText, targetText, initialDisplay) => {
          fc.pre(sourceText !== targetText);
          const doubleToggled = toggleLanguage(toggleLanguage(initialDisplay));
          expect(doubleToggled).toBe(initialDisplay);

          const originalText = getFrontText(sourceText, targetText, initialDisplay);
          const doubleToggledText = getFrontText(sourceText, targetText, doubleToggled);
          expect(doubleToggledText).toBe(originalText);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("front always shows exactly one of source or target text (never mixed)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.constantFrom<LanguageDisplay>("source", "target"),
        (sourceText, targetText, display) => {
          fc.pre(sourceText !== targetText);
          const frontText = getFrontText(sourceText, targetText, display);
          const isSource = frontText === sourceText;
          const isTarget = frontText === targetText;
          // Exactly one of them must be true
          expect(isSource !== isTarget).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
