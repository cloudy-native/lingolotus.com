/**
 * Bold Lotus Theme 🪷⚡
 * Confident and modern with rich, saturated colors.
 * Deep Indigo (authority) + Vibrant Pink (energy) + Rich Teal (growth)
 * 
 * A sophisticated palette that commands attention without overwhelming.
 * Perfect for a premium learning experience.
 */

export const semanticColors = {
    // Background colors - Using bolder shades for impact
    header: {
        flashcards: "primary.200",  // Rich indigo background
        reading: "teal.200",        // Bold teal background
        default: "gray.100",
    },
    hero: {
        flashcards: "primary.100",  // Slightly lighter for hero
        reading: "teal.100",
        default: "gray.50",
    },
    card: {
        bg: "white",
        border: "gray.400",         // Stronger borders
    },
    section: {
        bg: "white",
        bgAlt: "primary.100",       // Bolder alternate background
    },
    layout: {
        bg: "gray.50",
        footer: "gray.300",         // Stronger footer
    },

    // Text colors - Darker for better contrast
    text: {
        primary: "gray.900",
        secondary: "gray.800",      // Darker secondary
        muted: "gray.600",
        phonetic: "primary.700",    // Bolder phonetic text
        supporting: "gray.700",
    },

    // Border colors - More prominent
    border: {
        default: "gray.400",
        header: {
            flashcards: "primary.400",  // Bold indigo borders
            reading: "teal.400",        // Bold teal borders
        },
    },

    // Feature-specific colors
    breakdown: {
        border: "primary.400",
        accent: "primary.700",      // Stronger accent
    },
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Bold, saturated colors for clear visual hierarchy.
 */
export const tagColorSchemes = {
    language: "primary",    // Deep indigo for source language (uses custom primary)
    targetLanguage: "teal", // Rich teal for target language
    difficulty: "purple",   // Rich purple for difficulty levels
    category: "orange",     // Vibrant orange for categories
    featured: "accent",     // Gold accent for featured content
    theme: "primary",       // Brand primary color
    easy: "green",          // Emerald for easy
    medium: "orange",       // Coral for medium
    hard: "red",            // Bold red for hard
} as const;
