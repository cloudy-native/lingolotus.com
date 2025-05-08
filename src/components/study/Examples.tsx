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
    <Box w="100%" bg="gray.50" borderRadius="lg" p={4} mt={2} boxShadow="xs">
      <Text
        fontWeight="bold"
        color="gray.700"
        mb={2}
        fontSize="md"
        textAlign="left"
      >
        Example{examples.length > 1 ? "s" : ""}:
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {examples.map((example, idx) => (
          <Box
            key={idx}
            borderLeft="4px solid #90cdf4"
            bg="white"
            borderRadius="md"
            p={3}
            mb={2}
            boxShadow="xs"
          >
            <VStack align="start" gap={1} alignItems="left">
              <HStack spacing={2} align="center">
                <TextToSpeech
                  text={example.translation}
                  lang={targetLanguage}
                />
                <Text fontSize="md" color="gray.700" textAlign="left">
                  {example.translation}
                </Text>
              </HStack>
              <HStack spacing={2} align="center">
                <TextToSpeech text={example.original} lang={sourceLanguage} />
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.600"
                  textAlign="left"
                >
                  {example.original}
                </Text>
              </HStack>
              {example.phonetic && (
                <Text fontSize="sm" color="gray.400" textAlign="left">
                  /{example.phonetic}/
                </Text>
              )}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Examples;
