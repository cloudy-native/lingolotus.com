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
  const contentBg = useColorModeValue("gray.50", "gray.800");
  const phoneticColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack spacing={3} width="100%" maxWidth="100%" align="stretch">
      {/* Front content */}
      <Box
        borderRadius="md"
        p={3}
        bg={contentBg}
      >
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

      {/* Back content */}
      <Box
        borderRadius="md"
        p={3}
        bg={contentBg}
      >
        <HStack spacing={2} align="center" maxWidth="100%">
          <TextToSpeech text={card.backContent.text} lang={targetLanguage} />
          <Heading size="lg" mb={0} wordBreak="break-word">
            {card.backContent.text}
          </Heading>
        </HStack>
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
