# Framework Evaluation: Lingo Lotus

## Purpose

This document evaluates static site frameworks for the Lingo Lotus project to determine whether migration from Gatsby 5 is warranted. It covers build performance, ecosystem health, static site generation capabilities, data layer flexibility, and UI component library compatibility.

**Project characteristics:**
- Static content site (flashcards, books, stories stored as JSON)
- No server-side API
- Hosted on S3 + CloudFront
- Current stack: Gatsby 5.11 + React 18 + TypeScript + Chakra UI v2
- Interactive features: flashcard study mode, speech synthesis

---

## Framework Comparison Matrix

| Criterion | Gatsby 5 | Astro | Next.js | Vite + React (SPA) |
|-----------|----------|-------|---------|---------------------|
| **Build performance** | Slow (multi-minute builds, GraphQL compilation overhead) | Fast (~15s builds for comparable sites, Vite-based bundler) | Moderate (Turbopack improving, but heavier than Astro for static) | Fast (Vite dev/build), but no SSG output |
| **Ecosystem health** | Maintenance mode — last release v5.16, Gatsby Cloud shut down, core team dissolved | Active — Cloudflare-owned, v6+ available, growing community | Very active — Vercel-backed, large ecosystem | Stable tooling, but no framework opinions |
| **SSG capability** | Full SSG via `createPages` + GraphQL | First-class SSG — zero JS by default, ships pure HTML | SSG supported (`output: 'export'`), but secondary to SSR | No SSG — client-rendered SPA only |
| **Data layer flexibility** | Rigid — GraphQL required, plugin system for sources | Flexible — Content Collections with `file()`/`glob()` loaders, Zod schema validation, typed APIs via `getCollection()`/`getEntry()` | Flexible — fetch anything in `getStaticProps`, no opinionated data layer | Manual — import JSON directly, no built-in content tooling |
| **Chakra UI compatibility** | Works (React 18 + Emotion) | Works inside React islands (`@astrojs/react` integration) | Works natively (React framework) | Works natively (React SPA) |
| **SEO / static HTML** | Generates HTML but ships heavy JS bundle for hydration | Pure HTML by default — JS only where explicitly opted in (islands) | Full HTML output in SSG mode | No static HTML — requires JS to render content |
| **Node.js compatibility** | Frequent breakage with newer Node versions (common community complaint) | Good — Vite-based, tracks Node LTS | Good — tracks Node LTS | Good — Vite tracks Node LTS |

---

## Detailed Findings

### Gatsby 5

Gatsby is effectively in **maintenance mode**:

- Last meaningful release was v5.16; no new feature development
- Gatsby Cloud (the managed build/hosting platform) has been **shut down**
- Core maintainers have left; the community has largely migrated to other frameworks
- Node version breakage is a recurring issue — builds fail on Node 20+ without workarounds
- The GraphQL data layer adds compilation overhead and complexity for what is ultimately just reading JSON files
- Plugin ecosystem is stagnating — many plugins lack maintenance

For this project specifically, Gatsby's GraphQL requirement means writing `gatsby-node.js` page-creation logic, GraphQL queries in every template, and maintaining `gatsby-transformer-json` configuration — all to accomplish what could be a direct file import with type safety.

### Astro

Astro is the strongest candidate for this project:

- **Cloudflare-owned** (acquired 2024), v6+ available with active development
- **Content Collections** with `file()` loader handle JSON files natively:
  - Zod schema validation at build time catches data errors early
  - Full TypeScript types generated automatically from schemas
  - `getCollection()` and `getEntry()` provide simple, typed APIs — no GraphQL needed
- **Zero JS by default** — pages ship as pure HTML unless you explicitly opt in
- **Islands architecture** — React components hydrate only where needed (`client:load`, `client:visible`, `client:idle` directives)
- **15-second builds** vs Gatsby's multi-minute builds for comparable content volume
- **`@astrojs/react` integration** means existing React components work with minimal changes
- **`glob()` loader** can load all JSON files from a directory pattern — maps directly to the `data/` directory structure
- Vite-based dev server with instant HMR

The project's JSON data (flashcards in `data/flash-cards/`, books in `data/books/`, stories in `data/books/stories/`) maps directly to Astro content collections. Static HTML output provides better SEO and faster loading than Gatsby's JS-heavy hydration model. React components still work for interactive parts (flashcard study, speech synthesis) via islands.

### Next.js

Next.js is **overkill for this project**:

- Primarily designed for dynamic server rendering, API routes, and server components
- SSG is supported (`output: 'export'`) but is a secondary use case
- App Router adds complexity that provides no benefit for a purely static site
- Vercel-optimized deployment model doesn't align with S3+CloudFront hosting
- Would require implementing data fetching in `getStaticProps` or server components — more ceremony than Astro's content collections for the same result
- Larger framework surface area means more to maintain

### Vite + React (SPA)

A pure Vite+React SPA **loses critical benefits**:

- No static HTML output — content is client-rendered, hurting SEO
- Search engines and social previews cannot see content without JS execution
- Initial load requires downloading and parsing the entire React bundle before content appears
- Not ideal for a content-heavy site where most pages are read-only
- Would require adding a routing library, SSG plugin, or accepting the SEO tradeoff

---

## Project-Specific Assessment

The Lingo Lotus data architecture maps directly to Astro content collections:

| Data Source | Current (Gatsby) | Astro Equivalent |
|-------------|-------------------|------------------|
| `data/flash-cards/collections/*.json` | `gatsby-transformer-json` + GraphQL queries | `defineCollection({ loader: glob({ pattern: "*.json", base: "data/flash-cards/collections" }) })` |
| `data/flash-cards/decks/*.json` | Same transformer + separate queries | Same `glob()` loader pattern |
| `data/books/*.json` | Same | `file()` or `glob()` loader |
| `data/books/stories/*.json` | Same | `glob()` loader with nested schema |

**Key advantages for this project:**

1. **No GraphQL** — `getCollection("flashcards")` replaces multi-line GraphQL queries with a single typed function call
2. **Zod validation** — data schema errors are caught at build time, not at runtime
3. **Static HTML** — flashcard listings, book indexes, and story pages are pure HTML (fast, SEO-friendly)
4. **Islands for interactivity** — flashcard study mode, speech synthesis, and score tracking hydrate as React islands only on pages that need them
5. **Build speed** — ~15s vs multi-minute Gatsby builds means faster iteration and CI/CD

---

## Chakra UI v2 End-of-Life Assessment

### Current Status

Chakra UI v2 is approaching **end of life**:

- v2 is in maintenance mode — receiving only critical security patches
- The team's focus has shifted entirely to v3
- React 19 compatibility for v2 is uncertain
- Emotion (v2's CSS-in-JS engine) is also seeing reduced maintenance

### Chakra UI v3 Breaking Changes

v3 is a **ground-up rewrite** with significant architectural changes:

- **Drops Emotion entirely** — switches to Panda CSS (zero-runtime CSS-in-JS)
- Component APIs have changed substantially
- Theme system is completely redesigned
- Not a drop-in upgrade — requires a multi-phase refactor of every component usage
- Migration effort: high (every styled component, theme token, and responsive prop needs updating)

### Alternative Component Libraries

| Library | Approach | Migration Effort | Notes |
|---------|----------|-----------------|-------|
| **Chakra UI v3** | Panda CSS (zero-runtime) | High — full API rewrite | Same team, but effectively a new library |
| **Ark UI** | Headless components (from Chakra team) | Medium — bring your own styles | Foundation of Chakra v3, no styling opinions |
| **Park UI** | Ark UI + Panda CSS presets | Medium — styled Ark UI | Ready-made styling on top of Ark |
| **shadcn/ui** | Tailwind + Radix primitives, copy-paste | Medium — different styling paradigm | Very popular, excellent DX, works great with Astro |

### Recommendation for Chakra UI

If migrating to Astro, the Chakra UI question simplifies:

- Chakra components would **only be used inside React islands** (interactive flashcard study, speech controls)
- Static page layouts would use Astro's built-in styling (CSS, Tailwind, or scoped styles)
- This reduces the Chakra surface area significantly — only ~5-10 interactive components need it
- A phased approach works: keep Chakra v2 inside islands initially, replace with shadcn/ui or Ark UI over time

---

## Recommendation

**Migrate to Astro.** The rationale:

1. **GraphQL is unnecessary overhead** — Astro's `getCollection()` and content collections provide simpler, typed APIs for the exact data access patterns this project needs
2. **Static HTML gives better SEO and loading** — the site is primarily content (flashcard listings, stories, books) that doesn't need JavaScript to render
3. **React components still work** — flashcard study mode, speech synthesis, score tracking all work as React islands via `@astrojs/react`
4. **15-second builds vs multi-minute Gatsby builds** — dramatically faster development iteration and CI/CD
5. **Active ecosystem** — Cloudflare-owned, regular releases, growing community (vs Gatsby's maintenance-only status)
6. **JSON data is a first-class citizen** — `file()` and `glob()` loaders with Zod schemas validate data at build time
7. **S3+CloudFront hosting is unchanged** — Astro outputs a `dist/` folder of static files, same deployment model
8. **Reduced Chakra UI dependency surface** — only interactive islands need Chakra, static layouts use native Astro styling

---

## Migration Path

### Phase 1: Foundation (1–2 days)

- Initialize Astro project with `@astrojs/react` integration
- Define content collection schemas for flashcards, decks, books, and stories
- Validate all JSON data against Zod schemas
- Set up path aliases and TypeScript configuration
- **Risk:** Low — no production impact, can be done in parallel

### Phase 2: Static Pages (2–3 days)

- Migrate page templates (deck listings, book indexes, story pages) to Astro components
- Replace GraphQL queries with `getCollection()`/`getEntry()` calls
- Implement layouts using Astro's built-in templating
- Set up static routing to match existing URL structure
- **Risk:** Medium — URL structure must be preserved for SEO; verify with redirect tests

### Phase 3: Interactive Islands (2–3 days)

- Migrate flashcard study component as a React island (`client:load`)
- Migrate speech synthesis controls as a React island
- Migrate score/progress tracking as a React island
- Keep Chakra UI v2 for these components initially
- **Risk:** Medium — island hydration boundaries need careful testing; ensure state management works within islands

### Phase 4: Styling & Polish (1–2 days)

- Implement static page styles (Tailwind CSS or Astro scoped styles)
- Ensure responsive design parity with current Chakra-based layouts
- Add dark mode support (Astro has built-in `prefers-color-scheme` support)
- **Risk:** Low — visual regression testing with screenshots

### Phase 5: Build & Deploy (0.5–1 day)

- Update `scripts/deploy.sh` to build with `astro build` and sync `dist/`
- Update CI/CD pipeline if applicable
- Verify S3+CloudFront deployment works with Astro's output
- **Risk:** Low — same static file deployment model

### Total Estimated Effort

**7–11 days** of focused development time.

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| URL structure breaks (SEO) | Medium | High | Map all existing routes before migration; implement redirects if needed |
| Chakra UI island hydration issues | Low | Medium | Test interactive components thoroughly; Astro's React integration is mature |
| Data schema migration errors | Low | Low | Zod schemas catch errors at build time; run against all JSON files early |
| Missing Gatsby plugin functionality | Low | Medium | Audit plugins — most (sitemap, manifest, robots.txt) have Astro equivalents or integrations |
| Build/deploy pipeline changes | Low | Low | Same output model (static files to S3); only build command changes |

### Gatsby Plugin Equivalents

| Gatsby Plugin | Astro Equivalent |
|---------------|-----------------|
| `gatsby-plugin-sitemap` | `@astrojs/sitemap` |
| `gatsby-plugin-manifest` | Manual `manifest.json` or community integration |
| `gatsby-plugin-robots-txt` | Static `public/robots.txt` |
| `gatsby-plugin-image` / `gatsby-plugin-sharp` | `astro:assets` (built-in image optimization) |
| `gatsby-plugin-offline` | Service worker via Workbox (manual setup) |
| `gatsby-transformer-json` | Content Collections with `file()`/`glob()` loaders |
| `gatsby-source-filesystem` | Not needed — content collections read filesystem directly |

---

## Decision

This evaluation recommends **migrating from Gatsby 5 to Astro**. The project's characteristics — static content, JSON data sources, no server-side API, S3+CloudFront hosting — align perfectly with Astro's design philosophy. The migration eliminates GraphQL complexity, delivers faster builds, produces lighter HTML output, and moves to an actively maintained framework with a growing ecosystem.

The migration can be executed incrementally with React components preserved as islands, minimizing risk while delivering immediate performance and DX improvements.
