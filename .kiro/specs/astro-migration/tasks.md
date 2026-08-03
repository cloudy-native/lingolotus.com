# Implementation Plan: Astro Migration

## Overview

Migrate the Lingo Lotus website from Gatsby 5.11 to Astro 5+ with Tailwind CSS v4 and shadcn/ui. The migration follows a phased approach: foundation setup, static page templates, interactive React islands, SEO/deployment pipeline, Gatsby/Chakra cleanup, and property-based testing. Each phase builds incrementally on the previous, ensuring the build passes at every step.

## Tasks

- [x] 1. Foundation — Astro project initialization and content collections
  - [x] 1.1 Initialize Astro project with core integrations
    - Create `astro.config.ts` with `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/sitemap` integrations
    - Set `output: "static"`, `trailingSlash: "never"`, `site: "https://lingolotus.com"`
    - Create/update `tsconfig.json` with Astro preset, strict mode, and `@/*` path alias resolving to `./src/*`
    - Update `package.json` scripts to use `astro` commands (`dev`, `build`, `preview`, `clean`)
    - Add Astro, React 18, and integration dependencies via pnpm
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Configure Tailwind CSS v4 with design tokens
    - Create `tailwind.config.ts` with colors, spacing, typography, breakpoints
    - Configure dark mode with `class` strategy
    - Add Thai font-family stack (Sarabun/Noto Sans Thai with sans-serif fallback)
    - Create `src/styles/global.css` with Tailwind directives and font imports
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 1.3 Create content collection schemas in `src/content/config.ts`
    - Define `flashcardCollections` collection with `glob()` loader for `data/flash-cards/collections/`
    - Define `flashcardDecks` collection with `glob()` loader for `data/flash-cards/decks/`
    - Define `books` collection with `glob()` loader for `data/books/` (excluding `stories/`)
    - Define `stories` collection with `glob()` loader for `data/books/stories/`
    - Define `languages` collection with `glob()` loader for `data/languages/`
    - All schemas use Zod validation matching the design document specifications
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.4 Create shared utilities and types
    - Create `src/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
    - Create URL path generation functions for all route patterns
    - Create referential integrity validation helpers (deck→collection, story→book)
    - Create `src/types/index.ts` with shared TypeScript types
    - _Requirements: 3.3, 3.4, 3.5, 3.7, 3.8, 3.12_

  - [x] 1.5 Set up shadcn/ui with Radix UI primitives
    - Initialize shadcn/ui configuration using the project's Tailwind theme tokens
    - Install button, card, and breadcrumb components into `src/components/ui/`
    - Verify components use project color, spacing, and border-radius tokens
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Checkpoint — Foundation verification
  - Ensure `pnpm build` exits with code 0, content collections load and validate all JSON data files. Ask the user if questions arise.

- [x] 3. Static pages — Layouts and page templates
  - [x] 3.1 Create BaseLayout and PageLayout components
    - Create `src/layouts/BaseLayout.astro` with HTML shell, meta tags, theme init script, global styles
    - Create `src/layouts/PageLayout.astro` with navigation header, breadcrumbs, and footer
    - Include `lang="en"` on `<html>`, canonical URL, OG tags, JSON-LD slot
    - Implement inline theme initialization script (localStorage → class toggle) to prevent FOUC
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 3.2 Create homepage (`src/pages/index.astro`)
    - Query flashcard collections where `featured === true`
    - Render collection cards with name, description, difficulty, image
    - Use BaseLayout with homepage-specific SEO metadata
    - _Requirements: 3.11, 4.1_

  - [x] 3.3 Create flash cards listing page (`src/pages/flash-cards/index.astro`)
    - Query all flashcard collections
    - Render collection cards as static HTML (name, description, difficulty, image)
    - Include empty-state message when no collections exist
    - _Requirements: 3.2, 4.1, 4.8_

  - [x] 3.4 Create collection detail page (`src/pages/flash-cards/[collectionId]/index.astro`)
    - Implement `getStaticPaths()` generating paths from all collection IDs
    - Query decks filtered by `collectionId`
    - Render deck cards with name, description, card count
    - Include empty-state for collections with no decks
    - _Requirements: 3.3, 4.2, 4.8_

  - [x] 3.5 Create deck detail page (`src/pages/flash-cards/[collectionId]/decks/[deckId]/index.astro`)
    - Implement `getStaticPaths()` generating paths from all deck collectionId/deckId pairs
    - Validate deck's collectionId references an existing collection (fail build if orphaned)
    - Render deck metadata and card list (front, back, phonetic, tags)
    - _Requirements: 3.4, 3.12, 4.3_

  - [x] 3.6 Create deck study page (`src/pages/flash-cards/[collectionId]/decks/[deckId]/study.astro`)
    - Implement `getStaticPaths()` for study routes
    - Pass deck card data as props to StudyMode React island (placeholder for now)
    - _Requirements: 3.5, 5.1_

  - [x] 3.7 Create reading list page (`src/pages/reading/index.astro`)
    - Query all books from content collection
    - Render book cards with name, description, difficulty, image
    - Include empty-state message
    - _Requirements: 3.6, 4.4, 4.8_

  - [x] 3.8 Create book detail page (`src/pages/reading/[bookId]/index.astro`)
    - Implement `getStaticPaths()` from book IDs
    - Query stories filtered by `bookId`
    - Render book metadata and story list with titles
    - Include empty-state for books with no stories
    - _Requirements: 3.7, 4.5, 4.8_

  - [x] 3.9 Create story detail page (`src/pages/reading/[bookId]/[storyId].astro`)
    - Implement `getStaticPaths()` from all story bookId/storyId pairs
    - Validate story's bookId references an existing book
    - Render story title, sentences (source, target, phonetic), word breakdown
    - Include SpeechButton island (placeholder) for sentence pronunciation
    - _Requirements: 3.8, 4.6_

  - [x] 3.10 Create about page and 404 page
    - Create `src/pages/about.astro` rendering `content/about.md` as HTML
    - Create `src/pages/404.astro` with user-friendly error message
    - _Requirements: 3.9, 3.10, 4.7_

  - [x] 3.11 Implement responsive layouts for all pages
    - Apply Tailwind responsive classes at mobile (320px), tablet (768px), desktop (1280px)
    - Ensure no horizontal scroll, readable text, accessible interactive elements at all breakpoints
    - _Requirements: 6.5_

- [x] 4. Checkpoint — Static pages verification
  - Ensure `pnpm build` produces all expected HTML files in `dist/`, all URLs from Requirement 3 are generated, pages render correct static content. Ask the user if questions arise.

- [x] 5. Interactive islands — React components with shadcn/ui
  - [x] 5.1 Implement StudyMode island (`src/components/islands/StudyMode.tsx`)
    - Implement card flip interaction (click/tap to reveal back content)
    - Implement sequential navigation with boundary disabling (prev disabled at 0, next disabled at N-1)
    - Implement progress tracking (correct/incorrect/remaining counters, sum always equals total)
    - Implement language toggle (swap source/target on card front)
    - Implement keyboard navigation (arrow keys, space to flip)
    - Use shadcn/ui Card with ARIA attributes, visible focus, flip animation ≤300ms
    - Use shadcn/ui Button for navigation controls (Tab-focusable, Enter/Space activatable, WCAG AA focus)
    - Hydrate with `client:load` on the study page
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7, 7.2, 7.3_

  - [x] 5.2 Implement SpeechButton island (`src/components/islands/SpeechButton.tsx`)
    - Invoke Web Speech API with voice matching the card's language code
    - Display speaking/idle visual state indicator
    - Disable button when API unavailable or no matching voice found
    - Hydrate with `client:visible`
    - _Requirements: 5.5, 5.6_

  - [x] 5.3 Implement ThemeToggle island (`src/components/islands/ThemeToggle.tsx`)
    - Toggle dark/light class on `<html>` element
    - Persist theme choice in localStorage
    - Default to OS preference on first visit
    - Hydrate with `client:load`
    - _Requirements: 6.2_

  - [x] 5.4 Implement breadcrumb navigation component
    - Create breadcrumb using shadcn/ui `<nav aria-label="breadcrumb">` with ordered list
    - Render URL path segments as links, current page with `aria-current="page"`
    - Integrate into PageLayout for all content pages
    - _Requirements: 7.4_

- [x] 6. Checkpoint — Islands verification
  - Ensure `pnpm build` succeeds, study page hydrates StudyMode correctly, speech button renders, theme toggle persists. Ask the user if questions arise.

- [x] 7. SEO and deployment pipeline
  - [x] 7.1 Implement SEO metadata generation
    - Ensure all pages have `<title>` (≤60 chars) and `<meta name="description">` (≤160 chars)
    - Render OG tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`)
    - Set `og:type` to `"website"` for listings/homepage, `"article"` for content detail pages
    - Add `<link rel="canonical">` with full URL on every page
    - Implement site-level default description fallback for pages without explicit descriptions
    - Add JSON-LD `WebPage` structured data on content detail pages (story, book, deck, collection)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 7.2 Create static assets and PWA manifest
    - Create `public/robots.txt` with `User-agent: *`, `Allow: /`, `Sitemap: https://lingolotus.com/sitemap-index.xml`
    - Create `public/manifest.json` with name "Lingo Lotus", theme_color `#3182ce`, display `standalone`, start_url `/`
    - Move existing static assets (favicon, images) to `public/` directory
    - _Requirements: 8.4, 8.5, 11.2_

  - [x] 7.3 Implement image handling with `astro:assets`
    - Configure image optimization pipeline for static images referenced in layouts (output WebP)
    - Ensure content collection `imageUrl` paths resolve from `public/` directory
    - Add `width`, `height`, `alt` attributes to all rendered `<img>` elements
    - Implement build-time validation for missing `imageUrl` references
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 7.4 Create deploy script (`scripts/deploy.sh`)
    - Run `astro build` to produce `dist/` output
    - Sync hashed assets (`_astro/`) to S3 with `--cache-control "max-age=31536000,public" --delete`
    - Sync HTML files to S3 with `--cache-control "max-age=0,must-revalidate"`
    - Create CloudFront invalidation for `/*` after successful sync
    - Exit with non-zero status if build fails (no sync on failure)
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 8.8_

- [x] 8. Checkpoint — SEO and deployment verification
  - Ensure sitemap-index.xml includes all URLs, robots.txt is correct, deploy script runs without errors, all meta tags render correctly. Ask the user if questions arise.

- [x] 9. Cleanup — Remove Gatsby and Chakra UI dependencies
  - [x] 9.1 Remove Gatsby configuration files and dependencies
    - Delete `gatsby-config.ts`, `gatsby-node.ts`, `gatsby-browser.tsx`, `gatsby-ssr.tsx` from project root
    - Remove all `gatsby` and `gatsby-*` packages from `package.json` dependencies and devDependencies
    - Remove GraphQL tagged template literals, `useStaticQuery`, `StaticQuery` from all `src/` files
    - _Requirements: 10.1, 10.3, 10.4_

  - [x] 9.2 Remove Chakra UI and Emotion dependencies
    - Remove all `@chakra-ui/*`, `@emotion/*`, and `framer-motion` packages from `package.json`
    - Remove all imports from `@chakra-ui/*` and `@emotion/*` in `src/` files
    - Update package.json scripts to reference only `astro` commands
    - Run `pnpm install` to update lockfile
    - _Requirements: 10.2, 10.5, 10.6_

- [x] 10. Checkpoint — Clean build verification
  - Ensure `pnpm build` produces zero TypeScript errors, zero schema validation errors, all URLs render, no Gatsby/Chakra imports remain. Ask the user if questions arise.

- [x] 11. Testing — Property-based tests with fast-check
  - [x] 11.1 Set up fast-check testing infrastructure
    - Install `fast-check` and `vitest` as dev dependencies
    - Create test configuration for property-based tests
    - Create test file structure at `src/__tests__/properties/`
    - _Requirements: 2.6_

  - [x] 11.2 Write property test for schema validation round-trip
    - **Property 1: Schema Validation Round-Trip**
    - Generate random valid objects for each content collection schema; verify parse → serialize → parse identity
    - Generate invalid objects (missing required fields, wrong types); verify Zod rejects them
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 11.3 Write property test for path generation correctness
    - **Property 2: Path Generation Correctness**
    - Generate random alphanumeric ID strings; verify generated paths start with `/`, contain IDs in correct positions, match URL patterns
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.7, 3.8**

  - [x] 11.4 Write property test for referential integrity
    - **Property 3: Referential Integrity — Collection References**
    - Generate random collection/deck sets with varying overlap; verify orphan detection returns errors for missing references and success for valid references
    - **Validates: Requirements 3.12**

  - [x] 11.5 Write property test for navigation boundary states
    - **Property 4: Navigation Boundary States**
    - Generate random deck sizes (1-100) and index positions; verify prev disabled iff index=0, next disabled iff index=N-1
    - **Validates: Requirements 5.3**

  - [x] 11.6 Write property test for progress calculation invariant
    - **Property 5: Progress Calculation Invariant**
    - Generate random N, C, I where C+I ≤ N; verify remaining = N-C-I and sum = N always
    - **Validates: Requirements 5.4**

  - [x] 11.7 Write property test for language toggle swap
    - **Property 6: Language Toggle Swap**
    - Generate random source/target text pairs; verify toggle shows correct text and double-toggle returns to original
    - **Validates: Requirements 5.7**

  - [x] 11.8 Write property test for breadcrumb structure
    - **Property 7: Breadcrumb Structure from URL Path**
    - Generate random path segment arrays (1-5 segments); verify nav element, K+1 items, last has aria-current="page"
    - **Validates: Requirements 7.4**

  - [x] 11.9 Write property test for SEO metadata completeness
    - **Property 8: SEO Metadata Completeness**
    - Generate random name (≤60 chars), description (≤160 chars), paths; verify title, meta description, og:url, canonical, and JSON-LD output
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.7**

  - [x] 11.10 Write property test for image reference validation
    - **Property 9: Image Reference Validation**
    - Generate random imageUrl paths; verify validator returns error for missing files and success for existing files
    - **Validates: Requirements 11.4**

- [x] 12. Final checkpoint — Full migration verification
  - Ensure all tests pass, all URLs generate correctly, build produces zero errors, no legacy dependencies remain. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each migration phase
- Property tests validate universal correctness properties defined in the design
- The migration preserves existing JSON data files in `data/` unchanged
- During Phase 1-3, Chakra UI may coexist with Tailwind in React islands per Requirement 12
- URL structure preservation (Requirement 3) is validated at every checkpoint
- All implementations use TypeScript in strict mode with pnpm as package manager

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.7", "3.10"] },
    { "id": 5, "tasks": ["3.4", "3.8"] },
    { "id": 6, "tasks": ["3.5", "3.6", "3.9"] },
    { "id": 7, "tasks": ["3.11"] },
    { "id": 8, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 9, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 10, "tasks": ["7.4"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["9.2"] },
    { "id": 13, "tasks": ["11.1"] },
    { "id": 14, "tasks": ["11.2", "11.3", "11.4", "11.5", "11.6", "11.7", "11.8", "11.9", "11.10"] }
  ]
}
```
