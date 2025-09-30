/**
 * Original Theme (Current)
 * The original blue/orange color scheme.
 * Blue (flashcards) + Orange (reading)
 */

export const semanticColors = {
	// Background colors
	header: {
		flashcards: "blue.50",
		reading: "orange.50",
		default: "gray.50",
	},
	hero: {
		flashcards: "blue.50",
		reading: "blue.50",
		default: "gray.50",
	},
	card: {
		bg: "white",
		border: "gray.200",
	},
	section: {
		bg: "white",
		bgAlt: "gray.50",
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
		phonetic: "gray.500",
		supporting: "gray.600",
	},

	// Border colors
	border: {
		default: "gray.200",
		header: {
			flashcards: "blue.100",
			reading: "orange.100",
		},
	},

	// Feature-specific colors
	breakdown: {
		border: "orange.200",
		accent: "orange.600",
	},
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Use these for consistent tag coloring across the app.
 */
export const tagColorSchemes = {
	language: "blue",
	targetLanguage: "teal",
	difficulty: "purple",
	category: "orange",
	featured: "yellow",
	theme: "primary",
	easy: "green",
	medium: "yellow",
	hard: "red",
} as const;
