import { TranslationFlashcard } from "@/types";
import {
    Box,
    Heading,
    HStack,
    Spacer,
    Tag,
    Text,
    VStack,
} from "@chakra-ui/react";
import React from "react";
import TextToSpeech from "../speech/TextToSpeech";

interface CardFrontProps {
    card: TranslationFlashcard;
    sourceLanguage: string;
    targetLanguage: string;
    cardFrontLanguage: "source" | "target";
}

const CardFront: React.FC<CardFrontProps> = ({
    card,
    sourceLanguage,
    targetLanguage,
    cardFrontLanguage,
}) => {
    return (
        <VStack spacing={6} width="100%" maxWidth="100%">
            <Box width="100%" maxWidth="100%">
                {cardFrontLanguage === "source" ? (
                    <Box borderRadius="md" p={3} bg="gray.50">
                        <HStack spacing={2} justify="center" maxWidth="100%">
                            <TextToSpeech
                                text={card.frontContent.text}
                                lang={sourceLanguage}
                            />
                            <Heading
                                size="xl"
                                textAlign="center"
                                wordBreak="break-word"
                            >
                                {card.frontContent.text}
                            </Heading>
                        </HStack>
                        {card.phonetic && (
                            <Text
                                color="gray.400"
                                fontSize="xl"
                                fontStyle="italic"
                                letterSpacing="wide"
                                textAlign="center"
                                mt={2}
                            >
                                /{card.phonetic}/
                            </Text>
                        )}
                    </Box>
                ) : (
                    <Box borderRadius="md" p={3} bg="gray.50">
                        <HStack spacing={2} justify="center" maxWidth="100%">
                            <TextToSpeech
                                text={card.backContent.text}
                                lang={targetLanguage}
                            />
                            <Heading
                                size="xl"
                                textAlign="center"
                                wordBreak="break-word"
                            >
                                {card.backContent.text}
                            </Heading>
                        </HStack>
                    </Box>
                )}
            </Box>

            <Box height="100px" />

            {card.partOfSpeech && (
                <Tag
                    colorScheme="secondary"
                    fontSize="md"
                    borderRadius="full"
                    px={4}
                    py={1}
                    mt={1}
                >
                    {card.partOfSpeech}
                </Tag>
            )}

            <Spacer />

            <Text fontSize="sm" color="gray.400" opacity={0.7}>
                Tap or click anywhere to flip
            </Text>
        </VStack>
    );
};

export default CardFront;
