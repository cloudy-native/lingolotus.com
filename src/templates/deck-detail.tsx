import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Container,
    Flex,
    Heading,
    Icon,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import { graphql, HeadFC, Link, navigate } from "gatsby";
import { ChevronRight, Clock } from "lucide-react";
import React from "react";

import { TextToSpeech } from "../components/speech/TextToSpeech";
import { Deck, TranslationFlashcard } from "../types";
import { getLanguageInfo } from "../utils/language";
import {
    collectionDetailPath,
    flashcardListPath,
    studyDeckPath,
} from "../utils/paths";

interface DeckDetailTemplateProps {
    data: {
        decksJson: Deck<TranslationFlashcard>;
        collectionsJson: {
            collectionId: string;
            name: string;
            sourceLanguage: string;
            targetLanguage: string;
        };
    };
}

const DeckDetailTemplate: React.FC<DeckDetailTemplateProps> = ({ data }) => {
    const deck = data.decksJson;
    const collection = data.collectionsJson;

    const headerBg = "teal.50";
    const headerBorder = "teal.100";

    const handleStartStudy = (studyLanguage: "source" | "target") => {
        navigate(
            studyDeckPath(collection.collectionId, deck.deckId, studyLanguage),
        );
    };

    const sourceLanguageInfo = getLanguageInfo(collection.sourceLanguage);
    const studyInSourceLanguage =
        "Study in " +
        sourceLanguageInfo.nativeName +
        " " +
        sourceLanguageInfo.flag;

    const targetLanguageInfo = getLanguageInfo(collection.targetLanguage);
    const studyInTargetLanguage =
        "Study in " +
        targetLanguageInfo.nativeName +
        " " +
        targetLanguageInfo.flag;

    return (
        <>
            <Box
                bg={headerBg}
                borderBottom="1px"
                borderColor={headerBorder}
                py={8}
            >
                <Container maxW="container.xl">
                    <Breadcrumb
                        spacing="8px"
                        separator={<Icon as={ChevronRight} color="gray.500" />}
                        mb={4}
                    >
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/">
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to={flashcardListPath()}>
                                Collections
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={Link}
                                to={collectionDetailPath(
                                    collection.collectionId,
                                )}
                            >
                                {collection.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink>{deck.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>

                    <Flex
                        direction={{ base: "column", md: "row" }}
                        align={{ md: "center" }}
                        gap={6}
                    >
                        <Box flex="1">
                            <Heading as="h1" size="xl" mb={2}>
                                {deck.name}
                            </Heading>

                            <Text fontSize="lg" mb={4}>
                                {deck.description}
                            </Text>

                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={4}
                                mb={4}
                            >
                                <Box>
                                    <Stack direction="row" spacing={4} mb={2}>
                                        <Tag colorScheme="green">
                                            {deck.sourceLanguage} →{" "}
                                            {deck.targetLanguage}
                                        </Tag>
                                        <Tag colorScheme="purple">
                                            {deck.difficulty}
                                        </Tag>
                                        <Tag colorScheme="blue">
                                            {deck.theme}
                                        </Tag>
                                    </Stack>

                                    <Flex align="center" mb={2}>
                                        <Icon as={Clock} mr={2} />
                                        <Text fontSize="sm">
                                            Updated:{" "}
                                            {new Date(
                                                deck.updatedAt,
                                            ).toLocaleDateString()}
                                            , flashcards: {deck.cards.length}
                                        </Text>
                                    </Flex>
                                </Box>
                            </SimpleGrid>

                            <Box mb={6}>
                                <Text fontSize="md" fontWeight="medium" mb={3}>
                                    Choose your study direction:
                                </Text>
                                <Text fontSize="sm" color="gray.600" mb={4}>
                                    <strong>{studyInSourceLanguage}:</strong> See {sourceLanguageInfo.nativeName} text, guess the {targetLanguageInfo.nativeName} translation
                                    <br />
                                    <strong>{studyInTargetLanguage}:</strong> See {targetLanguageInfo.nativeName} text, guess the {sourceLanguageInfo.nativeName} translation
                                </Text>
                                <ButtonGroup>
                                    <Button
                                        colorScheme="primary"
                                        onClick={() => handleStartStudy("source")}
                                    >
                                        {studyInSourceLanguage}
                                    </Button>
                                    <Button
                                        colorScheme="primary"
                                        onClick={() => handleStartStudy("target")}
                                    >
                                        {studyInTargetLanguage}
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={8}>
                <Heading as="h2" size="lg" mb={6}>
                    Learn to Say
                </Heading>

                <Flex flexWrap="wrap" gap={3}>
                    {deck.cards
                        .filter(
                            (
                                card,
                            ): card is TranslationFlashcard & {
                                examples: NonNullable<
                                    TranslationFlashcard["examples"]
                                >;
                            } =>
                                card.examples !== undefined &&
                                card.examples.length > 0,
                        )
                        .slice(0, 12)
                        .flatMap((card) =>
                            card.examples.slice(0, 1).map((example) => ({
                                ...example,
                                cardId: card.frontContent.text,
                            })),
                        )
                        .map((example) => (
                            <Text
                                key={`${example.cardId}-${example.original}`}
                                fontSize="md"
                                color="gray.700"
                                whiteSpace="nowrap"
                            >
                                🪷 {example.translation}
                            </Text>
                        ))}
                </Flex>
            </Container>
        </>
    );
};

export default DeckDetailTemplate;

export const Head: HeadFC<any> = ({ data }) => {
    const deck = data?.decksJson;
    const deckName = deck?.name || "Flashcard Deck";

    return (
        <>
            <title>{deckName} | Lingo Lotus</title>
            <meta
                name="description"
                content={
                    deck?.description ||
                    `Study ${deckName} flashcards on Lingo Lotus`
                }
            />
        </>
    );
};

export const query = graphql`
  query DeckById($collectionId: String!, $deckId: String!) {
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
      collectionId
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
      collectionId
      name
      sourceLanguage
      targetLanguage
    }
  }
`;
