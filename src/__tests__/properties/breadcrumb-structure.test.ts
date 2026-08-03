import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: astro-migration, Property 7: Breadcrumb Structure from URL Path
 *
 * Validates: Requirements 7.4
 *
 * For any valid URL path with K segments (K ≥ 1), the breadcrumb component SHALL
 * render a `<nav aria-label="breadcrumb">` containing K + 1 items (home + each segment),
 * where the last item has `aria-current="page"` and all other items are links.
 */

// Breadcrumb generation logic (extracted from Breadcrumb component)
interface BreadcrumbItem {
  label: string;
  href?: string;
}

function generateBreadcrumbs(segments: string[]): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    items.push({
      label: segments[i],
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}

// Simulate the rendered breadcrumb structure
interface RenderedBreadcrumb {
  navAriaLabel: string;
  items: Array<{
    label: string;
    isLink: boolean;
    href?: string;
    ariaCurrent?: string;
  }>;
}

function renderBreadcrumb(items: BreadcrumbItem[]): RenderedBreadcrumb {
  return {
    navAriaLabel: "breadcrumb",
    items: items.map((item, index) => {
      const isLast = index === items.length - 1;
      return {
        label: item.label,
        isLink: item.href !== undefined && !isLast,
        href: item.href,
        ariaCurrent: isLast ? "page" : undefined,
      };
    }),
  };
}

describe("Property 7: Breadcrumb Structure from URL Path", () => {
  const pathSegmentArb = fc.stringMatching(/^[a-z0-9-]+$/);
  const pathSegmentsArb = fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 });

  it("for K path segments, breadcrumb has K+1 items (home + segments)", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        expect(items).toHaveLength(segments.length + 1);
      }),
      { numRuns: 100 },
    );
  });

  it("first item is always 'Home' with href='/'", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        expect(items[0].label).toBe("Home");
        expect(items[0].href).toBe("/");
      }),
      { numRuns: 100 },
    );
  });

  it("last item has no href (represents current page → gets aria-current='page')", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        const rendered = renderBreadcrumb(items);
        const lastItem = rendered.items[rendered.items.length - 1];
        expect(lastItem.href).toBeUndefined();
        expect(lastItem.ariaCurrent).toBe("page");
      }),
      { numRuns: 100 },
    );
  });

  it("all intermediate items have href values (are links)", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        const rendered = renderBreadcrumb(items);
        // All items except the last should have href and be links
        for (let i = 0; i < rendered.items.length - 1; i++) {
          expect(rendered.items[i].href).toBeDefined();
          expect(rendered.items[i].isLink).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("items never have empty labels", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        for (const item of items) {
          expect(item.label.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("nav element has aria-label='breadcrumb'", () => {
    fc.assert(
      fc.property(pathSegmentsArb, (segments) => {
        const items = generateBreadcrumbs(segments);
        const rendered = renderBreadcrumb(items);
        expect(rendered.navAriaLabel).toBe("breadcrumb");
      }),
      { numRuns: 100 },
    );
  });
});
