import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

import { semanticColors } from "../theme/colors";
import { tokens } from "../theme/tokens";

interface LanguageCardProps extends BoxProps {
    children: React.ReactNode;
}

/**
 * Standardized card component for consistent styling across the app.
 * Use this for collection cards, book cards, deck cards, etc.
 *
 * Uses design tokens for consistent spacing, borders, and hover effects.
 */
export const LanguageCard: React.FC<LanguageCardProps> = ({
    children,
    ...props
}) => {
    return (
        <Box
            borderWidth={tokens.card.borderWidth}
            borderRadius={tokens.borderRadius.md}
            borderColor={semanticColors.card.border}
            bg={semanticColors.card.bg}
            overflow="hidden"
            boxShadow={tokens.shadows.card}
            transition={tokens.hover.transition}
            _hover={{
                transform: tokens.hover.transform,
                boxShadow: tokens.shadows.cardHover,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};
