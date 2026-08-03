/**
 * Learning ladder: zip decks + stories by level.
 * Pure helpers — safe for SSG and client.
 */

import type { Level } from "./progress";
import { normalizeLevel } from "./progress";
import {
  getDeckPath,
  getStudyPath,
  getStoryPath,
  getUnitPath,
  withUnitQuery,
} from "./utils";

export interface LadderDeckRef {
  deckId: string;
  collectionId: string;
  name: string;
  description?: string;
}

export interface LadderStoryRef {
  storyId: string;
  bookId: string;
  title: string;
  sentenceCount?: number;
}

export interface LadderStep {
  index: number;
  level: Level;
  deck?: LadderDeckRef;
  story?: LadderStoryRef;
  /** Curriculum unit metadata (when units.json drives the path) */
  unitId?: string;
  unitTitle?: string;
  unitType?: "theme" | "skill";
}

export interface LevelLadder {
  level: Level;
  steps: LadderStep[];
}

/** Per-unit pairing (authoritative when `?unit=` is present) */
export interface UnitPairInfo {
  unitId: string;
  level: Level;
  stepIndex: number;
  unitTitle?: string;
  unitType?: "theme" | "skill";
  deck?: LadderDeckRef;
  story?: LadderStoryRef;
}

export interface LadderCatalog {
  levels: LevelLadder[];
  /** Quick lookup: deckId → step metadata (first unit wins) */
  deckIndex: Record<
    string,
    { level: Level; stepIndex: number; pairedStory?: LadderStoryRef; unitId?: string }
  >;
  storyIndex: Record<
    string,
    { level: Level; stepIndex: number; pairedDeck?: LadderDeckRef; unitId?: string }
  >;
  /** unitId → full pair info */
  unitIndex: Record<string, UnitPairInfo>;
}

/** Onboarding content anchors (v1) */
export const ONBOARDING = {
  deckId: "greetings",
  collectionId: "thai-english-beginner",
  storyId: "thai-beginner-1-greetings",
  bookId: "thai-beginner-1",
  cardLimit: 6,
} as const;

interface LevelConfig {
  collectionIds: string[];
  bookIds: string[];
  /** When true, only zip as many stories as decks (elementary soft-link) */
  capStoriesToDeckCount?: boolean;
  /** Force these deckIds first (if present) */
  priorityDeckIds?: string[];
}

const LEVEL_CONFIG: Record<Level, LevelConfig> = {
  beginner: {
    collectionIds: ["thai-english-beginner"],
    bookIds: ["thai-beginner-1", "thai-beginner-2"],
    priorityDeckIds: ["greetings"],
  },
  elementary: {
    collectionIds: ["thai-english-elementary"],
    // Soft-link pool; capped to deck count
    bookIds: ["thai-beginner-2", "thai-intermediate-1"],
    capStoriesToDeckCount: true,
  },
  intermediate: {
    collectionIds: ["thai-english-intermediate"],
    bookIds: ["thai-intermediate-1", "thai-intermediate-2"],
  },
  advanced: {
    collectionIds: ["thai-english-advanced"],
    bookIds: ["thai-advanced-1"],
  },
};

export interface RawCollection {
  collectionId: string;
  difficulty?: string;
}

export interface RawDeck {
  deckId: string;
  collectionId: string;
  name: string;
  description?: string;
  difficulty?: string;
}

export interface RawBook {
  bookId: string;
  difficulty?: string;
}

export interface RawStory {
  storyId: string;
  bookId: string;
  title: { source: string; target: string };
  sentences?: unknown[];
}

export interface CurriculumUnitRaw {
  unitId: string;
  level: string;
  order: number;
  type: "theme" | "skill";
  title: { en: string; th?: string };
  deckId?: string;
  storyId?: string;
  bookId?: string;
}

function sortDecks(
  decks: LadderDeckRef[],
  priorityDeckIds: string[] = [],
): LadderDeckRef[] {
  const priority = new Map(priorityDeckIds.map((id, i) => [id, i]));
  return [...decks].sort((a, b) => {
    const pa = priority.has(a.deckId)
      ? (priority.get(a.deckId) as number)
      : 1000;
    const pb = priority.has(b.deckId)
      ? (priority.get(b.deckId) as number)
      : 1000;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name) || a.deckId.localeCompare(b.deckId);
  });
}

function sortStories(
  stories: LadderStoryRef[],
  bookOrder: string[],
): LadderStoryRef[] {
  const bookRank = new Map(bookOrder.map((id, i) => [id, i]));
  return [...stories].sort((a, b) => {
    const ra = bookRank.get(a.bookId) ?? 1000;
    const rb = bookRank.get(b.bookId) ?? 1000;
    if (ra !== rb) return ra - rb;
    return a.storyId.localeCompare(b.storyId);
  });
}

function indexStep(
  deckIndex: LadderCatalog["deckIndex"],
  storyIndex: LadderCatalog["storyIndex"],
  unitIndex: LadderCatalog["unitIndex"],
  step: LadderStep,
  /** first-wins so multi-unit decks keep their earliest pair */
  firstWins = true,
): void {
  if (step.unitId) {
    unitIndex[step.unitId] = {
      unitId: step.unitId,
      level: step.level,
      stepIndex: step.index,
      unitTitle: step.unitTitle,
      unitType: step.unitType,
      deck: step.deck,
      story: step.story,
    };
  }
  if (step.deck) {
    if (!firstWins || !deckIndex[step.deck.deckId]) {
      deckIndex[step.deck.deckId] = {
        level: step.level,
        stepIndex: step.index,
        pairedStory: step.story,
        unitId: step.unitId,
      };
    }
  }
  if (step.story) {
    if (!firstWins || !storyIndex[step.story.storyId]) {
      storyIndex[step.story.storyId] = {
        level: step.level,
        stepIndex: step.index,
        pairedDeck: step.deck,
        unitId: step.unitId,
      };
    }
  }
}

/**
 * Preferred path: explicit curriculum units (thematic deck+story pairs).
 * Falls back to legacy zip-by-level if units are empty/missing.
 */
export function buildLadderCatalog(input: {
  collections: RawCollection[];
  decks: RawDeck[];
  books: RawBook[];
  stories: RawStory[];
  units?: CurriculumUnitRaw[];
}): LadderCatalog {
  const deckById = new Map(
    input.decks.map((d) => [
      d.deckId,
      {
        deckId: d.deckId,
        collectionId: d.collectionId,
        name: d.name,
        description: d.description,
      } satisfies LadderDeckRef,
    ]),
  );
  const storyById = new Map(
    input.stories.map((s) => [
      s.storyId,
      {
        storyId: s.storyId,
        bookId: s.bookId,
        title: s.title.target || s.title.source,
        sentenceCount: Array.isArray(s.sentences)
          ? s.sentences.length
          : undefined,
      } satisfies LadderStoryRef,
    ]),
  );

  const units = (input.units ?? [])
    .map((u) => ({
      ...u,
      level: normalizeLevel(u.level) as Level | null,
    }))
    .filter((u): u is CurriculumUnitRaw & { level: Level } => u.level != null)
    .sort((a, b) => a.order - b.order || a.unitId.localeCompare(b.unitId));

  if (units.length > 0) {
    const levels: LevelLadder[] = [];
    const deckIndex: LadderCatalog["deckIndex"] = {};
    const storyIndex: LadderCatalog["storyIndex"] = {};
    const unitIndex: LadderCatalog["unitIndex"] = {};

    for (const level of Object.keys(LEVEL_CONFIG) as Level[]) {
      const levelUnits = units.filter((u) => u.level === level);
      const steps: LadderStep[] = levelUnits.map((u, i) => {
        const deck = u.deckId ? deckById.get(u.deckId) : undefined;
        const story = u.storyId ? storyById.get(u.storyId) : undefined;
        if (u.deckId && !deck) {
          console.warn(
            `[curriculum] unit ${u.unitId}: missing deck "${u.deckId}"`,
          );
        }
        if (u.storyId && !story) {
          console.warn(
            `[curriculum] unit ${u.unitId}: missing story "${u.storyId}"`,
          );
        }
        return {
          index: i,
          level,
          deck,
          story,
          unitId: u.unitId,
          unitTitle: u.title.en,
          unitType: u.type,
        } satisfies LadderStep;
      });

      for (const step of steps) {
        indexStep(deckIndex, storyIndex, unitIndex, step, true);
      }
      levels.push({ level, steps });
    }

    return { levels, deckIndex, storyIndex, unitIndex };
  }

  // ---- Legacy zip fallback ----
  const collectionDifficulty = new Map(
    input.collections.map((c) => [
      c.collectionId,
      normalizeLevel(c.difficulty ?? null),
    ]),
  );

  const levels: LevelLadder[] = [];
  const deckIndex: LadderCatalog["deckIndex"] = {};
  const storyIndex: LadderCatalog["storyIndex"] = {};
  const unitIndex: LadderCatalog["unitIndex"] = {};

  for (const level of Object.keys(LEVEL_CONFIG) as Level[]) {
    const config = LEVEL_CONFIG[level];
    const collectionSet = new Set(config.collectionIds);

    const decks = sortDecks(
      input.decks
        .filter((d) => {
          if (collectionSet.has(d.collectionId)) return true;
          return collectionDifficulty.get(d.collectionId) === level;
        })
        .map((d) => ({
          deckId: d.deckId,
          collectionId: d.collectionId,
          name: d.name,
          description: d.description,
        })),
      config.priorityDeckIds,
    );

    const bookSet = new Set(config.bookIds);
    let stories = sortStories(
      input.stories
        .filter((s) => bookSet.has(s.bookId))
        .map((s) => ({
          storyId: s.storyId,
          bookId: s.bookId,
          title: s.title.target || s.title.source,
          sentenceCount: Array.isArray(s.sentences)
            ? s.sentences.length
            : undefined,
        })),
      config.bookIds,
    );

    if (config.capStoriesToDeckCount) {
      stories = stories.slice(0, decks.length);
    }

    const stepCount = Math.max(decks.length, stories.length);
    const steps: LadderStep[] = [];

    for (let i = 0; i < stepCount; i++) {
      const deck = decks[i];
      const story = stories[i];
      const step: LadderStep = {
        index: i,
        level,
        deck,
        story,
      };
      steps.push(step);
      indexStep(deckIndex, storyIndex, unitIndex, step, false);
    }

    levels.push({ level, steps });
  }

  return { levels, deckIndex, storyIndex, unitIndex };
}

export function getLevelLadder(
  catalog: LadderCatalog,
  level: Level,
): LevelLadder {
  return (
    catalog.levels.find((l) => l.level === level) ?? {
      level,
      steps: [],
    }
  );
}

export type StepHalfStatus = "not_started" | "done";

export interface StepProgressView {
  step: LadderStep;
  cardsDone: boolean;
  readingDone: boolean;
  /** ○ not started · ◐ partial · ● complete */
  mark: "empty" | "partial" | "complete";
  nextHalf: "cards" | "reading" | null;
}

export function getStepProgress(
  step: LadderStep,
  completedDecks: Set<string> | string[],
  completedStories: Set<string> | string[],
): StepProgressView {
  const decks = completedDecks instanceof Set
    ? completedDecks
    : new Set(completedDecks);
  const stories = completedStories instanceof Set
    ? completedStories
    : new Set(completedStories);

  const cardsDone = step.deck ? decks.has(step.deck.deckId) : true;
  const readingDone = step.story ? stories.has(step.story.storyId) : true;

  let mark: StepProgressView["mark"] = "empty";
  if (cardsDone && readingDone) mark = "complete";
  else if (cardsDone || readingDone) mark = "partial";

  let nextHalf: StepProgressView["nextHalf"] = null;
  if (step.deck && !cardsDone) nextHalf = "cards";
  else if (step.story && !readingDone) nextHalf = "reading";

  return { step, cardsDone, readingDone, mark, nextHalf };
}

export function findNextIncompleteStep(
  ladder: LevelLadder,
  completedDecks: string[],
  completedStories: string[],
): StepProgressView | null {
  for (const step of ladder.steps) {
    const view = getStepProgress(step, completedDecks, completedStories);
    if (view.mark !== "complete") return view;
  }
  return null;
}

export function findContinueTarget(
  catalog: LadderCatalog,
  level: Level,
  lastActivity: {
    type: string;
    id: string;
    level?: Level;
    half?: string;
    unitId?: string;
  } | null,
): { type: "deck" | "story"; href: string; label: string } | null {
  if (!lastActivity) return null;
  if (lastActivity.level && lastActivity.level !== level) return null;
  if (lastActivity.type === "onboarding") return null;

  // Prefer unit hub when we still have unit context
  if (lastActivity.unitId && catalog.unitIndex[lastActivity.unitId]) {
    const u = catalog.unitIndex[lastActivity.unitId];
    if (u.level === level) {
      if (lastActivity.type === "deck" && u.deck) {
        return {
          type: "deck",
          href: withUnitQuery(
            getStudyPath(u.deck.collectionId, u.deck.deckId),
            u.unitId,
          ),
          label: u.deck.name,
        };
      }
      if (lastActivity.type === "story" && u.story) {
        return {
          type: "story",
          href: withUnitQuery(
            getStoryPath(u.story.bookId, u.story.storyId),
            u.unitId,
          ),
          label: u.story.title,
        };
      }
    }
  }

  if (lastActivity.type === "deck") {
    // Prefer ladder meta on current level; still resume study if deck is known anywhere
    let deck: LadderDeckRef | undefined;
    let unitId: string | undefined = lastActivity.unitId;
    const meta = catalog.deckIndex[lastActivity.id];
    if (meta && meta.level === level) {
      deck = getLevelLadder(catalog, level).steps[meta.stepIndex]?.deck;
      unitId = unitId || meta.unitId;
    }
    if (!deck && meta) {
      deck = getLevelLadder(catalog, meta.level).steps[meta.stepIndex]?.deck;
      unitId = unitId || meta.unitId;
    }
    // Scan all levels as last resort
    if (!deck) {
      for (const ladder of catalog.levels) {
        const found = ladder.steps.find((s) => s.deck?.deckId === lastActivity.id);
        if (found?.deck) {
          deck = found.deck;
          unitId = unitId || found.unitId;
          break;
        }
      }
    }
    if (!deck) return null;
    return {
      type: "deck",
      href: withUnitQuery(
        getStudyPath(deck.collectionId, deck.deckId),
        unitId,
      ),
      label: deck.name,
    };
  }

  if (lastActivity.type === "story") {
    const meta = catalog.storyIndex[lastActivity.id];
    if (!meta || meta.level !== level) return null;
    const ladder = getLevelLadder(catalog, level);
    const step = ladder.steps[meta.stepIndex];
    if (!step?.story) return null;
    return {
      type: "story",
      href: withUnitQuery(
        getStoryPath(step.story.bookId, step.story.storyId),
        lastActivity.unitId || meta.unitId || step.unitId,
      ),
      label: step.story.title,
    };
  }

  return null;
}

export function hrefForHalf(
  step: LadderStep,
  half: "cards" | "reading",
): string | null {
  if (half === "cards" && step.deck) {
    return withUnitQuery(
      getStudyPath(step.deck.collectionId, step.deck.deckId),
      step.unitId,
    );
  }
  if (half === "reading" && step.story) {
    return withUnitQuery(
      getStoryPath(step.story.bookId, step.story.storyId),
      step.unitId,
    );
  }
  return null;
}

/** Prefer unit hub when the step is part of the curriculum catalog */
export function hrefForStep(step: LadderStep): string | null {
  if (step.unitId) return getUnitPath(step.unitId);
  if (step.deck) {
    return withUnitQuery(
      getStudyPath(step.deck.collectionId, step.deck.deckId),
      step.unitId,
    );
  }
  if (step.story) {
    return withUnitQuery(
      getStoryPath(step.story.bookId, step.story.storyId),
      step.unitId,
    );
  }
  return null;
}

/** Resolve pair info preferring explicit unitId over first-wins deck/story index */
export function resolveUnitPair(
  catalog: LadderCatalog,
  opts: {
    unitId?: string | null;
    deckId?: string | null;
    storyId?: string | null;
  },
): UnitPairInfo | null {
  if (opts.unitId && catalog.unitIndex[opts.unitId]) {
    return catalog.unitIndex[opts.unitId];
  }
  if (opts.deckId && catalog.deckIndex[opts.deckId]) {
    const meta = catalog.deckIndex[opts.deckId];
    if (meta.unitId && catalog.unitIndex[meta.unitId]) {
      return catalog.unitIndex[meta.unitId];
    }
    return {
      unitId: meta.unitId || "",
      level: meta.level,
      stepIndex: meta.stepIndex,
      story: meta.pairedStory,
      deck: opts.deckId
        ? {
            deckId: opts.deckId,
            collectionId: "",
            name: "",
          }
        : undefined,
    };
  }
  if (opts.storyId && catalog.storyIndex[opts.storyId]) {
    const meta = catalog.storyIndex[opts.storyId];
    if (meta.unitId && catalog.unitIndex[meta.unitId]) {
      return catalog.unitIndex[meta.unitId];
    }
  }
  return null;
}

export function deckStudyHref(deck: LadderDeckRef): string {
  return getStudyPath(deck.collectionId, deck.deckId);
}

export function deckDetailHref(deck: LadderDeckRef): string {
  return getDeckPath(deck.collectionId, deck.deckId);
}

export function storyHref(story: LadderStoryRef): string {
  return getStoryPath(story.bookId, story.storyId);
}
