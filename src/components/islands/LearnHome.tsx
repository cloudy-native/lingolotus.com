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
import { getBrowsePath, getOnboardingPath, getUnitPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LearnHomeProps {
  catalog: LadderCatalog;
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
          : "#")
  );
}

export default function LearnHome({ catalog }: LearnHomeProps) {
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
      <div className="mx-auto max-w-xl">
        <section className="space-y-6 py-4 sm:py-8">
          <div>
            <p className="mb-2 text-sm font-medium text-teal-700">
              {DIR_ICONS.learn} Lingo Lotus
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learn Thai, one clear step at a time
            </h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Short flashcard steps and simple stories with phonetics — free, on
              this device.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LEVELS.map((level) => (
              <li
                key={level}
                className={cn(
                  "rounded-xl border px-3 py-3 text-center",
                  LEVEL_BAND[level].soft,
                )}
              >
                <span className="text-2xl" aria-hidden="true">
                  {emojiForLevel(level)}
                </span>
                <p className={cn("mt-1 text-xs font-semibold", LEVEL_BAND[level].text)}>
                  {LEVEL_LABELS[level]}
                </p>
              </li>
            ))}
          </ul>

          <p className="text-sm font-medium text-slate-700">
            Free forever · No account · Progress saved on this device
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={getOnboardingPath()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <span aria-hidden="true">🚀</span> Start learning
            </a>
            <a
              href={getBrowsePath()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span aria-hidden="true">{DIR_ICONS.browse}</span> Browse the library
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              We’ll start at Beginner — you can change level anytime after.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-800">
              Not a beginner?
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-label="Skip intro and choose level"
            >
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSkipIntro(level)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-teal-500 hover:text-teal-800"
                >
                  <span aria-hidden="true">{emojiForLevel(level)}</span>
                  {LEVEL_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2 sm:py-4">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <span aria-hidden="true" className="mr-2">
            {DIR_ICONS.learn}
          </span>
          Welcome back
        </h1>
        <p className="text-slate-600">
          Your full Thai path — {totalDone} of {totalUnits} units done. Tap any
          stop to open it.
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
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-500",
                )}
              >
                <span aria-hidden="true">{emojiForLevel(level)}</span>
                {LEVEL_LABELS[level]}
              </button>
            );
          })}
        </div>
      </header>

      {continueTarget && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            <span aria-hidden="true">▶️ </span>Continue
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {continueTarget.label}
          </p>
          <p className="text-sm text-slate-600">
            {continueTarget.type === "deck"
              ? `${DIR_ICONS.cards} Flashcards`
              : `${DIR_ICONS.story} Reading`}
          </p>

          {continueDeckStats && (
            <div className="mt-3 space-y-2">
              <div
                className="flex h-2 overflow-hidden rounded-full bg-teal-100"
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
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="font-medium text-emerald-700">
                  ✓ {continueDeckStats.correct}
                </span>
                <span className="font-medium text-amber-700">
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
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto"
          >
            Continue <span aria-hidden="true">→</span>
          </a>
        </section>
      )}

      {nextStep && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span aria-hidden="true">⭐ </span>Next up · {LEVEL_LABELS[progress.level]}
          </p>
          <StepSummary view={nextStep} />
          <a
            href={unitHref(nextStep.step, nextStep)}
            className={cn(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold sm:w-auto",
              continueTarget
                ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                : "bg-teal-700 text-white hover:bg-teal-800",
            )}
          >
            {nextStep.mark === "empty" ? "Open unit" : "Continue unit"}
            <span aria-hidden="true">→</span>
          </a>
        </section>
      )}

      {levelComplete && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">
            <span aria-hidden="true">🎉 </span>
            You’ve finished this level’s path
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Pick another level above, or explore the map below.
          </p>
        </section>
      )}

      {/* ── Full graphic learning path ── */}
      <section aria-labelledby="learning-path-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="learning-path-heading"
              className="text-lg font-bold text-slate-900 sm:text-xl"
            >
              <span aria-hidden="true" className="mr-1.5">
                🗺️
              </span>
              Full learning path
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Every unit in the curriculum — click any stop.
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
