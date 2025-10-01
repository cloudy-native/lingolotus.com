/**
 * Sunset Vibes Theme 🌅
 * Warm, energetic colors that inspire and motivate.
 * Orange (energy) + Pink (warmth)
 */

export const semanticColors = {
    // Background colors
    header: {
        flashcards: "orange.50",
        reading: "pink.50",
        default: "gray.50",
    },
    hero: {
        flashcards: "orange.50",
        reading: "pink.50",
        default: "gray.50",
    },
    card: {
        bg: "white",
        border: "gray.200",
    },
    section: {
        bg: "white",
        bgAlt: "orange.50",
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
        phonetic: "pink.600",
        supporting: "gray.600",
    },

    // Border colors
    border: {
        default: "gray.200",
        header: {
            flashcards: "orange.200",
            reading: "pink.200",
        },
    },

    // Feature-specific colors
    breakdown: {
        border: "pink.200",
        accent: "pink.600",
    },
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Use these for consistent tag coloring across the app.
 */
export const tagColorSchemes = {
    language: "orange",
    targetLanguage: "pink",
    difficulty: "purple",
    category: "red",
    featured: "yellow",
    theme: "primary",
    easy: "green",
    medium: "orange",
    hard: "red",
} as const;
