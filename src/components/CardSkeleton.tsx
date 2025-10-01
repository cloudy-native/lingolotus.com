import { Box, Skeleton, Stack } from "@chakra-ui/react";
import React from "react";

import { LanguageCard } from "./LanguageCard";

interface CardSkeletonProps {
    count?: number;
    hasImage?: boolean;
}

/**
 * Loading skeleton for card components
 * Use this while loading collections, books, or decks
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
    count = 1,
    hasImage = true,
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <LanguageCard key={i} height="100%">
                    {hasImage && <Skeleton height="200px" width="100%" />}
                    <Box p={5}>
                        <Stack spacing={3}>
                            <Skeleton height="24px" width="70%" />
                            <Skeleton height="16px" />
                            <Skeleton height="16px" width="90%" />
                            <Skeleton height="16px" width="60%" />
                            <Skeleton height="20px" width="40%" mt={2} />
                        </Stack>
                    </Box>
                </LanguageCard>
            ))}
        </>
    );
};
