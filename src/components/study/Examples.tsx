import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import React from "react";
import TextToSpeech from "../speech/TextToSpeech";

interface Example {
    original: string;
    translation: string;
    phonetic?: string;
}

interface ExamplesProps {
    examples: Example[];
    sourceLanguage: string;
    targetLanguage: string;
}

const Examples: React.FC<ExamplesProps> = ({
    examples,
    sourceLanguage,
    targetLanguage,
}) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {examples.map((example) => (
                <Box
                    key={`${example.original}-${example.translation}`}
                    w="100%"
                    borderRadius="lg"
                    p={4}
                    mt={2}
                    boxShadow="xs"
                    bg="gray.50"
                >
                    <VStack align="start" gap={1} alignItems="left">
                        <HStack spacing={2} align="center">
                            <TextToSpeech
                                text={example.translation}
                                lang={targetLanguage}
                            />
                            <Text fontSize="md" textAlign="left">
                                {example.translation}
                            </Text>
                        </HStack>
                        <HStack spacing={2} align="center">
                            <TextToSpeech
                                text={example.original}
                                lang={sourceLanguage}
                            />
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                textAlign="left"
                            >
                                {example.original}
                            </Text>
                        </HStack>
                        {example.phonetic && (
                            <Text
                                fontSize="sm"
                                textAlign="left"
                                color="gray.500"
                            >
                                /{example.phonetic}/
                            </Text>
                        )}
                    </VStack>
                </Box>
            ))}
        </SimpleGrid>
    );
};

export default Examples;
