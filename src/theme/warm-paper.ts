/**
 * Warm paper — the site theme.
 *
 * Cream page, ivory cards, terracotta phonetics, clay actions.
 * Tailwind: paper / paper-page, orange (clay), stone (ink), amber (hairlines).
 */

export const paper = {
    card: "#fffaf3",
    page: "#f7f3ec",
} as const;

/** Level surfaces — warm, not clinic green/sky. */
export const levelSurfaces = {
    beginner: {
        ring: "ring-orange-200",
        bg: "bg-orange-700",
        soft: "bg-orange-50 border-orange-200",
        text: "text-orange-950",
        card: "border-orange-200 bg-orange-50/70 hover:border-orange-300",
        badge: "bg-orange-100 text-orange-950",
    },
    elementary: {
        ring: "ring-amber-200",
        bg: "bg-amber-700",
        soft: "bg-amber-50 border-amber-200",
        text: "text-amber-950",
        card: "border-amber-200 bg-amber-50/70 hover:border-amber-300",
        badge: "bg-amber-100 text-amber-950",
    },
    intermediate: {
        ring: "ring-rose-200",
        bg: "bg-rose-700",
        soft: "bg-rose-50 border-rose-200",
        text: "text-rose-950",
        card: "border-rose-200 bg-rose-50/70 hover:border-rose-300",
        badge: "bg-rose-100 text-rose-950",
    },
    advanced: {
        ring: "ring-stone-300",
        bg: "bg-stone-700",
        soft: "bg-stone-100 border-stone-300",
        text: "text-stone-900",
        card: "border-stone-300 bg-stone-100/80 hover:border-stone-400",
        badge: "bg-stone-200 text-stone-900",
    },
} as const;

/** Chakra-era shape kept so leftover docs/imports still typecheck. */
export const semanticColors = {
    header: {
        flashcards: "orange.50",
        reading: "amber.50",
        default: "stone.50",
    },
    hero: {
        flashcards: "orange.50",
        reading: "amber.50",
        default: "stone.50",
    },
    card: {
        bg: "paper",
        border: "amber.200",
    },
    section: {
        bg: "paper",
        bgAlt: "amber.50",
    },
    layout: {
        bg: "paper.page",
        footer: "amber.50",
    },
    text: {
        primary: "stone.900",
        secondary: "stone.600",
        muted: "stone.500",
        phonetic: "orange.800",
        supporting: "stone.600",
    },
    border: {
        default: "amber.200",
        header: {
            flashcards: "orange.200",
            reading: "amber.200",
        },
    },
    breakdown: {
        border: "orange.200",
        accent: "orange.800",
    },
} as const;

export const tagColorSchemes = {
    language: "orange",
    targetLanguage: "amber",
    difficulty: "rose",
    category: "stone",
    featured: "amber",
    theme: "primary",
    easy: "orange",
    medium: "amber",
    hard: "rose",
} as const;
