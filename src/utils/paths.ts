export function collectionListPath() {
  return '/collections';
}

export function collectionDetailPath(collectionId: string) {
  return `/collections/${collectionId}`;
}

export function deckDetailPath(collectionId: string, deckId: string) {
  return `/collections/${collectionId}/decks/${deckId}`;
}

export function studyDeckPath(collectionId: string, deckId: string, studyLanguage?: 'source' | 'target') {
  if (!studyLanguage) {
    return `/collections/${collectionId}/decks/${deckId}/study`;
  }

  return `/collections/${collectionId}/decks/${deckId}/study?studyLanguage=${studyLanguage}`;
}

export function deckReviewPath(collectionId: string, deckId: string) {
  return `/collections/${collectionId}/decks/${deckId}/review`;
}

