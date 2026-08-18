import {
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from "react";
import SpeechButton from "@/components/islands/SpeechButton";
import SessionComplete from "@/components/islands/SessionComplete";
import { useReaderSettings } from "@/components/islands/ReaderSettings";
import UnitModeSwitcher from "@/components/islands/UnitModeSwitcher";
import type { Level } from "@/lib/progress";
import {
    cn,
    getLearnPath,
    getStoryPath,
    getStudyPath,
    getUnitPath,
    readUnitIdFromSearch,
    withUnitQuery,
} from "@/lib/utils";

interface Sentence {
    source: string;
    target: string;
    phonetic: string;
    breakdown?: Array<{
        source: string;
        target: string;
        phonetic: string;
        partOfSpeech?: string;
    }>;
}

interface StoryReaderProps {
    sentences: Sentence[];
    language: string;
    bookImageUrl?: string;
    title: { source: string; target: string };
    summary?: { source: string; target: string };
    difficulty?: string;
    storyId?: string;
    bookId?: string;
    isSample?: boolean;
    onComplete?: () => void;
    level?: Level;
    stepIndex?: number;
    nextHref?: string | null;
    nextLabel?: string | null;
    unitId?: string | null;
    unitPairMap?: Record<
        string,
        {
            unitId: string;
            unitTitle?: string;
            level?: Level;
            stepIndex?: number;
            deck?: {
                deckId: string;
                collectionId: string;
                name: string;
            } | null;
        }
    > | null;
    grammarMarkdown?: string | null;
}

type ViewMode = "read" | "translate";

type WordPiece = {
    source: string;
    target: string;
    phonetic: string;
    partOfSpeech?: string;
};

/** Collapsed POS buckets for subtle color coding */
type PosBucket =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "pronoun"
    | "particle"
    | "number"
    | "function"
    | "other";

const POS_BUCKET_META: Record<
    PosBucket,
    {
        label: string;
        /** Colored underline under Thai */
        underline: string;
        hover: string;
        tip: string;
    }
> = {
    noun: {
        label: "noun",
        underline: "border-sky-400/90",
        hover: "hover:bg-sky-50",
        tip: "noun / proper noun",
    },
    verb: {
        label: "verb",
        underline: "border-violet-400/90",
        hover: "hover:bg-violet-50",
        tip: "verb / auxiliary",
    },
    adjective: {
        label: "adj",
        underline: "border-amber-400/90",
        hover: "hover:bg-amber-50",
        tip: "adjective",
    },
    adverb: {
        label: "adv",
        underline: "border-orange-400/90",
        hover: "hover:bg-orange-50",
        tip: "adverb",
    },
    pronoun: {
        label: "pron",
        underline: "border-cyan-400/90",
        hover: "hover:bg-cyan-50",
        tip: "pronoun",
    },
    particle: {
        label: "part",
        underline: "border-rose-400/90",
        hover: "hover:bg-rose-50",
        tip: "particle / interjection / negation",
    },
    number: {
        label: "num",
        underline: "border-emerald-400/90",
        hover: "hover:bg-emerald-50",
        tip: "number / classifier",
    },
    function: {
        label: "func",
        underline: "border-stone-400/90",
        hover: "hover:bg-stone-50",
        tip: "preposition / conjunction / determiner",
    },
    other: {
        label: "other",
        underline: "border-fuchsia-400/80",
        hover: "hover:bg-fuchsia-50",
        tip: "phrase / question / other",
    },
};

const POS_DOT: Record<PosBucket, string> = {
    noun: "bg-sky-400",
    verb: "bg-violet-400",
    adjective: "bg-amber-400",
    adverb: "bg-orange-400",
    pronoun: "bg-cyan-400",
    particle: "bg-rose-400",
    number: "bg-emerald-400",
    function: "bg-stone-400",
    other: "bg-fuchsia-400",
};

function normalizePos(raw?: string | null): PosBucket | null {
    if (!raw?.trim()) return null;
    const p = raw.toLowerCase().trim();
    if (p === "noun" || p === "proper noun") return "noun";
    if (p === "verb" || p === "auxiliary") return "verb";
    if (p === "adjective") return "adjective";
    if (p === "adverb") return "adverb";
    if (p === "pronoun") return "pronoun";
    if (p === "particle" || p === "interjection" || p === "negation") {
        return "particle";
    }
    if (p === "number" || p === "classifier") return "number";
    if (
        p === "preposition" ||
        p === "conjunction" ||
        p === "determiner" ||
        p === "relative"
    ) {
        return "function";
    }
    return "other";
}

/** Low-scaffold levels get word-aligned Paiboon (ruby) when breakdown exists */
function isLowDifficulty(
    difficulty?: string | null,
    level?: Level | null,
): boolean {
    const d = (difficulty || level || "").toLowerCase();
    return d.includes("beginner") || d.includes("elementary");
}

function speakThai(text: string, languageCode: string) {
    if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        !text.trim()
    ) {
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode === "th" ? "th-TH" : languageCode;
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const voice =
        voices.find((v) => v.lang === "th-TH" || v.lang === "th") ||
        voices.find((v) => v.lang.startsWith("th")) ||
        voices.find((v) => v.lang.startsWith(languageCode));
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    }
    window.speechSynthesis.speak(utterance);
}

/**
 * Word-aligned Thai + Paiboon (phonetics above) + optional English gloss (below).
 * POS via subtle color underline + rich tooltip (not inline clutter).
 * Each word is clickable for TTS.
 *
 * Layout per token:
 *   sà-wàt-dii   ← Paiboon (if showPhonetics)
 *   สวัสดี        ← Thai (colored bottom edge = POS)
 *   hello        ← English gloss (if showEnglish)
 */
function ThaiRubyLine({
    words,
    showPhonetics,
    showEnglish,
    showPos,
    languageCode,
    thaiClass,
}: {
    words: WordPiece[];
    showPhonetics: boolean;
    showEnglish: boolean;
    showPos: boolean;
    languageCode: string;
    thaiClass: string;
}) {
    return (
        <div className="flex flex-wrap items-end gap-x-2.5 gap-y-3">
            {words.map((word, i) => {
                const bucket = showPos ? normalizePos(word.partOfSpeech) : null;
                const meta = bucket ? POS_BUCKET_META[bucket] : null;
                return (
                    <button
                        key={`${word.source}-${i}`}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            speakThai(word.source, languageCode);
                        }}
                        title={[
                            word.source,
                            word.phonetic && `/${word.phonetic}/`,
                            word.target && `= ${word.target}`,
                            showPos &&
                                word.partOfSpeech &&
                                `· ${word.partOfSpeech}`,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        className={cn(
                            "inline-flex max-w-[9rem] flex-col items-center rounded-md px-0.5 py-0.5 text-center transition-colors sm:max-w-[11rem]",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                            meta ? meta.hover : "hover:bg-orange-50",
                        )}
                    >
                        {showPhonetics && (
                            <span className="mb-0.5 w-full truncate text-[11px] font-medium italic leading-none text-stone-500 sm:text-xs">
                                {word.phonetic || "·"}
                            </span>
                        )}
                        <span
                            className={cn(
                                "font-thai font-medium text-stone-900",
                                // POS cue only when the Parts of speech toggle is on
                                bucket && meta && "border-b-2 pb-px",
                                bucket && meta?.underline,
                                thaiClass,
                            )}
                        >
                            {word.source}
                        </span>
                        {showEnglish && word.target ? (
                            <span className="mt-0.5 w-full text-[11px] font-medium leading-snug text-stone-600 sm:text-xs">
                                {word.target}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}

/** Compact legend — only buckets that appear in this story */
function PosLegend({ words }: { words: WordPiece[] }) {
    const present = new Set<PosBucket>();
    for (const w of words) {
        const b = normalizePos(w.partOfSpeech);
        if (b) present.add(b);
    }
    if (present.size === 0) return null;

    const order: PosBucket[] = [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "pronoun",
        "particle",
        "number",
        "function",
        "other",
    ];
    const items = order.filter((b) => present.has(b));

    return (
        <ul
            className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500"
            aria-label="Part of speech colors"
        >
            {items.map((b) => (
                <li key={b} className="inline-flex items-center gap-1">
                    <span
                        className={cn("h-1.5 w-3 rounded-full", POS_DOT[b])}
                        aria-hidden="true"
                    />
                    <span title={POS_BUCKET_META[b].tip}>
                        {POS_BUCKET_META[b].label}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default function StoryReader({
    sentences,
    language,
    title,
    summary,
    difficulty,
    bookImageUrl,
    storyId,
    bookId,
    isSample = false,
    onComplete,
    level,
    stepIndex,
    nextHref = null,
    nextLabel = null,
    unitId = null,
    unitPairMap = null,
    grammarMarkdown = null,
}: StoryReaderProps) {
    const [mode, setMode] = useState<ViewMode>("read");
    const { thaiStyle, fontSize, showPhonetics, showPos } = useReaderSettings();
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const [finished, setFinished] = useState(false);
    const [activeUnitId, setActiveUnitId] = useState<string | null>(unitId);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const fromUrl = readUnitIdFromSearch(window.location.search);
        if (fromUrl && unitPairMap && unitPairMap[fromUrl]) {
            setActiveUnitId(fromUrl);
        } else if (unitId) {
            setActiveUnitId(unitId);
        }
    }, [unitId, unitPairMap]);

    const resolvedLevel: Level | undefined =
        (activeUnitId && unitPairMap?.[activeUnitId]?.level) || level;
    const resolvedStepIndex: number | undefined =
        activeUnitId && unitPairMap?.[activeUnitId]
            ? unitPairMap[activeUnitId].stepIndex
            : stepIndex;
    const pairInfo = activeUnitId ? unitPairMap?.[activeUnitId] : null;
    const resolvedUnitTitle = pairInfo?.unitTitle || title.target;
    const pairedDeck = pairInfo?.deck ?? null;

    const storyHref =
        !isSample && activeUnitId && storyId && bookId
            ? withUnitQuery(getStoryPath(bookId, storyId), activeUnitId)
            : null;
    const cardsHref =
        !isSample && activeUnitId && pairedDeck
            ? withUnitQuery(
                  getStudyPath(pairedDeck.collectionId, pairedDeck.deckId),
                  activeUnitId,
              )
            : null;

    const modeSwitcher =
        !isSample && activeUnitId && cardsHref && storyHref ? (
            <UnitModeSwitcher
                unitId={activeUnitId}
                unitTitle={resolvedUnitTitle}
                active="reading"
                cardsHref={cardsHref}
                storyHref={storyHref}
                cardsLabel={pairInfo?.deck?.name ?? null}
                storyLabel={
                    title.target?.trim() || title.source?.trim() || null
                }
            />
        ) : null;

    const handleFinish = useCallback(() => {
        setFinished(true);
        onComplete?.();
    }, [onComplete]);

    const revealSentence = useCallback((index: number) => {
        setRevealed((prev) => new Set(prev).add(index));
    }, []);

    const hideSentence = useCallback((index: number) => {
        setRevealed((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
        });
    }, []);

    const revealAll = useCallback(() => {
        setRevealed(new Set(sentences.map((_, i) => i)));
    }, [sentences]);

    const hideAll = useCallback(() => {
        setRevealed(new Set());
    }, []);

    const thaiText = {
        sm: "text-lg leading-snug",
        base: "text-xl leading-snug sm:text-[1.35rem]",
        lg: "text-2xl leading-snug sm:text-[1.65rem]",
    }[fontSize];

    const enText = {
        sm: "text-sm leading-relaxed",
        base: "text-base leading-relaxed",
        lg: "text-lg leading-relaxed",
    }[fontSize];

    const lowScaffold = isLowDifficulty(difficulty, resolvedLevel);

    /** All breakdown words in this story (for POS legend) */
    const storyWords = useMemo(() => {
        const out: WordPiece[] = [];
        for (const s of sentences) {
            if (s.breakdown?.length) out.push(...s.breakdown);
        }
        return out;
    }, [sentences]);

    const shell = (body: ReactNode) => (
        <div className="mx-auto w-full max-w-4xl space-y-3">
            {/* Quiet secondary nav — content dominates */}
            {!isSample && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                        href={getLearnPath()}
                        className="inline-flex items-center gap-1 rounded text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
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
                            className="text-sm font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
                        >
                            Unit hub
                        </a>
                    ) : null}
                </div>
            )}
            {modeSwitcher}
            {body}
        </div>
    );

    if (finished && !isSample && storyId) {
        return shell(
            <SessionComplete
                kind="story"
                storyId={storyId}
                storyTitle={title.target}
                level={resolvedLevel}
                stepIndex={resolvedStepIndex}
                nextHref={nextHref}
                nextLabel={nextLabel}
                unitId={activeUnitId}
            />,
        );
    }

    // grammarMarkdown kept for call-site compatibility; Grammar lives in site nav
    void grammarMarkdown;

    return shell(
        <>
            {/* Title row — mirrors StudyMode header density */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                <h1 className="text-lg font-semibold text-stone-900 sm:text-xl">
                    {title.target}
                </h1>
                {difficulty ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800 ring-1 ring-emerald-100">
                        {difficulty}
                    </span>
                ) : null}
            </div>

            {/* Story page — one continuous surface; data-thai-style scopes Textbook vs Street font */}
            <article
                data-thai-style={thaiStyle}
                className={cn(
                    "overflow-hidden rounded-2xl border border-amber-100/80 bg-gradient-to-b from-amber-50/90 via-white to-white shadow-sm",
                    "ring-1 ring-amber-900/5",
                )}
            >
                {/* Compact story head */}
                <header className="flex gap-3 border-b border-amber-100/80 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                    {bookImageUrl ? (
                        <img
                            src={bookImageUrl}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-lg object-cover shadow-sm sm:h-16 sm:w-16"
                        />
                    ) : (
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-2xl sm:h-16 sm:w-16"
                            aria-hidden="true"
                        >
                            📖
                        </div>
                    )}
                    <div className="min-w-0 flex-1 self-center">
                        {title.source ? (
                            <p className="font-thai text-base font-semibold text-stone-800 sm:text-lg">
                                {title.source}
                            </p>
                        ) : null}
                        {summary ? (
                            <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">
                                {summary.target}
                            </p>
                        ) : null}
                    </div>
                </header>

                {/* Slim chrome: read/translate mode + reveal actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-paper/70 px-3 py-2 sm:px-4">
                    <div
                        className="inline-flex rounded-lg bg-stone-100 p-0.5"
                        role="group"
                        aria-label="Reading mode"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setMode("read");
                                hideAll();
                            }}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                                mode === "read"
                                    ? "bg-orange-800 text-white shadow-sm"
                                    : "text-stone-600 hover:text-stone-900",
                            )}
                        >
                            Read
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("translate");
                                hideAll();
                            }}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                                mode === "translate"
                                    ? "bg-orange-800 text-white shadow-sm"
                                    : "text-stone-600 hover:text-stone-900",
                            )}
                        >
                            Translate
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={revealAll}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-50 sm:text-sm"
                        >
                            Reveal all
                        </button>
                        <button
                            type="button"
                            onClick={hideAll}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-800 sm:text-sm"
                        >
                            Hide
                        </button>
                    </div>
                </div>

                {/* Continuous narrative column */}
                <div className="px-4 py-5 sm:px-8 sm:py-7 md:px-12">
                    <div className="mx-auto max-w-prose">
                        {mode === "read" ? (
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                                {lowScaffold
                                    ? "Tap a word to hear it · Show English for glosses + sentence"
                                    : "Read in Thai · Show English for the translation"}
                            </p>
                        ) : (
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                                Translate · tap a line for Thai
                            </p>
                        )}

                        {lowScaffold && showPos && storyWords.length > 0 ? (
                            <PosLegend words={storyWords} />
                        ) : null}

                        <div className="space-y-3">
                            {sentences.map((sentence, index) => {
                                const isRevealed = revealed.has(index);
                                const words = sentence.breakdown ?? [];
                                const useRuby = lowScaffold && words.length > 0;

                                const thaiBlock = (showWordEnglish: boolean) =>
                                    useRuby ? (
                                        <ThaiRubyLine
                                            words={words}
                                            showPhonetics={showPhonetics}
                                            showEnglish={showWordEnglish}
                                            showPos={showPos}
                                            languageCode={language}
                                            thaiClass={thaiText}
                                        />
                                    ) : (
                                        <div>
                                            <p
                                                className={cn(
                                                    "font-thai font-medium text-stone-900",
                                                    thaiText,
                                                )}
                                            >
                                                {sentence.source}
                                            </p>
                                            {showPhonetics &&
                                            sentence.phonetic ? (
                                                <p className="mt-0.5 text-sm italic text-stone-500">
                                                    {sentence.phonetic}
                                                </p>
                                            ) : null}
                                        </div>
                                    );

                                if (mode === "read") {
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "group rounded-xl border border-transparent px-2 py-2.5 transition-colors sm:px-3",
                                                isRevealed
                                                    ? "border-orange-100 bg-orange-50/70"
                                                    : "hover:bg-amber-50/50",
                                            )}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <SpeechButton
                                                    text={sentence.source}
                                                    languageCode={language}
                                                    size="sm"
                                                    className="mt-1 shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    {/* Thai / ruby — word glosses appear when English is shown */}
                                                    {thaiBlock(isRevealed)}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            isRevealed
                                                                ? hideSentence(
                                                                      index,
                                                                  )
                                                                : revealSentence(
                                                                      index,
                                                                  )
                                                        }
                                                        className={cn(
                                                            "mt-2 text-left text-xs font-semibold transition-colors",
                                                            isRevealed
                                                                ? "text-stone-500 hover:text-stone-800"
                                                                : "text-orange-800 hover:text-orange-950",
                                                        )}
                                                    >
                                                        {isRevealed
                                                            ? "Hide English"
                                                            : "Show English"}
                                                    </button>

                                                    {/* Full-sentence English (2nd part of Show English) */}
                                                    {isRevealed && (
                                                        <p
                                                            className={cn(
                                                                "mt-1.5 font-medium text-stone-600",
                                                                enText,
                                                            )}
                                                        >
                                                            {sentence.target}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Translate mode: English sentence first; Thai (+ word glosses) after reveal
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "group rounded-xl border border-transparent px-2 py-2.5 transition-colors sm:px-3",
                                            isRevealed
                                                ? "border-orange-100 bg-orange-50/70"
                                                : "hover:bg-amber-50/50",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                isRevealed
                                                    ? hideSentence(index)
                                                    : revealSentence(index)
                                            }
                                            className="w-full text-left"
                                        >
                                            <span
                                                className={cn(
                                                    "font-medium text-stone-800",
                                                    enText,
                                                )}
                                            >
                                                {sentence.target}
                                            </span>
                                        </button>
                                        {isRevealed && (
                                            <div className="mt-2 flex items-start gap-2.5">
                                                <SpeechButton
                                                    text={sentence.source}
                                                    languageCode={language}
                                                    size="sm"
                                                    className="mt-1 shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    {thaiBlock(true)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Finish — same teal CTA language as study complete */}
                {!isSample && storyId && (
                    <footer className="border-t border-amber-100/80 bg-amber-50/40 px-4 py-5 text-center sm:px-6">
                        <p className="text-sm text-stone-600">
                            Finished reading?
                        </p>
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="mt-2 inline-flex items-center justify-center rounded-xl bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            Mark story complete
                        </button>
                    </footer>
                )}
            </article>
        </>,
    );
}
