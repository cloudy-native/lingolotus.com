import { useState, useCallback, useEffect, useRef } from "react";
import SpeechButton from "@/components/islands/SpeechButton";
import SessionComplete, {
  type PairedStoryInfo,
} from "@/components/islands/SessionComplete";
import { FlippableCard } from "@/components/ui/card";
import {
  clearDeckSession,
  loadProgress,
  resumeCardIndex,
  saveDeckSession,
  type CardResult,
  type Level,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

interface StudyCard {
  frontContent: { type: string; text: string };
  backContent: { type: string; text: string };
  phonetic?: string;
  partOfSpeech?: string;
  context?: string;
  tags?: string[];
  examples?: Array<{ original: string; translation: string; phonetic?: string }>;
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
  deckId,
  isSample = false,
  onSessionComplete,
  hideCompletionActions = false,
  pairedStory = null,
  storyAlreadyComplete = false,
  level,
  stepIndex,
}: StudyModeProps) {
  const total = cards.length;
  const hydrated = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [languageDisplay, setLanguageDisplay] = useState<LanguageDisplay>("source");
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
    if (saved && saved.total === total && saved.cardResults.length === total) {
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
        { level, stepIndex, touchLastActivity: true },
      );
    },
    [deckId, isSample, level, stepIndex, total],
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
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

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

  const frontContent = (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6">
      <div className="flex items-center justify-center gap-2">
        <p className="text-3xl md:text-4xl font-bold text-center text-gray-900  font-thai">
          {getFrontText()}
        </p>
        <SpeechButton
          text={getFrontText()}
          languageCode={languageDisplay === "source" ? currentCard.sourceLanguage : currentCard.targetLanguage}
        />
      </div>
      {currentCard.phonetic && languageDisplay === "source" && (
        <p className="mt-3 text-lg text-slate-500 italic">
          /{currentCard.phonetic}/
        </p>
      )}
      {currentCard.partOfSpeech && (
        <span className="mt-6 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700  ">
          {currentCard.partOfSpeech}
        </span>
      )}
      <p className="mt-6 text-sm text-slate-500">
        Tap or click anywhere to flip
      </p>
    </div>
  );

  const backContent = (
    <div className="flex flex-col p-6">
      {/* Translation word with context */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-3">
        <p className="text-2xl md:text-3xl font-bold text-slate-900">
          {getBackText()}
        </p>
        {currentCard.context && (
          <p className="mt-1 text-sm text-slate-600">
            {currentCard.context}
          </p>
        )}
      </div>

      {/* Source word + phonetic */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-slate-900 font-thai">
              {languageDisplay === "source"
                ? currentCard.frontContent.text
                : currentCard.backContent.text}
            </p>
            {currentCard.phonetic && (
              <p className="text-sm text-slate-500 italic">
                /{currentCard.phonetic}/
              </p>
            )}
          </div>
          <SpeechButton
            text={languageDisplay === "source" ? currentCard.frontContent.text : currentCard.backContent.text}
            languageCode={languageDisplay === "source" ? currentCard.sourceLanguage : currentCard.targetLanguage}
          />
        </div>
      </div>

      {/* Examples */}
      {currentCard.examples && currentCard.examples.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {currentCard.examples.map((example, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-medium text-slate-900">
                {example.translation}
              </p>
              <p className="text-sm text-slate-700 font-thai">
                {example.original}
              </p>
              {example.phonetic && (
                <p className="text-xs italic text-slate-500">
                  /{example.phonetic}/
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {currentCard.tags && currentCard.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {currentCard.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (!ready || !currentCard) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-sm text-slate-500" aria-busy="true">
        Loading progress…
      </div>
    );
  }

  const progressBar = (
    <>
      {/* Progress bar — clickable, colored by answer */}
      <div className="mb-4 flex gap-0.5" role="list" aria-label="Card progress">
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
        <span className="text-gray-600">
          Remaining: {remaining}
        </span>
      </div>
    </>
  );

  if (showComplete && hideCompletionActions) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        {progressBar}
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Cards done</p>
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
        <div className="text-center">
          <span className="text-lg font-semibold text-slate-900">{deckName}</span>
        </div>
        {progressBar}
        <SessionComplete
          kind="deck"
          deckId={deckId}
          deckName={deckName}
          level={level}
          stepIndex={stepIndex}
          pairedStory={pairedStory}
          storyAlreadyComplete={storyAlreadyComplete}
          correct={correct}
          incorrect={incorrect}
          total={total}
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header row: deck name + counter + language toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-center flex-1">
          <span className="text-lg font-semibold text-slate-900">
            {deckName}
          </span>
          <span className="ml-3 text-lg text-teal-700">
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
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          aria-label="Previous card"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
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
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          aria-label="Next card"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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
