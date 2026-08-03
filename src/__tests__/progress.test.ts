import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  createDefaultProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  loadProgress,
  markDeckComplete,
  markOnboardingComplete,
  setLevel,
} from "../lib/progress";

describe("parseProgress", () => {
  it("returns defaults for garbage", () => {
    expect(parseProgress(null).level).toBe("beginner");
    expect(parseProgress({}).onboardingCompleted).toBe(false);
  });

  it("keeps valid fields", () => {
    const p = parseProgress({
      version: 1,
      level: "intermediate",
      onboardingCompleted: true,
      completedDecks: ["greetings", "greetings"],
      completedStories: ["s1"],
      lastActivity: {
        type: "deck",
        id: "greetings",
        updatedAt: "2020-01-01T00:00:00.000Z",
      },
    });
    expect(p.level).toBe("intermediate");
    expect(p.completedDecks).toEqual(["greetings"]);
    expect(p.lastActivity?.id).toBe("greetings");
  });
});

describe("localStorage progress", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads defaults when empty", () => {
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it("persists deck completion and level", () => {
    setLevel("elementary");
    markDeckComplete("farm-animals", { level: "elementary", stepIndex: 0 });
    const p = loadProgress();
    expect(p.level).toBe("elementary");
    expect(p.completedDecks).toContain("farm-animals");
    expect(p.lastActivity?.type).toBe("deck");
    expect(store.has(PROGRESS_STORAGE_KEY)).toBe(true);
  });

  it("marks onboarding complete", () => {
    markOnboardingComplete();
    const p = loadProgress();
    expect(p.onboardingCompleted).toBe(true);
    expect(p.flags?.introSampleDone).toBe(true);
  });

  it("saves and summarizes deck session scores", async () => {
    const { saveDeckSession, summarizeDeckSession, resetAllProgress } =
      await import("../lib/progress");
    saveDeckSession("greetings", {
      cardResults: [true, true, false, null, null],
      currentIndex: 3,
      total: 5,
    });
    const p = loadProgress();
    const stats = summarizeDeckSession(p.deckSessions?.greetings);
    expect(stats).toEqual({
      correct: 2,
      incorrect: 1,
      remaining: 2,
      total: 5,
      currentIndex: 3,
      complete: false,
    });
    resetAllProgress();
    expect(loadProgress().deckSessions).toEqual({});
  });
});

describe("resumeCardIndex", () => {
  it("prefers first incorrect, then first unanswered", async () => {
    const { resumeCardIndex } = await import("../lib/progress");
    expect(resumeCardIndex([true, false, false, null])).toBe(1);
    expect(resumeCardIndex([true, true, null, false])).toBe(3);
    expect(resumeCardIndex([true, true, null, null])).toBe(2);
    expect(resumeCardIndex([true, true, true])).toBe(0);
    expect(resumeCardIndex([])).toBe(0);
  });
});

