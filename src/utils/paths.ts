export function flashcardListPath() {
    return "/flash-cards";
}

export function collectionDetailPath(collectionId: string) {
    return `/flash-cards/${collectionId}`;
}

export function deckDetailPath(collectionId: string, deckId: string) {
    return `/flash-cards/${collectionId}/decks/${deckId}`;
}

export function studyDeckPath(
    collectionId: string,
    deckId: string,
    studyLanguage?: "source" | "target",
) {
    if (!studyLanguage) {
        return `/flash-cards/${collectionId}/decks/${deckId}/study`;
    }

    return `/flash-cards/${collectionId}/decks/${deckId}/study?studyLanguage=${studyLanguage}`;
}

export function readingPath() {
    return "/reading";
}

export function bookDetailPath(bookId: string) {
    return `/reading/${bookId}`;
}

export function storyDetailPath(bookId: string, storyId: string) {
    return `/reading/${bookId}/${storyId}`;
}
