# Lingo Lotus — UX Spec (v1)

Status: **Approved direction** (from design brief). This document specifies screens, states, and flows for implementation.

Related: product brief decisions captured in conversation (journey-first, local progress, radical IA + home).

---

## 1. Goals & non-goals

### Goals
- New visitor **starts learning in one primary action** without understanding collections/decks/books/stories.
- Returner lands on a **personal Learn home** with obvious **Continue** and **Next**.
- Flashcards + reading feel like **one journey**, not two peer apps.
- Intermediate/advanced users can **switch level anytime** without a dead-end beginner path.
- Free forever + no account remain **clear trust signals**.

### Non-goals (this phase)
- Accounts / cross-device sync
- Rebuilding StudyMode / StoryReader engines
- New content authoring or perfect topic pairing
- Multi-language switcher
- Heavy gamification (streaks, XP, leaderboards)
- Keeping the old dual-column catalog homepage as the primary mental model

---

## 2. Mental model

```
Learn (home)     →  “What should I do now?”
Browse           →  “Let me pick anything”
Session          →  existing engines (cards / reading)
After session    →  re-orient to pair half or Learn
```

**Ladder:** within a selected level, ordered **steps**.  
**Step:** ideally `deck + story` (zip by level). Leftovers = solo steps.  
**Half-step:** cards half or reading half of a paired step.

---

## 3. Information architecture

### Navigation (global)

| Item | Route (proposed) | Role |
|------|------------------|------|
| **Learn** | `/` | Personal hub; primary |
| **Browse** | `/browse` | Full library |
| About | `/about` | Footer + optional overflow; not primary nav on mobile |

**Remove from primary nav:** separate top-level Flashcards and Reading (they become Browse sections / filters).

**Legacy URLs:** keep `/flash-cards/*` and `/reading/*` working (redirects or same pages linked from Browse). Do not break bookmarks.

### Mobile nav
- Bottom or top: **Learn | Browse** only (plus logo).
- About in footer.
- Level control lives **on Learn**, not in global nav.

### Desktop nav
- Logo → Learn  
- Learn · Browse  
- Footer: About, free forever note

---

## 4. Domain objects (product layer)

Built at runtime from existing content + local progress. No CMS required for v1.

### Level
`beginner | elementary | intermediate | advanced`

Normalization: content uses mixed casing (`Beginner` vs `beginner`); UI always title-case; storage always lowercase.

### Ladder (per level)
Ordered list of **steps** derived by:

1. Collect decks in collections for that level (by `collection.difficulty`, fallback `deck.difficulty`).
2. Sort decks stably (see §12).
3. Collect stories from books for that level (map elementary → soft-link rule).
4. Sort stories stably.
5. **Zip:** step `i` = `{ deck: decks[i]?, story: stories[i]? }` for `i` in `0 .. max(len)-1`.
6. Missing side → solo step.

#### Level content mapping (v1)

| Level | Decks source | Stories source |
|-------|--------------|----------------|
| Beginner | `thai-english-beginner` | `thai-beginner-1` then `thai-beginner-2` |
| Elementary | `thai-english-elementary` | Soft-link pool: `thai-beginner-2` then `thai-intermediate-1` (cards still primary; see empty pair UX) |
| Intermediate | `thai-english-intermediate` | `thai-intermediate-1` then `thai-intermediate-2` |
| Advanced | `thai-english-advanced` | `thai-advanced-1` |

**Elementary note:** treat as **cards-led**. Prefer showing deck steps; attach soft-linked stories via zip so reading still appears, but copy should not pretend elementary has a dedicated reading curriculum.

Approximate counts today (for UI density planning):

| Level | Decks | Stories | Paired | Solo (approx) |
|-------|------:|--------:|-------:|---------------|
| Beginner | 2 | 20 | 2 | 18 reading-only |
| Elementary | 5 | ~20 soft | 5 | many reading-only if using full soft pool — **cap soft stories** (see below) |
| Intermediate | 6 | 20 | 6 | 14 reading-only |
| Advanced | 1 | 10 | 1 | 9 reading-only |

**Elementary soft-pool cap:** only zip as many soft-linked stories as there are elementary decks (5). Do **not** dump 20 reading-only elementary steps. Extra beginner-2 / intermediate-1 stories remain available in Browse under their real levels.

### Progress (local only)

```ts
// conceptual schema — key: lingolotus.progress.v1
{
  version: 1,
  level: "beginner",
  onboardingCompleted: boolean,
  // last deep-link target for Continue
  lastActivity: null | {
    type: "deck" | "story" | "onboarding",
    id: string,           // deckId or storyId
    stepIndex?: number,
    half?: "cards" | "reading",
    updatedAt: string     // ISO
  },
  completedDecks: string[],   // deckIds
  completedStories: string[], // storyIds
  // optional light marks for onboarding sample
  flags?: { introSampleDone?: boolean }
}
```

**Completion rules (v1, simple):**
- Deck: user finishes a study session end-state (existing “session complete” path), or explicitly marks done if we already have that — prefer **session complete event**.
- Story: user reaches end of story reader (last sentence / finish CTA), fire complete.
- Partial progress inside a deck/story is **not** required for v1 beyond whatever the engine already keeps in-session.

---

## 5. Screen inventory

1. **Learn home** (`/`) — first-run & returning  
2. **Guided first session** (onboarding flow)  
3. **Browse hub** (`/browse`)  
4. **Browse · Cards** (collections → decks; may reuse existing routes)  
5. **Browse · Reading** (books → stories; may reuse existing routes)  
6. **Deck study** (existing engine + exit chrome)  
7. **Story read** (existing engine + exit chrome)  
8. **Post-session: cards half complete**  
9. **Post-session: reading half / solo complete**  
10. **About** (minor copy/nav only)  
11. **404** (unchanged tone polish optional)

---

## 6. Screen specs

### 6.1 Learn home — first run

**When:** `onboardingCompleted === false` (no meaningful progress).

**Purpose:** one path into learning; explain product in one breath; trust.

**Layout (mobile-first):**
1. **Header:** 🪷 Lingo Lotus (no heavy hero image)
2. **Headline:** e.g. “Learn Thai, one clear step at a time.”
3. **Subcopy (1–2 lines):** flashcards + short stories, phonetics included. Calm coach tone.
4. **Trust row:** “Free forever · No account · Progress saved on this device”
5. **Primary CTA:** **Start learning** (full width)
6. **Secondary:** “Browse the library” (text button → Browse)
7. **Level note (quiet):** “We’ll start at Beginner — you can change level anytime after.”
8. Optional tiny “I’m not a beginner” → still goes to Learn **after** setting level, or opens level sheet **then** Start (see §7.2). Prefer: secondary link opens level picker; selecting a level sets storage and enables Start for that level’s intro variant (v1 may still use beginner intro content with a disclaimer — see open items).

**Not on first-run Learn:**
- Dual flashcards/reading marketing columns
- Featured grids
- Dense feature lists

**Empty/error:** if content fails to load, show retry + Browse link; never a dead primary CTA.

---

### 6.2 Learn home — returning

**When:** `onboardingCompleted === true` OR any completion/lastActivity exists.

**Purpose:** answer “what now?” in under 3 seconds.

**Layout:**
1. **Greeting line** (static calm): “Welcome back” / “Pick up where you left off” (no name)
2. **Level control** (always visible): segmented control or chips  
   `Beginner · Elementary · Intermediate · Advanced`  
   Current level emphasized. Changing level **does not** wipe other levels’ completion; it only changes which ladder/Continue context is shown.
3. **Continue card** (primary surface)
   - If `lastActivity` in current level’s ladder: show title, type badge (Cards / Reading), CTA **Continue**
   - If last activity is other level: still show it with level badge, **or** prefer current-level next (product choice: **prefer current level’s next**; show last activity only if it matches current level; otherwise show Next as primary)
   - **Decision (v1):** Continue = last activity **if** it belongs to selected level; else hide Continue and promote Next.
4. **Next step card**
   - First incomplete step in selected level ladder (prefer incomplete cards half, then reading half, then next step)
   - Title composition:
     - Pair: “Step N · {Deck name} + {Story title}”
     - Or show two mini-rows: Cards / Reading with status icons
   - CTA: **Start** / **Resume** on the incomplete half
5. **Step list (light progress)** — current level only
   - Compact list or vertical stepper (first ~5 visible, rest expand)
   - Each step: name(s), marks:
     - ○ not started · ◐ cards done · ● step complete (both halves or solo done)
   - Tapping a step opens the incomplete half, or cards half if neither done
6. **Browse link:** “Or browse the full library”
7. **Trust footnote:** free · local progress · no account

**States:**

| State | UI |
|-------|-----|
| Has last activity in level | Continue + Next both may show (Next = following incomplete) |
| No last activity, has incompletes | Next only |
| Level fully complete | Celebration-lite: “You’ve finished this level’s path” + CTA switch level or Browse |
| Fresh level switch | Next = first incomplete in that level; list resets context |
| Storage unavailable | Banner: progress won’t persist; still allow learning |
| Storage corrupted | Reset progress quietly + toast; treat as first-run or empty return |

---

### 6.3 Guided first session (~3–5 minutes)

**Entry:** Start learning (first run).

**Flow (linear):**
1. **Intro screen (optional 1 beat, ≤10s)**  
   “A few words, then a tiny story. About 5 minutes.”  
   CTA: **Let’s go** · Skip → mark onboarding complete? **No** — Skip should jump to Learn returning with beginner level set but `onboardingCompleted true` and no fake completions (**Skip intro**).
2. **Cards sample**  
   - Deck: **greetings** (`Basic Thai Greetings`)  
   - Card cap: **6 cards** (not full deck) for timebox  
   - Use existing StudyMode with a `limit` / sample mode if needed; else temporary sample route  
   - Chrome: progress “Intro · Cards 3/6”, minimal exit “Save & exit” → Learn (onboarding still incomplete unless they finish)
3. **Bridge screen**  
   “Nice start. Here’s how those words feel in a real sentence.”  
   CTA: **Read a short story**
4. **Reading sample**  
   - Story: shortest/simple from beginner-1 — prefer **greetings-themed if exists**, else first stable story e.g. `thai-beginner-1-greetings` if present, else `thai-beginner-1-colors` / first by sort  
   - Cap: full short story OK if ≤~8–12 sentences (beginner-1 is ~8); do not use intermediate  
   - Existing StoryReader; chrome “Intro · Reading”
5. **Completion screen**  
   - “You’re set up. We’ll keep a simple path for you on this device.”  
   - Trust reminder  
   - Primary: **Go to your Learn home**  
   - Sets `onboardingCompleted: true`, `level: beginner`, optional `flags.introSampleDone`, `lastActivity` → learn home  
   - Do **not** mark full greetings deck complete from sample-only (unless they did full deck). Sample is onboarding, not ladder completion.

**Abandon mid-intro:**  
- Persist `onboardingCompleted: false`, keep `lastActivity: onboarding` position if easy; else return to first-run Learn with Start still primary.

---

### 6.4 Browse hub

**Route:** `/browse`

**Purpose:** free exploration without killing the journey model.

**Layout:**
1. Title: **Browse**
2. Short line: “All flashcards and stories — jump in anywhere.”
3. **Two equal entry cards:**
   - **Flashcards** → cards library (existing `/flash-cards` or `/browse/cards`)
   - **Reading** → reading library (existing `/reading` or `/browse/reading`)
4. Optional: “Back to Learn” link

**Not required v1:** unified search, cross-type filters.

**Browse subpages:** reuse current collection/deck/book/story listing UIs with:
- Nav updated to Learn/Browse
- Breadcrumbs: Browse → …
- Reduced marketing hero blurb (tighten copy; keep scannable lists)

---

### 6.5 Deck study (engine unchanged)

**Entry points:** Learn (Continue/Next/step), Browse, post-onboarding, pair prompt.

**Added chrome only:**
- Clear **Back** target: `returnTo` query or referrer policy → Learn vs Browse vs pair bridge
- On **session complete** → **Post-session cards** (§6.7), not a dead end or raw deck page only

---

### 6.6 Story reader (engine unchanged)

**Added chrome only:**
- Back/close returns to sensible parent
- On **story finish** → **Post-session reading** (§6.8)

---

### 6.7 Post-session — cards half complete

**When:** user completes a deck that is the cards half of a step (or solo deck step).

**UI (modal page or full screen interstitial):**
- Calm success: “Deck complete”
- If paired story incomplete:  
  - Primary: **Read: {story title}**  
  - Secondary: **Back to Learn**  
  - Tertiary: Browse
- If solo or story already done:  
  - Primary: **Back to Learn** (Next will update)  
  - Secondary: next incomplete cards in level if any

Mark `completedDecks` += id; update `lastActivity`.

---

### 6.8 Post-session — reading complete

**When:** story finished.

**UI:**
- “Story complete”
- If this completed a pair: “Step N done” (light)
- Primary: **Back to Learn**
- Secondary: **Next step** (deep link to next incomplete half)
- If user arrived from Browse only: still offer Learn + stay in Browse book

Mark `completedStories` += id; update `lastActivity`.

---

### 6.9 About

- Keep founder/free mission
- Align CTA: **Start learning** / **Go to Learn**
- Not in primary mobile nav

---

## 7. Key flows

### 7.1 First visit happy path
```
Land Learn (first-run)
  → Start learning
  → Intro beat
  → 6 greeting cards
  → Bridge
  → Short beginner story
  → Completion
  → Learn (returning): Next = first full ladder step
```

### 7.2 Not a beginner
```
First-run: “Choose level” / level chips
  → set level
  → either (A) level-specific short intro later, or (B) skip intro → Learn returning for that level
v1 recommendation: Skip intro allowed; full guided session remains beginner-content. Non-beginners use level chips + Skip.
```

### 7.3 Daily return
```
Land Learn (returning)
  → Continue (if last in level) OR Next
  → Session
  → Post-session pair prompt or Learn
```

### 7.4 Pair continuity
```
Complete deck half
  → Strong CTA into paired story
  → Complete story
  → Learn shows next step
```

### 7.5 Browse escape hatch
```
Learn → Browse → pick random deck
  → study
  → post-session still offers Learn
  → completion counts toward ladder marks if that deck is on a ladder
```

---

## 8. Component-level UI notes

### Level chips
- Always on returning Learn
- Keyboard accessible; `aria-pressed` / radiogroup pattern
- Changing level is instant (client island)

### Step status icons
- Use simple monochrome marks; avoid rainbow badge spam from old catalog
- Type badges: “Cards” / “Reading” only

### CTAs
- One primary per screen (filled)
- Secondary text or outline
- Full-width primary on mobile

### Motion
- Minimal; short fades OK
- No confetti/heavy celebration in v1

### Imagery
- Learn home: little or no large Thailand photo
- Browse/list pages: optional small thumbs if already present; don’t dominate

### Copy tone
- Calm coach: short sentences, second person, no hype stack
- Avoid “Master fluency” style claims on Learn

---

## 9. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (default) | Single column; primary CTA full width; step list compact; level chips wrap/scroll |
| Tablet+ | Continue + Next can sit side-by-side; step list wider |
| Desktop | Max content width ~640–720px for Learn (reading comfort); Browse can be wider grids |

---

## 10. Accessibility

- Focus order follows primary path (CTA early)
- Level control is a radiogroup
- Status not color-only (icons + text)
- Post-session titles announced as page/heading change
- Respect existing reduced-motion if present
- TTS controls in engines unchanged but must remain reachable

---

## 11. Analytics (optional, later)
Not required for UX v1. If added: `onboarding_start`, `onboarding_complete`, `continue_click`, `next_click`, `level_change`, `pair_cta_click` — privacy-light, no PII.

---

## 12. Ladder ordering algorithm (deterministic)

```
decksForLevel(level):
  filter decks where collectionId maps to collection.difficulty == level
  sort by: theme/name ascending, then deckId ascending
  # Implementation may fix greetings first for beginner via explicit priority list

storiesForLevel(level):
  books = books mapped to level (see §4)
  stories in those books
  sort by: book order (beginner-1 before beginner-2), then storyId ascending

steps = zip(decks, stories) // extras solo
```

**Beginner priority override (v1):** force `greetings` as first deck if present. (`common-adjectives` second despite its card-level “intermediate” tag — collection membership wins.)

---

## 13. Route map (proposed)

| Route | Screen |
|-------|--------|
| `/` | Learn home (first-run or returning) |
| `/onboarding` | Guided first session shell (or query `/?onboarding=1`) |
| `/browse` | Browse hub |
| `/flash-cards...` | Existing; linked from Browse |
| `/reading...` | Existing; linked from Browse |
| `/about` | About |

Prefer **client islands** on Learn for progress/level; keep content lists SSG.

---

## 14. Implementation phases (for later planning)

1. **Progress module** — localStorage schema, ladder builder, completion helpers  
2. **Shell** — nav Learn/Browse; demote About  
3. **Learn home** — first-run + returning states  
4. **Onboarding flow** — sample cards + story + flags  
5. **Session exit chrome** — pair CTA interstitials  
6. **Browse hub** + copy tighten on library pages  
7. **Polish** — empty states, a11y, mobile spacing  

---

## 15. Open items (resolve in build if needed)

1. Exact beginner intro **storyId** (greetings-themed if available).  
2. Whether non-beginner first visit gets a **level-specific** mini-intro or skip-only (spec recommends skip-only for v1).  
3. Whether completing a deck from Browse auto-opens pair CTA (yes — if deck is on any step).  
4. Sample cards mode: engine supports limit vs fork a thin wrapper.  
5. Visual design tokens: reuse teal primary; reduce slate-card catalog chrome on Learn.

---

## 16. Acceptance criteria

- [ ] First visit shows single primary **Start learning**, not dual catalog columns as the hero.
- [ ] Completing onboarding lands on Learn with level=beginner and a clear **Next**.
- [ ] Return visit shows **Continue** and/or **Next** without opening Browse.
- [ ] Level chips change the step list without wiping other levels’ completions.
- [ ] Completing a paired deck shows strong CTA to paired story.
- [ ] Browse still reaches all existing decks and stories.
- [ ] Old `/flash-cards` and `/reading` URLs still work.
- [ ] No login required; progress survives refresh on same browser.
- [ ] Mobile: primary path usable thumb-zone, no horizontal chaos on level chips.
- [ ] StudyMode and StoryReader core interactions unchanged aside from entry/exit chrome.

---

## 17. Copy bank (starting point)

| Place | Copy |
|-------|------|
| Learn first-run H1 | Learn Thai, one clear step at a time |
| Learn first-run sub | Short flashcard steps and simple stories with phonetics — free, on this device. |
| Primary CTA | Start learning |
| Trust | Free forever · No account · Progress saved on this device |
| Continue | Continue |
| Next | Next up |
| Pair CTA | Read the paired story |
| Onboarding bridge | Nice start. Here’s those words in a real mini-story. |
| Level complete | You’ve finished this level’s path. Try another level or browse freely. |

Tone check: if a line could appear in a growth-hack onboarding, rewrite calmer.
