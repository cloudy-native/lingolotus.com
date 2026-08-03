import { useState, useCallback, useEffect } from "react";
import SpeechButton from "@/components/islands/SpeechButton";
import SessionComplete from "@/components/islands/SessionComplete";
import GrammarCheatsheet, {
  GrammarOpenButton,
} from "@/components/islands/GrammarCheatsheet";
import type { Level } from "@/lib/progress";
import { cn, readUnitIdFromSearch } from "@/lib/utils";

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
  isSample?: boolean;
  onComplete?: () => void;
  level?: Level;
  stepIndex?: number;
  nextHref?: string | null;
  nextLabel?: string | null;
  unitId?: string | null;
  /** unitId → pair (for ?unit= back-link + progress) */
  unitPairMap?: Record<
    string,
    { unitId: string; level?: Level; stepIndex?: number }
  > | null;
  /** Markdown grammar guide (from languages/grammar/{lang}.md) */
  grammarMarkdown?: string | null;
}

type StudyMode = "read" | "translate";
type FontSize = "sm" | "base" | "lg";

export default function StoryReader({
  sentences,
  language,
  title,
  summary,
  difficulty,
  bookImageUrl,
  storyId,
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
  const [mode, setMode] = useState<StudyMode>("read");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [showPhonetics, setShowPhonetics] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);
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
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const toggleBreakdown = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const revealAll = useCallback(() => {
    setRevealed(new Set(sentences.map((_, i) => i)));
  }, [sentences]);

  const hideAll = useCallback(() => {
    setRevealed(new Set());
    setExpanded(new Set());
  }, []);

  const fontSizeClass = {
    sm: "text-base",
    base: "text-lg",
    lg: "text-xl",
  }[fontSize];

  const thaiFontSizeClass = {
    sm: "text-lg",
    base: "text-xl",
    lg: "text-2xl",
  }[fontSize];

  if (finished && !isSample && storyId) {
    return (
      <SessionComplete
        kind="story"
        storyId={storyId}
        storyTitle={title.target}
        level={resolvedLevel}
        stepIndex={resolvedStepIndex}
        nextHref={nextHref}
        nextLabel={nextLabel}
        unitId={activeUnitId}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Story Header */}
      <header className="flex gap-4 rounded-xl bg-teal-50 p-6  sm:gap-6">
        {bookImageUrl && (
          <img
            src={bookImageUrl}
            alt={title.target}
            className="h-28 w-28 flex-shrink-0 rounded-lg object-cover shadow-md sm:h-36 sm:w-36"
          />
        )}
        <div>
          <p className="text-lg font-medium text-gray-900 ">
            {title.target}
          </p>
          {summary && (
            <>
              <p className="mt-1 font-thai text-gray-700 ">
                {summary.source}
              </p>
              <p className="text-sm text-gray-600 ">
                {summary.target}
              </p>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800  ">
              {language.toUpperCase()}
            </span>
            {difficulty && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800  ">
                {difficulty}
              </span>
            )}
          </div>
          {grammarMarkdown && (
            <div className="mt-3">
              <GrammarOpenButton
                onClick={() => setGrammarOpen(true)}
                expanded={grammarOpen}
              />
            </div>
          )}
        </div>
      </header>

      <GrammarCheatsheet
        open={grammarOpen}
        onClose={() => setGrammarOpen(false)}
        referenceMarkdown={grammarMarkdown}
        level={resolvedLevel ?? difficulty}
        languageCode={language}
      />

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 ">
          <button
            type="button"
            onClick={() => { setMode("read"); hideAll(); }}
            className={cn(
              "inline-flex items-center gap-2 rounded-l-lg px-5 py-2.5 text-sm font-medium transition-colors",
              mode === "read"
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50  "
            )}
          >
            📖 Read Mode
          </button>
          <button
            type="button"
            onClick={() => { setMode("translate"); hideAll(); }}
            className={cn(
              "inline-flex items-center gap-2 rounded-r-lg px-5 py-2.5 text-sm font-medium transition-colors",
              mode === "translate"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50  "
            )}
          >
            ✍️ Translate Mode
          </button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Font size — label “ก” scales with each option */}
        <div
          className="flex items-end gap-1"
          role="group"
          aria-label="Text size"
        >
          {(
            [
              { size: "sm" as const, labelClass: "text-sm", box: "h-8 min-w-8 px-1.5" },
              { size: "base" as const, labelClass: "text-lg", box: "h-9 min-w-9 px-2" },
              { size: "lg" as const, labelClass: "text-2xl", box: "h-11 min-w-11 px-2" },
            ] as const
          ).map(({ size, labelClass, box }) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              title={
                size === "sm"
                  ? "Small text"
                  : size === "base"
                    ? "Medium text"
                    : "Large text"
              }
              aria-label={
                size === "sm"
                  ? "Small text"
                  : size === "base"
                    ? "Medium text"
                    : "Large text"
              }
              aria-pressed={fontSize === size}
              className={cn(
                "inline-flex items-center justify-center rounded-md font-thai leading-none transition-colors",
                box,
                labelClass,
                fontSize === size
                  ? "bg-teal-100 text-teal-900 ring-1 ring-teal-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              )}
            >
              ก
            </button>
          ))}
        </div>

        {/* Reveal/Hide All */}
        <button
          type="button"
          onClick={revealAll}
          className="rounded-md border border-primary-300 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50   :bg-primary-950"
        >
          Reveal All
        </button>
        <button
          type="button"
          onClick={hideAll}
          className="text-sm text-gray-600 hover:text-gray-900  :text-gray-100"
        >
          Hide All
        </button>

        {/* Show Phonetics toggle */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700  cursor-pointer">
          Show Phonetics
          <button
            type="button"
            role="switch"
            aria-checked={showPhonetics}
            onClick={() => setShowPhonetics((prev) => !prev)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              showPhonetics ? "bg-teal-500" : "bg-gray-300 "
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                showPhonetics ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </label>
      </div>

      {/* Sentences */}
      <div className="space-y-4">
        {sentences.map((sentence, index) => {
          const isRevealed = revealed.has(index);
          const isExpanded = expanded.has(index);

          if (mode === "read") {
            // Read Mode: Show Thai first, reveal translation
            return (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4",
                  isRevealed
                    ? "border-green-200 bg-green-50  "
                    : "border-gray-200 bg-white  "
                )}
              >
                {!isRevealed ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("font-thai text-gray-900 ", thaiFontSizeClass)}>
                        {sentence.source}
                      </p>
                      <SpeechButton text={sentence.source} languageCode={language} />
                    </div>
                    {showPhonetics && (
                      <p className="mt-1 text-sm italic text-primary-600 ">
                        {sentence.phonetic}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => revealSentence(index)}
                      className="mt-2 inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Show Translation
                    </button>
                  </>
                ) : (
                  <>
                    {/* English translation first */}
                    <p className={cn("text-gray-900  font-medium", fontSizeClass)}>
                      {sentence.target}
                    </p>
                    {/* Thai text with speaker */}
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <p className={cn("font-thai text-gray-900 ", thaiFontSizeClass)}>
                        {sentence.source}
                      </p>
                      <SpeechButton text={sentence.source} languageCode={language} />
                    </div>
                    {/* +/- button inline with phonetic */}
                    {showPhonetics && (
                      <div className="mt-1 flex items-center gap-2">
                        {sentence.breakdown && sentence.breakdown.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleBreakdown(index)}
                            className={cn(
                              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                              isExpanded ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            {isExpanded ? "−" : "+"}
                          </button>
                        )}
                        <span className="text-sm italic text-primary-600 ">
                          {sentence.phonetic}
                        </span>
                      </div>
                    )}
                    {/* Word breakdown */}
                    {isExpanded && sentence.breakdown && sentence.breakdown.length > 0 && (
                      <div className="mt-2 border-l-2 border-primary-300 pl-4 space-y-1 ">
                        {sentence.breakdown.map((word, wi) => (
                          <div key={wi} className="flex items-center gap-2 text-sm text-gray-700">
                            <SpeechButton text={word.source} languageCode={language} />
                            <span className="italic text-primary-600">{word.phonetic}</span>
                            <span>{" → "}</span>
                            <span>{word.target}</span>
                            {word.partOfSpeech && (
                              <span className="text-gray-500"> ({word.partOfSpeech})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => hideSentence(index)}
                      className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900  :text-gray-100"
                    >
                      Hide Answer
                    </button>
                  </>
                )}
              </div>
            );
          }

          // Translate Mode: Show English first, reveal Thai
          return (
            <div
              key={index}
              className={cn(
                "rounded-lg border p-4",
                isRevealed
                  ? "border-green-200 bg-green-50  "
                  : "border-gray-200 bg-white  "
              )}
            >
              <p className={cn("text-gray-900  font-medium", fontSizeClass)}>
                {sentence.target}
              </p>
              {isRevealed ? (
                <>
                  {/* Thai text with speaker */}
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <p className={cn("font-thai text-gray-900 ", thaiFontSizeClass)}>
                      {sentence.source}
                    </p>
                    <SpeechButton text={sentence.source} languageCode={language} />
                  </div>
                  {/* +/- button inline with phonetic */}
                  {showPhonetics && (
                    <div className="mt-1 flex items-center gap-2">
                      {sentence.breakdown && sentence.breakdown.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleBreakdown(index)}
                          className={cn(
                            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                            isExpanded ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          {isExpanded ? "−" : "+"}
                        </button>
                      )}
                      <span className="text-sm italic text-primary-600 ">
                        {sentence.phonetic}
                      </span>
                    </div>
                  )}
                  {/* Word breakdown */}
                  {isExpanded && sentence.breakdown && sentence.breakdown.length > 0 && (
                    <div className="mt-2 border-l-2 border-primary-300 pl-4 space-y-1 ">
                      {sentence.breakdown.map((word, wi) => (
                        <p key={wi} className="text-sm text-gray-700 ">
                          🔊 <span className="italic text-primary-600 ">{word.phonetic}</span>
                          {" → "}
                          {word.target}
                          {word.partOfSpeech && (
                            <span className="text-gray-500 "> ({word.partOfSpeech})</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => hideSentence(index)}
                    className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900  :text-gray-100"
                  >
                    Hide Answer
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => revealSentence(index)}
                  className="mt-2 inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Show Answer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish story — marks progress / onboarding */}
      {!isSample && storyId && (
        <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">Finished reading?</p>
          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Mark story complete
          </button>
        </div>
      )}
    </div>
  );
}
