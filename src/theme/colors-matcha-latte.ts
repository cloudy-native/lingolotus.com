/**
 * Matcha Latte Theme 🍵
 * Earthy, sophisticated palette that feels organic and grounded.
 * Green (growth) + Yellow (optimism)
 */

export const semanticColors = {
    // Background colors
    header: {
        flashcards: "green.50",
        reading: "yellow.50",
        default: "gray.50",
    },
    hero: {
        flashcards: "green.50",
        reading: "yellow.50",
        default: "gray.50",
    },
    card: {
        bg: "white",
        border: "gray.200",
    },
    section: {
        bg: "white",
        bgAlt: "green.50",
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
        phonetic: "green.700",
        supporting: "gray.600",
    },

    // Border colors
    border: {
        default: "gray.200",
        header: {
            flashcards: "green.200",
            reading: "yellow.200",
        },
    },

    // Feature-specific colors
    breakdown: {
        border: "green.200",
        accent: "green.600",
    },
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Use these for consistent tag coloring across the app.
 */
export const tagColorSchemes = {
    language: "green",
    targetLanguage: "lime",
    difficulty: "orange",
    category: "yellow",
    featured: "amber",
    theme: "primary",
    easy: "green",
    medium: "orange",
    hard: "red",
} as const;
