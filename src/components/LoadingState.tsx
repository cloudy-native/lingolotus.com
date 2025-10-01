import { Box, Container, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import React from "react";

interface LoadingStateProps {
    variant?: "grid" | "list" | "detail";
    count?: number;
}

/**
 * Consistent loading skeleton component for all pages
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
    variant = "grid",
    count = 6,
}) => {
    if (variant === "grid") {
        return (
            <Container maxW="container.xl" py={8}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {Array.from({ length: count }).map((_, i) => (
                        <Box key={i}>
                            <Skeleton height="200px" borderRadius="lg" mb={4} />
                            <Skeleton height="24px" mb={2} />
                            <Skeleton height="16px" mb={2} />
                            <Skeleton height="16px" width="60%" />
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        );
    }

    if (variant === "list") {
        return (
            <Container maxW="container.xl" py={8}>
                <Stack spacing={4}>
                    {Array.from({ length: count }).map((_, i) => (
                        <Box key={i} borderWidth="1px" borderRadius="lg" p={6}>
                            <Skeleton height="24px" mb={3} width="40%" />
                            <Skeleton height="16px" mb={2} />
                            <Skeleton height="16px" width="80%" />
                        </Box>
                    ))}
                </Stack>
            </Container>
        );
    }

    if (variant === "detail") {
        return (
            <Container maxW="container.xl" py={8}>
                <Stack spacing={6}>
                    <Skeleton height="40px" width="60%" />
                    <Skeleton height="300px" borderRadius="lg" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" width="70%" />
                </Stack>
            </Container>
        );
    }

    return null;
};
