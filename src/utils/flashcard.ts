import {
    Deck,
    Flashcard,
    SessionProgress,
    TranslationFlashcard,
} from "../types";

// Factory function to create a new translation flashcard
export function createTranslationCard(
    id: string,
    sourceWord: string,
    targetWord: string,
    sourceLanguage: string,
    targetLanguage: string,
    options?: {
        phonetic?: string;
        partOfSpeech?: TranslationFlashcard["partOfSpeech"];
        context?: string;
        examples?: TranslationFlashcard["examples"];
        tags?: string[];
        difficulty?: Flashcard["difficulty"];
    },
): TranslationFlashcard {
    return {
        id,
        frontContent: {
            type: "text",
            text: sourceWord,
        },
        backContent: {
            type: "text",
            text: targetWord,
        },
        sourceLanguage,
        targetLanguage,
        phonetic: options?.phonetic,
        partOfSpeech: options?.partOfSpeech,
        context: options?.context,
        examples: options?.examples,
        tags: options?.tags || [],
        difficulty: options?.difficulty || "medium",
    };
}

// Factory function to create a new deck
export function createTranslationDeck(
    id: string,
    deckId: string,
    collectionId: string,
    name: string,
    description: string,
    sourceLanguage: string,
    targetLanguage: string,
    cards: TranslationFlashcard[] = [],
    options?: {
        category?: string;
        difficulty?: Deck["difficulty"];
        theme?: string;
    },
): Deck<TranslationFlashcard> {
    return {
        id,
        deckId,
        collectionId,
        name,
        description,
        sourceLanguage,
        targetLanguage,
        cards,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: options?.category,
        difficulty: options?.difficulty || "mixed",
        theme: options?.theme || "mixed",
    };
}
