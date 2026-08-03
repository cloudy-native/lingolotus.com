import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for conditional class merging.
 * Handles Tailwind CSS class conflicts intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// URL Path Generation
// ---------------------------------------------------------------------------

/** Returns the homepage / Learn hub path */
export function getHomePath(): string {
  return "/";
}

/** Returns the Learn hub path (alias of home) */
export function getLearnPath(): string {
  return "/";
}

/** Returns the Browse hub path */
export function getBrowsePath(): string {
  return "/browse";
}

/** Returns the onboarding path */
export function getOnboardingPath(): string {
  return "/onboarding";
}

/** Returns a curriculum unit hub path */
export function getUnitPath(unitId: string): string {
  return `/unit/${unitId}`;
}

/** Append `?unit=` so study/story sessions keep unit context for pair CTAs */
export function withUnitQuery(
  path: string,
  unitId?: string | null,
): string {
  if (!unitId) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}unit=${encodeURIComponent(unitId)}`;
}

/** Read unit id from a query string (e.g. window.location.search) */
export function readUnitIdFromSearch(search: string): string | null {
  try {
    const id = new URLSearchParams(search).get("unit");
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

/** Returns the flash cards listing path */
export function getFlashCardsPath(): string {
  return "/flash-cards";
}

/** Returns the collection detail path */
export function getCollectionPath(collectionId: string): string {
  return `/flash-cards/${collectionId}`;
}

/** Returns the deck detail path */
export function getDeckPath(collectionId: string, deckId: string): string {
  return `/flash-cards/${collectionId}/decks/${deckId}`;
}

/** Returns the deck study mode path */
export function getStudyPath(collectionId: string, deckId: string): string {
  return `/flash-cards/${collectionId}/decks/${deckId}/study`;
}

/** Returns the reading (books) listing path */
export function getReadingPath(): string {
  return "/reading";
}

/** Returns the book detail path */
export function getBookPath(bookId: string): string {
  return `/reading/${bookId}`;
}

/** Returns the story detail path */
export function getStoryPath(bookId: string, storyId: string): string {
  return `/reading/${bookId}/${storyId}`;
}

// ---------------------------------------------------------------------------
// Referential Integrity Validation
// ---------------------------------------------------------------------------

export interface ReferentialIntegrityError {
  type: "orphaned-deck" | "orphaned-story";
  /** The entity that has the broken reference */
  entityId: string;
  /** The field that contains the broken reference */
  field: string;
  /** The value that doesn't match any parent */
  referencedId: string;
  /** Human-readable error message */
  message: string;
}

export interface ReferentialIntegrityResult {
  valid: boolean;
  errors: ReferentialIntegrityError[];
}

/**
 * Validates that every deck's collectionId references an existing collection.
 * Returns errors for any orphaned decks.
 */
export function validateDeckReferences(
  decks: Array<{ deckId: string; collectionId: string }>,
  collections: Array<{ collectionId: string }>,
): ReferentialIntegrityResult {
  const collectionIds = new Set(collections.map((c) => c.collectionId));
  const errors: ReferentialIntegrityError[] = [];

  for (const deck of decks) {
    if (!collectionIds.has(deck.collectionId)) {
      errors.push({
        type: "orphaned-deck",
        entityId: deck.deckId,
        field: "collectionId",
        referencedId: deck.collectionId,
        message: `Deck "${deck.deckId}" references collection "${deck.collectionId}" which does not exist`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that every story's bookId references an existing book.
 * Returns errors for any orphaned stories.
 */
export function validateStoryReferences(
  stories: Array<{ storyId: string; bookId: string }>,
  books: Array<{ bookId: string }>,
): ReferentialIntegrityResult {
  const bookIds = new Set(books.map((b) => b.bookId));
  const errors: ReferentialIntegrityError[] = [];

  for (const story of stories) {
    if (!bookIds.has(story.bookId)) {
      errors.push({
        type: "orphaned-story",
        entityId: story.storyId,
        field: "bookId",
        referencedId: story.bookId,
        message: `Story "${story.storyId}" references book "${story.bookId}" which does not exist`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all referential integrity constraints.
 * Combines deck→collection and story→book validation.
 */
export function validateReferentialIntegrity(
  decks: Array<{ deckId: string; collectionId: string }>,
  collections: Array<{ collectionId: string }>,
  stories: Array<{ storyId: string; bookId: string }>,
  books: Array<{ bookId: string }>,
): ReferentialIntegrityResult {
  const deckResult = validateDeckReferences(decks, collections);
  const storyResult = validateStoryReferences(stories, books);

  const allErrors = [...deckResult.errors, ...storyResult.errors];
  return { valid: allErrors.length === 0, errors: allErrors };
}
