// Basic content types for flashcards
export interface BaseContent {
    type: string;
}

export interface TextContent extends BaseContent {
    type: "text";
    text: string;
}

// Core flashcard structure
export interface Flashcard {
    frontContent: TextContent;
    backContent: TextContent;
    tags: string[];
    difficulty: string;
    lastReviewed?: Date;
    nextReviewDate?: Date;
}

export interface TranslationExample {
    original: string;
    translation: string;
    phonetic?: string;
}

// Language translation flashcard
export interface TranslationFlashcard extends Flashcard {
    sourceLanguage: string;
    targetLanguage: string;
    phonetic?: string;
    partOfSpeech?: string;
    context?: string;
    examples?: TranslationExample[];
}

// Deck structure to hold collections of flashcards
export interface Deck<T extends Flashcard = Flashcard> {
    id: string;
    deckId: string;
    name: string;
    description: string;
    sourceLanguage: string;
    targetLanguage: string;
    cards: T[];
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: string;
    theme: string;
    difficulty?: "beginner" | "intermediate" | "advanced" | "mixed";
    collectionId: string;
}

// Collection structure to group related decks
export interface Collection {
    id: string;
    collectionId: string;
    name: string;
    description: string;
    sourceLanguage: string;
    targetLanguage: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: string;
    difficulty?: "beginner" | "intermediate" | "advanced" | "mixed";
    imageUrl?: string;
}

// Type to track user progress during the session
export interface SessionProgress {
    currentCardIndex: number;
}

// Reading story types
export interface Book {
    bookId: string;
    name: string;
    description: string;
    sourceLanguage: string;
    targetLanguage?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    imageUrl?: string;
}

export interface ReadingSentence {
    source: string;
    target: string;
    phonetic: string;
    breakdown?: ReadingSentenceBreakdown[];
}

export interface ReadingSentenceBreakdown {
    source: string;
    target: string;
    phonetic: string;
    partOfSpeech?: string;
}

export interface ReadingStoryTitle {
    source: string;
    target: string;
}

export interface ReadingStory {
    storyId: string;
    bookId: string;
    language: string;
    title: ReadingStoryTitle;
    sentences: ReadingSentence[];
    createdAt: Date | string;
    updatedAt: Date | string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    summary?: {
        source: string;
        target: string;
    };
}

// Language type (aligned with languages content collection schema)
export interface Language {
    languageCode: string;
    language: string;
    english: string;
    flag: string;
}

