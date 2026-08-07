import { useCallback, useEffect, useMemo, useState } from "react";
import type { LadderCatalog, LadderStep, StepProgressView } from "@/lib/ladder";
import {
  findContinueTarget,
  findNextIncompleteStep,
  getLevelLadder,
  getStepProgress,
  hrefForHalf,
  hrefForStep,
} from "@/lib/ladder";
import {
  LEVEL_LABELS,
  LEVELS,
  loadProgress,
  resetAllProgress,
  setLevel,
  skipOnboarding,
  summarizeDeckSession,
  type DeckSessionStats,
  type LearnerProgress,
  type Level,
} from "@/lib/progress";
import {
  DIR_ICONS,
  LEVEL_ICONS,
  emojiForLevel,
  emojiForUnit,
} from "@/lib/content-icons";
import {
  getBrowsePath,
  getFlashCardsPath,
  getOnboardingPath,
  getReadingPath,
  getUnitPath,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Clickable story sample for the home gallery (from index.astro) */
export interface StoryTeaser {
  unitId: string;
  storyId: string;
  bookId: string;
  level: Level;
  titleEn: string;
  titleTh?: string;
  blurb: string;
  imageUrl: string;
  href: string;
  unitHref: string;
}

interface LearnHomeProps {
  catalog: LadderCatalog;
  storyTeasers?: StoryTeaser[];
}

const LEVEL_BAND: Record<
  Level,
  { ring: string; bg: string; soft: string; text: string; line: string }
> = {
  beginner: {
    ring: "ring-emerald-200",
    bg: "bg-emerald-600",
    soft: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-900",
    line: "from-emerald-300 to-emerald-100",
  },
  elementary: {
    ring: "ring-sky-200",
    bg: "bg-sky-600",
    soft: "bg-sky-50 border-sky-200",
    text: "text-sky-900",
    line: "from-sky-300 to-sky-100",
  },
  intermediate: {
    ring: "ring-amber-200",
    bg: "bg-amber-600",
    soft: "bg-amber-50 border-amber-200",
    text: "text-amber-950",
    line: "from-amber-300 to-amber-100",
  },
  advanced: {
    ring: "ring-violet-200",
    bg: "bg-violet-600",
    soft: "bg-violet-50 border-violet-200",
    text: "text-violet-900",
    line: "from-violet-300 to-violet-100",
  },
};

function MarkIcon({ mark }: { mark: StepProgressView["mark"] }) {
  if (mark === "complete") {
    return (
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[11px] text-white"
        aria-label="Complete"
      >
        ✓
      </span>
    );
  }
  if (mark === "partial") {
    return (
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-600 text-xs text-teal-700"
        aria-label="In progress"
      >
        ◐
      </span>
    );
  }
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 text-xs text-slate-400"
      aria-label="Not started"
    >
      ○
    </span>
  );
}

function unitHref(step: LadderStep, view: StepProgressView): string {
  if (step.unitId) return getUnitPath(step.unitId);
  return (
    hrefForStep(step) ??
    (view.nextHalf != null
      ? hrefForHalf(step, view.nextHalf)
      : step.deck
        ? hrefForHalf(step, "cards")
        : step.story
          ? hrefForHalf(step, "reading")
          : null) ??
    "#"
  );
}

/** Decorative floaters — pure presentation */
function HeroDecor({ variant = "welcome" }: { variant?: "start" | "welcome" }) {
  const floats =
    variant === "start"
      ? [
          { e: "👋", c: "left-[6%] top-[18%] text-2xl opacity-90" },
          { e: "🍜", c: "right-[10%] top-[14%] text-xl opacity-80" },
          { e: "🎨", c: "left-[12%] bottom-[20%] text-xl opacity-75" },
          { e: "✈️", c: "right-[8%] bottom-[22%] text-2xl opacity-85" },
          { e: "🐱", c: "left-[40%] top-[8%] text-lg opacity-70" },
          { e: "🛕", c: "right-[28%] bottom-[12%] text-lg opacity-70" },
        ]
      : [
          { e: "🃏", c: "left-[8%] top-[20%] text-xl opacity-80" },
          { e: "📖", c: "right-[12%] top-[16%] text-2xl opacity-85" },
          { e: "🎵", c: "left-[18%] bottom-[18%] text-lg opacity-70" },
          { e: "🗺️", c: "right-[16%] bottom-[20%] text-xl opacity-75" },
        ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* soft blobs */}
      <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-teal-300/40 blur-3xl" />
      <div className="absolute -right-12 top-8 h-48 w-48 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
      {/* Thai script watermark */}
      <p className="absolute right-3 top-3 select-none font-thai text-5xl font-bold leading-none text-teal-900/[0.07] sm:right-6 sm:top-5 sm:text-7xl">
        สวัสดี
      </p>
      <p className="absolute bottom-2 left-4 select-none font-thai text-4xl font-bold leading-none text-amber-900/[0.06] sm:text-5xl">
        เรียนไทย
      </p>
      {/* floating topic icons */}
      {floats.map((f) => (
        <span
          key={f.e + f.c}
          className={cn("absolute hidden animate-pulse sm:block", f.c)}
          style={{ animationDuration: "3.5s" }}
        >
          {f.e}
        </span>
      ))}
      {/* dotted path hint */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-16 w-full text-teal-600/15"
        viewBox="0 0 400 40"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 28 C 60 8, 100 32, 160 18 S 280 4, 340 22 S 380 30, 400 16"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TrustPills() {
  return (
    <ul className="flex flex-wrap gap-2">
      {[
        { e: "🆓", t: "Free forever" },
        { e: "📵", t: "No account" },
        { e: "💾", t: "Saved on this device" },
      ].map((p) => (
        <li
          key={p.t}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm"
        >
          <span aria-hidden="true">{p.e}</span>
          {p.t}
        </li>
      ))}
    </ul>
  );
}

function HowItWorksStrip() {
  const steps = [
    {
      e: "🃏",
      title: "Cards",
      blurb: "Flip words & phrases",
      tone: "from-cyan-50 to-teal-100 border-cyan-200 hover:border-cyan-400 hover:shadow-md",
      href: getFlashCardsPath(),
    },
    {
      e: "📖",
      title: "Stories",
      blurb: "Same theme in Thai",
      tone: "from-amber-50 to-orange-100 border-amber-200 hover:border-amber-400 hover:shadow-md",
      href: getReadingPath(),
    },
    {
      e: "🗺️",
      title: "Path",
      blurb: "Clear next step",
      tone: "from-violet-50 to-fuchsia-100 border-violet-200 hover:border-violet-400 hover:shadow-md",
      href: getOnboardingPath(),
    },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3">
      {steps.map((s) => (
        <li key={s.title}>
          <a
            href={s.href}
            className={cn(
              "block rounded-2xl border bg-gradient-to-br px-2 py-3 text-center shadow-sm transition sm:px-3 sm:py-4",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
              s.tone,
            )}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden="true">
              {s.e}
            </span>
            <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">
              {s.title}
            </p>
            <p className="mt-0.5 hidden text-[11px] leading-snug text-slate-600 sm:block">
              {s.blurb}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

const LEVEL_BADGE: Record<Level, string> = {
  beginner: "bg-emerald-600",
  elementary: "bg-sky-600",
  intermediate: "bg-amber-600",
  advanced: "bg-violet-600",
};

/**
 * One random story card per level (equal height, one image each).
 */
function StoryShowcase({
  teasers,
  variant = "new",
}: {
  teasers: StoryTeaser[];
  variant?: "new" | "return";
}) {
  // Stable pick for this page view (don’t reshuffle on every re-render)
  const picks = useMemo(() => {
    if (teasers.length === 0) return [] as StoryTeaser[];
    const levelOrder: Level[] =
      variant === "new"
        ? (["beginner", "elementary"] as Level[])
        : LEVELS;
    return levelOrder
      .map((level) => {
        const pool = teasers.filter((t) => t.level === level);
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)]!;
      })
      .filter((t): t is StoryTeaser => t != null);
  }, [teasers, variant]);

  if (picks.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="story-showcase-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="story-showcase-heading"
            className="text-lg font-extrabold tracking-tight text-slate-900"
          >
            <span aria-hidden="true" className="mr-1.5">
              📖
            </span>
            {variant === "new" ? "Peek at the stories" : "Stories you can open"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            {variant === "new"
              ? "A sample from each level — jump in anytime. The guided path is still here when you’re ready."
              : "One sample per level (rotates). Stay on your path below, or open any story."}
          </p>
        </div>
        <a
          href={getReadingPath()}
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          All stories →
        </a>
      </div>

      <ul
        className={cn(
          "grid gap-3",
          picks.length === 1 && "grid-cols-1 sm:max-w-sm",
          picks.length === 2 && "grid-cols-2",
          picks.length === 3 && "grid-cols-2 sm:grid-cols-3",
          picks.length >= 4 && "grid-cols-2 lg:grid-cols-4",
        )}
      >
        {picks.map((t) => (
          <li key={t.level}>
            <a
              href={t.href}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition",
                "hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={t.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span
                  className={cn(
                    "absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
                    LEVEL_BADGE[t.level],
                  )}
                >
                  {LEVEL_LABELS[t.level]}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
                <p className="font-thai text-sm font-semibold leading-snug text-slate-800 line-clamp-1">
                  {t.titleTh || t.titleEn}
                </p>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {t.titleEn}
                </p>
                {t.blurb ? (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                    {t.blurb}
                  </p>
                ) : null}
                <span className="mt-auto pt-2 text-[11px] font-semibold text-teal-700 group-hover:text-teal-900">
                  Read story →
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LearnHome({
  catalog,
  storyTeasers = [],
}: LearnHomeProps) {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  /** Filter path bands; default shows every level */
  const [focusLevel, setFocusLevel] = useState<Level | "all">("all");

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const refresh = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const handleLevelChange = useCallback((level: Level) => {
    setProgress(setLevel(level));
    // Keep full map visible; level only drives Continue / Next
  }, []);

  const handleSkipIntro = useCallback((level: Level) => {
    setProgress(skipOnboarding(level));
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress(resetAllProgress());
    setConfirmReset(false);
  }, []);

  const ladder = useMemo(() => {
    if (!progress) return null;
    return getLevelLadder(catalog, progress.level);
  }, [catalog, progress]);

  const stepViews = useMemo(() => {
    if (!progress || !ladder) return [];
    return ladder.steps.map((step) =>
      getStepProgress(step, progress.completedDecks, progress.completedStories),
    );
  }, [ladder, progress]);

  const nextStep = useMemo(() => {
    if (!progress || !ladder) return null;
    return findNextIncompleteStep(
      ladder,
      progress.completedDecks,
      progress.completedStories,
    );
  }, [ladder, progress]);

  const continueTarget = useMemo(() => {
    if (!progress) return null;
    return findContinueTarget(catalog, progress.level, progress.lastActivity);
  }, [catalog, progress]);

  const continueDeckStats: DeckSessionStats | null = useMemo(() => {
    if (!progress || !continueTarget || continueTarget.type !== "deck") {
      return null;
    }
    const deckId =
      progress.lastActivity?.type === "deck" ? progress.lastActivity.id : null;
    if (!deckId) return null;
    return summarizeDeckSession(progress.deckSessions?.[deckId] ?? null);
  }, [progress, continueTarget]);

  /** Full path: every level → every unit with progress */
  const fullPath = useMemo(() => {
    if (!progress) return [];
    return LEVELS.map((level) => {
      const levelLadder = getLevelLadder(catalog, level);
      const views = levelLadder.steps.map((step) =>
        getStepProgress(step, progress.completedDecks, progress.completedStories),
      );
      const done = views.filter((v) => v.mark === "complete").length;
      return { level, views, done, total: views.length };
    });
  }, [catalog, progress]);

  const totalUnits = fullPath.reduce((n, b) => n + b.total, 0);
  const totalDone = fullPath.reduce((n, b) => n + b.done, 0);

  // Hydration placeholder
  if (!progress) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  const isFirstRun = !progress.onboardingCompleted;
  const activeFocus = focusLevel;
  const levelComplete = nextStep === null && stepViews.length > 0;

  if (isFirstRun) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-2 sm:py-4">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-amber-50 px-5 py-8 shadow-lg sm:px-8 sm:py-10">
          <HeroDecor variant="start" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur-sm">
              <span className="text-lg" aria-hidden="true">
                🪷
              </span>
              Lingo Lotus
              <span className="font-thai font-normal text-teal-600/80">· ภาษาไทย</span>
            </div>
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
                Learn Thai that{" "}
                <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  feels real
                </span>
                — one clear step at a time
              </h1>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                Pair short flashcard drills with graded stories, phonetics, and a
                map of every unit. Free, private, and saved on this device.
              </p>
            </div>
            <TrustPills />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={getOnboardingPath()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-teal-600/25 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <span aria-hidden="true">🚀</span> Start learning
              </a>
              <a
                href={getBrowsePath()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-white"
              >
                <span aria-hidden="true">{DIR_ICONS.browse}</span> Browse the library
              </a>
            </div>
          </div>
        </section>

        <HowItWorksStrip />

        <StoryShowcase teasers={storyTeasers} variant="new" />

        {/* Combined level picker — clickable cards (same action as former skip-intro chips) */}
        <section
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          aria-labelledby="level-pick-heading"
        >
          <div className="mb-1 flex items-start gap-2">
            <span className="text-xl" aria-hidden="true">
              🌈
            </span>
            <div>
              <h2
                id="level-pick-heading"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                Choose where to begin
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Tap a level to open your learning map there — no intro required.
                New to Thai? Pick{" "}
                <strong className="font-semibold text-slate-800">Beginner</strong>.
                Already know some? Jump ahead; you can change level anytime.
              </p>
            </div>
          </div>
          <ul
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="list"
          >
            {LEVELS.map((level, i) => (
              <li key={level}>
                <button
                  type="button"
                  onClick={() => handleSkipIntro(level)}
                  className={cn(
                    "relative flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border px-3 py-4 text-center shadow-sm transition",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                    LEVEL_BAND[level].soft,
                  )}
                >
                  <span
                    className="absolute -right-1 -top-1 text-4xl opacity-20"
                    aria-hidden="true"
                  >
                    {emojiForLevel(level)}
                  </span>
                  <span className="relative text-3xl" aria-hidden="true">
                    {emojiForLevel(level)}
                  </span>
                  <p
                    className={cn(
                      "relative mt-1.5 text-sm font-bold",
                      LEVEL_BAND[level].text,
                    )}
                  >
                    {LEVEL_LABELS[level]}
                  </p>
                  <p className="relative mt-0.5 text-[11px] text-slate-600">
                    {LEVEL_ICONS[level].trail}
                  </p>
                  <p className="relative mt-2 text-[10px] font-semibold uppercase tracking-wide text-teal-700/80">
                    {i === 0 ? "Recommended start" : "Skip to here"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col items-stretch gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600 sm:text-sm">
              Prefer a short guided intro first?
            </p>
            <a
              href={getOnboardingPath()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">🚀</span> Start learning
            </a>
          </div>
        </section>
      </div>
    );
  }

  const pct =
    totalUnits > 0 ? Math.round((totalDone / totalUnits) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2 sm:py-4">
      {/* Welcome hero */}
      <header className="relative overflow-hidden rounded-[1.75rem] border border-teal-200/70 bg-gradient-to-br from-teal-50 via-white to-violet-50 px-5 py-7 shadow-md sm:px-7 sm:py-8">
        <HeroDecor variant="welcome" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-lg">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800">
                <span aria-hidden="true">🪷</span>
                Welcome back
                <span className="font-thai font-normal text-teal-600/70">
                  · สวัสดีอีกครั้ง
                </span>
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Your Thai journey continues
              </h1>
              <p className="mt-2 text-slate-600">
                {totalDone === 0
                  ? "Pick a stop on the map below — every unit pairs cards with a story."
                  : `${totalDone} of ${totalUnits} units done (${pct}%). Tap any stop to open it.`}
              </p>
            </div>
            {/* Progress ring-ish stat */}
            <div className="flex shrink-0 flex-col items-center rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-lg font-extrabold text-white shadow-inner"
                role="img"
                aria-label={`${pct} percent of path complete`}
              >
                {pct}%
              </div>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Path done
              </p>
            </div>
          </div>

          {/* Mini stats — each card links to a hub */}
          <ul className="grid grid-cols-3 gap-2">
            <li>
              <a
                href={getFlashCardsPath()}
                className="block rounded-2xl border border-cyan-100 bg-cyan-50/90 px-3 py-2.5 text-center shadow-sm transition hover:border-cyan-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <p className="text-lg font-extrabold text-cyan-900">
                  {progress.completedDecks.length}
                </p>
                <p className="text-[11px] font-semibold text-cyan-800/80">
                  🃏 decks done
                </p>
              </a>
            </li>
            <li>
              <a
                href={getReadingPath()}
                className="block rounded-2xl border border-amber-100 bg-amber-50/90 px-3 py-2.5 text-center shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <p className="text-lg font-extrabold text-amber-950">
                  {progress.completedStories.length}
                </p>
                <p className="text-[11px] font-semibold text-amber-900/80">
                  📖 stories done
                </p>
              </a>
            </li>
            <li>
              <a
                href="#learning-path-heading"
                className="block rounded-2xl border border-violet-100 bg-violet-50/90 px-3 py-2.5 text-center shadow-sm transition hover:border-violet-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <p className="text-lg font-extrabold text-violet-950">
                  {emojiForLevel(progress.level)}
                </p>
                <p className="text-[11px] font-semibold text-violet-900/80">
                  {LEVEL_LABELS[progress.level]}
                </p>
              </a>
            </li>
          </ul>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Level for Continue & Next
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Learning level (Continue & Next)"
            >
              {LEVELS.map((level) => {
                const selected = progress.level === level;
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleLevelChange(level)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
                      selected
                        ? "bg-slate-900 text-white shadow-md"
                        : "border border-white bg-white/90 text-slate-700 shadow-sm hover:border-teal-300",
                    )}
                  >
                    <span aria-hidden="true">{emojiForLevel(level)}</span>
                    {LEVEL_LABELS[level]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {continueTarget && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-teal-300 bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-50 p-5 shadow-md sm:p-6">
          <div
            className="pointer-events-none absolute -right-4 -top-4 text-7xl opacity-20"
            aria-hidden="true"
          >
            {continueTarget.type === "deck" ? "🃏" : "📖"}
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
            <span aria-hidden="true">▶️ </span>Pick up where you left off
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {continueTarget.label}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-0.5 text-sm font-semibold text-teal-900">
            {continueTarget.type === "deck"
              ? `${DIR_ICONS.cards} Flashcards`
              : `${DIR_ICONS.story} Reading`}
          </p>

          {continueDeckStats && (
            <div className="mt-3 space-y-2">
              <div
                className="flex h-2.5 overflow-hidden rounded-full bg-teal-200/80"
                role="img"
                aria-label={`${continueDeckStats.correct} correct, ${continueDeckStats.incorrect} incorrect, ${continueDeckStats.remaining} remaining of ${continueDeckStats.total}`}
              >
                {continueDeckStats.total > 0 && (
                  <>
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${(continueDeckStats.correct / continueDeckStats.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{
                        width: `${(continueDeckStats.incorrect / continueDeckStats.total) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                <span className="text-emerald-700">
                  ✓ {continueDeckStats.correct}
                </span>
                <span className="text-amber-700">
                  ✗ {continueDeckStats.incorrect}
                </span>
                <span className="text-slate-600">
                  Left: {continueDeckStats.remaining}
                </span>
              </div>
            </div>
          )}

          <a
            href={continueTarget.href}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-emerald-700 sm:w-auto"
          >
            Continue session <span aria-hidden="true">→</span>
          </a>
        </section>
      )}

      <StoryShowcase teasers={storyTeasers} variant="return" />

      {nextStep && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/50 p-5 shadow-sm sm:p-6">
          <div
            className="pointer-events-none absolute -right-2 top-2 text-6xl opacity-15"
            aria-hidden="true"
          >
            ⭐
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-800">
            <span aria-hidden="true">⭐ </span>Next up ·{" "}
            {LEVEL_LABELS[progress.level]}
          </p>
          <StepSummary view={nextStep} />
          <a
            href={unitHref(nextStep.step, nextStep)}
            className={cn(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold sm:w-auto",
              continueTarget
                ? "border-2 border-violet-200 bg-white text-violet-950 hover:border-violet-300 hover:bg-violet-50"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:from-violet-700 hover:to-fuchsia-700",
            )}
          >
            {nextStep.mark === "empty" ? "Open unit" : "Continue unit"}
            <span aria-hidden="true">→</span>
          </a>
        </section>
      )}

      {levelComplete && (
        <section className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
          <p className="text-lg font-extrabold text-emerald-900">
            <span aria-hidden="true">🎉 </span>
            You’ve finished this level’s path
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Pick another level above, or explore the full map below.
          </p>
        </section>
      )}

      {/* ── Full graphic learning path ── */}
      <section aria-labelledby="learning-path-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/40 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="learning-path-heading"
              className="text-lg font-extrabold text-slate-900 sm:text-xl"
            >
              <span aria-hidden="true" className="mr-1.5">
                🗺️
              </span>
              Full learning path
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Every unit in the curriculum — click any stop on the map.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFocusLevel("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                activeFocus === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              All levels
            </button>
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFocusLevel(level)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  activeFocus === level
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                <span aria-hidden="true">{emojiForLevel(level)}</span>
                {LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Overall progress track */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              Journey progress
            </span>
            <span className="tabular-nums text-slate-500">
              {totalDone}/{totalUnits}
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={totalDone}
            aria-valuemin={0}
            aria-valuemax={totalUnits}
            aria-label={`${totalDone} of ${totalUnits} units complete`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
              style={{
                width:
                  totalUnits > 0
                    ? `${Math.round((totalDone / totalUnits) * 100)}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        <div className="relative space-y-8">
          {/* Vertical trail spine */}
          <div
            className="pointer-events-none absolute bottom-8 left-[1.65rem] top-8 w-1 rounded-full bg-gradient-to-b from-emerald-300 via-amber-300 to-violet-400 sm:left-8"
            aria-hidden="true"
          />

          {fullPath.map(({ level, views, done, total }, bandIndex) => {
            const band = LEVEL_BAND[level];
            const meta = LEVEL_ICONS[level];
            const show =
              activeFocus === "all" || activeFocus === level;
            if (!show) return null;
            const isCurrent = progress.level === level;

            return (
              <div key={level} className="relative pl-0">
                {/* Level marker on spine */}
                <div className="relative mb-4 flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md ring-4 ring-white sm:h-16 sm:w-16 sm:text-3xl",
                      band.bg,
                      "text-white",
                    )}
                    aria-hidden="true"
                  >
                    <span className="drop-shadow-sm">{meta.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={cn("text-lg font-bold", band.text)}>
                        {LEVEL_LABELS[level]}
                      </h3>
                      {isCurrent && (
                        <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Your level
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-500">
                        {done}/{total} done
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {meta.short} · {meta.trail}
                    </p>
                    <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={cn("h-full rounded-full", band.bg)}
                        style={{
                          width:
                            total > 0
                              ? `${Math.round((done / total) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unit nodes grid */}
                <ul className="relative ml-2 grid grid-cols-2 gap-2.5 sm:ml-6 sm:grid-cols-3 md:grid-cols-4">
                  {views.map((view, i) => {
                    const step = view.step;
                    const emoji = emojiForUnit(
                      step.unitId,
                      step.unitTitle,
                      step.unitType,
                    );
                    const title =
                      step.unitTitle ||
                      step.deck?.name ||
                      step.story?.title ||
                      `Step ${step.index + 1}`;
                    const href = unitHref(step, view);
                    const skill = step.unitType === "skill";

                    return (
                      <li key={step.unitId || `${level}-${step.index}`}>
                        <a
                          href={href}
                          className={cn(
                            "group relative flex h-full flex-col rounded-2xl border bg-white p-3 shadow-sm transition-all",
                            "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                            view.mark === "complete" &&
                              "border-emerald-300 bg-emerald-50/60",
                            view.mark === "partial" &&
                              "border-teal-300 bg-teal-50/50",
                            view.mark === "empty" &&
                              "border-slate-200 hover:border-teal-300",
                            skill && "ring-1 ring-violet-200",
                          )}
                        >
                          <div className="mb-2 flex items-start justify-between gap-1">
                            <span
                              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl shadow-inner ring-1 ring-slate-100 transition-transform group-hover:scale-105"
                              aria-hidden="true"
                            >
                              {emoji}
                            </span>
                            <MarkIcon mark={view.mark} />
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {bandIndex === 0 && i === 0
                              ? "Start"
                              : skill
                                ? "Skill"
                                : `Stop ${step.index + 1}`}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-teal-800">
                            {title}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.deck && (
                              <span
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                  view.cardsDone
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600",
                                )}
                              >
                                {DIR_ICONS.cards}
                                {view.cardsDone ? " ✓" : ""}
                              </span>
                            )}
                            {step.story && (
                              <span
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                  view.readingDone
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600",
                                )}
                              >
                                {DIR_ICONS.story}
                                {view.readingDone ? " ✓" : ""}
                              </span>
                            )}
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-500">
          ○ not started · ◐ in progress · ✓ complete ·{" "}
          <span aria-hidden="true">{DIR_ICONS.cards}</span> cards ·{" "}
          <span aria-hidden="true">{DIR_ICONS.story}</span> reading
        </p>
      </section>

      <p className="text-center text-sm text-slate-500">
        <a
          href={getBrowsePath()}
          className="font-medium text-teal-700 hover:text-teal-900"
        >
          <span aria-hidden="true">{DIR_ICONS.browse} </span>
          Or browse the full library
        </a>
        <span className="mx-2">·</span>
        Free forever · Local progress · No account
      </p>

      <div className="border-t border-slate-100 pt-6 text-center">
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Reset all progress
          </button>
        ) : (
          <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-900">
              Clear path completion, card scores, and start over on this device?
              This cannot be undone.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleResetProgress}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Yes, reset everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {progress.level} · {progress.completedDecks.length} decks ·{" "}
        {progress.completedStories.length} stories
        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </span>
    </div>
  );
}

function StepSummary({
  view,
  compact = false,
}: {
  view: StepProgressView;
  compact?: boolean;
}) {
  const { step, cardsDone, readingDone } = view;
  const titleParts: string[] = [];
  if (step.deck) titleParts.push(step.deck.name);
  if (step.story) titleParts.push(step.story.title);
  const fallbackTitle =
    titleParts.length === 2
      ? `${titleParts[0]} + ${titleParts[1]}`
      : titleParts[0] || "Step";
  const title = step.unitTitle || fallbackTitle;
  const skill = step.unitType === "skill";
  const emoji = emojiForUnit(step.unitId, step.unitTitle, step.unitType);

  return (
    <div className="mt-2 flex min-w-0 items-start gap-3">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-100"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold text-slate-900",
            compact ? "text-sm" : "text-lg",
          )}
        >
          <span className="font-medium text-slate-500">
            Step {step.index + 1} ·{" "}
          </span>
          {title}
          {skill && (
            <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">
              {DIR_ICONS.skill} Skill
            </span>
          )}
        </p>
        <div
          className={cn(
            "mt-1 flex flex-wrap gap-2",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {step.deck && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                cardsDone
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-slate-100 text-slate-700",
              )}
            >
              {DIR_ICONS.cards} Cards{cardsDone ? " ✓" : ""}
            </span>
          )}
          {step.story && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                readingDone
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-slate-100 text-slate-700",
              )}
            >
              {DIR_ICONS.story} Reading{readingDone ? " ✓" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
