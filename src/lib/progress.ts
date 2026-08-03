/**
 * Local-only learner progress (no accounts).
 * Storage key: lingolotus.progress.v1
 */

export type Level = "beginner" | "elementary" | "intermediate" | "advanced";

export const LEVELS: Level[] = [
  "beginner",
  "elementary",
  "intermediate",
  "advanced",
];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type ActivityType = "deck" | "story" | "onboarding";

export interface LastActivity {
  type: ActivityType;
  id: string;
  stepIndex?: number;
  half?: "cards" | "reading";
  level?: Level;
  /** Curriculum unit context for pair CTAs / continue links */
  unitId?: string;
  updatedAt: string;
}

/** Per-card answer: true = correct, false = incorrect, null = unanswered */
export type CardResult = boolean | null;

/** In-progress or finished flashcard session for a deck */
export interface DeckSessionState {
  cardResults: CardResult[];
  currentIndex: number;
  total: number;
  updatedAt: string;
}

export interface DeckSessionStats {
  correct: number;
  incorrect: number;
  remaining: number;
  total: number;
  currentIndex: number;
  /** true when every card has been answered */
  complete: boolean;
}

export interface LearnerProgress {
  version: 1;
  level: Level;
  onboardingCompleted: boolean;
  lastActivity: LastActivity | null;
  completedDecks: string[];
  completedStories: string[];
  /** Live right/wrong state per deckId */
  deckSessions?: Record<string, DeckSessionState>;
  flags?: {
    introSampleDone?: boolean;
  };
}

export const PROGRESS_STORAGE_KEY = "lingolotus.progress.v1";

export function createDefaultProgress(): LearnerProgress {
  return {
    version: 1,
    level: "beginner",
    onboardingCompleted: false,
    lastActivity: null,
    completedDecks: [],
    completedStories: [],
    deckSessions: {},
    flags: {},
  };
}

export function summarizeDeckSession(
  session: DeckSessionState | undefined | null,
): DeckSessionStats | null {
  if (!session || !Array.isArray(session.cardResults) || session.total < 1) {
    return null;
  }
  const correct = session.cardResults.filter((r) => r === true).length;
  const incorrect = session.cardResults.filter((r) => r === false).length;
  const remaining = session.total - correct - incorrect;
  return {
    correct,
    incorrect,
    remaining: Math.max(0, remaining),
    total: session.total,
    currentIndex: session.currentIndex,
    complete: remaining <= 0,
  };
}

/**
 * Where to land when resuming a deck session:
 * 1) first incorrect card
 * 2) else first unanswered
 * 3) else 0
 */
export function resumeCardIndex(cardResults: CardResult[]): number {
  if (!cardResults.length) return 0;
  const firstWrong = cardResults.findIndex((r) => r === false);
  if (firstWrong >= 0) return firstWrong;
  const firstOpen = cardResults.findIndex((r) => r === null);
  if (firstOpen >= 0) return firstOpen;
  return 0;
}

function parseCardResults(raw: unknown, total: number): CardResult[] {
  if (!Array.isArray(raw)) {
    return new Array(total).fill(null);
  }
  const results: CardResult[] = [];
  for (let i = 0; i < total; i++) {
    const v = raw[i];
    if (v === true) results.push(true);
    else if (v === false) results.push(false);
    else results.push(null);
  }
  return results;
}

function parseDeckSessions(
  raw: unknown,
): Record<string, DeckSessionState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, DeckSessionState> = {};
  for (const [deckId, value] of Object.entries(
    raw as Record<string, unknown>,
  )) {
    if (!value || typeof value !== "object") continue;
    const s = value as Record<string, unknown>;
    const total =
      typeof s.total === "number" && s.total > 0
        ? Math.floor(s.total)
        : Array.isArray(s.cardResults)
          ? s.cardResults.length
          : 0;
    if (total < 1) continue;
    const currentIndex =
      typeof s.currentIndex === "number"
        ? Math.min(Math.max(0, Math.floor(s.currentIndex)), total - 1)
        : 0;
    out[deckId] = {
      cardResults: parseCardResults(s.cardResults, total),
      currentIndex,
      total,
      updatedAt:
        typeof s.updatedAt === "string"
          ? s.updatedAt
          : new Date().toISOString(),
    };
  }
  return out;
}

export function isLevel(value: unknown): value is Level {
  return (
    value === "beginner" ||
    value === "elementary" ||
    value === "intermediate" ||
    value === "advanced"
  );
}

export function normalizeLevel(raw: string | undefined | null): Level | null {
  if (!raw) return null;
  const n = raw.trim().toLowerCase();
  return isLevel(n) ? n : null;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

export function parseProgress(raw: unknown): LearnerProgress {
  const defaults = createDefaultProgress();
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Record<string, unknown>;
  const level = isLevel(obj.level) ? obj.level : defaults.level;

  let lastActivity: LastActivity | null = null;
  if (obj.lastActivity && typeof obj.lastActivity === "object") {
    const la = obj.lastActivity as Record<string, unknown>;
    if (
      (la.type === "deck" || la.type === "story" || la.type === "onboarding") &&
      typeof la.id === "string"
    ) {
      lastActivity = {
        type: la.type,
        id: la.id,
        stepIndex: typeof la.stepIndex === "number" ? la.stepIndex : undefined,
        half:
          la.half === "cards" || la.half === "reading" ? la.half : undefined,
        level: isLevel(la.level) ? la.level : undefined,
        unitId: typeof la.unitId === "string" ? la.unitId : undefined,
        updatedAt:
          typeof la.updatedAt === "string"
            ? la.updatedAt
            : new Date().toISOString(),
      };
    }
  }

  const completedDecks = Array.isArray(obj.completedDecks)
    ? uniqueIds(obj.completedDecks.filter((x): x is string => typeof x === "string"))
    : [];
  const completedStories = Array.isArray(obj.completedStories)
    ? uniqueIds(
        obj.completedStories.filter((x): x is string => typeof x === "string"),
      )
    : [];

  const flagsRaw =
    obj.flags && typeof obj.flags === "object"
      ? (obj.flags as Record<string, unknown>)
      : {};

  return {
    version: 1,
    level,
    onboardingCompleted: Boolean(obj.onboardingCompleted),
    lastActivity,
    completedDecks,
    completedStories,
    deckSessions: parseDeckSessions(obj.deckSessions),
    flags: {
      introSampleDone: Boolean(flagsRaw.introSampleDone),
    },
  };
}

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    return parseProgress(JSON.parse(raw));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: LearnerProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(progress),
    );
  } catch {
    // Quota / private mode — fail quietly
  }
}

export function updateProgress(
  updater: (prev: LearnerProgress) => LearnerProgress,
): LearnerProgress {
  const next = updater(loadProgress());
  saveProgress(next);
  return next;
}

export function setLevel(level: Level): LearnerProgress {
  return updateProgress((p) => ({ ...p, level }));
}

export function markOnboardingComplete(): LearnerProgress {
  return updateProgress((p) => ({
    ...p,
    onboardingCompleted: true,
    level: p.level || "beginner",
    flags: { ...p.flags, introSampleDone: true },
    lastActivity: {
      type: "onboarding",
      id: "complete",
      level: p.level || "beginner",
      updatedAt: new Date().toISOString(),
    },
  }));
}

export function skipOnboarding(level: Level = "beginner"): LearnerProgress {
  return updateProgress((p) => ({
    ...p,
    level,
    onboardingCompleted: true,
    lastActivity: null,
  }));
}

export function markDeckComplete(
  deckId: string,
  meta?: { stepIndex?: number; level?: Level; unitId?: string },
): LearnerProgress {
  return updateProgress((p) => ({
    ...p,
    completedDecks: uniqueIds([...p.completedDecks, deckId]),
    lastActivity: {
      type: "deck",
      id: deckId,
      stepIndex: meta?.stepIndex,
      half: "cards",
      level: meta?.level ?? p.level,
      unitId: meta?.unitId,
      updatedAt: new Date().toISOString(),
    },
  }));
}

export function markStoryComplete(
  storyId: string,
  meta?: { stepIndex?: number; level?: Level; unitId?: string },
): LearnerProgress {
  return updateProgress((p) => ({
    ...p,
    completedStories: uniqueIds([...p.completedStories, storyId]),
    lastActivity: {
      type: "story",
      id: storyId,
      stepIndex: meta?.stepIndex,
      half: "reading",
      level: meta?.level ?? p.level,
      unitId: meta?.unitId,
      updatedAt: new Date().toISOString(),
    },
  }));
}

export function setLastActivity(activity: LastActivity): LearnerProgress {
  return updateProgress((p) => ({
    ...p,
    lastActivity: activity,
  }));
}

export function isDeckCompleted(
  progress: LearnerProgress,
  deckId: string,
): boolean {
  return progress.completedDecks.includes(deckId);
}

export function isStoryCompleted(
  progress: LearnerProgress,
  storyId: string,
): boolean {
  return progress.completedStories.includes(storyId);
}

export function getDeckSession(
  progress: LearnerProgress,
  deckId: string,
): DeckSessionState | undefined {
  return progress.deckSessions?.[deckId];
}

export function saveDeckSession(
  deckId: string,
  session: Omit<DeckSessionState, "updatedAt"> & { updatedAt?: string },
  meta?: {
    stepIndex?: number;
    level?: Level;
    unitId?: string;
    touchLastActivity?: boolean;
  },
): LearnerProgress {
  const state: DeckSessionState = {
    cardResults: session.cardResults,
    currentIndex: session.currentIndex,
    total: session.total,
    updatedAt: session.updatedAt ?? new Date().toISOString(),
  };

  return updateProgress((p) => {
    const deckSessions = { ...(p.deckSessions ?? {}), [deckId]: state };
    const touch = meta?.touchLastActivity !== false;
    return {
      ...p,
      deckSessions,
      lastActivity: touch
        ? {
            type: "deck",
            id: deckId,
            stepIndex: meta?.stepIndex,
            half: "cards",
            level: meta?.level ?? p.level,
            unitId: meta?.unitId,
            updatedAt: state.updatedAt,
          }
        : p.lastActivity,
    };
  });
}

export function clearDeckSession(deckId: string): LearnerProgress {
  return updateProgress((p) => {
    const deckSessions = { ...(p.deckSessions ?? {}) };
    delete deckSessions[deckId];
    const completedDecks = p.completedDecks.filter((id) => id !== deckId);
    let lastActivity = p.lastActivity;
    if (lastActivity?.type === "deck" && lastActivity.id === deckId) {
      lastActivity = null;
    }
    return { ...p, deckSessions, completedDecks, lastActivity };
  });
}

/**
 * Full reset: onboarding, completions, deck sessions, last activity.
 * Keeps nothing — returns to first-run Learn.
 */
export function resetAllProgress(): LearnerProgress {
  const next = createDefaultProgress();
  saveProgress(next);
  return next;
}
