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
    HStack,
    Icon,
    Select,
    SimpleGrid,
    Stack,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";
import { graphql, HeadFC, Link, navigate } from "gatsby";
import { ChevronRight, Clock, Eye } from "lucide-react";
import React, { useState } from "react";

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

const SHOW_CARDS = 6;

// Component to display a preview of a flashcard
const FlashcardPreview: React.FC<{ card: TranslationFlashcard }> = ({
    card,
}) => {
    const cardBg = "white";
    const cardBorder = "gray.200";

    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            borderColor={cardBorder}
            bg={cardBg}
            p={4}
            mb={3}
        >
            <Flex justify="space-between" align="center" mb={2}>
                <Heading as="h4" size="sm">
                    {card.frontContent.text}
                </Heading>
                <Tag
                    colorScheme={
                        card.difficulty === "easy"
                            ? "green"
                            : card.difficulty === "medium"
                              ? "yellow"
                              : "red"
                    }
                >
                    {card.difficulty}
                </Tag>
            </Flex>

            {card.phonetic && (
                <Text color="gray.500" fontSize="sm" mb={2}>
                    /{card.phonetic}/
                </Text>
            )}

            <Text fontWeight="medium" mb={2}>
                {card.backContent.text}
            </Text>

            {card.partOfSpeech && (
                <Text fontSize="sm" fontStyle="italic" color="gray.500" mb={1}>
                    {card.partOfSpeech}
                </Text>
            )}

            {card.tags.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
                    {card.tags.map((tag, idx) => (
                        <Tag key={tag} size="sm" colorScheme="blue">
                            {tag}
                        </Tag>
                    ))}
                </HStack>
            )}

            {card.examples && card.examples.length > 0 && (
                <Box
                    mt={3}
                    pt={3}
                    borderTopWidth="1px"
                    borderColor={cardBorder}
                >
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        {card.examples[0].original}
                    </Text>
                    <Text fontSize="sm">{card.examples[0].translation}</Text>
                    {card.examples[0].phonetic && (
                        <Text fontSize="sm" color="gray.600">
                            /{card.examples[0].phonetic}/
                        </Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

const DeckDetailTemplate: React.FC<DeckDetailTemplateProps> = ({ data }) => {
    const deck = data.decksJson;
    const collection = data.collectionsJson;

    const [studyType, setStudyType] = useState<string>("all");
    const [cardOrder, setCardOrder] = useState<string>("default");

    const headerBg = "teal.50";
    const headerBorder = "teal.100";

    const handleStartStudy = (studyLanguage: "source" | "target") => {
        // Save study preferences to local storage or state management
        localStorage.setItem(
            "studyPreferences",
            JSON.stringify({
                type: studyType,
                order: cardOrder,
            }),
        );

        // Navigate to the study page
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

                            <VStack
                                spacing={4}
                                align="stretch"
                                mb={6}
                                maxW={{ base: "100%", md: "400px" }}
                            >
                                <Flex>
                                    <Box flex="1" mr={2}>
                                        <Text mb={1} fontWeight="medium">
                                            Study Type:
                                        </Text>
                                        <Select
                                            value={studyType}
                                            onChange={(e) =>
                                                setStudyType(e.target.value)
                                            }
                                        >
                                            <option value="all">
                                                All Cards
                                            </option>
                                            <option value="new">
                                                New Cards Only
                                            </option>
                                            <option value="review">
                                                Review Cards Only
                                            </option>
                                            <option value="difficult">
                                                Difficult Cards Only
                                            </option>
                                        </Select>
                                    </Box>
                                    <Box flex="1" ml={2}>
                                        <Text mb={1} fontWeight="medium">
                                            Card Order:
                                        </Text>
                                        <Select
                                            value={cardOrder}
                                            onChange={(e) =>
                                                setCardOrder(e.target.value)
                                            }
                                        >
                                            <option value="default">
                                                Default Order
                                            </option>
                                            <option value="random">
                                                Random Order
                                            </option>
                                            <option value="difficulty">
                                                By Difficulty
                                            </option>
                                        </Select>
                                    </Box>
                                </Flex>
                                <ButtonGroup>
                                    <Button
                                        colorScheme="primary"
                                        leftIcon={<Icon as={Eye} />}
                                        onClick={() =>
                                            handleStartStudy("target")
                                        }
                                    >
                                        {studyInTargetLanguage}
                                    </Button>
                                    <Button
                                        colorScheme="primary"
                                        leftIcon={<Icon as={Eye} />}
                                        onClick={() =>
                                            handleStartStudy("source")
                                        }
                                    >
                                        {studyInSourceLanguage}
                                    </Button>
                                </ButtonGroup>
                            </VStack>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={8}>
                <Tabs colorScheme="primary" variant="enclosed">
                    <TabList>
                        <Tab>Preview Cards</Tab>
                        <Tab>Card Statistics</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <SimpleGrid
                                columns={{ base: 1, md: 2, lg: 3 }}
                                spacing={6}
                            >
                                {deck.cards.slice(0, SHOW_CARDS).map((card) => (
                                    <FlashcardPreview
                                        key={card.id}
                                        card={card as TranslationFlashcard}
                                    />
                                ))}
                            </SimpleGrid>

                            {deck.cards.length > SHOW_CARDS && (
                                <Text
                                    mt={4}
                                    fontStyle="italic"
                                    textAlign="center"
                                >
                                    Showing {SHOW_CARDS} of {deck.cards.length}{" "}
                                    cards
                                </Text>
                            )}
                        </TabPanel>

                        <TabPanel>
                            <Box
                                borderWidth="1px"
                                borderRadius="lg"
                                overflow="hidden"
                            >
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Difficulty</Th>
                                            <Th>Count</Th>
                                            <Th>Percentage</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                                <Tag colorScheme="green">
                                                    Easy
                                                </Tag>
                                            </Td>
                                            <Td>
                                                {
                                                    deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "easy",
                                                    ).length
                                                }
                                            </Td>
                                            <Td>
                                                {Math.round(
                                                    (deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "easy",
                                                    ).length /
                                                        deck.cards.length) *
                                                        100,
                                                )}
                                                %
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Tag colorScheme="yellow">
                                                    Medium
                                                </Tag>
                                            </Td>
                                            <Td>
                                                {
                                                    deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "medium",
                                                    ).length
                                                }
                                            </Td>
                                            <Td>
                                                {Math.round(
                                                    (deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "medium",
                                                    ).length /
                                                        deck.cards.length) *
                                                        100,
                                                )}
                                                %
                                            </Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Tag colorScheme="red">
                                                    Hard
                                                </Tag>
                                            </Td>
                                            <Td>
                                                {
                                                    deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "hard",
                                                    ).length
                                                }
                                            </Td>
                                            <Td>
                                                {Math.round(
                                                    (deck.cards.filter(
                                                        (c) =>
                                                            c.difficulty ===
                                                            "hard",
                                                    ).length /
                                                        deck.cards.length) *
                                                        100,
                                                )}
                                                %
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
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
