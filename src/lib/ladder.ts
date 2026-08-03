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
}

export interface LevelLadder {
  level: Level;
  steps: LadderStep[];
}

export interface LadderCatalog {
  levels: LevelLadder[];
  /** Quick lookup: deckId → step metadata */
  deckIndex: Record<
    string,
    { level: Level; stepIndex: number; pairedStory?: LadderStoryRef }
  >;
  storyIndex: Record<
    string,
    { level: Level; stepIndex: number; pairedDeck?: LadderDeckRef }
  >;
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

export function buildLadderCatalog(input: {
  collections: RawCollection[];
  decks: RawDeck[];
  books: RawBook[];
  stories: RawStory[];
}): LadderCatalog {
  const collectionDifficulty = new Map(
    input.collections.map((c) => [
      c.collectionId,
      normalizeLevel(c.difficulty ?? null),
    ]),
  );

  const levels: LevelLadder[] = [];
  const deckIndex: LadderCatalog["deckIndex"] = {};
  const storyIndex: LadderCatalog["storyIndex"] = {};

  for (const level of Object.keys(LEVEL_CONFIG) as Level[]) {
    const config = LEVEL_CONFIG[level];
    const collectionSet = new Set(config.collectionIds);

    const decks = sortDecks(
      input.decks
        .filter((d) => {
          if (collectionSet.has(d.collectionId)) return true;
          // Fallback: collection difficulty match
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
          sentenceCount: Array.isArray(s.sentences) ? s.sentences.length : undefined,
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

      if (deck) {
        deckIndex[deck.deckId] = {
          level,
          stepIndex: i,
          pairedStory: story,
        };
      }
      if (story) {
        storyIndex[story.storyId] = {
          level,
          stepIndex: i,
          pairedDeck: deck,
        };
      }
    }

    levels.push({ level, steps });
  }

  return { levels, deckIndex, storyIndex };
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
  } | null,
): { type: "deck" | "story"; href: string; label: string } | null {
  if (!lastActivity) return null;
  if (lastActivity.level && lastActivity.level !== level) return null;
  if (lastActivity.type === "onboarding") return null;

  if (lastActivity.type === "deck") {
    // Prefer ladder meta on current level; still resume study if deck is known anywhere
    let deck: LadderDeckRef | undefined;
    const meta = catalog.deckIndex[lastActivity.id];
    if (meta && meta.level === level) {
      deck = getLevelLadder(catalog, level).steps[meta.stepIndex]?.deck;
    }
    if (!deck && meta) {
      deck = getLevelLadder(catalog, meta.level).steps[meta.stepIndex]?.deck;
    }
    // Scan all levels as last resort
    if (!deck) {
      for (const ladder of catalog.levels) {
        const found = ladder.steps.find((s) => s.deck?.deckId === lastActivity.id)
          ?.deck;
        if (found) {
          deck = found;
          break;
        }
      }
    }
    if (!deck) return null;
    // Always deep-link into study (cards), never deck details
    return {
      type: "deck",
      href: getStudyPath(deck.collectionId, deck.deckId),
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
      href: getStoryPath(step.story.bookId, step.story.storyId),
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
    return getStudyPath(step.deck.collectionId, step.deck.deckId);
  }
  if (half === "reading" && step.story) {
    return getStoryPath(step.story.bookId, step.story.storyId);
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
