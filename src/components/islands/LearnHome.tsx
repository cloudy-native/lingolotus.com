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
import { getBrowsePath, getUnitPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import FirstRunHome, {
    type FirstRunPreview,
} from "@/components/islands/FirstRunHome";
import { levelSurfaces } from "@/theme/warm-paper";

/** @deprecated Optional prop kept so older call sites typecheck; P0 no longer shows a gallery. */
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
    /** Ignored in P0 — kept for call-site compatibility */
    storyTeasers?: StoryTeaser[];
    /** First-run shop window: live Thai line + three unit covers */
    firstRun?: FirstRunPreview;
}

const LEVEL_BAND = levelSurfaces;

function MarkIcon({ mark }: { mark: StepProgressView["mark"] }) {
    if (mark === "complete") {
        return (
            <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white"
                aria-label="Complete"
            >
                ✓
            </span>
        );
    }
    if (mark === "partial") {
        return (
            <span
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-800 text-xs text-orange-800"
                aria-label="In progress"
            >
                ◐
            </span>
        );
    }
    return (
        <span
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-stone-300 text-xs text-stone-400"
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
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-2xl ring-1 ring-stone-100"
                aria-hidden="true"
            >
                {emoji}
            </span>
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        "font-semibold text-stone-900",
                        compact ? "text-sm" : "text-lg",
                    )}
                >
                    <span className="font-medium text-stone-500">
                        Step {step.index + 1} ·{" "}
                    </span>
                    {title}
                    {skill && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">
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
                                    : "bg-stone-100 text-stone-700",
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
                                    : "bg-stone-100 text-stone-700",
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

function UnitTile({
    view,
    stopLabel,
}: {
    view: StepProgressView;
    stopLabel: string;
}) {
    const step = view.step;
    const emoji = emojiForUnit(step.unitId, step.unitTitle, step.unitType);
    const title =
        step.unitTitle ||
        step.deck?.name ||
        step.story?.title ||
        `Step ${step.index + 1}`;
    const href = unitHref(step, view);
    const skill = step.unitType === "skill";

    return (
        <a
            href={href}
            className={cn(
                "group relative flex h-full flex-col rounded-2xl border bg-paper p-3 shadow-sm transition-all",
                "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                view.mark === "complete" &&
                    "border-emerald-300 bg-emerald-50/60",
                view.mark === "partial" && "border-orange-300 bg-orange-50/50",
                view.mark === "empty" &&
                    "border-stone-200 hover:border-orange-300",
                skill && "ring-1 ring-rose-200",
            )}
        >
            <div className="mb-2 flex items-start justify-between gap-1">
                <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 text-2xl shadow-inner ring-1 ring-stone-100 transition-transform group-hover:scale-105"
                    aria-hidden="true"
                >
                    {emoji}
                </span>
                <MarkIcon mark={view.mark} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                {stopLabel}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-stone-900 group-hover:text-orange-900">
                {title}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
                {step.deck && (
                    <span
                        className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                            view.cardsDone
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-600",
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
                                : "bg-stone-100 text-stone-600",
                        )}
                    >
                        {DIR_ICONS.story}
                        {view.readingDone ? " ✓" : ""}
                    </span>
                )}
            </div>
        </a>
    );
}

export default function LearnHome({
    catalog,
    storyTeasers: _storyTeasers = [],
    firstRun,
}: LearnHomeProps) {
    void _storyTeasers;
    const [progress, setProgress] = useState<LearnerProgress | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    /** Extra levels expanded in the map accordion (in addition to current level) */
    const [expandedLevels, setExpandedLevels] = useState<Set<Level>>(
        () => new Set(),
    );

    useEffect(() => {
        setProgress(loadProgress());
    }, []);

    const refresh = useCallback(() => {
        setProgress(loadProgress());
    }, []);

    const handleLevelChange = useCallback((level: Level) => {
        setProgress(setLevel(level));
        // Map follows the same control — clear temporary expansions
        setExpandedLevels(new Set());
    }, []);

    const handleSkipIntro = useCallback((level: Level) => {
        setProgress(skipOnboarding(level));
    }, []);

    const handleResetProgress = useCallback(() => {
        setProgress(resetAllProgress());
        setConfirmReset(false);
        setExpandedLevels(new Set());
    }, []);

    const toggleMapLevel = useCallback((level: Level, isCurrent: boolean) => {
        if (isCurrent) return;
        setExpandedLevels((prev) => {
            const next = new Set(prev);
            if (next.has(level)) next.delete(level);
            else next.add(level);
            return next;
        });
    }, []);

    const ladder = useMemo(() => {
        if (!progress) return null;
        return getLevelLadder(catalog, progress.level);
    }, [catalog, progress]);

    const stepViews = useMemo(() => {
        if (!progress || !ladder) return [];
        return ladder.steps.map((step) =>
            getStepProgress(
                step,
                progress.completedDecks,
                progress.completedStories,
            ),
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
        return findContinueTarget(
            catalog,
            progress.level,
            progress.lastActivity,
        );
    }, [catalog, progress]);

    const continueDeckStats: DeckSessionStats | null = useMemo(() => {
        if (!progress || !continueTarget || continueTarget.type !== "deck") {
            return null;
        }
        const deckId =
            progress.lastActivity?.type === "deck"
                ? progress.lastActivity.id
                : null;
        if (!deckId) return null;
        return summarizeDeckSession(progress.deckSessions?.[deckId] ?? null);
    }, [progress, continueTarget]);

    /** Per-level path stats for map + header */
    const fullPath = useMemo(() => {
        if (!progress) return [];
        return LEVELS.map((level) => {
            const levelLadder = getLevelLadder(catalog, level);
            const views = levelLadder.steps.map((step) =>
                getStepProgress(
                    step,
                    progress.completedDecks,
                    progress.completedStories,
                ),
            );
            const done = views.filter((v) => v.mark === "complete").length;
            return { level, views, done, total: views.length };
        });
    }, [catalog, progress]);

    const currentBand = fullPath.find((b) => b.level === progress?.level);
    const levelDone = currentBand?.done ?? 0;
    const levelTotal = currentBand?.total ?? 0;
    const levelPct =
        levelTotal > 0 ? Math.round((levelDone / levelTotal) * 100) : 0;

    // Hydration placeholder
    if (!progress) {
        return (
            <div
                className="-mx-4 -mt-6 bg-gradient-to-b from-amber-50 to-stone-100 px-4 py-10 sm:-mx-6 lg:-mx-8"
                aria-busy="true"
            >
                <div className="mx-auto max-w-xl space-y-6">
                    <div className="mx-auto h-8 w-48 animate-pulse rounded bg-amber-100/80" />
                    <div className="h-40 animate-pulse rounded-2xl bg-amber-100/70" />
                    <div className="h-64 animate-pulse rounded-2xl bg-amber-100/70" />
                </div>
            </div>
        );
    }

    const isFirstRun = !progress.onboardingCompleted;
    const levelComplete = nextStep === null && stepViews.length > 0;

    // ── First run: product window, then one primary path ─────────────────
    if (isFirstRun) {
        return (
            <FirstRunHome preview={firstRun} onSkipIntro={handleSkipIntro} />
        );
    }

    // ── Returning: Continue / Next first, one level control, current-level map ──
    return (
        <div className="mx-auto max-w-xl space-y-6 py-2 sm:py-4">
            {/* Compact context — not a marketing hero */}
            <header className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-orange-900">
                            <span aria-hidden="true">🪷 </span>
                            Welcome back
                        </p>
                        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                            What should you do now?
                        </h1>
                    </div>
                    {levelTotal > 0 && (
                        <p className="text-sm tabular-nums text-stone-500">
                            {LEVEL_LABELS[progress.level]} · {levelDone}/
                            {levelTotal} ({levelPct}%)
                        </p>
                    )}
                </div>

                {/* Single level control — drives Continue, Next, and map */}
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
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
                                    selected
                                        ? "bg-stone-900 text-white shadow-sm"
                                        : "border border-stone-200 bg-paper text-stone-700 hover:border-orange-300",
                                )}
                            >
                                <span aria-hidden="true">
                                    {emojiForLevel(level)}
                                </span>
                                {LEVEL_LABELS[level]}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Primary action: Continue */}
            {continueTarget && (
                <section className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-5 shadow-sm sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-900">
                        Pick up where you left off
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-stone-900">
                        {continueTarget.label}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-paper/80 px-2.5 py-0.5 text-sm font-semibold text-orange-950">
                        {continueTarget.type === "deck"
                            ? `${DIR_ICONS.cards} Flashcards`
                            : `${DIR_ICONS.story} Reading`}
                    </p>

                    {continueDeckStats && (
                        <div className="mt-3 space-y-2">
                            <div
                                className="flex h-2.5 overflow-hidden rounded-full bg-orange-200/80"
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
                                <span className="text-stone-600">
                                    Left: {continueDeckStats.remaining}
                                </span>
                            </div>
                        </div>
                    )}

                    <a
                        href={continueTarget.href}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-800 px-5 py-3.5 text-sm font-bold text-white hover:bg-orange-900 sm:w-auto"
                    >
                        Continue session <span aria-hidden="true">→</span>
                    </a>
                </section>
            )}

            {/* Next up — secondary when Continue exists, primary when not */}
            {nextStep && (
                <section
                    className={cn(
                        "rounded-2xl border p-5 shadow-sm sm:p-6",
                        continueTarget
                            ? "border-stone-200 bg-paper"
                            : "border-2 border-rose-200 bg-rose-50/50",
                    )}
                >
                    <p
                        className={cn(
                            "text-xs font-bold uppercase tracking-wide",
                            continueTarget ? "text-stone-500" : "text-rose-800",
                        )}
                    >
                        Next up · {LEVEL_LABELS[progress.level]}
                    </p>
                    <StepSummary view={nextStep} />
                    <a
                        href={unitHref(nextStep.step, nextStep)}
                        className={cn(
                            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold sm:w-auto",
                            continueTarget
                                ? "border border-stone-200 bg-paper text-stone-900 hover:bg-stone-50"
                                : "bg-rose-800 text-white hover:bg-rose-900",
                        )}
                    >
                        {nextStep.mark === "empty"
                            ? "Open unit"
                            : "Continue unit"}
                        <span aria-hidden="true">→</span>
                    </a>
                </section>
            )}

            {levelComplete && (
                <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
                    <p className="text-lg font-extrabold text-emerald-900">
                        You’ve finished this level’s path
                    </p>
                    <p className="mt-1 text-sm text-emerald-800">
                        Pick another level above, or browse freely.
                    </p>
                </section>
            )}

            {/* Learning path — current level open; others collapsed accordion */}
            <section
                aria-labelledby="learning-path-heading"
                className="space-y-3"
            >
                <div>
                    <h2
                        id="learning-path-heading"
                        className="text-lg font-bold text-stone-900"
                    >
                        Your path
                    </h2>
                    <p className="mt-0.5 text-sm text-stone-600">
                        {LEVEL_LABELS[progress.level]} units — tap any stop.
                        Other levels stay collapsed until you open them.
                    </p>
                </div>

                {levelTotal > 0 && (
                    <div
                        className="h-2 overflow-hidden rounded-full bg-stone-200"
                        role="progressbar"
                        aria-valuenow={levelDone}
                        aria-valuemin={0}
                        aria-valuemax={levelTotal}
                        aria-label={`${levelDone} of ${levelTotal} ${LEVEL_LABELS[progress.level]} units complete`}
                    >
                        <div
                            className="h-full rounded-full bg-orange-800 transition-all"
                            style={{ width: `${levelPct}%` }}
                        />
                    </div>
                )}

                <div className="space-y-3">
                    {fullPath.map(({ level, views, done, total }) => {
                        const band = LEVEL_BAND[level];
                        const meta = LEVEL_ICONS[level];
                        const isCurrent = progress.level === level;
                        const isOpen = isCurrent || expandedLevels.has(level);

                        return (
                            <div
                                key={level}
                                className={cn(
                                    "overflow-hidden rounded-2xl border",
                                    isCurrent
                                        ? "border-stone-300 bg-paper shadow-sm"
                                        : "border-stone-200 bg-stone-50/50",
                                )}
                            >
                                <div className="flex items-center gap-2 p-3 sm:p-4">
                                    <div
                                        className={cn(
                                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm sm:h-12 sm:w-12 sm:text-2xl",
                                            band.bg,
                                        )}
                                        aria-hidden="true"
                                    >
                                        {meta.emoji}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3
                                                className={cn(
                                                    "font-bold",
                                                    band.text,
                                                )}
                                            >
                                                {LEVEL_LABELS[level]}
                                            </h3>
                                            {isCurrent && (
                                                <span className="rounded-full bg-orange-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                    Current
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-stone-500">
                                                {done}/{total}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500 sm:text-sm">
                                            {meta.short}
                                        </p>
                                    </div>
                                    {!isCurrent && (
                                        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLevelChange(level)
                                                }
                                                className="rounded-lg border border-stone-200 bg-paper px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:border-orange-300"
                                            >
                                                Switch
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleMapLevel(
                                                        level,
                                                        isCurrent,
                                                    )
                                                }
                                                aria-expanded={isOpen}
                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-50"
                                            >
                                                {isOpen ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isOpen && (
                                    <ul className="grid grid-cols-2 gap-2 border-t border-stone-100 bg-paper p-3 sm:grid-cols-3 sm:p-4">
                                        {views.map((view, i) => (
                                            <li
                                                key={
                                                    view.step.unitId ||
                                                    `${level}-${view.step.index}`
                                                }
                                            >
                                                <UnitTile
                                                    view={view}
                                                    stopLabel={
                                                        i === 0 &&
                                                        level === "beginner"
                                                            ? "Start"
                                                            : view.step
                                                                    .unitType ===
                                                                "skill"
                                                              ? "Skill"
                                                              : `Stop ${view.step.index + 1}`
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-stone-500">
                    ○ not started · ◐ in progress · ✓ complete ·{" "}
                    <span aria-hidden="true">{DIR_ICONS.cards}</span> cards ·{" "}
                    <span aria-hidden="true">{DIR_ICONS.story}</span> reading
                </p>
            </section>

            <p className="text-center text-sm text-stone-500">
                <a
                    href={getBrowsePath()}
                    className="font-medium text-orange-800 hover:text-orange-950"
                >
                    Or browse the full library
                </a>
                <span className="mx-2">·</span>
                Free forever · Local progress · No account
            </p>

            <div className="border-t border-stone-100 pt-6 text-center">
                {!confirmReset ? (
                    <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="text-sm font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
                    >
                        Reset all progress
                    </button>
                ) : (
                    <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                        <p className="text-sm text-rose-900">
                            Clear path completion, card scores, and start over
                            on this device? This cannot be undone.
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
                                className="rounded-lg border border-stone-200 bg-paper px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
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
