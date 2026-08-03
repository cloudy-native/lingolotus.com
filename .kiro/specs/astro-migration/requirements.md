# Requirements Document

## Introduction

This document specifies requirements for migrating the Lingo Lotus language learning website (lingolotus.com) from Gatsby 5.11 to Astro with Tailwind CSS and shadcn/ui. The migration preserves all existing functionality — flashcard collections, reading books, story study, speech synthesis, and score tracking — while replacing the build framework, styling system, and component library in a phased approach. The site remains static (S3 + CloudFront hosted) with no server-side API.

## Glossary

- **Build_System**: The Astro static site generator (v5+) configured with `@astrojs/react` integration, responsible for compiling `.astro` pages and React islands into static HTML/CSS/JS output
- **Content_Collection**: An Astro content collection defined with `defineCollection()` using `file()` or `glob()` loaders and Zod schemas to load, validate, and type JSON data files at build time
- **React_Island**: A React component rendered inside an Astro page using a `client:*` directive (`client:load`, `client:visible`, `client:idle`) that hydrates interactively on the client
- **Static_Page**: An Astro `.astro` component page that renders to pure HTML with no client-side JavaScript hydration
- **Tailwind_System**: Tailwind CSS v4 integrated via `@astrojs/tailwind`, used for utility-first styling of static page layouts
- **Shadcn_Component**: A shadcn/ui component (built on Radix UI primitives + Tailwind CSS) used inside React islands for interactive UI elements
- **Deploy_Pipeline**: The build and deployment process that runs `astro build` and syncs the `dist/` output directory to the S3 bucket fronted by CloudFront
- **URL_Structure**: The set of URL paths served by the site that search engines and users have bookmarked, which must remain unchanged after migration
- **Study_Mode**: The interactive flashcard study experience where users flip cards, navigate between cards, hear speech synthesis, and track scores
- **Speech_Engine**: The browser Web Speech API (SpeechSynthesis) integration that reads Thai text aloud for pronunciation practice

## Requirements

### Requirement 1: Astro Project Initialization

**User Story:** As a developer, I want the project initialized as an Astro application with React integration, so that I can build static pages with interactive React islands.

#### Acceptance Criteria

1. THE Build_System SHALL use Astro v5 or later with the `@astrojs/react` integration enabled and React 18 as the component framework
2. THE Build_System SHALL use TypeScript in strict mode with path aliases configured as `@/*` resolving to `./src/*`
3. THE Build_System SHALL use pnpm as the package manager with a `pnpm-lock.yaml` file present at the project root
4. THE Build_System SHALL set the Astro output mode to `static`, producing a build directory containing only pre-rendered HTML, CSS, and JavaScript files that require no server-side runtime
5. THE Build_System SHALL include the `@astrojs/sitemap` integration configured with `https://lingolotus.com` as the site URL
6. WHEN a developer runs `pnpm build`, THE Build_System SHALL complete with exit code 0 and produce at least one `.html` file in the output directory

### Requirement 2: Content Collection Schemas

**User Story:** As a developer, I want JSON data files validated against typed schemas at build time, so that data errors are caught before deployment rather than at runtime.

#### Acceptance Criteria

1. THE Content_Collection for flashcard collections SHALL load all JSON files from `data/flash-cards/collections/` using a `glob()` loader and validate each file against a Zod schema requiring `collectionId`, `name`, `description`, `sourceLanguage`, `targetLanguage`, `createdAt`, `updatedAt`, and optional fields `category`, `difficulty`, `imageUrl`, `featured`
2. THE Content_Collection for flashcard decks SHALL load all JSON files from `data/flash-cards/decks/` using a `glob()` loader and validate each file against a Zod schema requiring `collectionId`, `deckId`, `name`, `description`, `sourceLanguage`, `targetLanguage`, `cards` (array with at least one element), `createdAt`, `updatedAt`, `theme`, and optional fields `category`, `difficulty`
3. THE Content_Collection for books SHALL load all JSON files from `data/books/` (excluding the `stories/` subdirectory) using a `glob()` loader and validate each file against a Zod schema requiring `bookId`, `name`, `description`, `sourceLanguage`, `createdAt`, `updatedAt`, and optional fields `targetLanguage`, `category`, `difficulty`, `imageUrl`, `featured`
4. THE Content_Collection for stories SHALL load all JSON files from `data/books/stories/` using a `glob()` loader and validate each file against a Zod schema requiring `storyId`, `bookId`, `language`, `title` (object with `source` string and `target` string), `sentences` (array with at least one element, each containing `source`, `target`, `phonetic`, and optional `breakdown` array), `createdAt`, `updatedAt`, and optional fields `difficulty`, `summary`
5. THE Content_Collection for languages SHALL load all JSON files from `data/languages/` using a `glob()` loader and validate each file against a Zod schema requiring `languageCode`, `language`, `english`, and `flag`
6. WHEN a JSON data file fails schema validation, THE Build_System SHALL report the file path and validation error and fail the build

### Requirement 3: URL Structure Preservation

**User Story:** As a site owner, I want all existing URLs to remain unchanged after migration, so that search engine rankings, bookmarks, and external links continue to work.

#### Acceptance Criteria

1. THE Build_System SHALL configure trailing slash handling to `"never"` so that URLs resolve without a trailing slash, matching the existing Gatsby output
2. THE Build_System SHALL generate a page at `/flash-cards/` listing all flashcard collections
3. THE Build_System SHALL generate a page at `/flash-cards/{collectionId}/` for each flashcard collection, where `{collectionId}` is the `collectionId` field from the flashcard collections content collection
4. THE Build_System SHALL generate a page at `/flash-cards/{collectionId}/decks/{deckId}/` for each deck, where `{collectionId}` and `{deckId}` are the `collectionId` and `deckId` fields from the flashcard decks content collection
5. THE Build_System SHALL generate a page at `/flash-cards/{collectionId}/decks/{deckId}/study` for each deck study mode, using the same `collectionId` and `deckId` values as criterion 4
6. THE Build_System SHALL generate a page at `/reading/` listing all books
7. THE Build_System SHALL generate a page at `/reading/{bookId}/` for each book, where `{bookId}` is the `bookId` field from the books content collection
8. THE Build_System SHALL generate a page at `/reading/{bookId}/{storyId}/` for each story, where `{bookId}` and `{storyId}` are the `bookId` and `storyId` fields from the stories content collection
9. THE Build_System SHALL generate a page at `/about/` for the about page
10. THE Build_System SHALL generate a 404 error page at `/404.html`
11. THE Build_System SHALL generate a homepage at `/` displaying featured flashcard collections (collections where `featured` is `true`)
12. IF a deck's `collectionId` references a collection that does not exist in the flashcard collections content collection, THEN THE Build_System SHALL fail the build and report the orphaned reference

### Requirement 4: Static Page Rendering

**User Story:** As a user, I want content pages to load instantly without JavaScript, so that I can browse flashcard listings, book indexes, and story content on any device.

#### Acceptance Criteria

1. THE Static_Page for the flashcard collection list SHALL render collection cards with name, description, difficulty, and image as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
2. THE Static_Page for a collection detail SHALL render all decks belonging to that collection with name, description, and card count as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
3. THE Static_Page for a deck detail SHALL render the deck metadata (name, description) and list of cards showing front text, back text, phonetic transcription, and tags as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
4. THE Static_Page for the reading list SHALL render all books with name, description, difficulty, and image as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
5. THE Static_Page for a book detail SHALL render the book metadata (name, description, difficulty) and list of stories belonging to that book with story title as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
6. THE Static_Page for a story detail SHALL render the story title, all sentences with source text, target translation, phonetic transcription, and word breakdown (source word, target translation, phonetic, and part of speech for each word) as server-generated HTML content that is fully visible in the initial page source without requiring client-side JavaScript execution
7. THE Static_Page for the about page SHALL render the about content from `content/about.md` as HTML without requiring client-side JavaScript execution
8. WHEN a Static_Page contains no items for its listing (zero collections, zero decks, zero cards, zero books, or zero stories), THE Static_Page SHALL render an empty-state message indicating no content is available

### Requirement 5: React Island Architecture for Interactive Features

**User Story:** As a learner, I want to study flashcards interactively with flipping, navigation, and speech, so that I can practice vocabulary effectively.

#### Acceptance Criteria

1. WHEN a user navigates to a deck study page, THE Study_Mode component SHALL hydrate with the deck's card data and render an interactive flashcard displaying the front content of the first card in the deck
2. WHILE the Study_Mode component is active, THE Study_Mode component SHALL allow the user to flip a card by clicking or tapping the card area, revealing the back content (translation, phonetic transcription, and examples) of the current card
3. WHILE the Study_Mode component is active, THE Study_Mode component SHALL provide next and previous navigation controls that move between cards sequentially, disable the previous control on the first card, and disable the next control on the last card
4. WHILE the Study_Mode component is active, THE Study_Mode component SHALL display study progress as a count of correct, incorrect, and remaining cards out of the total cards in the deck
5. WHEN a user activates the speech control on a card, THE Speech_Engine component SHALL invoke the Web Speech API to speak the displayed card text using a voice matching the card's language code, and display a visual indicator distinguishing between speaking and idle states
6. IF the Web Speech API is unavailable or no voice is found for the card's language code, THEN THE Speech_Engine component SHALL disable the speech control
7. WHILE the Study_Mode component is active, THE Study_Mode component SHALL provide a language toggle that switches whether the card front displays source-language text or target-language text, applying the selection to all cards in the current session

### Requirement 6: Tailwind CSS Integration for Static Layouts

**User Story:** As a developer, I want static page layouts styled with Tailwind CSS, so that the site has consistent, maintainable styling without Chakra UI's runtime CSS-in-JS overhead.

#### Acceptance Criteria

1. THE Tailwind_System SHALL be configured via `@astrojs/tailwind` integration with a design token system covering colors, spacing, typography, and breakpoints
2. THE Tailwind_System SHALL support dark mode using the `class` strategy, defaulting to the user's operating system preference on first visit and persisting the user's explicit theme choice in localStorage across sessions
3. THE Tailwind_System SHALL include a custom font-family stack for Thai script rendering that specifies at least one Thai-optimized font (e.g., Sarabun, Noto Sans Thai) with a sans-serif fallback, applied to elements containing Thai text
4. WHEN a Static_Page renders, THE Tailwind_System SHALL produce only the CSS classes used on that page (tree-shaken output)
5. THE Tailwind_System SHALL provide responsive layouts at mobile (320px), tablet (768px), and desktop (1280px) viewport widths such that no horizontal scrollbar appears, all text remains readable without zooming, and all interactive elements remain accessible without being clipped or overlapping

### Requirement 7: shadcn/ui Component Integration

**User Story:** As a developer, I want interactive React components built with shadcn/ui, so that study mode and other interactive features use accessible, well-tested primitives without Chakra UI.

#### Acceptance Criteria

1. THE Shadcn_Component library SHALL be installed with Radix UI primitives and configured to use the project's Tailwind CSS theme tokens for colors, spacing, typography, and border-radius
2. WHEN the Study_Mode renders a flashcard, THE Shadcn_Component for cards SHALL provide a card container with ARIA role and label attributes, visible focus indicator, and a flip animation completing within 300 milliseconds
3. WHEN the Study_Mode renders navigation controls, THE Shadcn_Component for buttons SHALL provide button primitives that are focusable via Tab key, activatable via Enter and Space keys, and include visible focus indicators meeting WCAG 2.1 AA contrast requirements
4. WHEN the site renders a breadcrumb navigation, THE Shadcn_Component for breadcrumbs SHALL render an `<nav aria-label="breadcrumb">` element with an ordered list of links reflecting the URL path segments defined in the URL_Structure, with the current page indicated by `aria-current="page"`
5. IF a Shadcn_Component is not available for a required UI pattern, THEN THE Build_System SHALL use a custom React component built with Radix UI primitives and Tailwind CSS that meets the same WCAG 2.1 AA accessibility requirements as shadcn/ui components, including ARIA attributes, keyboard operability via Tab, Enter, and Space keys, and visible focus indicators

### Requirement 8: Build and Deployment Pipeline

**User Story:** As a developer, I want the build and deploy process updated for Astro, so that deployment to S3 + CloudFront continues to work with the new framework.

#### Acceptance Criteria

1. THE Deploy_Pipeline SHALL run `astro build` to produce static output in the `dist/` directory
2. THE Deploy_Pipeline SHALL sync hashed asset files (JS, CSS, images in `_astro/`) from the `dist/` directory to the S3 bucket using `aws s3 sync` with `--cache-control "max-age=31536000,public"` and `--delete` flags, and SHALL sync HTML files with `--cache-control "max-age=0,must-revalidate"`
3. THE Deploy_Pipeline SHALL generate a `sitemap-index.xml` at the site root listing all pages defined in Requirement 3 (URL Structure Preservation) excluding `/404.html`
4. THE Deploy_Pipeline SHALL include a `robots.txt` in the `public/` directory with `User-agent: *` and `Allow: /` directives and a `Sitemap` directive pointing to `https://lingolotus.com/sitemap-index.xml`
5. THE Deploy_Pipeline SHALL generate a `manifest.json` for PWA support with name "Lingo Lotus", theme color `#3182ce`, display mode `standalone`, and `start_url` set to `/`
6. WHEN `astro build` completes, THE Build_System SHALL produce zero TypeScript type errors and zero Zod schema validation errors
7. IF `astro build` fails with type errors or schema validation errors, THEN THE Deploy_Pipeline SHALL exit with a non-zero status code and SHALL NOT sync any files to the S3 bucket
8. WHEN the S3 sync completes successfully, THE Deploy_Pipeline SHALL create a CloudFront invalidation for `/*` to clear cached content

### Requirement 9: SEO and Meta Tag Preservation

**User Story:** As a site owner, I want meta tags, structured data, and SEO signals preserved, so that search engine visibility is maintained after migration.

#### Acceptance Criteria

1. THE Build_System SHALL render a `<title>` tag (maximum 60 characters) and `<meta name="description">` tag (maximum 160 characters) on every page using page-specific content derived from the page's collection data (name, description fields) or frontmatter
2. THE Build_System SHALL render Open Graph meta tags (`og:title`, `og:description`, `og:url`, `og:type`) on every page, with `og:type` set to `"website"` for listing pages and the homepage, and `"article"` for individual content pages (story, deck, book detail)
3. THE Build_System SHALL set the canonical URL via a `<link rel="canonical">` element to `https://lingolotus.com{path}` on every page
4. THE Build_System SHALL render the site name as "Lingo Lotus" in the `og:site_name` meta tag
5. WHEN the Build_System generates HTML pages, THE Build_System SHALL include the `lang="en"` attribute on the `<html>` element
6. IF a page does not have explicit description content in its collection data or frontmatter, THEN THE Build_System SHALL render a site-level default description in the `<meta name="description">` and `og:description` tags rather than leaving them empty
7. WHEN the Build_System generates a content detail page (story, book, deck, or collection), THE Build_System SHALL include a JSON-LD structured data block of type `WebPage` containing the page name, description, and URL

### Requirement 10: Gatsby and Chakra UI Removal

**User Story:** As a developer, I want all Gatsby and Chakra UI dependencies removed after migration is complete, so that the project has no dead code or unused dependencies.

#### Acceptance Criteria

1. WHEN the migration is complete, THE Build_System SHALL have no `gatsby` or `gatsby-*` packages in either `dependencies` or `devDependencies` in `package.json`
2. WHEN the migration is complete, THE Build_System SHALL have no `@chakra-ui/*`, `@emotion/*`, or `framer-motion` packages in either `dependencies` or `devDependencies` in `package.json`
3. WHEN the migration is complete, THE Build_System SHALL have no `gatsby-node.ts`, `gatsby-config.ts`, `gatsby-browser.tsx`, or `gatsby-ssr.tsx` files in the project root
4. WHEN the migration is complete, THE Build_System SHALL have no `graphql` tagged template literals, `useStaticQuery` imports, or `StaticQuery` component references in any file within the `src/` directory
5. WHEN the migration is complete, THE Build_System SHALL have no imports from any `@chakra-ui/*` or `@emotion/*` package in any file within the `src/` directory
6. WHEN the migration is complete, THE Build_System SHALL have all `scripts` entries in `package.json` reference `astro` commands (not `gatsby` commands) for build, develop, serve, and clean operations

### Requirement 11: Image and Asset Handling

**User Story:** As a user, I want images optimized and served efficiently, so that pages load quickly on all connection speeds.

#### Acceptance Criteria

1. WHEN a static image is referenced in a page layout, THE Build_System SHALL process it through Astro's built-in `astro:assets` image optimization pipeline and output it in WebP format
2. THE Build_System SHALL serve static assets (favicon, manifest icons, existing images in `static/images/`) from the `public/` directory without transformation, preserving their original file paths
3. WHEN an image is referenced in a content collection entry (via `imageUrl`), THE Build_System SHALL resolve the path relative to the `public/` directory and include the image in the build output at the same URL path
4. IF a content collection entry references an `imageUrl` whose file does not exist in the `public/` directory, THEN THE Build_System SHALL fail the build and report the entry identifier and missing file path
5. WHEN an optimized image is rendered in HTML, THE Build_System SHALL include `width`, `height`, and `alt` attributes on the `<img>` element to prevent layout shift and support accessibility

### Requirement 12: Progressive Migration Support

**User Story:** As a developer, I want the migration to proceed in phases, so that I can validate each step before moving to the next.

#### Acceptance Criteria

1. WHILE the platform migration phase is in progress (Gatsby to Astro), THE Build_System SHALL compile and render Chakra UI v2 components inside React islands via `@astrojs/react` integration with Emotion, producing a successful build with zero errors and rendering those components without visual or functional regressions
2. WHILE the styling migration phase is in progress (Chakra to Tailwind), THE Build_System SHALL compile Tailwind CSS classes and Chakra UI styled components in the same build, producing output where both styling systems render their respective components without CSS class collisions or overridden styles that alter intended visual appearance
3. WHILE the component migration phase is in progress (Chakra to shadcn/ui), THE Build_System SHALL compile and hydrate shadcn/ui components and Chakra UI components in separate React islands, where each island renders and responds to user interaction independently without runtime JavaScript errors
4. WHEN a migration phase is complete (defined as: no source file imports packages belonging to the previous phase's system being replaced), THE Build_System SHALL produce a successful build with zero TypeScript errors, zero schema validation errors, and all URL paths defined in Requirement 3 returning rendered HTML output
5. IF Tailwind CSS reset styles conflict with Chakra UI Emotion styles during the styling migration phase, THEN THE Build_System SHALL scope Tailwind's base reset to exclude React islands that contain Chakra UI components, preserving Chakra UI's intended rendering
