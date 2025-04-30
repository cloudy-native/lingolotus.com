// Basic content types for flashcards
export interface BaseContent {
  type: string;
}

export interface TextContent extends BaseContent {
  type: 'text';
  text: string;
}

// Core flashcard structure
export interface Flashcard {
  id: string;
  cardId: string;
  frontContent: TextContent;
  backContent: TextContent;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
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
  phonetic?: string; // Optional pronunciation guide
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'conjunction' | 'interjection' | 'phrase';
  context?: string; // Optional usage context
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
  theme: string;              // Theme of this deck (basics, food, etc.)
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  collectionId: string;       // Reference to parent collection
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
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  imageUrl?: string;
  featured?: boolean;         // Is this a featured collection?
}

// Type to track user progress during the session
export interface SessionProgress {
  currentCardIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  cardsReviewed: Set<string>; // Card IDs that have been reviewed
  cardStatistics: {
    [cardId: string]: {
      correctCount: number;
      incorrectCount: number;
      lastReviewed?: Date;
      confidenceLevel: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
    }
  };
}