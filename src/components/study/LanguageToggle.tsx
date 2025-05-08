import { Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { getLanguageInfo } from "../../utils/language";

interface LanguageToggleProps {
  sourceLanguage: string;
  targetLanguage: string;
  cardFrontLanguage: "source" | "target";
  setCardFrontLanguage: (lang: "source" | "target") => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  sourceLanguage,
  targetLanguage,
  cardFrontLanguage,
  setCardFrontLanguage,
}) => {
  return (
    <Flex justify="center">
      <HStack spacing={4}>
        {/* Target language button */}
        <Button
          colorScheme={cardFrontLanguage === "target" ? "primary" : "gray"}
          variant={cardFrontLanguage === "target" ? "solid" : "outline"}
          onClick={() => setCardFrontLanguage("target")}
          boxShadow={
            cardFrontLanguage === "target" ? "0 0 0 2px #3182ce" : undefined
          }
          borderWidth={2}
          borderColor={cardFrontLanguage === "target" ? "blue.400" : "gray.200"}
          _hover={{ transform: "scale(1.05)", boxShadow: "md" }}
          aria-label="Show target language first"
          title={`Show ${getLanguageInfo(targetLanguage).englishName} first`}
        >
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg">
              {getLanguageInfo(targetLanguage).flag}{" "}
              {getLanguageInfo(targetLanguage).englishName}
            </Text>
          </VStack>
        </Button>
        {/* Source language button */}
        <Button
          colorScheme={cardFrontLanguage === "source" ? "primary" : "gray"}
          variant={cardFrontLanguage === "source" ? "solid" : "outline"}
          onClick={() => setCardFrontLanguage("source")}
          boxShadow={
            cardFrontLanguage === "source" ? "0 0 0 2px #3182ce" : undefined
          }
          borderWidth={2}
          borderColor={cardFrontLanguage === "source" ? "blue.400" : "gray.200"}
          _hover={{ transform: "scale(1.05)", boxShadow: "md" }}
          aria-label="Show source language first"
          title={`Show ${getLanguageInfo(sourceLanguage).nativeName} first`}
        >
          <VStack spacing={0} align="start">
            <Text fontWeight="bold" fontSize="lg">
              {getLanguageInfo(sourceLanguage).flag}{" "}
              {getLanguageInfo(sourceLanguage).nativeName}
            </Text>
          </VStack>
        </Button>
      </HStack>
    </Flex>
  );
};

export default LanguageToggle;
