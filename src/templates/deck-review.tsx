import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { graphql } from "gatsby";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Repeat,
  Star,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import FlashcardTemplate from "../components/flashcard";
import { Deck, SessionProgress, TranslationFlashcard } from "../types";

interface FlashcardReviewTemplateProps {
  data: {
    decksJson: Deck<TranslationFlashcard>;
  };
  pageContext: {
    sessionId: string;
  };
}

const FlashcardReviewTemplate: React.FC<FlashcardReviewTemplateProps> = ({
  data,
  pageContext,
}) => {
  const { decksJson: deck } = data;
  const { sessionId } = pageContext;
  const toast = useToast();

  // Mock session data - in a real app, this would come from a database or localStorage
  const [sessionData, setSessionData] = useState<SessionProgress>({
    currentCardIndex: 0,
    correctAnswers: 15,
    incorrectAnswers: 5,
    cardsReviewed: new Set<string>(
      deck.cards.slice(0, 20).map((card) => card.id),
    ),
    cardStatistics: deck.cards.reduce((acc, card, index) => {
      // Create mock statistics based on card index for demonstration
      const isCorrect = index % 4 !== 3; // 75% correct rate
      return {
        ...acc,
        [card.id]: {
          correctCount: isCorrect ? 1 : 0,
          incorrectCount: isCorrect ? 0 : 1,
          lastReviewed: new Date(),
          confidenceLevel: isCorrect ? 4 : 2,
        },
      };
    }, {}),
  });

  // Filter options
  const [filterOption, setFilterOption] = useState<string>("all");

  // Filtered cards
  const [filteredCards, setFilteredCards] = useState<TranslationFlashcard[]>(
    deck.cards,
  );

  // Apply filters when option changes
  useEffect(() => {
    let newFilteredCards = [...deck.cards] as TranslationFlashcard[];

    switch (filterOption) {
      case "correct":
        newFilteredCards = newFilteredCards.filter(
          (card) =>
            sessionData.cardStatistics[card.id]?.correctCount > 0 &&
            sessionData.cardStatistics[card.id]?.incorrectCount === 0,
        );
        break;
      case "incorrect":
        newFilteredCards = newFilteredCards.filter(
          (card) => sessionData.cardStatistics[card.id]?.incorrectCount > 0,
        );
        break;
      case "unreviewed":
        newFilteredCards = newFilteredCards.filter(
          (card) => !sessionData.cardsReviewed.has(card.id),
        );
        break;
      case "lowConfidence":
        newFilteredCards = newFilteredCards.filter(
          (card) =>
            (sessionData.cardStatistics[card.id]?.confidenceLevel || 0) <= 2,
        );
        break;
      case "highConfidence":
        newFilteredCards = newFilteredCards.filter(
          (card) =>
            (sessionData.cardStatistics[card.id]?.confidenceLevel || 0) >= 4,
        );
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    setFilteredCards(newFilteredCards);
  }, [filterOption, sessionData, deck.cards]);

  // Calculate overall statistics
  const totalReviewed =
    sessionData.correctAnswers + sessionData.incorrectAnswers;
  const accuracyRate =
    totalReviewed > 0
      ? Math.round((sessionData.correctAnswers / totalReviewed) * 100)
      : 0;

  const boxBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header section */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Session Review: {deck.name}
          </Heading>
          <Text color="gray.600" mb={4}>
            Review your progress and performance in this study session
          </Text>

          {/* Session progress bar */}
          <Box mb={6}>
            <Flex justify="space-between" mb={1}>
              <Text fontWeight="medium">Session Progress</Text>
              <Text>
                {sessionData.cardsReviewed.size} of {deck.cards.length} cards
                reviewed
              </Text>
            </Flex>
            <Progress
              value={(sessionData.cardsReviewed.size / deck.cards.length) * 100}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
            />
          </Box>

          {/* Session statistics */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
            <Stat
              p={4}
              bg={boxBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <StatLabel>Accuracy</StatLabel>
              <StatNumber>{accuracyRate}%</StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={Check} color="green.500" />
                  <Text>{sessionData.correctAnswers} correct</Text>
                </HStack>
              </StatHelpText>
            </Stat>

            <Stat
              p={4}
              bg={boxBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <StatLabel>Mistakes</StatLabel>
              <StatNumber>{sessionData.incorrectAnswers}</StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={X} color="red.500" />
                  <Text>Incorrect answers</Text>
                </HStack>
              </StatHelpText>
            </Stat>

            <Stat
              p={4}
              bg={boxBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <StatLabel>Cards Reviewed</StatLabel>
              <StatNumber>{sessionData.cardsReviewed.size}</StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={Info} />
                  <Text>of {deck.cards.length} total</Text>
                </HStack>
              </StatHelpText>
            </Stat>

            <Stat
              p={4}
              bg={boxBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <StatLabel>Low Confidence</StatLabel>
              <StatNumber>
                {
                  Object.values(sessionData.cardStatistics).filter(
                    (stat) => stat.confidenceLevel <= 2,
                  ).length
                }
              </StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={Star} color="yellow.500" />
                  <Text>Cards to review again</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Filter section */}
        <Box mb={4}>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            align={{ md: "center" }}
          >
            <Heading as="h2" size="md">
              Review Cards
            </Heading>

            <Spacer />

            <HStack>
              <Text>Filter:</Text>
              <Select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                width={{ base: "full", md: "200px" }}
              >
                <option value="all">All Cards</option>
                <option value="correct">Correct Answers</option>
                <option value="incorrect">Incorrect Answers</option>
                <option value="unreviewed">Not Reviewed</option>
                <option value="lowConfidence">Low Confidence</option>
                <option value="highConfidence">High Confidence</option>
              </Select>
            </HStack>

            <Tooltip label="Start a new study session with these cards">
              <Button
                leftIcon={<Icon as={Repeat} />}
                colorScheme="blue"
                display={{ base: "none", md: "flex" }}
                onClick={() => {
                  toast({
                    title: "New session created",
                    description: `Starting review with ${filteredCards.length} cards`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                Study Again
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* Cards display */}
        {filteredCards.length > 0 ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {filteredCards.map((card) => {
              const stats = sessionData.cardStatistics[card.id];
              const wasReviewed = sessionData.cardsReviewed.has(card.id);
              const wasCorrect = stats?.correctCount > 0;

              return (
                <Box
                  key={card.id}
                  borderWidth="1px"
                  borderColor={
                    wasReviewed
                      ? wasCorrect
                        ? "green.200"
                        : "red.200"
                      : borderColor
                  }
                  borderRadius="lg"
                  p={4}
                >
                  <Flex justify="space-between" mb={2}>
                    <Tag
                      colorScheme={
                        !wasReviewed ? "gray" : wasCorrect ? "green" : "red"
                      }
                    >
                      {!wasReviewed
                        ? "Not Reviewed"
                        : wasCorrect
                          ? "Correct"
                          : "Incorrect"}
                    </Tag>

                    {stats && (
                      <HStack>
                        <Icon
                          as={Star}
                          color={
                            stats.confidenceLevel <= 2
                              ? "red.400"
                              : stats.confidenceLevel === 3
                                ? "yellow.400"
                                : "green.400"
                          }
                        />
                        <Text fontSize="sm">
                          Confidence: {stats.confidenceLevel}/5
                        </Text>
                      </HStack>
                    )}
                  </Flex>

                  <FlashcardTemplate
                    card={card}
                    showButtons={false}
                    isPreview={true}
                    showAnswer={true}
                  />

                  {stats && (
                    <HStack mt={4} justify="center" spacing={8}>
                      <VStack>
                        <Text fontSize="sm" color="gray.500">
                          Correct
                        </Text>
                        <Tag colorScheme="green" fontSize="md">
                          {stats.correctCount}
                        </Tag>
                      </VStack>
                      <VStack>
                        <Text fontSize="sm" color="gray.500">
                          Incorrect
                        </Text>
                        <Tag colorScheme="red" fontSize="md">
                          {stats.incorrectCount}
                        </Tag>
                      </VStack>
                      {stats.lastReviewed && (
                        <VStack>
                          <Text fontSize="sm" color="gray.500">
                            Last Reviewed
                          </Text>
                          <Text fontSize="sm">
                            {new Date(stats.lastReviewed).toLocaleDateString()}
                          </Text>
                        </VStack>
                      )}
                    </HStack>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Box
            p={8}
            textAlign="center"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={boxBg}
          >
            <Icon as={Info} boxSize={10} color="blue.500" mb={4} />
            <Heading as="h3" size="md" mb={2}>
              No Cards Match Filter
            </Heading>
            <Text mb={4}>Try selecting a different filter option.</Text>
            <Button onClick={() => setFilterOption("all")}>
              Show All Cards
            </Button>
          </Box>
        )}

        {/* Bottom navigation */}
        <Flex justify="space-between" mt={8}>
          <Button leftIcon={<Icon as={ArrowLeft} />} variant="outline">
            Back to Deck
          </Button>

          <Button
            rightIcon={<Icon as={Repeat} />}
            colorScheme="blue"
            display={{ base: "flex", md: "none" }}
            onClick={() => {
              toast({
                title: "New session created",
                description: `Starting review with ${filteredCards.length} cards`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Study Again
          </Button>

          <Button rightIcon={<Icon as={ArrowRight} />} colorScheme="teal">
            Next Deck
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default FlashcardReviewTemplate;

export const query = graphql`
  query DeckReviewById($collectionId: String!, $deckId: String!) {
    decksJson(collectionId: { eq: $collectionId }, deckId: { eq: $deckId }) {
      collectionId
      deckId
      name
      description
      sourceLanguage
      targetLanguage
      theme
      difficulty
      cards {
        cardId
        frontContent {
          type
          text
        }
        backContent {
          type
          text
        }
        tags
        difficulty
        sourceLanguage
        targetLanguage
        phonetic
        partOfSpeech
        context
        examples {
          original
          translation
          phonetic
        }
      }
    }
  }
`;
