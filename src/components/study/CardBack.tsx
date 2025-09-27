import { TranslationFlashcard } from "@/types";
import {
  Box,
  Heading,
  HStack,
  Spacer,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import TextToSpeech from "../speech/TextToSpeech";
import Examples from "./Examples";

interface CardBackProps {
  card: TranslationFlashcard;
  sourceLanguage: string;
  targetLanguage: string;
}

const CardBack: React.FC<CardBackProps> = ({
  card,
  sourceLanguage,
  targetLanguage,
}) => {
  const contentBg = "gray.50";
  const phoneticColor = "gray.500";

  return (
    <VStack spacing={3} width="100%" maxWidth="100%" align="stretch">
      <Box borderRadius="md" p={3} bg={contentBg}>
        <HStack spacing={2} align="center" maxWidth="100%">
          <TextToSpeech text={card.frontContent.text} lang={sourceLanguage} />
          <Heading size="lg" mb={0} wordBreak="break-word">
            {card.backContent.text}
          </Heading>
        </HStack>
        {card.context && (
          <Text
            color={phoneticColor}
            fontSize="sm"
            fontStyle="italic"
            letterSpacing="wide"
            mt={1}
            textAlign="left"
          >
            {card.context}
          </Text>
        )}
      </Box>
      
      <Box borderRadius="md" p={3} bg={contentBg}>
        <HStack spacing={2} align="center" maxWidth="100%">
          <TextToSpeech text={card.frontContent.text} lang={sourceLanguage} />
          <Heading size="lg" mb={0} wordBreak="break-word">
            {card.frontContent.text}
          </Heading>
        </HStack>
        {card.phonetic && (
          <Text
            color={phoneticColor}
            fontSize="sm"
            fontStyle="italic"
            letterSpacing="wide"
            mt={1}
            textAlign="left"
          >
            /{card.phonetic}/
          </Text>
        )}
      </Box>

      {card.examples && card.examples.length > 0 && (
        <Examples
          examples={card.examples}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      )}

      <Spacer />

      {card.tags.length > 0 && (
        <HStack spacing={2} wrap="wrap">
          {card.tags.map((tag, idx) => (
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
  );
};

export default CardBack;
