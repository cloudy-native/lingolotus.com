/**
 * Zen Garden Theme 🌸
 * A calming, nature-inspired palette perfect for learning.
 * Purple (lotus flower) + Teal (water/growth)
 */

export const semanticColors = {
    // Background colors
    header: {
        flashcards: "purple.50",
        reading: "teal.50",
        default: "gray.50",
    },
    hero: {
        flashcards: "purple.50",
        reading: "teal.50",
        default: "gray.50",
    },
    card: {
        bg: "white",
        border: "gray.200",
    },
    section: {
        bg: "white",
        bgAlt: "purple.50",
    },
    layout: {
        bg: "white",
        footer: "gray.100",
    },

    // Text colors
    text: {
        primary: "gray.800",
        secondary: "gray.600",
        muted: "gray.500",
        phonetic: "purple.600",
        supporting: "gray.600",
    },

    // Border colors
    border: {
        default: "gray.200",
        header: {
            flashcards: "purple.200",
            reading: "teal.200",
        },
    },

    // Feature-specific colors
    breakdown: {
        border: "teal.200",
        accent: "teal.600",
    },
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Use these for consistent tag coloring across the app.
 */
export const tagColorSchemes = {
    language: "teal",
    targetLanguage: "cyan",
    difficulty: "purple",
    category: "pink",
    featured: "yellow",
    theme: "primary",
    easy: "green",
    medium: "orange",
    hard: "red",
} as const;
