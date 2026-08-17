import { useState, useCallback, useEffect, useRef } from "react";
import SessionComplete, {
    type PairedStoryInfo,
} from "@/components/islands/SessionComplete";
import { useReaderSettings } from "@/components/islands/ReaderSettings";
import { ThaiPhrase } from "@/components/islands/ThaiPhrase";
import UnitModeSwitcher from "@/components/islands/UnitModeSwitcher";
import { FlippableCard } from "@/components/ui/card";
import {
    clearDeckSession,
    loadProgress,
    resumeCardIndex,
    saveDeckSession,
    type CardResult,
    type Level,
} from "@/lib/progress";
import {
    cn,
    getLearnPath,
    getStoryPath,
    getStudyPath,
    getUnitPath,
    readUnitIdFromSearch,
    withUnitQuery,
} from "@/lib/utils";

/** Serializable unit → pair map for client-side `?unit=` resolution */
export type ClientUnitPairMap = Record<
    string,
    {
        unitId: string;
        unitTitle?: string;
        level?: Level;
        stepIndex?: number;
        story?: PairedStoryInfo | null;
    }
>;

interface StudyCard {
    frontContent: { type: string; text: string };
    backContent: { type: string; text: string };
    phonetic?: string;
    partOfSpeech?: string;
    context?: string;
    tags?: string[];
    examples?: Array<{
        original: string;
        translation: string;
        phonetic?: string;
    }>;
    sourceLanguage: string;
    targetLanguage: string;
}

interface StudyModeProps {
    cards: StudyCard[];
    deckName: string;
    collectionId: string;
    deckId: string;
    /** Sample / onboarding mode — do not mark full deck complete */
    isSample?: boolean;
    /** Called when all cards have been answered (or user finishes sample) */
    onSessionComplete?: () => void;
    /** Hide built-in SessionComplete UI (parent handles next step) */
    hideCompletionActions?: boolean;
    pairedStory?: PairedStoryInfo | null;
    storyAlreadyComplete?: boolean;
    level?: Level;
    stepIndex?: number;
    unitId?: string | null;
    /** unitId → pair info; used when URL has ?unit= */
    unitPairMap?: ClientUnitPairMap | null;
    grammarMarkdown?: string | null;
    /** Optional link to deck detail page (page chrome) */
    deckDetailsHref?: string | null;
}

type LanguageDisplay = "source" | "target";

const LANG_NAMES: Record<string, { native: string; flag: string }> = {
    th: { native: "ไทย", flag: "🇹🇭" },
    en: { native: "English", flag: "🇬🇧" },
    ja: { native: "日本語", flag: "🇯🇵" },
    zh: { native: "中文", flag: "🇨🇳" },
    ko: { native: "한국어", flag: "🇰🇷" },
};

function getLangInfo(code: string) {
    return LANG_NAMES[code] || { native: code.toUpperCase(), flag: "🌐" };
}

function emptyResults(n: number): CardResult[] {
    return new Array(n).fill(null);
}

export default function StudyMode({
    cards,
    deckName,
    collectionId,
    deckId,
    isSample = false,
    onSessionComplete,
    hideCompletionActions = false,
    pairedStory = null,
    storyAlreadyComplete = false,
    level,
    stepIndex,
    unitId = null,
    unitPairMap = null,
    grammarMarkdown = null,
    deckDetailsHref = null,
}: StudyModeProps) {
    const total = cards.length;
    const hydrated = useRef(false);
    const { fontSize, showPhonetics, showPos } = useReaderSettings();

    const [activeUnitId, setActiveUnitId] = useState<string | null>(unitId);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Prefer ?unit= over SSG default so multi-unit decks pair correctly
    useEffect(() => {
        if (typeof window === "undefined") return;
        const fromUrl = readUnitIdFromSearch(window.location.search);
        if (fromUrl && unitPairMap && unitPairMap[fromUrl]) {
            setActiveUnitId(fromUrl);
        } else if (unitId) {
            setActiveUnitId(unitId);
        }
    }, [unitId, unitPairMap]);

    const resolvedPair: PairedStoryInfo | null = (() => {
        if (activeUnitId && unitPairMap?.[activeUnitId]?.story) {
            return unitPairMap[activeUnitId].story ?? null;
        }
        return pairedStory ?? null;
    })();
    const resolvedLevel: Level | undefined =
        (activeUnitId && unitPairMap?.[activeUnitId]?.level) || level;
    const resolvedStepIndex: number | undefined =
        activeUnitId && unitPairMap?.[activeUnitId]
            ? unitPairMap[activeUnitId].stepIndex
            : stepIndex;
    const resolvedUnitTitle =
        (activeUnitId && unitPairMap?.[activeUnitId]?.unitTitle) || null;

    const cardsHref =
        !isSample && activeUnitId
            ? withUnitQuery(getStudyPath(collectionId, deckId), activeUnitId)
            : null;
    const storyHref =
        !isSample && activeUnitId && resolvedPair
            ? withUnitQuery(
                  getStoryPath(resolvedPair.bookId, resolvedPair.storyId),
                  activeUnitId,
              )
            : null;

    const modeSwitcher =
        !isSample && activeUnitId && cardsHref && storyHref ? (
            <UnitModeSwitcher
                unitId={activeUnitId}
                unitTitle={resolvedUnitTitle || deckName}
                active="cards"
                cardsHref={cardsHref}
                storyHref={storyHref}
                cardsLabel={deckName}
                storyLabel={resolvedPair?.title ?? null}
            />
        ) : null;

    /** Shared page chrome with StoryReader (quiet back + mode switcher) */
    const pageChrome = !isSample ? (
        <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                    href={getLearnPath()}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                    </svg>
                    Learn
                </a>
                {activeUnitId ? (
                    <a
                        href={getUnitPath(activeUnitId)}
                        className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                    >
                        Unit hub
                    </a>
                ) : deckDetailsHref ? (
                    <a
                        href={deckDetailsHref}
                        className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                    >
                        Deck details
                    </a>
                ) : null}
            </div>
            {modeSwitcher}
        </div>
    ) : null;
    const [isFlipped, setIsFlipped] = useState(false);
    const [languageDisplay, setLanguageDisplay] =
        useState<LanguageDisplay>("source");
    // Track per-card results: null = unanswered, true = correct, false = incorrect
    const [cardResults, setCardResults] = useState<CardResult[]>(() =>
        emptyResults(total),
    );
    const [showComplete, setShowComplete] = useState(false);
    const [completionNotified, setCompletionNotified] = useState(false);
    const [ready, setReady] = useState(isSample);

    // Restore saved session (skip sample / onboarding)
    useEffect(() => {
        if (isSample || hydrated.current) {
            setReady(true);
            return;
        }
        hydrated.current = true;
        const saved = loadProgress().deckSessions?.[deckId];
        if (
            saved &&
            saved.total === total &&
            saved.cardResults.length === total
        ) {
            setCardResults(saved.cardResults);
            // Continue / resume: land on first wrong, else first unanswered
            const startAt = resumeCardIndex(saved.cardResults);
            setCurrentIndex(startAt);
            const rem =
                total -
                saved.cardResults.filter((r) => r === true).length -
                saved.cardResults.filter((r) => r === false).length;
            const hasWrong = saved.cardResults.some((r) => r === false);
            // Prefer cards when wrongs remain to review; only open complete if all correct
            if (rem <= 0 && !hasWrong && total > 0) {
                setShowComplete(true);
                setCompletionNotified(true);
            } else if (rem <= 0 && hasWrong) {
                setShowComplete(false);
                // Session already fully answered — don't auto-popup complete again while reviewing wrongs
                setCompletionNotified(true);
            } else {
                setShowComplete(false);
                setCompletionNotified(false);
            }
            // Keep storage index aligned with where we opened
            if (startAt !== saved.currentIndex) {
                saveDeckSession(
                    deckId,
                    {
                        cardResults: saved.cardResults,
                        currentIndex: startAt,
                        total,
                    },
                    { level, stepIndex, touchLastActivity: true },
                );
            }
        }
        setReady(true);
    }, [deckId, total, isSample, level, stepIndex]);

    const correct = cardResults.filter((r) => r === true).length;
    const incorrect = cardResults.filter((r) => r === false).length;
    const remaining = total - correct - incorrect;
    const currentCard = cards[currentIndex] ?? cards[0];

    const persistSession = useCallback(
        (results: CardResult[], index: number) => {
            if (isSample || total < 1) return;
            saveDeckSession(
                deckId,
                {
                    cardResults: results,
                    currentIndex: index,
                    total,
                },
                {
                    level: resolvedLevel,
                    stepIndex: resolvedStepIndex,
                    unitId: activeUnitId || undefined,
                    touchLastActivity: true,
                },
            );
        },
        [
            deckId,
            isSample,
            resolvedLevel,
            resolvedStepIndex,
            activeUnitId,
            total,
        ],
    );

    // When all cards answered, open completion
    useEffect(() => {
        if (!ready || total < 1 || remaining > 0 || completionNotified) return;
        setCompletionNotified(true);
        setShowComplete(true);
        onSessionComplete?.();
    }, [remaining, total, completionNotified, onSessionComplete, ready]);

    const sourceLang = getLangInfo(currentCard.sourceLanguage);
    const targetLang = getLangInfo(currentCard.targetLanguage);

    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex === total - 1;

    const flipCard = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            const nextIndex = currentIndex - 1;
            setCurrentIndex(nextIndex);
            setIsFlipped(false);
            persistSession(cardResults, nextIndex);
        }
    }, [cardResults, currentIndex, persistSession]);

    const goToNext = useCallback(() => {
        if (currentIndex < total - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setIsFlipped(false);
            persistSession(cardResults, nextIndex);
        }
    }, [cardResults, currentIndex, persistSession, total]);

    const goToCard = useCallback(
        (index: number) => {
            setCurrentIndex(index);
            setIsFlipped(false);
            persistSession(cardResults, index);
        },
        [cardResults, persistSession],
    );

    const markCorrect = useCallback(() => {
        setCardResults((prev) => {
            const next = [...prev];
            next[currentIndex] = true;
            const nextIndex =
                currentIndex < total - 1 ? currentIndex + 1 : currentIndex;
            persistSession(next, nextIndex);
            return next;
        });
        if (currentIndex < total - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        }
    }, [currentIndex, total, persistSession]);

    const markIncorrect = useCallback(() => {
        setCardResults((prev) => {
            const next = [...prev];
            next[currentIndex] = false;
            const nextIndex =
                currentIndex < total - 1 ? currentIndex + 1 : currentIndex;
            persistSession(next, nextIndex);
            return next;
        });
        if (currentIndex < total - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        }
    }, [currentIndex, total, persistSession]);

    const handleResetDeck = useCallback(() => {
        if (!isSample) {
            clearDeckSession(deckId);
        }
        const fresh = emptyResults(total);
        setCardResults(fresh);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowComplete(false);
        setCompletionNotified(false);
        if (!isSample) {
            persistSession(fresh, 0);
        }
    }, [deckId, isSample, persistSession, total]);

    const handleReviewAnswers = useCallback(() => {
        setShowComplete(false);
        setIsFlipped(false);
        // Keep completionNotified true so we don't re-fire onSessionComplete
    }, []);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
                return;

            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault();
                    goToPrevious();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    goToNext();
                    break;
                case " ":
                    event.preventDefault();
                    flipCard();
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToPrevious, goToNext, flipCard]);

    // Get front/back text based on language toggle
    const getFrontText = () => {
        return languageDisplay === "source"
            ? currentCard.frontContent.text
            : currentCard.backContent.text;
    };

    const getBackText = () => {
        return languageDisplay === "source"
            ? currentCard.backContent.text
            : currentCard.frontContent.text;
    };

    // Progress bar segments — use card results for coloring
    const getSegmentColor = (i: number) => {
        const result = cardResults[i];
        if (i === currentIndex) return "bg-slate-700";
        if (result === true) return "bg-emerald-500";
        if (result === false) return "bg-amber-500";
        return "bg-slate-200";
    };

    const thaiText = currentCard.frontContent.text;
    const englishText = currentCard.backContent.text;
    const thaiLang = currentCard.sourceLanguage;

    // Front: one clear prompt — no nested chrome
    const frontContent = (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 sm:min-h-[240px]">
            {languageDisplay === "source" ? (
                <ThaiPhrase
                    thai={thaiText}
                    phonetic={currentCard.phonetic}
                    languageCode={thaiLang}
                    showPhonetics={showPhonetics}
                    fontSize={fontSize}
                    partOfSpeech={currentCard.partOfSpeech}
                    showPos={showPos}
                    align="center"
                    size="lg"
                />
            ) : (
                <p
                    className={cn(
                        "text-center font-bold text-slate-900",
                        fontSize === "sm" && "text-2xl",
                        fontSize === "base" && "text-3xl md:text-4xl",
                        fontSize === "lg" && "text-4xl md:text-5xl",
                    )}
                >
                    {englishText}
                </p>
            )}
        </div>
    );

    // Back: English → Thai → compact examples (no nested card stack)
    const backContent = (
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
            <div>
                <p
                    className={cn(
                        "font-bold leading-snug text-slate-900",
                        fontSize === "sm" && "text-xl",
                        fontSize === "base" && "text-2xl",
                        fontSize === "lg" && "text-3xl",
                    )}
                >
                    {languageDisplay === "source" ? englishText : thaiText}
                </p>
                {currentCard.context ? (
                    <p className="mt-0.5 text-sm text-slate-500">
                        {currentCard.context}
                    </p>
                ) : null}
            </div>

            <ThaiPhrase
                thai={thaiText}
                phonetic={currentCard.phonetic}
                languageCode={thaiLang}
                showPhonetics={showPhonetics}
                fontSize={fontSize}
                partOfSpeech={currentCard.partOfSpeech}
                showPos={showPos}
                align="start"
                size="md"
            />

            {currentCard.examples && currentCard.examples.length > 0 ? (
                <ul className="space-y-3 border-t border-slate-100 pt-3">
                    {currentCard.examples.map((example, idx) => (
                        <li key={idx}>
                            {example.translation ? (
                                <p className="mb-0.5 text-xs font-medium text-slate-500">
                                    {example.translation}
                                </p>
                            ) : null}
                            <ThaiPhrase
                                thai={example.original}
                                phonetic={example.phonetic}
                                languageCode={thaiLang}
                                showPhonetics={showPhonetics}
                                fontSize={fontSize}
                                align="start"
                                size="sm"
                            />
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );

    if (!ready || !currentCard) {
        return (
            <div
                className="mx-auto max-w-4xl py-12 text-center text-sm text-slate-500"
                aria-busy="true"
            >
                Loading progress…
            </div>
        );
    }

    const progressBar = (
        <>
            {/* Progress bar — clickable, colored by answer */}
            <div
                className="mb-4 flex gap-0.5"
                role="list"
                aria-label="Card progress"
            >
                {cards.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        role="listitem"
                        onClick={() => {
                            goToCard(i);
                            if (showComplete) setShowComplete(false);
                        }}
                        className={cn(
                            "h-2.5 flex-1 cursor-pointer rounded-full transition-colors hover:opacity-80",
                            getSegmentColor(i),
                        )}
                        aria-label={
                            cardResults[i] === true
                                ? `Card ${i + 1}, correct`
                                : cardResults[i] === false
                                  ? `Card ${i + 1}, incorrect`
                                  : `Card ${i + 1}, unanswered`
                        }
                    />
                ))}
            </div>

            {/* Progress counters */}
            <div
                className="mb-4 flex justify-center gap-6 text-sm"
                role="status"
                aria-live="polite"
                aria-label={`Progress: ${correct} correct, ${incorrect} incorrect, ${remaining} remaining out of ${total} total`}
            >
                <span className="font-medium text-emerald-600">
                    Correct: {correct}
                </span>
                <span className="font-medium text-amber-600">
                    Incorrect: {incorrect}
                </span>
                <span className="text-gray-600">Remaining: {remaining}</span>
            </div>
        </>
    );

    if (showComplete && hideCompletionActions) {
        return (
            <div className="mx-auto w-full max-w-4xl">
                {pageChrome}
                {progressBar}
                <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-lg font-semibold text-slate-900">
                        Cards done
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        {correct} correct · {incorrect} to review
                    </p>
                </div>
            </div>
        );
    }

    if (showComplete && !hideCompletionActions && !isSample) {
        return (
            <div className="mx-auto w-full max-w-4xl space-y-6">
                {pageChrome}
                <div className="text-center">
                    <span className="text-lg font-semibold text-slate-900">
                        {deckName}
                    </span>
                </div>
                {progressBar}
                <SessionComplete
                    kind="deck"
                    deckId={deckId}
                    deckName={deckName}
                    level={resolvedLevel}
                    stepIndex={resolvedStepIndex}
                    pairedStory={resolvedPair}
                    storyAlreadyComplete={storyAlreadyComplete}
                    correct={correct}
                    incorrect={incorrect}
                    total={total}
                    unitId={activeUnitId}
                />
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleReviewAnswers}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                        Review cards
                    </button>
                    <button
                        type="button"
                        onClick={handleResetDeck}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                        Reset deck progress
                    </button>
                </div>
            </div>
        );
    }

    // grammarMarkdown kept for call-site compatibility; Grammar lives in site nav
    void grammarMarkdown;

    return (
        <div className="mx-auto w-full max-w-4xl">
            {pageChrome}
            {/* Header row: deck name + counter + language toggles */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-center">
                    <span className="text-lg font-semibold text-slate-900 sm:text-xl">
                        {deckName}
                    </span>
                    <span className="text-lg text-teal-700">
                        {currentIndex + 1} of {total}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setLanguageDisplay("target")}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            languageDisplay === "target"
                                ? "bg-slate-800 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                        aria-pressed={languageDisplay === "target"}
                    >
                        {targetLang.flag} {targetLang.native}
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguageDisplay("source")}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            languageDisplay === "source"
                                ? "bg-teal-700 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                        aria-pressed={languageDisplay === "source"}
                    >
                        {sourceLang.flag} {sourceLang.native}
                    </button>
                </div>
            </div>

            {progressBar}

            <div className="mb-3 flex justify-end">
                <button
                    type="button"
                    onClick={handleResetDeck}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                    Reset deck progress
                </button>
            </div>

            {/* Card with side navigation */}
            <div className="flex items-center gap-2 mb-4">
                {/* Left nav arrow */}
                <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={isPrevDisabled}
                    className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                        isPrevDisabled
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    )}
                    aria-label="Previous card"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                {/* Flashcard */}
                <div className="flex-1">
                    <FlippableCard
                        isFlipped={isFlipped}
                        front={frontContent}
                        back={backContent}
                        onClick={flipCard}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                flipCard();
                            }
                        }}
                        aria-label={`Flashcard ${currentIndex + 1} of ${total}. ${isFlipped ? "Showing back." : "Showing front."} Press Space or click to flip.`}
                    />
                </div>

                {/* Right nav arrow */}
                <button
                    type="button"
                    onClick={goToNext}
                    disabled={isNextDisabled}
                    className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                        isNextDisabled
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    )}
                    aria-label="Next card"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </div>

            {/* Correct / Incorrect buttons (shown when card is flipped) */}
            {isFlipped && (
                <div className="flex justify-center gap-3 mb-4">
                    <button
                        type="button"
                        onClick={markCorrect}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        aria-label="Mark as correct"
                    >
                        ✓ Correct
                    </button>
                    <button
                        type="button"
                        onClick={markIncorrect}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        aria-label="Mark as incorrect"
                    >
                        ✗ Incorrect
                    </button>
                </div>
            )}

            {/* Keyboard hint */}
            <p className="text-center text-xs text-slate-500">
                Keyboard: ← Previous · → Next · Space Flip
            </p>
        </div>
    );
}
