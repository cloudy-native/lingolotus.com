import { useState } from "react";

export type ScoringStatus = "unanswered" | "correct" | "incorrect";

export interface CardScore {
    id: string;
    status: ScoringStatus;
}

export interface UseScoringResult {
    scores: Record<string, ScoringStatus>;
    currentIndex: number;
    totalCorrect: number;
    totalIncorrect: number;
    answerCard: (id: string, isCorrect: boolean) => void;
    nextCard: () => void;
    reset: () => void;
}

export function useScoring(ids: string[]): UseScoringResult {
    const [scores, setScores] = useState<Record<string, ScoringStatus>>(
        Object.fromEntries(ids.map((id) => [id, "unanswered"])),
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    const totalCorrect = Object.values(scores).filter(
        (s) => s === "correct",
    ).length;
    const totalIncorrect = Object.values(scores).filter(
        (s) => s === "incorrect",
    ).length;

    function answerCard(id: string, isCorrect: boolean) {
        setScores((prev) => ({
            ...prev,
            [id]: isCorrect ? "correct" : "incorrect",
        }));
    }

    function nextCard() {
        setCurrentIndex((idx) => Math.min(idx + 1, ids.length - 1));
    }

    function reset() {
        setScores(Object.fromEntries(ids.map((id) => [id, "unanswered"])));
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
