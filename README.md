<p align="center">
  <img src="https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">
  🪷 Lingo Lotus
</h1>

<p align="center">
  <strong>Learn Thai through a guided path of flashcards and graded stories</strong>
</p>

<p align="center">
  Free, offline-friendly study on your device — no account required.
</p>

## Features

### Learning
- **Learn path** — Thematic units that pair a deck with a related story
- **Flashcards** — Study sessions with phonetics (Paiboon-style), examples, and ครับ/ค่ะ
- **Graded reading** — Beginner stories with word breakdowns; intermediate+ freer narrative
- **Speech** — Browser text-to-speech for pronunciation practice
- **Progress** — Saved in `localStorage` on this device (continue where you left off)
- **Grammar cheatsheet** — Quick reference for Thai patterns while you study

### Product
- **Thai → English** focus for English speakers
- **Browse** by level for cards and books (outside the guided path)
- **Static site** — Fast loads, works as a static deploy

## Stack

| Layer | Choice |
|--------|--------|
| Framework | [Astro](https://astro.build) 7 (static output) |
| Interactive UI | React islands (`client:load` where needed) |
| Styling | Tailwind CSS 4 + small shared UI primitives |
| Content | JSON under `data/` + Astro content collections |
| Language | TypeScript |
| Quality | Vitest, Biome |
| Deploy | Static build → AWS (see `scripts/deploy.sh` / CDK) |

## Project structure

```
lingolotus.com/
├── data/
│   ├── curriculum/units.json    # Learn path source of truth
│   ├── books/                   # Book metadata + stories/
│   ├── flash-cards/
│   │   ├── collections/         # Level collections
│   │   └── decks/               # Card decks
│   └── languages/               # Grammar notes (e.g. th.md)
├── docs/                        # UX_SPEC, CURRICULUM_MAP, …
├── src/
│   ├── components/
│   │   ├── islands/             # React: Learn, study, story, theme, …
│   │   └── ui/                  # Shared button/card primitives
│   ├── layouts/                 # BaseLayout, PageLayout
│   ├── lib/                     # ladder, progress, curriculum, SEO
│   ├── pages/                   # File-based routes
│   ├── styles/global.css
│   └── content.config.ts        # Collection schemas
├── public/                      # Static assets
├── astro.config.mjs
└── package.json
```

## Getting started

### Prerequisites
- **Node.js** 20+ recommended
- **pnpm** or **npm**

### Install & run

```bash
git clone https://github.com/cloudy-native/lingolotus.com.git
cd lingolotus.com
pnpm install   # or: npm install
pnpm dev       # or: npm run dev
```

Open **http://localhost:4321** (Astro default).

### Scripts

```bash
pnpm dev          # Dev server
pnpm build        # Production static build → dist/
pnpm preview      # Preview production build
pnpm test         # Vitest
pnpm typecheck    # astro check + tsc
pnpm lint         # Biome check
pnpm format:fix   # Biome format
pnpm deploy       # Deploy script (see scripts/deploy.sh)
pnpm clean        # Remove dist/ and .astro/
```

## Content

### Curriculum units
Edit `data/curriculum/units.json` to order themes and pair `deckId` + `storyId` for the Learn path.

### Flashcard decks
1. Add or edit JSON in `data/flash-cards/decks/`
2. Register the deck in a collection under `data/flash-cards/collections/`
3. Link the deck from a unit when it belongs on the Learn path

Each card typically has Thai front, English back, Paiboon phonetic, context, and example sentences (prefer paired ครับ / ค่ะ where polite speech applies).

### Stories
1. Story body: `data/books/stories/*.json`
2. Book metadata: `data/books/*.json`
3. Wire into units for the guided path

**Scaffolding policy:** full word breakdowns on Beginner 1–2 only; intermediate+ stories are continuous Thai without split tokens.

### Docs
- `docs/UX_SPEC.md` — product / UX decisions
- `docs/CURRICULUM_MAP.md` — inventory and curriculum status

## Contributing

Contributions welcome — content, languages, features, and UX polish.

Useful areas:
- **Content** — decks, stories, unit pairing
- **a11y** — keyboard, focus, screen readers
- **New languages** — structure is Thai-first but content-driven

## License

MIT — see [LICENSE](LICENSE) if present.

## Acknowledgments

- Thai learners and teachers who shaped the curriculum goals
- Astro, React, Tailwind, and the open-source ecosystem

---

<p align="center">
  Made with ❤️ for language learners
</p>

<p align="center">
  <a href="https://lingolotus.com">Live site</a> ·
  <a href="https://github.com/cloudy-native/lingolotus.com">Source</a> ·
  <a href="https://lingolotus.com/about">About</a>
</p>
