import { useEffect, useMemo, useState } from "react";
import { getStepProgress, hrefForHalf, type LadderStep } from "@/lib/ladder";
import {
    LEVEL_LABELS,
    loadProgress,
    summarizeDeckSession,
    type LearnerProgress,
    type Level,
} from "@/lib/progress";
import {
    getLearnPath,
    getStudyPath,
    getStoryPath,
    withUnitQuery,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DIR_ICONS, emojiForLevel, emojiForUnit } from "@/lib/content-icons";

export interface UnitHubProps {
    step: LadderStep;
    level: Level;
    /** @deprecated Grammar is in site nav; prop kept for call-site compatibility */
    grammarMarkdown?: string | null;
}

export default function UnitHub({
    step,
    level,
    grammarMarkdown = null,
}: UnitHubProps) {
    const [progress, setProgress] = useState<LearnerProgress | null>(null);
    void grammarMarkdown;

    useEffect(() => {
        setProgress(loadProgress());
    }, []);

    const view = useMemo(() => {
        if (!progress) return null;
        return getStepProgress(
            step,
            progress.completedDecks,
            progress.completedStories,
        );
    }, [progress, step]);

    const deckStats = useMemo(() => {
        if (!progress || !step.deck) return null;
        return summarizeDeckSession(progress.deckSessions?.[step.deck.deckId]);
    }, [progress, step.deck]);

    if (!progress || !view) {
        return (
            <div className="mx-auto max-w-xl space-y-4 py-8" aria-busy="true">
                <div className="h-8 w-48 animate-pulse rounded bg-stone-100" />
                <div className="h-32 animate-pulse rounded-xl bg-stone-100" />
            </div>
        );
    }

    const cardsHref = step.deck
        ? withUnitQuery(
              getStudyPath(step.deck.collectionId, step.deck.deckId),
              step.unitId,
          )
        : null;
    const storyHref = step.story
        ? withUnitQuery(
              getStoryPath(step.story.bookId, step.story.storyId),
              step.unitId,
          )
        : null;
    const resumeHalf = view.nextHalf;
    const primaryHref =
        resumeHalf != null
            ? hrefForHalf(step, resumeHalf)
            : cardsHref || storyHref;
    const primaryLabel =
        view.mark === "complete"
            ? "Review unit"
            : view.mark === "empty"
              ? "Start unit"
              : resumeHalf === "reading"
                ? "Continue reading"
                : "Continue cards";

    const title =
        step.unitTitle || step.deck?.name || step.story?.title || "Unit";
    const skill = step.unitType === "skill";
    const unitEmoji = emojiForUnit(step.unitId, step.unitTitle, step.unitType);

    return (
        <div className="mx-auto max-w-xl space-y-6 py-2 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                    href={getLearnPath()}
                    className="text-sm font-medium text-orange-800 hover:text-orange-950"
                >
                    ← Back to Learn map
                </a>
            </div>

            <header className="space-y-3">
                <div className="flex items-start gap-3">
                    <span
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-4xl shadow-inner ring-1 ring-stone-100"
                        aria-hidden="true"
                    >
                        {unitEmoji}
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                            <span aria-hidden="true">
                                {emojiForLevel(level)}{" "}
                            </span>
                            {LEVEL_LABELS[level]}
                            {skill ? ` · ${DIR_ICONS.skill} Skill` : " · Unit"}
                            {" · "}
                            Step {step.index + 1}
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
                            {title}
                        </h1>
                    </div>
                </div>
                <p className="text-stone-600">
                    Switch freely between flashcards and the paired story.
                    Progress saves on this device.
                </p>
            </header>

            {/* Progress summary */}
            <div className="flex flex-wrap gap-2 text-sm">
                {step.deck && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium",
                            view.cardsDone
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-stone-100 text-stone-700",
                        )}
                    >
                        {DIR_ICONS.cards} Cards{view.cardsDone ? " ✓" : ""}
                    </span>
                )}
                {step.story && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium",
                            view.readingDone
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-stone-100 text-stone-700",
                        )}
                    >
                        {DIR_ICONS.story} Reading{view.readingDone ? " ✓" : ""}
                    </span>
                )}
                {view.mark === "complete" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-900">
                        {DIR_ICONS.complete} Unit complete
                    </span>
                )}
            </div>

            {primaryHref && (
                <a
                    href={primaryHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-800 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-900"
                >
                    {primaryLabel} <span aria-hidden="true">→</span>
                </a>
            )}

            <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-400">
                Pick how you want to practice
            </p>

            <div
                className={cn(
                    "grid gap-4",
                    step.deck && step.story
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-1",
                )}
            >
                {/* ── Flashcards: clay “flip deck” ── */}
                {step.deck && cardsHref && (
                    <a
                        href={cardsHref}
                        className={cn(
                            "group relative flex flex-col overflow-hidden rounded-3xl border-2 p-5 shadow-md transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                            "hover:-translate-y-1 hover:shadow-xl",
                            view.cardsDone
                                ? "border-orange-400 bg-gradient-to-br from-orange-50 via-orange-50 to-emerald-50"
                                : "border-orange-300 bg-gradient-to-br from-orange-100 via-orange-50 to-stone-100",
                        )}
                    >
                        {/* Decorative card stack */}
                        <div
                            className="pointer-events-none absolute -right-2 -top-2 opacity-90"
                            aria-hidden="true"
                        >
                            <div className="relative h-20 w-16">
                                <div className="absolute right-0 top-3 h-14 w-11 rotate-12 rounded-lg border-2 border-orange-200 bg-paper/80 shadow-sm" />
                                <div className="absolute right-2 top-1.5 h-14 w-11 -rotate-6 rounded-lg border-2 border-orange-300 bg-paper shadow-md" />
                                <div className="absolute right-4 top-0 flex h-14 w-11 items-center justify-center rounded-lg border-2 border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-lg transition-transform group-hover:rotate-3">
                                    ก
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col">
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                                <span aria-hidden="true">🃏</span> Flashcards
                            </span>

                            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-2xl shadow-inner ring-2 ring-orange-200">
                                <span aria-hidden="true">⚡</span>
                            </div>

                            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-orange-950">
                                Flip & drill
                            </h2>
                            <p className="mt-1 line-clamp-2 text-sm font-medium text-orange-900/80">
                                {step.deck.name}
                            </p>
                            <p className="mt-2 text-sm leading-snug text-orange-900/70">
                                Quick rounds: Thai on one side, English on the
                                other. Tap to flip, score yourself.
                            </p>

                            {deckStats ? (
                                <div className="mt-4 space-y-2">
                                    <div
                                        className="flex h-2 overflow-hidden rounded-full bg-orange-200/80"
                                        role="img"
                                        aria-label={`${deckStats.correct} correct, ${deckStats.incorrect} incorrect, ${deckStats.remaining} remaining`}
                                    >
                                        {deckStats.total > 0 && (
                                            <>
                                                <div
                                                    className="bg-emerald-500"
                                                    style={{
                                                        width: `${(deckStats.correct / deckStats.total) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="bg-amber-400"
                                                    style={{
                                                        width: `${(deckStats.incorrect / deckStats.total) * 100}%`,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-orange-900/80">
                                        <span className="text-emerald-700">
                                            ✓ {deckStats.correct}
                                        </span>
                                        {" · "}
                                        <span className="text-amber-700">
                                            ✗ {deckStats.incorrect}
                                        </span>
                                        {" · "}
                                        {deckStats.remaining} left
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-xs font-medium text-orange-800/70">
                                    No session yet — start a fresh drill.
                                </p>
                            )}

                            <span
                                className={cn(
                                    "mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors",
                                    "bg-orange-600 group-hover:bg-orange-700",
                                )}
                            >
                                {view.cardsDone
                                    ? "Review cards again"
                                    : "Study flashcards"}
                                <span aria-hidden="true">→</span>
                            </span>

                            {view.cardsDone && (
                                <span className="mt-2 text-center text-xs font-bold text-emerald-700">
                                    ✓ Cards complete
                                </span>
                            )}
                        </div>
                    </a>
                )}

                {/* ── Reading: warm amber “storybook” ── */}
                {step.story && storyHref && (
                    <a
                        href={storyHref}
                        className={cn(
                            "group relative flex flex-col overflow-hidden rounded-3xl border-2 p-5 shadow-md transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                            "hover:-translate-y-1 hover:shadow-xl",
                            view.readingDone
                                ? "border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
                                : "border-amber-300 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50",
                        )}
                    >
                        {/* Decorative open book */}
                        <div
                            className="pointer-events-none absolute -right-1 -top-1 opacity-95"
                            aria-hidden="true"
                        >
                            <div className="relative h-20 w-20">
                                <div className="absolute right-6 top-4 h-12 w-8 -skew-y-3 rounded-l-md bg-amber-800/20 shadow-inner" />
                                <div className="absolute right-2 top-3 flex h-14 w-10 skew-y-2 items-end justify-center rounded-r-md bg-gradient-to-br from-amber-500 to-orange-600 pb-1 text-xs font-bold text-white shadow-lg transition-transform group-hover:-rotate-2">
                                    อ่าน
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col">
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                                <span aria-hidden="true">📖</span> Reading
                            </span>

                            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-2xl shadow-inner ring-2 ring-amber-200">
                                <span aria-hidden="true">✨</span>
                            </div>

                            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-amber-950">
                                Read the story
                            </h2>
                            <p className="mt-1 line-clamp-2 text-sm font-medium text-amber-900/80">
                                {step.story.title}
                            </p>
                            <p className="mt-2 text-sm leading-snug text-amber-900/70">
                                Same theme in real sentences — phonetics,
                                translation, and
                                {level === "beginner" || level === "elementary"
                                    ? " word-by-word help."
                                    : " natural Thai flow."}
                            </p>

                            {step.story.sentenceCount != null &&
                            step.story.sentenceCount > 0 ? (
                                <p className="mt-4 text-xs font-semibold text-amber-900/80">
                                    ≈ {step.story.sentenceCount} lines · sit
                                    back and listen or read aloud
                                </p>
                            ) : (
                                <p className="mt-4 text-xs font-medium text-amber-800/70">
                                    Short graded story · tap lines for help
                                </p>
                            )}

                            <span
                                className={cn(
                                    "mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors",
                                    "bg-amber-600 group-hover:bg-amber-700",
                                )}
                            >
                                {view.readingDone
                                    ? "Re-read the story"
                                    : "Open the story"}
                                <span aria-hidden="true">→</span>
                            </span>

                            {view.readingDone && (
                                <span className="mt-2 text-center text-xs font-bold text-emerald-700">
                                    ✓ Reading complete
                                </span>
                            )}
                        </div>
                    </a>
                )}

                {step.unitType === "skill" && step.deck && !step.story && (
                    <p className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 sm:col-span-2">
                        <span aria-hidden="true">{DIR_ICONS.skill} </span>
                        Skill unit — flashcards only. No paired story for this
                        stop.
                    </p>
                )}
            </div>
        </div>
    );
}
