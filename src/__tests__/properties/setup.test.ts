import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

describe("fast-check infrastructure", () => {
  it("should run a trivial property test", () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        expect(n + 0).toBe(n);
      }),
      { numRuns: 100 },
    );
  });

  it("should verify string concatenation property", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (a, b) => {
        expect((a + b).length).toBe(a.length + b.length);
      }),
      { numRuns: 100 },
    );
  });
});
