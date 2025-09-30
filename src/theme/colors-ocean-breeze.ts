/**
 * Ocean Breeze Theme 🌊
 * Cool, professional palette that promotes focus and clarity.
 * Blue (trust) + Cyan (clarity)
 */

export const semanticColors = {
	// Background colors
	header: {
		flashcards: "blue.50",
		reading: "cyan.50",
		default: "gray.50",
	},
	hero: {
		flashcards: "blue.50",
		reading: "cyan.50",
		default: "gray.50",
	},
	card: {
		bg: "white",
		border: "gray.200",
	},
	section: {
		bg: "white",
		bgAlt: "blue.50",
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
		phonetic: "cyan.600",
		supporting: "gray.600",
	},

	// Border colors
	border: {
		default: "gray.200",
		header: {
			flashcards: "blue.200",
			reading: "cyan.200",
		},
	},

	// Feature-specific colors
	breakdown: {
		border: "cyan.200",
		accent: "cyan.600",
	},
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Use these for consistent tag coloring across the app.
 */
export const tagColorSchemes = {
	language: "blue",
	targetLanguage: "cyan",
	difficulty: "indigo",
	category: "teal",
	featured: "yellow",
	theme: "primary",
	easy: "green",
	medium: "orange",
	hard: "red",
} as const;
