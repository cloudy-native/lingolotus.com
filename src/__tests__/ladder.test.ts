import { describe, expect, it } from "vitest";
import { buildLadderCatalog, findNextIncompleteStep, getLevelLadder } from "../lib/ladder";

const catalog = buildLadderCatalog({
  collections: [
    { collectionId: "thai-english-beginner", difficulty: "beginner" },
    { collectionId: "thai-english-elementary", difficulty: "elementary" },
  ],
  decks: [
    {
      deckId: "greetings",
      collectionId: "thai-english-beginner",
      name: "Basic Thai Greetings",
    },
    {
      deckId: "common-adjectives",
      collectionId: "thai-english-beginner",
      name: "Thai Common Adjectives",
    },
    {
      deckId: "farm-animals",
      collectionId: "thai-english-elementary",
      name: "Farm Animals",
    },
  ],
  books: [
    { bookId: "thai-beginner-1", difficulty: "Beginner" },
    { bookId: "thai-beginner-2", difficulty: "Beginner" },
  ],
  stories: [
    {
      storyId: "thai-beginner-1-greetings",
      bookId: "thai-beginner-1",
      title: { source: "ทักทาย", target: "Greetings" },
    },
    {
      storyId: "thai-beginner-1-colors",
      bookId: "thai-beginner-1",
      title: { source: "สี", target: "Colors" },
    },
    {
      storyId: "thai-beginner-2-big-family",
      bookId: "thai-beginner-2",
      title: { source: "ครอบครัว", target: "My Big Family" },
    },
  ],
});

describe("buildLadderCatalog", () => {
  it("puts greetings first on beginner ladder", () => {
    const beginner = getLevelLadder(catalog, "beginner");
    expect(beginner.steps[0]?.deck?.deckId).toBe("greetings");
    // Stories zip by stable storyId order (colors before greetings alphabetically)
    expect(beginner.steps[0]?.story?.storyId).toBe("thai-beginner-1-colors");
  });

  it("indexes decks to paired stories", () => {
    expect(catalog.deckIndex.greetings.pairedStory?.storyId).toBe(
      "thai-beginner-1-colors",
    );
    expect(catalog.deckIndex["common-adjectives"].stepIndex).toBe(1);
  });

  it("caps elementary soft-linked stories to deck count", () => {
    const elementary = getLevelLadder(catalog, "elementary");
    expect(elementary.steps.length).toBe(1);
    expect(elementary.steps[0]?.deck?.deckId).toBe("farm-animals");
  });
});

describe("findNextIncompleteStep", () => {
  it("returns first incomplete half", () => {
    const beginner = getLevelLadder(catalog, "beginner");
    const next = findNextIncompleteStep(beginner, [], []);
    expect(next?.nextHalf).toBe("cards");
    expect(next?.step.deck?.deckId).toBe("greetings");
  });

  it("advances to reading after deck complete", () => {
    const beginner = getLevelLadder(catalog, "beginner");
    const next = findNextIncompleteStep(beginner, ["greetings"], []);
    expect(next?.nextHalf).toBe("reading");
    expect(next?.step.story?.storyId).toBe("thai-beginner-1-colors");
  });
});
