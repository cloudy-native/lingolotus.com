import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  Icon,
  Tag,
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp, Repeat } from "lucide-react";

import { TranslationFlashcard } from "../types";

interface FlashcardTemplateProps {
  card: TranslationFlashcard;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  showButtons?: boolean;
  isPreview?: boolean;
  showAnswer?: boolean;
}

/**
 * Reusable flashcard component that can be used in both study mode and preview mode
 */
const FlashcardTemplate: React.FC<FlashcardTemplateProps> = ({
  card,
  onCorrect,
  onIncorrect,
  showButtons = true,
  isPreview = false,
  showAnswer = false,
}) => {
  const [flipped, setFlipped] = useState<boolean>(showAnswer);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const frontBg = useColorModeValue("blue.50", "blue.900");
  const backBg = useColorModeValue("green.50", "green.900");

  const handleFlip = () => {
    if (!isPreview) {
      setFlipped(!flipped);
    }
  };

  const handleCorrect = () => {
    if (onCorrect) onCorrect();
  };

  const handleIncorrect = () => {
    if (onIncorrect) onIncorrect();
  };

  const difficultyColor = {
    easy: "green",
    medium: "yellow",
    hard: "red",
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={cardBorder}
      bg={cardBg}
      overflow="hidden"
      boxShadow="md"
      w="100%"
      maxW="600px"
      mx="auto"
    >
      {/* Card content */}
      <Box
        p={6}
        bg={flipped ? backBg : frontBg}
        onClick={handleFlip}
        cursor={isPreview ? "default" : "pointer"}
        transition="all 0.3s"
        minH="200px"
      >
        <VStack align="center" spacing={4}>
          {/* Front content or back content based on flip state */}
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            {flipped ? card.backContent.text : card.frontContent.text}
          </Text>

          {/* Show phonetic on front */}
          {!flipped && card.phonetic && (
            <Text fontSize="md" fontStyle="italic" color="gray.600">
              /{card.phonetic}/
            </Text>
          )}

          {/* Show part of speech on back */}
          {flipped && card.partOfSpeech && (
            <Tag colorScheme="purple">{card.partOfSpeech}</Tag>
          )}

          {/* Show example on back */}
          {flipped &&
            card.examples &&
            card.examples.length > 0 &&
            !isPreview && (
              <Box
                borderTopWidth="1px"
                borderColor={cardBorder}
                w="100%"
                pt={4}
                mt={4}
              >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Example:
                </Text>
                <Text fontStyle="italic">{card.examples[0].original}</Text>
                <Text>{card.examples[0].translation}</Text>
              </Box>
            )}

          {!isPreview && (
            <Text fontSize="xs" color="gray.500" mt={4}>
              {flipped ? "Click to see front" : "Click to see back"}
            </Text>
          )}
        </VStack>
      </Box>

      {/* Card footer with tags, difficulty, and feedback buttons */}
      <Box p={4}>
        <Flex direction="column" gap={3}>
          {/* Tags and difficulty */}
          <Flex justify="space-between" align="center">
            <HStack spacing={2} flexWrap="wrap">
              {card.tags.slice(0, 3).map((tag, index) => (
                <Tag key={index} colorScheme="blue">
                  {tag}
                </Tag>
              ))}
              {card.tags.length > 3 && (
                <Tag colorScheme="gray">+{card.tags.length - 3}</Tag>
              )}
            </HStack>
            <Tag colorScheme={difficultyColor[card.difficulty]}>
              {card.difficulty}
            </Tag>
          </Flex>

          {/* Additional details toggle */}
          {card.examples && card.examples.length > 0 && isPreview && (
            <Button
              size="sm"
              variant="ghost"
              rightIcon={showDetails ? <Icon as={ChevronUp} /> : <Icon as={ChevronDown} />}
              onClick={() => setShowDetails(!showDetails)}
              alignSelf="flex-start"
            >
              {showDetails ? "Hide details" : "Show details"}
            </Button>
          )}

          {/* Expanded details section */}
          {showDetails && isPreview && (
            <VStack
              align="stretch"
              spacing={2}
              mt={1}
              p={3}
              bg={useColorModeValue("gray.50", "gray.700")}
              borderRadius="md"
            >
              {card.examples && card.examples.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="bold" textAlign="left">
                    Examples:
                  </Text>
                  {card.examples.map((example, index) => (
                    <Box
                      key={index}
                      mb={index < (card.examples?.length ?? 0) - 1 ? 2 : 0}
                    >
                      <Text fontSize="sm" textAlign="left">
                        {example.translation}
                      </Text>
                      <Text fontSize="sm" textAlign="left">
                        {example.original}
                      </Text>
                      {example.phonetic && (
                        <Text fontSize="sm" color="gray.600" textAlign="left">
                          /{example.phonetic}/
                        </Text>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </VStack>
          )}

          {/* Feedback buttons */}
          {flipped && showButtons && !isPreview && (
            <HStack spacing={4} mt={2} justify="center">
              <Button colorScheme="red" onClick={handleIncorrect} flex={1}>
                Incorrect
              </Button>
              <Button colorScheme="green" onClick={handleCorrect} flex={1}>
                Correct
              </Button>
            </HStack>
          )}

          {isPreview && (
            <HStack spacing={4} mt={2} justify="center">
              <Button
                leftIcon={<Icon as={Repeat} />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => setFlipped(!flipped)}
              >
                Flip Card
              </Button>
            </HStack>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default FlashcardTemplate;
