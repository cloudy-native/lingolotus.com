import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateSEOMetadata } from "@/lib/seo";

/**
 * Feature: astro-migration, Property 8: SEO Metadata Completeness
 *
 * For any page with a name string (≤60 characters) and description string (≤160 characters)
 * and URL path, the SEO metadata generator SHALL produce a title tag matching the name,
 * a meta description matching the description, an `og:url` matching `https://lingolotus.com{path}`,
 * a canonical link matching the same URL, and for content detail pages, a JSON-LD block of
 * type `WebPage` containing the name, description, and URL.
 *
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.7**
 */

/** Generator for page names: non-empty, max 60 characters */
const nameArb = fc.string({ minLength: 1, maxLength: 60 });

/** Generator for page descriptions: non-empty, max 160 characters */
const descriptionArb = fc.string({ minLength: 1, maxLength: 160 });

/** Generator for valid URL paths: starts with /, lowercase alphanumeric with hyphens and slashes */
const pathArb = fc
  .array(fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/), {
    minLength: 1,
    maxLength: 4,
  })
  .map((segments) => `/${segments.join("/")}`);

/** Generator for isDetailPage boolean */
const isDetailPageArb = fc.boolean();

describe("Feature: astro-migration, Property 8: SEO Metadata Completeness", () => {
  it("title matches the input name", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          expect(result.title).toBe(name);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("description matches the input description", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          expect(result.description).toBe(description);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("canonicalUrl equals `https://lingolotus.com{path}`", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          expect(result.canonicalUrl).toBe(`https://lingolotus.com${path}`);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("ogUrl equals canonicalUrl", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          expect(result.ogUrl).toBe(result.canonicalUrl);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for detail pages: JSON-LD is present with type WebPage, name, description, url", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        (name, description, path) => {
          const result = generateSEOMetadata(name, description, path, true);
          expect(result.jsonLd).toBeDefined();
          expect(result.jsonLd!["@context"]).toBe("https://schema.org");
          expect(result.jsonLd!["@type"]).toBe("WebPage");
          expect(result.jsonLd!.name).toBe(name);
          expect(result.jsonLd!.description).toBe(description);
          expect(result.jsonLd!.url).toBe(result.canonicalUrl);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for listing pages: JSON-LD is undefined", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        (name, description, path) => {
          const result = generateSEOMetadata(name, description, path, false);
          expect(result.jsonLd).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("ogSiteName is always 'Lingo Lotus'", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          expect(result.ogSiteName).toBe("Lingo Lotus");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("ogType is 'article' for detail pages, 'website' for listings", () => {
    fc.assert(
      fc.property(
        nameArb,
        descriptionArb,
        pathArb,
        isDetailPageArb,
        (name, description, path, isDetailPage) => {
          const result = generateSEOMetadata(name, description, path, isDetailPage);
          if (isDetailPage) {
            expect(result.ogType).toBe("article");
          } else {
            expect(result.ogType).toBe("website");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
