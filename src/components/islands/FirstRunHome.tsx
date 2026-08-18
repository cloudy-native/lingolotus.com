import { useId } from "react";
import SpeechButton from "@/components/islands/SpeechButton";
import { LEVEL_LABELS, LEVELS, type Level } from "@/lib/progress";
import { emojiForLevel, emojiForUnit } from "@/lib/content-icons";
import { levelSurfaces } from "@/theme/warm-paper";
import { getBrowsePath, getOnboardingPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface FirstRunWord {
    thai: string;
    phonetic: string;
    english: string;
}

export interface FirstRunLine {
    thai: string;
    phonetic: string;
    english: string;
    words: FirstRunWord[];
}

export interface FirstRunCover {
    unitId: string;
    titleEn: string;
    titleTh: string;
    hookThai: string;
    hookEn: string;
    imageUrl: string;
    href: string;
}

export interface FirstRunPreview {
    lines: FirstRunLine[];
    covers: FirstRunCover[];
}

export const FIRST_RUN_LINE: FirstRunLine = {
    thai: "ไปไหน",
    phonetic: "bpai nǎi",
    english: "Where are you going?",
    words: [
        { thai: "ไป", phonetic: "bpai", english: "go" },
        { thai: "ไหน", phonetic: "nǎi", english: "where" },
    ],
};

const LEVEL_BAND = levelSurfaces;

function speakThai(text: string) {
    if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        !text.trim()
    ) {
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const voice =
        voices.find((v) => v.lang === "th-TH" || v.lang === "th") ||
        voices.find((v) => v.lang.startsWith("th"));
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    }
    window.speechSynthesis.speak(utterance);
}

/** Same word-aligned layout as beginning stories: phonetic / Thai / English. */
function SentenceRuby({ line }: { line: FirstRunLine }) {
    const words = line.words.length > 0 ? line.words : [];

    return (
        <div className="flex flex-col items-center">
            {words.length > 0 ? (
                <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-3">
                    {words.map((word, i) => (
                        <button
                            key={`${word.thai}-${i}`}
                            type="button"
                            onClick={() => speakThai(word.thai)}
                            title={[
                                word.thai,
                                word.phonetic && `/${word.phonetic}/`,
                                word.english && `= ${word.english}`,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            className="inline-flex max-w-[9rem] flex-col items-center rounded-md px-1 py-0.5 text-center transition-colors hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:max-w-[11rem]"
                        >
                            <span className="mb-1 w-full truncate text-xs font-medium italic leading-none text-orange-800/80 sm:text-sm">
                                {word.phonetic || "·"}
                            </span>
                            <span className="font-thai text-3xl font-bold leading-normal text-stone-900 sm:text-4xl">
                                {word.thai}
                            </span>
                            <span className="mt-1 w-full text-xs font-medium leading-snug text-stone-600 sm:text-sm">
                                {word.english}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="font-thai text-3xl font-bold leading-normal text-stone-900 sm:text-4xl">
                    {line.thai}
                </p>
            )}
            {line.english ? (
                <p className="mt-4 text-base font-medium text-stone-600 sm:text-lg">
                    {line.english}
                </p>
            ) : null}
            <SpeechButton
                text={line.thai}
                languageCode="th"
                tone="warm"
                label={`Listen: ${line.thai}`}
                className="mt-5"
            >
                <span aria-hidden="true">🔈</span>
                Listen
            </SpeechButton>
        </div>
    );
}

function CoverCard({ cover }: { cover: FirstRunCover }) {
    const emoji = emojiForUnit(cover.unitId, cover.titleEn);

    return (
        <a
            href={cover.href}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/70 bg-paper shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
            <div className="relative aspect-[5/4] overflow-hidden bg-stone-200 sm:aspect-[4/3]">
                <img
                    src={cover.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 font-thai text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
                    {cover.titleTh}
                </p>
            </div>
            <div className="flex flex-1 flex-col p-3.5">
                <p className="text-sm font-semibold text-stone-900 group-hover:text-orange-900">
                    <span aria-hidden="true">{emoji} </span>
                    {cover.titleEn}
                </p>
                <p className="mt-1 font-thai text-sm text-stone-800">
                    {cover.hookThai}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                    {cover.hookEn}
                </p>
                <p className="mt-auto pt-3 text-[11px] font-medium uppercase tracking-wide text-stone-500">
                    Cards + story
                </p>
            </div>
        </a>
    );
}

export default function FirstRunHome({
    preview,
    onSkipIntro,
}: {
    preview?: FirstRunPreview;
    onSkipIntro: (level: Level) => void;
}) {
    const stopsHeadingId = useId();
    const lines =
        preview?.lines && preview.lines.length > 0
            ? preview.lines
            : [FIRST_RUN_LINE];
    const covers = preview?.covers ?? [];

    return (
        <div className="relative -mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
            <div className="bg-gradient-to-b from-amber-50 via-orange-50/40 to-stone-100 px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    <header className="space-y-2 text-center">
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-900">
                            <span aria-hidden="true">🪷</span>
                            Lingo Lotus
                            <span className="font-thai font-normal text-orange-800/70">
                                · ภาษาไทย
                            </span>
                        </p>
                        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                            Learn Thai by reading it
                        </h1>
                    </header>

                    <section
                        aria-label="Hear a line of Thai"
                        className="rounded-3xl border border-amber-200/70 bg-paper p-5 shadow-sm sm:p-8"
                    >
                        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Tap a word to hear it
                        </p>
                        <SentenceRuby line={lines[0] ?? FIRST_RUN_LINE} />
                    </section>

                    <div className="space-y-3 text-center">
                        <p className="mx-auto max-w-lg text-base text-stone-600 sm:text-lg">
                            A few flashcards, then the same words in a short
                            story — phonetics on every line.
                        </p>
                        <p className="text-sm text-stone-500">
                            Free forever · No account · Progress saved on this
                            device
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <a
                            href={getOnboardingPath()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-800 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-orange-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[16rem]"
                        >
                            Start learning
                        </a>
                        <a
                            href={getBrowsePath()}
                            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-amber-50 hover:text-stone-900"
                        >
                            Browse the library
                        </a>
                    </div>

                    {covers.length > 0 && (
                        <section
                            aria-labelledby={stopsHeadingId}
                            className="space-y-3"
                        >
                            <div className="text-center sm:text-left">
                                <h2
                                    id={stopsHeadingId}
                                    className="text-lg font-bold text-stone-900"
                                >
                                    A peek at the first stops
                                </h2>
                                <p className="mt-0.5 text-sm text-stone-600">
                                    Cards and a matching story. Open any one, or
                                    start the guided intro.
                                </p>
                            </div>
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {covers.map((cover) => (
                                    <li key={cover.unitId}>
                                        <CoverCard cover={cover} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <details className="group rounded-2xl border border-amber-200/80 bg-paper/80">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-stone-800 marker:content-none [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center justify-between gap-2">
                                Not a beginner? Choose a level
                                <span
                                    className="text-stone-400 transition group-open:rotate-180"
                                    aria-hidden="true"
                                >
                                    ▾
                                </span>
                            </span>
                        </summary>
                        <div className="space-y-3 border-t border-amber-200/70 px-4 pb-4 pt-3">
                            <p className="text-xs leading-relaxed text-stone-600">
                                Skip the intro and open your path at this level.
                                You can change level anytime.
                            </p>
                            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {LEVELS.map((level) => (
                                    <li key={level}>
                                        <button
                                            type="button"
                                            onClick={() => onSkipIntro(level)}
                                            className={cn(
                                                "flex h-full w-full flex-col items-center rounded-xl border px-2 py-3 text-center text-sm font-semibold transition",
                                                "hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                                                LEVEL_BAND[level].soft,
                                                LEVEL_BAND[level].text,
                                            )}
                                        >
                                            <span
                                                className="text-xl"
                                                aria-hidden="true"
                                            >
                                                {emojiForLevel(level)}
                                            </span>
                                            <span className="mt-1">
                                                {LEVEL_LABELS[level]}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}
