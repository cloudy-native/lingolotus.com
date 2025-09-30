/**
 * Vibrant Lotus Theme 🪷✨
 * Bold, distinctive colors that make a statement.
 * Deep Purple (royal lotus) + Vibrant Orange (energy)
 * 
 * This theme uses deeper, more saturated colors for a striking,
 * memorable appearance while maintaining readability and professionalism.
 */

export const semanticColors = {
	// Background colors
	header: {
		flashcards: "purple.100",      // Richer purple
		reading: "orange.100",          // Vibrant orange
		default: "gray.50",
	},
	hero: {
		flashcards: "purple.100",
		reading: "orange.100",
		default: "gray.50",
	},
	card: {
		bg: "white",
		border: "gray.300",             // Slightly darker border for definition
	},
	section: {
		bg: "white",
		bgAlt: "purple.50",
	},
	layout: {
		bg: "white",
		footer: "gray.50",              // Lighter footer for contrast
	},

	// Text colors
	text: {
		primary: "gray.900",            // Darker for stronger contrast
		secondary: "gray.700",          // Bolder secondary text
		muted: "gray.600",              // Less muted
		phonetic: "purple.700",         // Deep purple for phonetics
		supporting: "gray.700",
	},

	// Border colors
	border: {
		default: "gray.300",
		header: {
			flashcards: "purple.300",   // Stronger purple border
			reading: "orange.300",      // Stronger orange border
		},
	},

	// Feature-specific colors
	breakdown: {
		border: "orange.300",           // Bold orange
		accent: "orange.700",           // Deep orange accent
	},
} as const;

/**
 * Tag color schemes by semantic meaning.
 * Using more vibrant, distinctive color schemes.
 */
export const tagColorSchemes = {
	language: "purple",                // Bold purple for languages
	targetLanguage: "orange",          // Bold orange for target
	difficulty: "pink",                // Pink for difficulty (stands out)
	category: "cyan",                  // Cyan for categories
	featured: "yellow",                // Keep yellow for featured
	theme: "primary",
	easy: "green",
	medium: "orange",
	hard: "red",
} as const;
