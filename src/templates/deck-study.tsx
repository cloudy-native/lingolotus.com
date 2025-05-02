import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  SimpleGrid,
  Spacer,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useLocation } from "@reach/router";
import { graphql, navigate } from "gatsby";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import SpeechHeading from "../components/SpeechHeading";
import TextToSpeech from "../components/TextToSpeech";
import { Deck, TranslationFlashcard } from "../types";
import { getLanguageInfo } from "../utils/language";
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
  const location = useLocation();
  const toast = useToast();

  const deck = data.decksJson;
  const params = new URLSearchParams(location.search);
  const studyLanguage = params.get("studyLanguage"); // 'target', 'source', or null
  const initialCardFrontLanguage: "source" | "target" =
    studyLanguage === "target" ? "target" : "source";

  // State for study session
  const [flipped, setFlipped] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);

  // Get study preferences from localStorage or use defaults
  const [studyCards, setStudyCards] = useState<TranslationFlashcard[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [cardFrontLanguage, setCardFrontLanguage] = useState<
    "source" | "target"
  >(initialCardFrontLanguage);

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

  // Handle answer submission
  const handleAnswer = (result: "correct" | "incorrect") => {
    goToNextCard();
  };

  // Current card
  const currentCard = studyCards[cardIndex];

  return (
    <>
      <Box py={4} px={{ base: 4, md: 8 }}>
        {/* Toggle for card front language */}
        <Flex justify="center" mb={4}>
          <HStack spacing={4}>
            {/* Target language button */}
            <Button
              colorScheme={cardFrontLanguage === "target" ? "blue" : "gray"}
              variant={cardFrontLanguage === "target" ? "solid" : "outline"}
              onClick={() => setCardFrontLanguage("target")}
              size="sm"
              leftIcon={
                <span>{getLanguageInfo(deck.targetLanguage).flag}</span>
              }
            >
              <VStack spacing={0} align="start">
                <Text fontWeight="bold">
                  {getLanguageInfo(deck.targetLanguage).englishName}
                </Text>
              </VStack>
            </Button>
            {/* Source language button */}
            <Button
              colorScheme={cardFrontLanguage === "source" ? "blue" : "gray"}
              variant={cardFrontLanguage === "source" ? "solid" : "outline"}
              onClick={() => setCardFrontLanguage("source")}
              size="sm"
              leftIcon={
                <span>{getLanguageInfo(deck.sourceLanguage).flag}</span>
              }
            >
              <VStack spacing={0} align="start">
                <Text fontWeight="bold">
                  {getLanguageInfo(deck.sourceLanguage).nativeName}
                </Text>
              </VStack>
            </Button>
          </HStack>
        </Flex>

        {/* Navigation and progress bar */}
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            leftIcon={<Icon as={ArrowLeft} />}
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
{/* 
        <Progress
          value={progressPercentage}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
          mb={8}
        /> */}

        {/* Card display */}
        {currentCard && (
          <Box maxW="800px" mx="auto" mb={8}>
            <Card
              bgGradient="linear(to-b, white, gray.50)"
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="2xl"
              overflow="hidden"
              minH={{ base: "340px", md: "400px" }}
              boxShadow="2xl"
              onClick={() => setFlipped(!flipped)}
              cursor="pointer"
              position="relative"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
            >
              <CardBody
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                p={{ base: 5, md: 8 }}
              >
                {!flipped ? (
                  // Front of card
                  <VStack spacing={5} w="100%">
                    <Box w="100%" px={{ base: 0, md: 6 }}>
                      {cardFrontLanguage === "source" ? (
                        <SpeechHeading
                          text={currentCard.frontContent.text}
                          lang={deck.sourceLanguage}
                          headingSize="xl"
                          mb={0}
                        />
                      ) : (
                        <SpeechHeading
                          text={currentCard.backContent.text}
                          lang={deck.targetLanguage}
                          headingSize="xl"
                          mb={0}
                        />
                      )}
                    </Box>

                    {cardFrontLanguage === "source" && currentCard.phonetic && (
                      <Text
                        color="gray.400"
                        fontSize="xl"
                        fontStyle="italic"
                        letterSpacing="wide"
                        mt={1}
                      >
                        /{currentCard.phonetic}/
                      </Text>
                    )}

                    {currentCard.partOfSpeech && (
                      <Tag
                        colorScheme="purple"
                        fontSize="md"
                        borderRadius="full"
                        px={4}
                        py={1}
                        mt={1}
                      >
                        {currentCard.partOfSpeech}
                      </Tag>
                    )}

                    <Spacer />

                    <Text fontSize="sm" color="gray.400" opacity={0.7}>
                      Tap or click anywhere to flip
                    </Text>
                  </VStack>
                ) : (
                  // Back of card
                  <VStack spacing={6} w="100%">
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={8}
                      w="100%"
                    >
                      <Box bg="gray.100" borderRadius="lg" p={4} boxShadow="sm">
                        <SpeechHeading
                          text={currentCard.frontContent.text}
                          lang={deck.sourceLanguage}
                          headingSize="lg"
                          mb={0}
                        />
                        {currentCard.phonetic && (
                          <Text
                            color="gray.400"
                            fontSize="lg"
                            fontStyle="italic"
                            letterSpacing="wide"
                            mt={1}
                            textAlign="left"
                          >
                            /{currentCard.phonetic}/
                          </Text>
                        )}
                      </Box>
                      <Box bg="gray.100" borderRadius="lg" p={4} boxShadow="sm">
                        <SpeechHeading
                          text={currentCard.backContent.text}
                          lang={deck.targetLanguage}
                          headingSize="lg"
                          mb={0}
                        />
                      </Box>
                    </SimpleGrid>

                    {currentCard.examples && (
                      <Box
                        w="100%"
                        bg="gray.50"
                        borderRadius="lg"
                        p={4}
                        mt={2}
                        boxShadow="xs"
                      >
                        <Text
                          fontWeight="bold"
                          color="gray.700"
                          mb={2}
                          fontSize="md"
                          textAlign="left"
                        >
                          Example{currentCard.examples.length > 1 ? "s" : ""}:
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {currentCard.examples.map((example, idx) => (
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
                                    lang={deck.targetLanguage}
                                  />
                                  <Text
                                    fontSize="md"
                                    color="gray.700"
                                    textAlign="left"
                                  >
                                    {example.translation}
                                  </Text>
                                </HStack>
                                <HStack spacing={2} align="center">
                                  <TextToSpeech
                                    text={example.original}
                                    lang={deck.sourceLanguage}
                                  />
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
                                  <Text
                                    fontSize="sm"
                                    color="gray.400"
                                    textAlign="left"
                                  >
                                    /{example.phonetic}/
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    <Spacer />

                    {currentCard.tags.length > 0 && (
                      <HStack spacing={2} wrap="wrap">
                        {currentCard.tags.map((tag, idx) => (
                          <Tag
                            key={idx}
                            colorScheme="blue"
                            borderRadius="full"
                            px={3}
                            fontSize="sm"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Card navigation and feedback buttons */}
            <HStack spacing={4} justify="center" mt={6}>
              <IconButton
                aria-label="Previous card"
                icon={<Icon as={ChevronLeft} />}
                onClick={goToPrevCard}
                isDisabled={cardIndex === 0}
                colorScheme="gray"
              />
              <IconButton
                aria-label="Next card"
                icon={<Icon as={ChevronRight} />}
                onClick={goToNextCard}
                isDisabled={cardIndex === studyCards.length - 1}
                colorScheme="gray"
              />
            </HStack>
          </Box>
        )}
      </Box>
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
