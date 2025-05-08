import { Box, Table, Tbody, Tr, Td, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { Deck, TranslationFlashcard } from "@/types";
import CardFront from "./CardFront";
import CardBack from "./CardBack";

interface FlashcardProps {
  card: TranslationFlashcard;
  deck: Deck<TranslationFlashcard>;
  flipped: boolean;
  setFlipped: (flipped: boolean) => void;
  cardFrontLanguage: "source" | "target";
}

const Flashcard: React.FC<FlashcardProps> = ({
  card,
  deck,
  flipped,
  setFlipped,
  cardFrontLanguage,
}) => {
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <Table
      width="100%"
      height={{ base: "500px", md: "600px" }}
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="xl"
      boxShadow="xl"
      onClick={() => setFlipped(!flipped)}
      cursor="pointer"
      style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}
    >
      <Tbody>
        <Tr>
          <Td
            height="100%"
            width="100%"
            textAlign="center"
            verticalAlign="middle"
            p={8}
          >
            {!flipped ? (
              <CardFront
                card={card}
                sourceLanguage={deck.sourceLanguage}
                targetLanguage={deck.targetLanguage}
                cardFrontLanguage={cardFrontLanguage}
              />
            ) : (
              <CardBack
                card={card}
                sourceLanguage={deck.sourceLanguage}
                targetLanguage={deck.targetLanguage}
              />
            )}
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
};

export default Flashcard;
