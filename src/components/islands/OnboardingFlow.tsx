import { useCallback, useMemo, useState } from "react";
import StudyMode from "@/components/islands/StudyMode";
import StoryReader from "@/components/islands/StoryReader";
import { ONBOARDING } from "@/lib/ladder";
import { markOnboardingComplete, skipOnboarding } from "@/lib/progress";
import { getHomePath, getLearnPath } from "@/lib/utils";

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

interface OnboardingFlowProps {
  cards: StudyCard[];
  deckName: string;
  story: {
    sentences: Sentence[];
    language: string;
    title: { source: string; target: string };
    summary?: { source: string; target: string };
    difficulty?: string;
  };
  bookImageUrl?: string;
  grammarMarkdown?: string | null;
}

type Phase = "intro" | "cards" | "bridge" | "reading" | "done";

export default function OnboardingFlow({
  cards,
  deckName,
  story,
  bookImageUrl,
  grammarMarkdown = null,
}: OnboardingFlowProps) {
  const [phase, setPhase] = useState<Phase>("intro");

  const sampleCards = useMemo(
    () => cards.slice(0, ONBOARDING.cardLimit),
    [cards],
  );

  const finish = useCallback(() => {
    markOnboardingComplete();
    setPhase("done");
  }, []);

  const skip = useCallback(() => {
    skipOnboarding("beginner");
    window.location.href = getLearnPath();
  }, []);

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <p className="text-sm font-medium text-teal-700">Quick start · ~5 minutes</p>
        <h1 className="text-3xl font-bold text-slate-900">
          A few words, then a tiny story
        </h1>
        <p className="text-slate-600">
          We’ll try {ONBOARDING.cardLimit} greeting cards, then a short beginner
          story with phonetics. No account needed.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPhase("cards")}
            className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white hover:bg-teal-800"
          >
            Let’s go
          </button>
          <button
            type="button"
            onClick={skip}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Skip intro
          </button>
        </div>
      </div>
    );
  }

  if (phase === "cards") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-teal-700">
            Intro · Cards (up to {sampleCards.length})
          </p>
          <button
            type="button"
            onClick={() => setPhase("bridge")}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Skip to story
          </button>
        </div>
        <StudyMode
          cards={sampleCards}
          deckName={deckName}
          collectionId={ONBOARDING.collectionId}
          deckId={ONBOARDING.deckId}
          isSample
          onSessionComplete={() => setPhase("bridge")}
          hideCompletionActions
        />
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setPhase("bridge")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Continue to story
          </button>
        </div>
      </div>
    );
  }

  if (phase === "bridge") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Nice start</h1>
        <p className="text-slate-600">
          Here’s how those words feel in a real mini-story.
        </p>
        <button
          type="button"
          onClick={() => setPhase("reading")}
          className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white hover:bg-teal-800"
        >
          Read a short story
        </button>
      </div>
    );
  }

  if (phase === "reading") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-teal-700">Intro · Reading</p>
        <StoryReader
          sentences={story.sentences}
          language={story.language}
          title={story.title}
          summary={story.summary}
          difficulty={story.difficulty}
          bookImageUrl={bookImageUrl}
          isSample
          onComplete={finish}
          grammarMarkdown={grammarMarkdown}
        />
        <div className="flex justify-center pb-8">
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Finish intro
          </button>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <h1 className="text-3xl font-bold text-slate-900">You’re set up</h1>
      <p className="text-slate-600">
        We’ll keep a simple path for you on this device. Free forever — no
        account.
      </p>
      <a
        href={getHomePath()}
        className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white hover:bg-teal-800"
      >
        Go to your Learn home
      </a>
    </div>
  );
}
