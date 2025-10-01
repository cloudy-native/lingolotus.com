/**
 * Design Tokens
 * Centralized design system values for consistency across the app
 */

export const tokens = {
    // Spacing scale (in Chakra UI space units)
    spacing: {
        xs: 2, // 8px
        sm: 3, // 12px
        md: 4, // 16px
        lg: 6, // 24px
        xl: 8, // 32px
        "2xl": 12, // 48px
        "3xl": 16, // 64px
    },

    // Border radius scale
    borderRadius: {
        sm: "md", // 6px
        md: "lg", // 8px
        lg: "xl", // 12px
    },

    // Shadow scale
    shadows: {
        card: "sm",
        cardHover: "md",
        header: "sm",
    },

    // Transition durations
    transitions: {
        fast: "0.15s",
        normal: "0.2s",
        slow: "0.3s",
    },

    // Card dimensions
    card: {
        imageHeight: "200px",
        padding: 5, // 20px
        borderWidth: "1px",
    },

    // Hover effects
    hover: {
        transform: "translateY(-4px)",
        transition: "all 0.3s",
    },

    // Icon sizes
    iconSize: {
        sm: 4, // 16px
        md: 5, // 20px
        lg: 6, // 24px
        xl: 7, // 28px
    },
} as const;

// Type-safe token access
export type Tokens = typeof tokens;
export type SpacingToken = keyof typeof tokens.spacing;
export type BorderRadiusToken = keyof typeof tokens.borderRadius;
