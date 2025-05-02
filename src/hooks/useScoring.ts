import { useState } from "react";

export type ScoringStatus = "unanswered" | "correct" | "incorrect";

export interface CardScore {
  cardId: string;
  status: ScoringStatus;
}

export interface UseScoringResult {
  scores: Record<string, ScoringStatus>;
  currentIndex: number;
  totalCorrect: number;
  totalIncorrect: number;
  answerCard: (cardId: string, isCorrect: boolean) => void;
  nextCard: () => void;
  reset: () => void;
}

export function useScoring(cardIds: string[]): UseScoringResult {
  const [scores, setScores] = useState<Record<string, ScoringStatus>>(
    Object.fromEntries(cardIds.map(id => [id, "unanswered"]))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalCorrect = Object.values(scores).filter(s => s === "correct").length;
  const totalIncorrect = Object.values(scores).filter(s => s === "incorrect").length;

  function answerCard(cardId: string, isCorrect: boolean) {
    setScores(prev => ({
      ...prev,
      [cardId]: isCorrect ? "correct" : "incorrect",
    }));
  }

  function nextCard() {
    setCurrentIndex(idx => Math.min(idx + 1, cardIds.length - 1));
  }

  function reset() {
    setScores(Object.fromEntries(cardIds.map(id => [id, "unanswered"])));
    setCurrentIndex(0);
  }

  return {
    scores,
    currentIndex,
    totalCorrect,
    totalIncorrect,
    answerCard,
    nextCard,
    reset,
  };
}
