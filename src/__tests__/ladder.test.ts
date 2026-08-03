import { describe, expect, it } from "vitest";
import {
  buildLadderCatalog,
  findNextIncompleteStep,
  getLevelLadder,
} from "../lib/ladder";

const baseInput = {
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
      deckId: "colors",
      collectionId: "thai-english-beginner",
      name: "Thai Colors",
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
};

const unitCatalog = buildLadderCatalog({
  ...baseInput,
  units: [
    {
      unitId: "beginner-greetings",
      level: "beginner",
      order: 1,
      type: "theme",
      title: { en: "Greetings & polite speech" },
      deckId: "greetings",
      storyId: "thai-beginner-1-greetings",
      bookId: "thai-beginner-1",
    },
    {
      unitId: "beginner-colors",
      level: "beginner",
      order: 2,
      type: "theme",
      title: { en: "Colors" },
      deckId: "colors",
      storyId: "thai-beginner-1-colors",
      bookId: "thai-beginner-1",
    },
    {
      unitId: "elementary-animals",
      level: "elementary",
      order: 1,
      type: "theme",
      title: { en: "Animals" },
      deckId: "farm-animals",
      storyId: "thai-beginner-2-big-family",
      bookId: "thai-beginner-2",
    },
  ],
});

describe("buildLadderCatalog with units", () => {
  it("pairs greetings deck with greetings story", () => {
    const beginner = getLevelLadder(unitCatalog, "beginner");
    expect(beginner.steps[0]?.deck?.deckId).toBe("greetings");
    expect(beginner.steps[0]?.story?.storyId).toBe(
      "thai-beginner-1-greetings",
    );
    expect(beginner.steps[0]?.unitTitle).toBe("Greetings & polite speech");
  });

  it("indexes decks to thematically paired stories", () => {
    expect(unitCatalog.deckIndex.greetings.pairedStory?.storyId).toBe(
      "thai-beginner-1-greetings",
    );
    expect(unitCatalog.deckIndex.colors.pairedStory?.storyId).toBe(
      "thai-beginner-1-colors",
    );
  });

  it("builds elementary from units", () => {
    const elementary = getLevelLadder(unitCatalog, "elementary");
    expect(elementary.steps.length).toBe(1);
    expect(elementary.steps[0]?.deck?.deckId).toBe("farm-animals");
  });
});

describe("findNextIncompleteStep", () => {
  it("returns first incomplete half", () => {
    const beginner = getLevelLadder(unitCatalog, "beginner");
    const next = findNextIncompleteStep(beginner, [], []);
    expect(next?.nextHalf).toBe("cards");
    expect(next?.step.deck?.deckId).toBe("greetings");
  });

  it("advances to reading after deck complete", () => {
    const beginner = getLevelLadder(unitCatalog, "beginner");
    const next = findNextIncompleteStep(beginner, ["greetings"], []);
    expect(next?.nextHalf).toBe("reading");
    expect(next?.step.story?.storyId).toBe("thai-beginner-1-greetings");
  });
});

describe("buildLadderCatalog legacy zip", () => {
  it("still works without units", () => {
    const legacy = buildLadderCatalog(baseInput);
    const beginner = getLevelLadder(legacy, "beginner");
    // Legacy zip: priority greetings first when present
    expect(beginner.steps[0]?.deck?.deckId).toBe("greetings");
    expect(beginner.steps.length).toBeGreaterThan(0);
  });
});
