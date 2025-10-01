import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";

interface PageLoaderProps {
    message?: string;
}

/**
 * Full-page loading spinner for async operations
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
    message = "Loading...",
}) => {
    return (
        <Center minH="60vh">
            <VStack spacing={4}>
                <Spinner
                    size="xl"
                    thickness="4px"
                    speed="0.65s"
                    color="blue.500"
                />
                <Text color="gray.600" fontSize="lg">
                    {message}
                </Text>
            </VStack>
        </Center>
    );
};
