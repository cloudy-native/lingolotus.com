# Lingo Lotus — Curriculum Map (Step 1)

Status: **Approved** — step 2 started: P0 decks shipped + `units.json` drives Learn path.  
Date: 2026-04-08  

### Step 2–3 progress
- [x] P0 decks: `colors`, `places`, `time`, `weather` (20 cards each, beginner collection)
- [x] `data/curriculum/units.json` — full path skeleton (Beg→Adv)
- [x] Ladder prefers units over zip-pairing
- [x] **Beginner 1 stories rewritten** (all 10) — Thailand-set, ครับ/ค่ะ, full breakdowns
- [x] **Beginner 2 stories rewritten** (all 10) — longer dialogs, full breakdowns
- [x] **Intermediate 1 + 2 rewritten** (20) — Thailand errands/social life, **no** breakdowns
- [x] **Advanced 1 rewritten** (10) — Thailand-only settings (no Alps/Paris/Tokyo), **no** breakdowns
- [x] **Pets & animals deck** rewritten (`farm-animals` id kept)
- [x] **P1 decks:** social-small-talk, school-study, planning-invites, job-interview
- [x] **Unit hub UX** — `/unit/{unitId}` with Cards | Reading switch; Learn path opens units
- [x] **Deck polish pass** — family, greetings, food, travel, shopping, medical, occupations, activities, pets: paired ครับ/ค่ะ examples, no slash particles, vocab-first where useful, Thailand-set sentences
- [ ] Classifiers / city-life / advanced decks (later gaps)  

Goals from product decisions:
- **Thematic paired units** (deck + story on the same topic)
- **Restructure freely** within Thai levels (IDs/paths may change later)
- **Unit hub** UX later: Cards | Story | switch mid-unit
- **Paiboon-like phonetics** with tone marks
- **Word breakdown only on Beginner 1–2**; Intermediate+ no split
- **Everyday life in Thailand**
- **ครับ / ค่ะ both taught** (with short notes)
- **Skill side-units** (tones, prepositions, pure grammar) without forced stories
- **~8–12 units per level**

---

## 1. What’s wrong with the inventory today

### 1.1 Misalignment (cards vs stories)

| Area | Flashcards | Stories | Problem |
|------|------------|---------|---------|
| Themes | Greetings, food, travel, medical, shopping, family, jobs, tones… | Beginner: animals, colors, weather, numbers… Intermediate: school, market, party… Advanced: Paris/Tokyo/Alps | **No intentional 1:1 pairing**; zip-by-level pairs unrelated topics |
| Level labels | `common-adjectives` lives in **beginner collection** but cards tagged intermediate | Books: Beginner 1/2, Intermediate 1/2, Advanced 1 | **Taxonomy is inconsistent** |
| Density | 14 decks total; beginner only has 2 decks | 50 stories (10×5 books) | **Too many solo reading steps**, too few card partners |
| Setting | Practical Thai (markets, clinics, taxis) | Advanced stories often **global English names + non-Thai settings** | Violates “everyday Thailand” |
| Scaffolding | Cards always atomic | Advanced sometimes still has breakdown; one advanced story has **no breakdown** while others do | Uneven; we will **standardize** |

### 1.2 Quality notes (existing content)

**Decks (after polish pass 2026-08)**
- **greetings, food-dining, shopping, thai-travel, thai-medical, thai-family, occupations, activities, farm-animals (pets)** — polished: paired ครับ/ค่ะ, context on every card, Thailand-set examples; occupations/activities moved vocab-first.
- **numbers-counting** — keep; good skill+life dual use.
- **common-adjectives** — useful; level fixed to elementary collection (re-home).
- **prepositions** — keep as **skill side-unit**.
- **tones-pronunciation-revised** — keep as **skill side-unit** (high value).
- **advanced-phrases** — keep as late skill / advanced culture unit (เกรงใจ, ทำใจ…); more advanced decks still a gap.
- **Still multi-unit deck reuse** — same deck linked from several units by design; optional future split of progressive subsets.

**Stories**
- **Beginner 1–2**: short, scaffolded, on-theme — **best rewrite base** (tighten Thai, fix awkward lines, ensure breakdown quality).
- **Intermediate 1**: strong thematic matches to life in Thailand (market, restaurant, travel, jobs) — **primary pairing material**.
- **Intermediate 2**: more narrative, often generic Western names/hobbies — **rewrite into Thai settings** or retire themes that don’t serve daily Thai.
- **Advanced 1**: least aligned (Tokyo, Alps, Paris, Rio) — **rewrite heavily** into Thai contexts (Bangkok move, Chiang Mai volunteer, Isaan reunion, etc.) or replace topics.

### 1.3 Product implication of pairing today

Current ladder **zips** decks×stories by sort order → e.g. greetings deck + animals story. That fights the product.  
**Target:** explicit **unit catalog** (metadata), not zip-by-filename.

---

## 2. Curriculum architecture

### 2.1 Levels (learner-facing)

| Level | Role | Scaffolding |
|-------|------|-------------|
| **Beginner** | Survive first conversations | Full breakdown + phonetics on every sentence; short dialogs (6–10 lines) |
| **Elementary** | Expand daily life | Full breakdown + phonetics; slightly longer (10–14 lines) |
| **Intermediate** | Real situations, freer speech | **No** word breakdown; phonetics on sentences OK; 12–20 sentences |
| **Advanced** | Nuance, culture, longer narrative | No breakdown; phonetics optional/reduced; richer vocab & particles |

> Note: Today’s books are Beginner 1/2, Intermediate 1/2, Advanced 1.  
> We map **Beginner ≈ B1**, **Elementary ≈ B2 + early life themes**, **Intermediate ≈ I1+I2 merged path**, **Advanced ≈ A1 rewritten**.  
> Collection IDs can be rationalized in implementation (step 2+).

### 2.2 Unit types

1. **Theme unit** (default)  
   - `deck` + `story` same topic  
   - Unit hub: Study cards ↔ Read story  
   - Progress: cards half + reading half (already in product model)

2. **Skill side-unit**  
   - Deck only (tones, prepositions, classifiers deep-dive)  
   - Appears in path as cards-only step; Browse can highlight “Skills”

3. **Story-only bridge** (rare)  
   - Only if a story teaches a transition without a mature deck yet  
   - Prefer creating the missing deck in step 2 rather than many story-only units

### 2.3 Unit ID convention (proposed)

```
unit:{level}:{slug}
  deckId:  {slug}          or keep legacy deckId during migration
  storyId: {level}-{slug}  e.g. beginner-greetings
```

Implementation can add `data/curriculum/units.json` later — **not required for this map**.

### 2.4 Politeness convention

- Teach **ครับ** and **ค่ะ** early (greetings unit).  
- Alternate speakers in dialogs (e.g. male/female or note “speaker A uses ครับ”).  
- Cards: include particle variants or a dedicated “polite endings” mini-set inside greetings.  
- Never imply one particle is “the only correct Thai.”

### 2.5 Phonetics

- Paiboon-like with tone marks (current site style): `sà-wàt-dii`, `kɔ̀p-kun`.  
- Standardize spellings in rewrite pass (one form per word).  
- Document a short **phonetic style sheet** in step 3 (appendix of rewrite PR).

### 2.6 Breakdown rules

| Level | `breakdown[]` | Notes |
|-------|---------------|--------|
| Beginner | **Required** every sentence | Split meaningful chunks (particles separate) |
| Elementary | **Required** every sentence | Same |
| Intermediate | **Omit** (empty/absent) | Sentence-level phonetic only |
| Advanced | **Omit** | Phonetic optional per sentence |

---

## 3. Proposed path by level

Rough target: **8–12 units/level**.  
Legend: **E** = exists (rewrite) · **G** = gap (create later) · **S** = skill side-unit · **M** = merge/re-level existing

### 3.1 Beginner (~10 units)

Spine: first week in Thailand — meet, thank, numbers, family, food, places.

| # | Unit | Deck source | Story source | Action |
|---|------|-------------|--------------|--------|
| 1 | Greetings & polite speech | **E** `greetings` | **E** `thai-beginner-1-greetings` | Rewrite pair; expand ครับ/ค่ะ |
| 2 | Numbers & counting | **E** `numbers-counting` (trim to beginner subset or full) | **E** `thai-beginner-1-numbers` | Align vocab; classifiers light intro |
| 3 | Family | **M** from `thai-family` (pull beginner subset) or **G** beginner-family deck | **E** `thai-beginner-1-family` | Don’t force full intermediate kinship tree yet |
| 4 | Food likes | **M** from `food-dining` (basic dishes + หิว/อร่อย) | **E** `thai-beginner-1-food` | Split full dining to Elementary |
| 5 | Colors | **G** colors deck | **E** `thai-beginner-1-colors` | Create deck later |
| 6 | Animals / pets | **M** `farm-animals` → rewrite as common animals + pets | **E** `thai-beginner-1-animals` + bits of `pet-cat` | Drop “farm only” framing |
| 7 | Places around town | **G** places deck | **E** `thai-beginner-1-places` | Create deck later |
| 8 | Time of day | **G** time deck | **E** `thai-beginner-1-time` | Create deck later |
| 9 | Weather | **G** weather deck | **E** `thai-beginner-1-weather` | Create deck later |
| 10 | Daily activities | **M** from `activities` (easy subset) | **E** `thai-beginner-1-daily-activities` | Full activities → Elementary |

**Skill (Beginner, optional in path)**  
| S1 | Tones intro | **E** `tones-pronunciation-revised` (select easier pairs) | — | Side-unit; may sit after unit 2 |

### 3.2 Elementary (~10 units)

Spine: longer sentences, markets, movement, simple plans.

| # | Unit | Deck source | Story source | Action |
|---|------|-------------|--------------|--------|
| 1 | Meeting people | **G** or extend greetings II | **E** `thai-beginner-2-new-friend` | Rewrite Thailand setting |
| 2 | Big family & roles | **E** rest of `thai-family` | **E** `thai-beginner-2-big-family` | Deeper kinship |
| 3 | Busy day / routines | **E** `activities` (full) | **E** `thai-beginner-2-busy-day` | Pair tightly |
| 4 | Food & picnic / street food | **E** `food-dining` (ordering core) | **E** `thai-beginner-2-picnic-food` | Thai picnic/street food rewrite |
| 5 | Counting in real life | Numbers review mini or classifiers **G** | **E** `thai-beginner-2-counting-fun` | Emphasize classifiers (จาน, คน…) |
| 6 | Day & clock time | **G** time II | **E** `thai-beginner-2-day-time` | Create/expand time deck |
| 7 | Colors in the city | Colors deck (shared) | **E** `thai-beginner-2-colors-everywhere` | Same deck as Beginner colors OK |
| 8 | Visiting places | Places deck II **G** | **E** `thai-beginner-2-visiting-places` | Temples, malls, BTS-ish language carefully |
| 9 | Weather & seasons | Weather deck | **E** `thai-beginner-2-weather-seasons` | Thailand seasons (hot/rainy/cool) |
| 10 | Common adjectives | **E** `common-adjectives` | **G** short story “describing people/places” | Need story or fold adjectives into units 2–4 |

**Skill**  
| S1 | Prepositions / location | **E** `prepositions` | — | Side-unit after places |
| S2 | Tones practice | Rest of tones deck | — | Side-unit |

### 3.3 Intermediate (~10–12 units)

Spine: transactions and social life in Thailand. Prefer **I1** stories; rewrite **I2** into Thai life.

| # | Unit | Deck source | Story source | Action |
|---|------|-------------|--------------|--------|
| 1 | At the market | **E** `shopping` (market half) or split | **E** `thai-intermediate-1-at-the-market` | Strong pair |
| 2 | At the restaurant | **E** `food-dining` advanced half + order phrases | **E** `thai-intermediate-1-at-the-restaurant` | Strong pair |
| 3 | Shopping for clothes | **E** `shopping` (sizes, price) | **E** `thai-intermediate-1-shopping-for-clothes` | Strong pair |
| 4 | Getting around | **E** `thai-travel` | **E** `thai-intermediate-1-traveling` | Taxi/BTS/train Thailand |
| 5 | Work & jobs | **E** `occupations` | **E** `thai-intermediate-1-work-and-jobs` | Strong pair |
| 6 | Health & clinic | **E** `thai-medical` | **E** `thai-intermediate-1-health-and-exercise` | Align medical + exercise carefully (or split health vs exercise) |
| 7 | Hobbies | **M** activities leftovers | **E** `thai-intermediate-1-hobbies` | Thai hobby contexts |
| 8 | Meeting new friends | **G** social phrases deck | **E** `thai-intermediate-1-meeting-new-friends` | Create deck later |
| 9 | Planning a gathering | **G** party/planning deck | **E** `thai-intermediate-1-planning-a-party` | Thai house party / temple fair optional |
| 10 | School / study life | **G** school deck | **E** `thai-intermediate-1-a-day-at-school` | Useful for language students |
| 11 | Job interview | **G** interview phrases | **E** `thai-intermediate-2-the-job-interview` | Rewrite Thai office context |
| 12 | Cooking / food culture | **G** or food III | **E** `thai-intermediate-2-the-cooking-class` | Thai cooking class rewrite |

**I2 stories to rehome or rewrite (not drop without reason)**  
| Story | Verdict |
|-------|---------|
| museum | Rewrite → Thai museum / palace museum day |
| language-exchange | Keep theme; set in Bangkok café |
| new-hobby | Merge with hobbies unit or rewrite pottery → Thai craft |
| weekend-getaway | Rewrite → Hua Hin / Kanchanaburi / Chiang Mai weekend |
| book-club | Lower priority; optional later |
| charity-run | Rewrite → Thai charity run / bike event |
| community-garden | Optional; community spirit OK in Thai condo/village |
| photography-project | Rewrite → Bangkok street photography / markets |

**Skill**  
| S1 | Tones mastery | Full tones deck | — |
| S2 | Prepositions in sentences | prepositions + examples rewrite | — |

### 3.4 Advanced (~8–10 units)

Spine: culture, nuance, longer narrative — **all Thailand-set**.

| # | Unit | Deck source | Story source | Action |
|---|------|-------------|--------------|--------|
| 1 | Softeners & heart words | **E** `advanced-phrases` | **G** story using เกรงใจ, ทำใจ, เป็นห่วง | Create story later |
| 2 | Family reunion (Thai) | Family review + kinship honorifics **G** | **E** `a-family-reunion` | **Rewrite**: not “Grandma Rosa’s farm” → Thai family + province |
| 3 | Moving to a new city | **G** city life phrases | **E** `a-new-city-a-new-life` | **Rewrite**: e.g. move to Bangkok/Chiang Mai (not Tokyo) |
| 4 | Volunteer / community | **G** | **E** `a-volunteers-mission` | Thai community org / temple school |
| 5 | Travel deeper | Travel II **G** | **E** `journey-to-the-mountains` | North Thailand mountains |
| 6 | Markets & craft / antiques | **G** | **E** `the-antique-shop` | Chatuchak / old town shop |
| 7 | Food passion | **G** | **E** `the-art-of-baking` → better **Thai dessert/chef** rewrite | Baking → ขนมไทย or street-food stall optional |
| 8 | Arts & expression | **G** | street-artist / music-festival / library | Pick **1–2** best; rewrite Thai (e.g. Loi Krathong music, Bangkok mural) |
| 9 | Winter retreat etc. | — | Alps/Paris-type | **Retire or fully rewrite** into Thai wellness/retreat (e.g. quiet temple stay) |

Advanced decks are sparse today (**1 deck**). Most advanced units need **new decks** in step 2.

---

## 4. Crosswalk: existing assets → future role

### 4.1 Decks

| deckId | Keep? | Future home | Notes |
|--------|-------|-------------|-------|
| greetings | Yes | Beginner U1 | Expand particles |
| numbers-counting | Yes | Beginner U2 (+ Elementary classifiers) | May split later |
| farm-animals | Rewrite | Beginner animals | Rename theme; expand pets |
| food-dining | Yes | Beg food + Elem dining + Int restaurant | Split by difficulty in rewrite |
| activities | Yes | Beg daily + Elem busy day + Int hobbies | Split |
| common-adjectives | Yes | Elementary skill/theme | Re-level out of “beginner collection” |
| prepositions | Yes | Skill side-unit | Elementary+ |
| tones-pronunciation-revised | Yes | Skill side-unit | All levels access; path slots Beg/El/Int |
| shopping | Yes | Intermediate market + clothes | Possibly two units one deck or split |
| thai-travel | Yes | Intermediate getting around | Thailand-first examples |
| thai-medical | Yes | Intermediate health | |
| thai-family | Yes | Beg family subset + Elem big family | Split cards by stage |
| occupations | Yes | Intermediate work | |
| advanced-phrases | Yes | Advanced U1 | Culture/nuance |

### 4.2 Stories (high-level)

| Band | Keep as rewrite base | Heavy rewrite / retheme | Defer / optional |
|------|----------------------|-------------------------|------------------|
| Beginner 1 | All 10 themes | Quality polish | — |
| Beginner 2 | All 10 | Thailand specificity | — |
| Intermediate 1 | All 10 | Light Thailand pass | — |
| Intermediate 2 | interview, cooking, weekend, language-exchange, museum, photo, charity | book-club, garden lower priority | Merge some into fewer units |
| Advanced 1 | Structure/length | **All settings → Thailand** | Drop pure Western-only if unsalvageable |

---

## 5. Gap list (create in step 2 — do not author yet)

### 5.1 Missing decks (priority)

| Priority | Deck | Level | Pairs with |
|----------|------|-------|------------|
| P0 | colors | Beginner | colors stories |
| P0 | places (town) | Beginner | places / visiting |
| P0 | time & clock | Beginner/Elementary | time stories |
| P0 | weather | Beginner/Elementary | weather stories |
| P1 | social / small talk | Intermediate | meeting friends |
| P1 | planning & invitations | Intermediate | party / plans |
| P1 | school & study | Intermediate | day at school |
| P1 | interview & workplace soft skills | Intermediate/Advanced | job interview |
| P2 | classifiers deep dive | Elementary skill | counting-fun |
| P2 | city life / moving | Advanced | new city |
| P2 | volunteer & community | Advanced | volunteer |
| P2 | culture soft language (beyond advanced-phrases) | Advanced | multiple |

### 5.2 Missing stories (priority)

| Priority | Story | Level | Pairs with |
|----------|-------|-------|------------|
| P0 | Describing people/places (adjectives) | Elementary | common-adjectives |
| P1 | Story built around advanced-phrases | Advanced | advanced-phrases |
| P2 | Extra Intermediate if we split health vs exercise | Intermediate | medical / activities |

### 5.3 Structural gaps

- No **unit metadata file** yet (`units.json`) for hub + fluid switch.  
- Collections named by CEFR-ish bands don’t match unit model.  
- Onboarding currently hardcodes greetings deck + greetings story — **still valid** after map (keep as Unit 1).

---

## 6. Compelling learner narrative (marketing of the path)

> **Beginner** — Arrive and be polite: say hello, count, talk family and food.  
> **Elementary** — Live a simple week: friends, routines, places, weather.  
> **Intermediate** — Handle real errands: market, restaurant, taxi, clinic, work.  
> **Advanced** — Speak with heart: เกรงใจ, family duty, city life, culture.

This is more motivating than “Collection: Elementary (5 decks)” and matches free, no-account Learn home.

---

## 7. Fluid switch (product notes for later implementation)

Not building now; requirements for when we implement unit hub:

1. **Unit page** `/learn/{unitId}` or modal from Learn:  
   - Primary: Continue cards / Continue story  
   - Secondary: switch to the other half anytime  
2. **Study complete** → paired story (exists) + “Stay in unit”.  
3. **Story complete** → paired deck review (first wrong) + “Stay in unit”.  
4. **Browse** still free-form; units are the guided spine.  
5. Metadata must list `deckId` + `storyId` + `level` + `order` + `type: theme|skill`.

---

## 8. Rewrite standards (for step 3–4)

When rewriting existing JSON:

1. **Thai first** — natural spoken Thai for the level; then English; then phonetics.  
2. **Register** — polite casual (suitable for learners talking to new acquaintances).  
3. **Names** — Thai or common in Thailand (Somchai, Nok, Pim…); places: Bangkok districts, Chiang Mai, markets, BTS/MRT carefully.  
4. **Particles** — both ครับ/ค่ะ across the corpus.  
5. **Beginner breakdown** — every sentence; words/chunks meaningful to learners.  
6. **Intermediate+** — strip breakdown arrays.  
7. **Length targets**  
   - Beg: 6–10 sentences  
   - Elem: 10–14  
   - Int: 14–20  
   - Adv: 16–22  
8. **Deck size** — prefer 16–24 cards per theme unit; skill decks 16–20.  
9. **Examples on cards** — at least one Thai sentence + English + phonetic where helpful.  
10. **No invented “translationese”** — if English is natural, Thai should be what people say.

---

## 9. Phased delivery (after this map)

| Phase | Work | Depends on |
|-------|------|------------|
| **1** | This map + your feedback | — |
| **2** | Create missing JSON decks/stories (gaps) | Approved map |
| **3** | Rewrite existing stories & decks to standards | Map + any P0 gaps you want first |
| **4** | Thai/English QA pass + breakdown strip/add | Rewrites |
| **5** | Wire `units.json` + unit hub UX | Stable IDs |

Recommended order inside 2–4: **Beginner path complete → Elementary → Intermediate → Advanced**.

---

## 10. Open decisions for you (small)

1. **Elementary as its own learner level** vs merge Beginner+Elementary into one long Beginner path with two stages?  
   - Map assumes **four levels** (matches current UI chips).  
2. **farm-animals**: expand to pets/city animals, or replace with “at the park”?  
3. **Health unit**: one unit (clinic + exercise) or two?  
4. **Advanced baking / Alps / Paris**: OK to fully replace topics with Thai-local equivalents?

---

## 11. Approval checklist

Please mark:

- [ ] Theme-unit pairing model approved  
- [ ] Level split (Beg / Elem / Int / Adv) approved  
- [ ] Beginner unit list (~10) directionally right  
- [ ] Intermediate prioritizes I1 + Thai rewrites of I2  
- [ ] Advanced must leave Western settings  
- [ ] Gap list P0 decks are the right first creates  
- [ ] Skill side-units (tones, prepositions) placement OK  

Once approved, step **2** starts with P0 decks (colors, places, time, weather) and unit metadata sketch—or step **3** rewrites Beginner 1 greetings pair first if you prefer quality before quantity.

---

## Appendix A — Full story inventory (IDs)

### Beginner 1
`animals`, `colors`, `daily-activities`, `family`, `food`, `greetings`, `numbers`, `places`, `time`, `weather`

### Beginner 2
`big-family`, `busy-day`, `colors-everywhere`, `counting-fun`, `day-time`, `new-friend`, `pet-cat`, `picnic-food`, `visiting-places`, `weather-seasons`

### Intermediate 1
`a-day-at-school`, `at-the-market`, `at-the-restaurant`, `health-and-exercise`, `hobbies`, `meeting-new-friends`, `planning-a-party`, `shopping-for-clothes`, `traveling`, `work-and-jobs`

### Intermediate 2
`a-day-at-the-museum`, `a-language-exchange`, `a-new-hobby`, `a-weekend-getaway`, `the-book-club`, `the-charity-run`, `the-community-garden`, `the-cooking-class`, `the-job-interview`, `the-photography-project`

### Advanced 1
`a-family-reunion`, `a-new-city-a-new-life`, `a-volunteers-mission`, `a-winter-retreat`, `journey-to-the-mountains`, `the-antique-shop`, `the-art-of-baking`, `the-librarys-hidden-treasure`, `the-music-festival`, `the-street-artist`

## Appendix B — Full deck inventory (IDs)

`greetings`, `common-adjectives`, `numbers-counting`, `farm-animals`, `food-dining`, `activities`, `prepositions`, `tones-pronunciation-revised`, `shopping`, `thai-travel`, `thai-medical`, `thai-family`, `occupations`, `advanced-phrases`
