/**
 * Emoji icons for curriculum units, levels, and browse directories.
 * Pure helpers — safe for SSG and client.
 */

import type { Level } from "./progress";

/** Level band icons + accent labels for path UI */
export const LEVEL_ICONS: Record<
  Level,
  { emoji: string; short: string; trail: string }
> = {
  beginner: { emoji: "🌱", short: "Start here", trail: "First words & daily life" },
  elementary: { emoji: "📘", short: "Grow", trail: "Longer talks & real days" },
  intermediate: { emoji: "🧭", short: "Explore", trail: "Errands, work & social life" },
  advanced: { emoji: "✨", short: "Deepen", trail: "Nuance, culture & stories" },
};

/** Explicit unitId → emoji (preferred over heuristics) */
const UNIT_EMOJI: Record<string, string> = {
  "beginner-greetings": "👋",
  "beginner-numbers": "🔢",
  "beginner-family": "👨‍👩‍👧",
  "beginner-food": "🍜",
  "beginner-colors": "🎨",
  "beginner-animals": "🐱",
  "beginner-places": "📍",
  "beginner-time": "🕐",
  "beginner-weather": "⛅",
  "beginner-daily-activities": "🏃",
  "beginner-skill-tones": "🎵",
  "elementary-new-friend": "🤝",
  "elementary-big-family": "🏠",
  "elementary-busy-day": "📅",
  "elementary-picnic-food": "🧺",
  "elementary-counting": "🧮",
  "elementary-day-time": "⏰",
  "elementary-colors": "🌈",
  "elementary-visiting-places": "🗺️",
  "elementary-weather": "🌦️",
  "elementary-adjectives": "💬",
  "elementary-skill-prepositions": "📌",
  "intermediate-market": "🛒",
  "intermediate-restaurant": "🍽️",
  "intermediate-shopping-clothes": "👕",
  "intermediate-travel": "✈️",
  "intermediate-work": "💼",
  "intermediate-health": "🏥",
  "intermediate-hobbies": "🎯",
  "intermediate-friends": "👥",
  "intermediate-party": "🎉",
  "intermediate-school": "🎓",
  "intermediate-interview": "📝",
  "intermediate-cooking": "👨‍🍳",
  "intermediate-weekend": "🏝️",
  "intermediate-language-exchange": "🗣️",
  "intermediate-museum": "🏛️",
  "intermediate-photography": "📷",
  "intermediate-charity-run": "🏃‍♂️",
  "intermediate-new-hobby": "🆕",
  "intermediate-community-garden": "🌿",
  "intermediate-book-club": "📚",
  "intermediate-skill-tones": "🎶",
  "advanced-phrases": "💛",
  "advanced-family-reunion": "👨‍👩‍👧‍👦",
  "advanced-new-city": "🏙️",
  "advanced-volunteer": "🤲",
  "advanced-mountains": "🏔️",
  "advanced-antique-shop": "🏺",
  "advanced-baking": "🥐",
  "advanced-music-festival": "🎪",
  "advanced-street-artist": "🎨",
  "advanced-library": "📖",
  "advanced-temple-stay": "🛕",
};

/** Deck id heuristics (browse / deck cards) */
const DECK_EMOJI: Record<string, string> = {
  greetings: "👋",
  "numbers-counting": "🔢",
  "thai-family": "👨‍👩‍👧",
  "food-dining": "🍜",
  colors: "🎨",
  "farm-animals": "🐱",
  places: "📍",
  time: "🕐",
  weather: "⛅",
  activities: "🏃",
  "tones-pronunciation-revised": "🎵",
  "common-adjectives": "💬",
  prepositions: "📌",
  shopping: "🛍️",
  "thai-travel": "✈️",
  occupations: "💼",
  "thai-medical": "🏥",
  "social-small-talk": "🗣️",
  "planning-invites": "🎉",
  "school-study": "🎓",
  "job-interview": "📝",
  "advanced-phrases": "💛",
};

const KEYWORD_EMOJI: Array<[RegExp, string]> = [
  [/greet|hello|polite/i, "👋"],
  [/number|count/i, "🔢"],
  [/family|reunion/i, "👨‍👩‍👧"],
  [/food|dining|restaurant|cook|bak|picnic/i, "🍜"],
  [/color/i, "🎨"],
  [/animal|pet|dog|cat/i, "🐱"],
  [/place|city|town|visit/i, "📍"],
  [/time|clock|day/i, "🕐"],
  [/weather|season/i, "⛅"],
  [/activit|hobby|sport|run/i, "🏃"],
  [/tone|pronunc/i, "🎵"],
  [/preposition|location/i, "📌"],
  [/market|shop/i, "🛒"],
  [/travel|airport|train/i, "✈️"],
  [/work|job|occupation|interview/i, "💼"],
  [/health|clinic|doctor|medical/i, "🏥"],
  [/friend|social|small.?talk/i, "👥"],
  [/party|invite|plan/i, "🎉"],
  [/school|study|student/i, "🎓"],
  [/museum/i, "🏛️"],
  [/photo/i, "📷"],
  [/garden|plant/i, "🌿"],
  [/book|library|read/i, "📚"],
  [/music|festival/i, "🎪"],
  [/artist|art/i, "🎨"],
  [/temple|monk|quiet/i, "🛕"],
  [/mountain/i, "🏔️"],
  [/volunteer|charity/i, "🤲"],
  [/antique/i, "🏺"],
  [/weekend|getaway|beach/i, "🏝️"],
  [/language.?exchange/i, "🗣️"],
  [/adjective/i, "💬"],
  [/phrase|softener|heart/i, "💛"],
];

export function emojiForUnit(
  unitId?: string | null,
  title?: string | null,
  unitType?: "theme" | "skill" | string | null,
): string {
  if (unitId && UNIT_EMOJI[unitId]) return UNIT_EMOJI[unitId];
  const hay = `${unitId ?? ""} ${title ?? ""}`;
  for (const [re, emoji] of KEYWORD_EMOJI) {
    if (re.test(hay)) return emoji;
  }
  if (unitType === "skill") return "🧩";
  return "🪷";
}

export function emojiForDeck(deckId?: string | null, name?: string | null): string {
  if (deckId && DECK_EMOJI[deckId]) return DECK_EMOJI[deckId];
  return emojiForUnit(deckId, name, "theme");
}

export function emojiForStory(title?: string | null, storyId?: string | null): string {
  return emojiForUnit(storyId, title, "theme");
}

export function emojiForLevel(level: Level): string {
  return LEVEL_ICONS[level].emoji;
}

/** Generic directory icons */
export const DIR_ICONS = {
  learn: "🪷",
  flashcards: "🃏",
  reading: "📖",
  browse: "🗂️",
  grammar: "📐",
  cards: "🃏",
  story: "📖",
  skill: "🧩",
  complete: "✅",
  partial: "◐",
  empty: "○",
} as const;
