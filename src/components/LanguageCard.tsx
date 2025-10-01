import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

import { semanticColors } from "../theme/colors";

interface LanguageCardProps extends BoxProps {
    children: React.ReactNode;
}

/**
 * Standardized card component for consistent styling across the app.
 * Use this for collection cards, book cards, deck cards, etc.
 */
export const LanguageCard: React.FC<LanguageCardProps> = ({
    children,
    ...props
}) => {
    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={semanticColors.card.border}
            bg={semanticColors.card.bg}
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-4px)", shadow: "md" }}
            {...props}
        >
            {children}
        </Box>
    );
};
