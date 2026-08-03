import { useCallback, useEffect, useMemo, useState } from "react";
import type { LadderCatalog, StepProgressView } from "@/lib/ladder";
import {
  findContinueTarget,
  findNextIncompleteStep,
  getLevelLadder,
  getStepProgress,
  hrefForHalf,
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
import { getBrowsePath, getOnboardingPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LearnHomeProps {
  catalog: LadderCatalog;
}

function MarkIcon({ mark }: { mark: StepProgressView["mark"] }) {
  if (mark === "complete") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white" aria-hidden="true">
        ●
      </span>
    );
  }
  if (mark === "partial") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-600 text-xs text-teal-700" aria-hidden="true">
        ◐
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 text-xs text-slate-400" aria-hidden="true">
      ○
    </span>
  );
}

export default function LearnHome({ catalog }: LearnHomeProps) {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const refresh = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const handleLevelChange = useCallback((level: Level) => {
    setProgress(setLevel(level));
  }, []);

  const handleSkipIntro = useCallback((level: Level) => {
    setProgress(skipOnboarding(level));
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress(resetAllProgress());
    setConfirmReset(false);
    setShowAllSteps(false);
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
    const deckId = progress.lastActivity?.type === "deck"
      ? progress.lastActivity.id
      : null;
    if (!deckId) return null;
    return summarizeDeckSession(progress.deckSessions?.[deckId] ?? null);
  }, [progress, continueTarget]);

  // Hydration placeholder
  if (!progress) {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-8" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const isFirstRun = !progress.onboardingCompleted;

  if (isFirstRun) {
    return (
      <div className="mx-auto max-w-xl">
        <section className="space-y-6 py-4 sm:py-8">
          <div>
            <p className="mb-2 text-sm font-medium text-teal-700">🪷 Lingo Lotus</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learn Thai, one clear step at a time
            </h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Short flashcard steps and simple stories with phonetics — free, on
              this device.
            </p>
          </div>

          <p className="text-sm font-medium text-slate-700">
            Free forever · No account · Progress saved on this device
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={getOnboardingPath()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Start learning
            </a>
            <a
              href={getBrowsePath()}
              className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Browse the library
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
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-teal-500 hover:text-teal-800"
                >
                  {LEVEL_LABELS[level]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Picks your level and skips the intro — you can still explore freely.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const visibleSteps = showAllSteps ? stepViews : stepViews.slice(0, 5);
  const levelComplete = nextStep === null && stepViews.length > 0;

  return (
    <div className="mx-auto max-w-xl space-y-8 py-2 sm:py-4">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-slate-600">Pick up where you left off.</p>

        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Learning level"
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
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-500",
                )}
              >
                {LEVEL_LABELS[level]}
              </button>
            );
          })}
        </div>
      </header>

      {continueTarget && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Continue
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {continueTarget.label}
          </p>
          <p className="text-sm text-slate-600">
            {continueTarget.type === "deck" ? "Flashcards" : "Reading"}
          </p>

          {continueDeckStats && (
            <div className="mt-3 space-y-2">
              {/* Mini progress bar */}
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
                  Correct: {continueDeckStats.correct}
                </span>
                <span className="font-medium text-amber-700">
                  Incorrect: {continueDeckStats.incorrect}
                </span>
                <span className="text-slate-600">
                  Remaining: {continueDeckStats.remaining}
                </span>
                <span className="text-slate-500">
                  {continueDeckStats.complete
                    ? "Complete"
                    : `Card ${continueDeckStats.currentIndex + 1} of ${continueDeckStats.total}`}
                </span>
              </div>
            </div>
          )}

          <a
            href={continueTarget.href}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto"
          >
            Continue
          </a>
        </section>
      )}

      {nextStep && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Next up
          </p>
          <StepSummary view={nextStep} />
          {nextStep.nextHalf && (
            <a
              href={hrefForHalf(nextStep.step, nextStep.nextHalf) ?? "#"}
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold sm:w-auto",
                continueTarget
                  ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  : "bg-teal-700 text-white hover:bg-teal-800",
              )}
            >
              {nextStep.mark === "empty" ? "Start" : "Resume"}
            </a>
          )}
        </section>
      )}

      {levelComplete && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">
            You’ve finished this level’s path
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Try another level above, or browse the full library.
          </p>
          <a
            href={getBrowsePath()}
            className="mt-3 inline-flex text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline"
          >
            Browse the library
          </a>
        </section>
      )}

      {stepViews.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {LEVEL_LABELS[progress.level]} path
            </h2>
            {stepViews.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllSteps((v) => !v)}
                className="text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                {showAllSteps ? "Show less" : `Show all (${stepViews.length})`}
              </button>
            )}
          </div>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {visibleSteps.map((view) => {
              const href =
                view.nextHalf != null
                  ? hrefForHalf(view.step, view.nextHalf)
                  : view.step.deck
                    ? hrefForHalf(view.step, "cards")
                    : view.step.story
                      ? hrefForHalf(view.step, "reading")
                      : null;
              return (
                <li key={`${view.step.level}-${view.step.index}`}>
                  {href ? (
                    <a
                      href={href}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <MarkIcon mark={view.mark} />
                      <StepSummary view={view} compact />
                    </a>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-3">
                      <MarkIcon mark={view.mark} />
                      <StepSummary view={view} compact />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-center text-sm text-slate-500">
        <a href={getBrowsePath()} className="font-medium text-teal-700 hover:text-teal-900">
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
  const title =
    titleParts.length === 2
      ? `${titleParts[0]} + ${titleParts[1]}`
      : titleParts[0] || "Step";

  return (
    <div className="min-w-0 flex-1">
      <p className={cn("font-semibold text-slate-900", compact ? "text-sm" : "text-lg")}>
        <span className="text-slate-500 font-medium">Step {step.index + 1} · </span>
        {title}
      </p>
      <div className={cn("mt-1 flex flex-wrap gap-2", compact ? "text-xs" : "text-sm")}>
        {step.deck && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              cardsDone
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-100 text-slate-700",
            )}
          >
            Cards{cardsDone ? " ✓" : ""}
          </span>
        )}
        {step.story && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              readingDone
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-100 text-slate-700",
            )}
          >
            Reading{readingDone ? " ✓" : ""}
          </span>
        )}
        {!step.deck && step.story && (
          <span className="text-slate-500">Reading only</span>
        )}
        {step.deck && !step.story && (
          <span className="text-slate-500">Cards only</span>
        )}
      </div>
    </div>
  );
}
