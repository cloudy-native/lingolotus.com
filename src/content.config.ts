import { defineCollection, } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod"

const flashcardCollections = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "data/flash-cards/collections" }),
  schema: z.object({
    collectionId: z.string(),
    name: z.string(),
    description: z.string(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    imageUrl: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const flashcardDecks = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "data/flash-cards/decks" }),
  schema: z.object({
    collectionId: z.string(),
    deckId: z.string(),
    name: z.string(),
    description: z.string(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    cards: z
      .array(
        z.object({
          frontContent: z.object({ type: z.literal("text"), text: z.string() }),
          backContent: z.object({ type: z.literal("text"), text: z.string() }),
          tags: z.array(z.string()),
          difficulty: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
          phonetic: z.string().optional(),
          partOfSpeech: z.string().optional(),
          context: z.string().optional(),
          examples: z
            .array(
              z.object({
                original: z.string(),
                translation: z.string(),
                phonetic: z.string().optional(),
              }),
            )
            .optional(),
        }),
      )
      .min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    theme: z.string(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: "*.json", base: "data/books" }),
  schema: z.object({
    bookId: z.string(),
    name: z.string(),
    description: z.string(),
    sourceLanguage: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    targetLanguage: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    imageUrl: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "data/books/stories" }),
  schema: z.object({
    storyId: z.string(),
    bookId: z.string(),
    language: z.string(),
    title: z.object({ source: z.string(), target: z.string() }),
    sentences: z
      .array(
        z.object({
          source: z.string(),
          target: z.string(),
          phonetic: z.string(),
          breakdown: z
            .array(
              z.object({
                source: z.string(),
                target: z.string(),
                phonetic: z.string(),
                partOfSpeech: z.string().optional(),
              }),
            )
            .optional(),
        }),
      )
      .min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    difficulty: z.string().optional(),
    summary: z
      .object({ source: z.string(), target: z.string() })
      .optional(),
  }),
});

const languages = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "data/languages" }),
  schema: z.object({
    languageCode: z.string(),
    language: z.string(),
    english: z.string(),
    flag: z.string(),
  }),
});

export const collections = {
  "flashcard-collections": flashcardCollections,
  "flashcard-decks": flashcardDecks,
  books,
  stories,
  languages,
};
