import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { navigate } from "gatsby";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Deck, TranslationFlashcard } from "@/types";
import { deckDetailPath } from "../../utils/paths";

import LanguageToggle from "./LanguageToggle";

interface NavigationHeaderProps {
  deck: Deck<TranslationFlashcard>;
  cardIndex: number;
  totalCards: number;
  sourceLanguage: string;
  targetLanguage: string;
  cardFrontLanguage: "source" | "target";
  setCardFrontLanguage: (lang: "source" | "target") => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  deck,
  cardIndex,
  totalCards,
  sourceLanguage,
  targetLanguage,
  cardFrontLanguage,
  setCardFrontLanguage,
}) => {
  return (
    <Flex justify="space-between" align="center" mb={4} gap={4}>
      <Button
        leftIcon={<Icon as={ArrowLeft} />}
        colorScheme="primary"
        variant="solid"
        onClick={() => navigate(deckDetailPath(deck.collectionId, deck.deckId))}
        boxShadow="md"
        position="sticky"
        top={0}
        zIndex={1}
        aria-label="Back to Deck"
      >
        Back to Deck
      </Button>
      <HStack spacing={6}>
        <Text
          fontWeight="bold"
          fontSize="lg"
          color="blue.600"
          letterSpacing="wide"
        >
          {cardIndex + 1} of {totalCards}
        </Text>
      </HStack>
      <LanguageToggle
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        cardFrontLanguage={cardFrontLanguage}
        setCardFrontLanguage={setCardFrontLanguage}
      />
    </Flex>
  );
};

export default NavigationHeader;
