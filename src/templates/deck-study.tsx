import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    IconButton,
    Tooltip,
} from "@chakra-ui/react";
import { useLocation } from "@reach/router";
import { graphql, HeadFC } from "gatsby";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import Flashcard from "../components/study/Flashcard";
import NavigationHeader from "../components/study/NavigationHeader";
import { useScoring } from "../hooks/useScoring";
import { Deck, TranslationFlashcard } from "../types";

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

    const deck = data.decksJson;
    const params = new URLSearchParams(location.search);
    const studyLanguage = params.get("studyLanguage"); // 'target', 'source', or null
    const initialCardFrontLanguage: "source" | "target" =
        studyLanguage === "target" ? "target" : "source";

    // State for study session
    const [flipped, setFlipped] = useState<boolean>(false);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const [studyCards, setStudyCards] = useState<TranslationFlashcard[]>([]);
    const [cardFrontLanguage, setCardFrontLanguage] = useState<
        "source" | "target"
    >(initialCardFrontLanguage);

    // Initialize study session
    useEffect(() => {
        initStudySession();
    }, [deck.cards]);

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
        } else if (preferences.type === "review") {
            // Logic for filtering review cards would go here
        } else if (preferences.type === "difficult") {
            cardsToStudy = cardsToStudy.filter(
                (card) =>
                    card.difficulty === "medium" || card.difficulty === "hard",
            );
        }

        // Sort cards based on order preference
        if (preferences.order === "random") {
            cardsToStudy = shuffleArray(cardsToStudy);
        } else if (preferences.order === "difficulty") {
            cardsToStudy.sort((a, b) => {
                const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
                return (
                    difficultyOrder[a.difficulty] -
                    difficultyOrder[b.difficulty]
                );
            });
        }

        setStudyCards(cardsToStudy);
    };

    // Generate unique IDs for cards based on their index
    const cardIds = useMemo(
        () => studyCards.map((_, index) => `card-${index}`),
        [studyCards],
    );

    // For debugging
    useEffect(() => {
        if (studyCards.length > 0) {
            console.log("Card IDs generated:", cardIds);
        }
    }, [cardIds, studyCards]);

    // Initialize scoring system
    const { scores, answerCard, nextCard, totalCorrect, totalIncorrect } =
        useScoring(cardIds);

    // Handle card navigation
    const goToNextCard = () => {
        if (cardIndex < studyCards.length - 1) {
            setCardIndex(cardIndex + 1);
            setFlipped(false);
        }
    };

    const goToPrevCard = () => {
        if (cardIndex > 0) {
            setCardIndex(cardIndex - 1);
            setFlipped(false);
        }
    };

    // Navigate to a specific card index
    const goToCard = (index: number) => {
        if (index >= 0 && index < studyCards.length) {
            setCardIndex(index);
            setFlipped(false);
        }
    };

    // Handle marking a card as correct or incorrect
    const handleMarkCard = (isCorrect: boolean) => {
        const currentCardId = cardIds[cardIndex];
        console.log("Marking card:", currentCardId, isCorrect);
        console.log("Current scores state:", scores);
        answerCard(currentCardId, isCorrect);

        // Automatically go to next card after a short delay
        setTimeout(() => {
            if (cardIndex < studyCards.length - 1) {
                goToNextCard();
            }
        }, 800);
    };

    // Current card
    const currentCard = studyCards[cardIndex];

    // Calculate progress (avoid division by zero)
    const progressValue: number =
        studyCards.length > 0 ? ((cardIndex + 1) / studyCards.length) * 100 : 0;

    return (
        <Box py={4} px={{ base: 4, md: 8 }}>
            {/* Navigation Header with Language Toggle */}
            <NavigationHeader
                deck={deck}
                cardIndex={cardIndex}
                totalCards={studyCards.length}
                sourceLanguage={deck.sourceLanguage}
                targetLanguage={deck.targetLanguage}
                cardFrontLanguage={cardFrontLanguage}
                setCardFrontLanguage={setCardFrontLanguage}
            />

            {/* Progress bar with color-coded segments */}
            <Flex width="100%" height="16px" mb={8}>
                {cardIds.map((id, idx) => {
                    const card = studyCards[idx];
                    const tooltipContent =
                        cardFrontLanguage === "source"
                            ? card.frontContent.text
                            : card.backContent.text;

                    return (
                        <Tooltip
                            key={id}
                            label={tooltipContent}
                            placement="top"
                            hasArrow
                        >
                            <Box
                                flex="1"
                                mx="1px"
                                height="16px"
                                borderRadius="sm"
                                bg={
                                    scores[id] === "correct"
                                        ? "green.400"
                                        : scores[id] === "incorrect"
                                          ? "orange.400"
                                          : "gray.300"
                                }
                                transition="all 0.2s"
                                cursor="pointer"
                                _hover={{
                                    opacity: 0.9,
                                    transform: "scaleY(1.2)",
                                }}
                                onClick={() => goToCard(idx)}
                                aria-label={`Go to card ${idx + 1}`}
                            />
                        </Tooltip>
                    );
                })}
            </Flex>

            {/* Stats display */}
            <Flex justify="center" mb={4}>
                <HStack spacing={6}>
                    <Box color="green.500" fontWeight="bold">
                        Correct: {totalCorrect}
                    </Box>
                    <Box color="red.500" fontWeight="bold">
                        Incorrect: {totalIncorrect}
                    </Box>
                    <Box color="gray.500" fontWeight="bold">
                        Remaining:{" "}
                        {studyCards.length - totalCorrect - totalIncorrect}
                    </Box>
                </HStack>
            </Flex>

            {/* Card Display */}
            {currentCard && (
                <Box maxW="800px" mx="auto" mb={8}>
                    <HStack spacing={4} justify="center" mt={6} align="top">
                        <Box height="100%">
                            <IconButton
                                aria-label="Previous card"
                                icon={<Icon as={ChevronLeft} />}
                                onClick={goToPrevCard}
                                isDisabled={cardIndex === 0}
                                colorScheme="primary"
                            />
                        </Box>

                        <Box>
                            <Flashcard
                                card={currentCard}
                                deck={deck}
                                flipped={flipped}
                                setFlipped={setFlipped}
                                cardFrontLanguage={cardFrontLanguage}
                            />

                            {/* Correct/Incorrect buttons - only shown when card is flipped */}
                            {flipped && (
                                <HStack spacing={4} mt={6} justify="center">
                                    <Button
                                        colorScheme="green"
                                        onClick={() => handleMarkCard(true)}
                                        size="lg"
                                        width="120px"
                                    >
                                        ✓ Correct
                                    </Button>
                                    <Button
                                        colorScheme="orange"
                                        onClick={() => handleMarkCard(false)}
                                        size="lg"
                                        width="120px"
                                    >
                                        ✗ Incorrect
                                    </Button>
                                </HStack>
                            )}
                        </Box>

                        <IconButton
                            aria-label="Next card"
                            icon={<Icon as={ChevronRight} />}
                            onClick={goToNextCard}
                            isDisabled={cardIndex === studyCards.length - 1}
                            colorScheme="primary"
                        />
                    </HStack>
                </Box>
            )}
        </Box>
    );
};

export default DeckStudyTemplate;

export const Head: HeadFC<any> = ({ data }) => {
    const deck = data?.decksJson;
    const deckName = deck?.name || "Study Session";

    return (
        <>
            <title>Study: {deckName} | Lingo Lotus</title>
            <meta
                name="description"
                content={`Practice ${deckName} flashcards with spaced repetition on Lingo Lotus`}
            />
        </>
    );
};

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
