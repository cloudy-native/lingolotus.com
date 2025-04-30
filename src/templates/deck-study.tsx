import {
  ArrowBackIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { graphql, navigate } from "gatsby";
import React, { useEffect, useState } from "react";

import { Deck, SessionProgress, TranslationFlashcard } from "../types";
import { deckDetailPath } from "../utils/paths";

interface DeckStudyTemplateProps {
  data: {
    decksJson: Deck<TranslationFlashcard>;
    collectionsJson: {
      id: string;
      name: string;
    };
  };
}

const DeckStudyTemplate: React.FC<DeckStudyTemplateProps> = ({ data }) => {
  const deck = data.decksJson;
  const collection = data.collectionsJson;
  const toast = useToast();

  // State for study session
  const [flipped, setFlipped] = useState<boolean>(false);
  const [showPhonetic, setShowPhonetic] = useState<boolean>(true);
  const [cardIndex, setCardIndex] = useState<number>(0);

  // Session progress tracking
  const [sessionProgress, setSessionProgress] = useState<SessionProgress>({
    currentCardIndex: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    cardsReviewed: new Set<string>(),
    cardStatistics: {},
  });

  // Get study preferences from localStorage or use defaults
  const [studyCards, setStudyCards] = useState<TranslationFlashcard[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Card appearance
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const cardHighlightBg = useColorModeValue("blue.50", "blue.900");

  // Helper function to shuffle array
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Initialize study session
  useEffect(() => {
    const initStudySession = () => {
      let preferences;

      try {
        preferences = JSON.parse(
          localStorage.getItem("studyPreferences") ||
            '{"type":"all","order":"default"}',
        );
      } catch (e) {
        preferences = { type: "all", order: "default" };
      }

      // Filter cards based on study type
      let cardsToStudy = [...deck.cards] as TranslationFlashcard[];

      if (preferences.type === "new") {
        // Logic for filtering new cards would go here
        // For now, just use all cards as an example
      } else if (preferences.type === "review") {
        // Logic for filtering review cards would go here
      } else if (preferences.type === "difficult") {
        cardsToStudy = cardsToStudy.filter(
          (card) => card.difficulty === "medium" || card.difficulty === "hard",
        );
      }

      // Sort cards based on order preference
      if (preferences.order === "random") {
        cardsToStudy = shuffleArray(cardsToStudy);
      } else if (preferences.order === "difficulty") {
        cardsToStudy.sort((a, b) => {
          const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
      }

      setStudyCards(cardsToStudy);

      // Initialize card statistics if they don't exist
      const initialCardStats = {};
      cardsToStudy.forEach((card) => {
        initialCardStats[card.cardId] = {
          correctCount: 0,
          incorrectCount: 0,
          confidenceLevel: 3, // Start at medium confidence
        };
      });

      setSessionProgress((prev) => ({
        ...prev,
        cardStatistics: {
          ...prev.cardStatistics,
          ...initialCardStats,
        },
      }));

      toast({
        title: "Study session started",
        description: `${cardsToStudy.length} cards loaded`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    };

    initStudySession();
  }, [deck.cards, toast]);

  // Handle card navigation
  const goToNextCard = () => {
    if (cardIndex < studyCards.length - 1) {
      setCardIndex(cardIndex + 1);
      setFlipped(false);
    } else {
      // End of deck
      onOpen(); // Open summary modal
    }
  };

  const goToPrevCard = () => {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setFlipped(false);
    }
  };

  // Handle card feedback
  const handleCardFeedback = (correct: boolean) => {
    const currentCard = studyCards[cardIndex];

    // Update session progress
    setSessionProgress((prev) => {
      const newCardsReviewed = new Set(prev.cardsReviewed);
      newCardsReviewed.add(currentCard.id);

      const newCardStats = { ...prev.cardStatistics };

      if (correct) {
        newCardStats[currentCard.cardId] = {
          ...newCardStats[currentCard.cardId],
          correctCount: newCardStats[currentCard.cardId].correctCount + 1,
          confidenceLevel: Math.min(
            5,
            newCardStats[currentCard.cardId].confidenceLevel + 1,
          ),
          lastReviewed: new Date(),
        };

        return {
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          cardsReviewed: newCardsReviewed,
          cardStatistics: newCardStats,
        };
      } else {
        newCardStats[currentCard.cardId] = {
          ...newCardStats[currentCard.cardId],
          incorrectCount: newCardStats[currentCard.cardId].incorrectCount + 1,
          confidenceLevel: Math.max(
            1,
            newCardStats[currentCard.cardId].confidenceLevel - 1,
          ),
          lastReviewed: new Date(),
        };

        return {
          ...prev,
          incorrectAnswers: prev.incorrectAnswers + 1,
          cardsReviewed: newCardsReviewed,
          cardStatistics: newCardStats,
        };
      }
    });

    // Go to next card
    goToNextCard();
  };

  // Calculate progress percentage
  const progressPercentage =
    (sessionProgress.cardsReviewed.size / studyCards.length) * 100;

  // Current card
  const currentCard = studyCards[cardIndex];

  // Modal to show study session summary
  const SessionSummaryModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Study Session Complete</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box textAlign="center">
              <Heading size="md" mb={2}>
                Session Statistics
              </Heading>
              <HStack justify="center" spacing={8} mb={4}>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {sessionProgress.correctAnswers}
                  </Text>
                  <Text>Correct</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {sessionProgress.incorrectAnswers}
                  </Text>
                  <Text>Incorrect</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {studyCards.length}
                  </Text>
                  <Text>Total Cards</Text>
                </VStack>
              </HStack>

              <Box mb={4}>
                <Text mb={2}>Accuracy</Text>
                <Progress
                  value={
                    (sessionProgress.correctAnswers /
                      (sessionProgress.correctAnswers +
                        sessionProgress.incorrectAnswers)) *
                      100 || 0
                  }
                  colorScheme="green"
                  borderRadius="md"
                  height="20px"
                />
                <Text mt={1}>
                  {Math.round(
                    (sessionProgress.correctAnswers /
                      (sessionProgress.correctAnswers +
                        sessionProgress.incorrectAnswers)) *
                      100 || 0,
                  )}
                  %
                </Text>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={2}>
                Hard Cards to Review
              </Heading>
              {Object.entries(sessionProgress.cardStatistics)
                .filter(([id, stats]) => stats.confidenceLevel <= 2)
                .slice(0, 3)
                .map(([id, stats]) => {
                  const card = studyCards.find((c) => c.id === id);
                  return card ? (
                    <Box
                      key={id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      mb={2}
                    >
                      <Flex justify="space-between">
                        <Text fontWeight="bold">{card.frontContent.text}</Text>
                        <Badge colorScheme="red">
                          Confidence: {stats.confidenceLevel}/5
                        </Badge>
                      </Flex>
                      <Text>{card.backContent.text}</Text>
                    </Box>
                  ) : null;
                })}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() =>
              navigate(deckDetailPath(deck.collectionId, deck.deckId))
            }
          >
            Back to Deck
          </Button>
          <Button
            colorScheme="teal"
            onClick={() => {
              setCardIndex(0);
              setFlipped(false);
              setSessionProgress({
                currentCardIndex: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                cardsReviewed: new Set<string>(),
                cardStatistics: {},
              });
              onClose();
              // initStudySession();
            }}
          >
            Restart Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <>
      <Box py={4} px={{ base: 4, md: 8 }}>
        {/* Navigation and progress bar */}
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            leftIcon={<ArrowBackIcon />}
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(deckDetailPath(deck.collectionId, deck.deckId))
            }
          >
            Back to Deck
          </Button>

          <HStack>
            <Text fontWeight="medium">
              {cardIndex + 1}/{studyCards.length}
            </Text>
          </HStack>
        </Flex>

        <Progress
          value={progressPercentage}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
          mb={8}
        />

        {/* Card display */}
        {currentCard && (
          <Box maxW="800px" mx="auto" mb={8}>
            <Card
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              height="400px"
              boxShadow="lg"
              onClick={() => setFlipped(!flipped)}
              cursor="pointer"
              position="relative"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-2px)" }}
            >
              <CardBody
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                p={8}
              >
                {!flipped ? (
                  // Front of card
                  <VStack spacing={4}>
                    <Heading size="lg" mb={2}>
                      {currentCard.frontContent.text}
                    </Heading>

                    {showPhonetic && currentCard.phonetic && (
                      <Text color="gray.500" fontSize="lg">
                        /{currentCard.phonetic}/
                      </Text>
                    )}

                    {currentCard.partOfSpeech && (
                      <Badge colorScheme="purple" fontSize="0.8em">
                        {currentCard.partOfSpeech}
                      </Badge>
                    )}

                    <Spacer />

                    <Text fontSize="sm" color="gray.500">
                      Click to flip card
                    </Text>
                  </VStack>
                ) : (
                  // Back of card
                  <VStack spacing={4}>
                    <SimpleGrid columns={2} spacing={20}>
                      <Box>
                        <Heading size="lg" mb={2}>
                          {currentCard.frontContent.text}
                        </Heading>

                        {showPhonetic && currentCard.phonetic && (
                          <Text color="gray.500" fontSize="md">
                            /{currentCard.phonetic}/
                          </Text>
                        )}
                      </Box>
                      <Box>
                        <Heading size="lg" mb={2}>
                          {currentCard.backContent.text}
                        </Heading>

                        {currentCard.context && (
                          <Text fontSize="md" color="gray.600">
                            {currentCard.context}
                          </Text>
                        )}
                      </Box>
                    </SimpleGrid>

                    {currentCard.examples && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                        {currentCard.examples.map((example, idx) => (
                          <Box key={idx} mt={4} pt={2} width="100%">
                            <VStack gap={1}>
                              <Text fontSize="md" color="gray.600">
                                {example.translation}
                              </Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {example.original}
                              </Text>
                              {example.phonetic && (
                                <Text fontSize="md" color="gray.600">
                                  /{example.phonetic}/
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}

                    <Spacer />

                    <HStack>
                      {currentCard.tags.map((tag, idx) => (
                        <Badge key={idx} colorScheme="blue" variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Card navigation and feedback buttons */}
            <HStack spacing={4} justify="center" mt={6}>
              <IconButton
                aria-label="Previous card"
                icon={<ChevronLeftIcon />}
                onClick={goToPrevCard}
                isDisabled={cardIndex === 0}
                colorScheme="gray"
              />

              {flipped && (
                <>
                  <Button
                    leftIcon={<CloseIcon />}
                    colorScheme="red"
                    onClick={() => handleCardFeedback(false)}
                  >
                    Incorrect
                  </Button>

                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={() => handleCardFeedback(true)}
                  >
                    Correct
                  </Button>
                </>
              )}

              <IconButton
                aria-label="Next card"
                icon={<ChevronRightIcon />}
                onClick={goToNextCard}
                isDisabled={cardIndex === studyCards.length - 1 && !flipped}
                colorScheme="gray"
              />
            </HStack>
          </Box>
        )}
      </Box>

      <SessionSummaryModal />
    </>
  );
};

export default DeckStudyTemplate;

export const query = graphql`
  query DeckStudyById($deckId: String!, $collectionId: String!) {
    decksJson(deckId: { eq: $deckId }) {
      collectionId
      deckId
      name
      description
      sourceLanguage
      targetLanguage
      createdAt
      updatedAt
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
    collectionsJson(collectionId: { eq: $collectionId }) {
      id
      name
    }
  }
`;
