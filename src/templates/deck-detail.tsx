import {
  ChevronRightIcon,
  InfoIcon,
  TimeIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Link, graphql, navigate } from "gatsby";
import React, { useState } from "react";

import { Deck, TranslationFlashcard } from "../types";
import { collectionDetailPath, collectionListPath, studyDeckPath } from "../utils/paths";

interface DeckDetailTemplateProps {
  data: {
    decksJson: Deck<TranslationFlashcard>;
    collectionsJson: {
      collectionId: string;
      name: string;
    };
  };
}

const SHOW_CARDS = 6;

// Component to display a preview of a flashcard
const FlashcardPreview: React.FC<{ card: TranslationFlashcard }> = ({
  card,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

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
        <Badge
          colorScheme={
            card.difficulty === "easy"
              ? "green"
              : card.difficulty === "medium"
                ? "yellow"
                : "red"
          }
        >
          {card.difficulty}
        </Badge>
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
            <Tag key={idx} size="sm" colorScheme="blue" variant="subtle">
              {tag}
            </Tag>
          ))}
        </HStack>
      )}

      {card.examples && card.examples.length > 0 && (
        <Box mt={3} pt={3} borderTopWidth="1px" borderColor={cardBorder}>
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
  const toast = useToast();

  const [studyType, setStudyType] = useState<string>("all");
  const [cardOrder, setCardOrder] = useState<string>("default");

  const headerBg = useColorModeValue("teal.50", "teal.900");
  const headerBorder = useColorModeValue("teal.100", "teal.800");

  const handleStartStudy = () => {
    // Save study preferences to local storage or state management
    localStorage.setItem(
      "studyPreferences",
      JSON.stringify({
        type: studyType,
        order: cardOrder,
      }),
    );

    toast({
      title: "Starting study session",
      description: `${deck.cards.length} cards loaded`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    // Navigate to the study page
    navigate(studyDeckPath(collection.collectionId, deck.deckId));
  };

  return (
    <>
      <Box bg={headerBg} borderBottom="1px" borderColor={headerBorder} py={8}>
        <Container maxW="container.xl">
          <Breadcrumb
            spacing="8px"
            separator={<ChevronRightIcon color="gray.500" />}
            mb={4}
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to={collectionListPath()}>
                Collections
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink
                as={Link}
                to={collectionDetailPath(collection.collectionId)}
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

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <Box>
                  <Stack direction="row" spacing={4} mb={2}>
                    <Badge colorScheme="green" fontSize="0.9em" p={1}>
                      {deck.sourceLanguage} → {deck.targetLanguage}
                    </Badge>
                    <Badge colorScheme="purple" fontSize="0.9em" p={1}>
                      {deck.difficulty}
                    </Badge>
                    <Badge colorScheme="blue" fontSize="0.9em" p={1}>
                      {deck.theme}
                    </Badge>
                  </Stack>

                  <Flex align="center" mb={2}>
                    <Icon as={TimeIcon} mr={2} />
                    <Text fontSize="sm">
                      Updated: {new Date(deck.updatedAt).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Box>

                <Box>
                  <Flex align="center" mb={2}>
                    <Icon as={InfoIcon} mr={2} />
                    <Text>{deck.cards.length} flashcards</Text>
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
                      onChange={(e) => setStudyType(e.target.value)}
                    >
                      <option value="all">All Cards</option>
                      <option value="new">New Cards Only</option>
                      <option value="review">Review Cards Only</option>
                      <option value="difficult">Difficult Cards Only</option>
                    </Select>
                  </Box>
                  <Box flex="1" ml={2}>
                    <Text mb={1} fontWeight="medium">
                      Card Order:
                    </Text>
                    <Select
                      value={cardOrder}
                      onChange={(e) => setCardOrder(e.target.value)}
                    >
                      <option value="default">Default Order</option>
                      <option value="random">Random Order</option>
                      <option value="difficulty">By Difficulty</option>
                    </Select>
                  </Box>
                </Flex>
                <Button
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<ViewIcon />}
                  onClick={handleStartStudy}
                >
                  Start Studying
                </Button>
              </VStack>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Tabs colorScheme="teal" variant="enclosed">
          <TabList>
            <Tab>Preview Cards</Tab>
            <Tab>Card Statistics</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {deck.cards.slice(0, SHOW_CARDS).map((card) => (
                  <FlashcardPreview
                    key={card.id}
                    card={card as TranslationFlashcard}
                  />
                ))}
              </SimpleGrid>

              {deck.cards.length > SHOW_CARDS && (
                <Text mt={4} fontStyle="italic" textAlign="center">
                  Showing {SHOW_CARDS} of {deck.cards.length} cards
                </Text>
              )}
            </TabPanel>

            <TabPanel>
              <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
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
                        <Badge colorScheme="green">Easy</Badge>
                      </Td>
                      <Td>
                        {
                          deck.cards.filter((c) => c.difficulty === "easy")
                            .length
                        }
                      </Td>
                      <Td>
                        {Math.round(
                          (deck.cards.filter((c) => c.difficulty === "easy")
                            .length /
                            deck.cards.length) *
                            100,
                        )}
                        %
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Badge colorScheme="yellow">Medium</Badge>
                      </Td>
                      <Td>
                        {
                          deck.cards.filter((c) => c.difficulty === "medium")
                            .length
                        }
                      </Td>
                      <Td>
                        {Math.round(
                          (deck.cards.filter((c) => c.difficulty === "medium")
                            .length /
                            deck.cards.length) *
                            100,
                        )}
                        %
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Badge colorScheme="red">Hard</Badge>
                      </Td>
                      <Td>
                        {
                          deck.cards.filter((c) => c.difficulty === "hard")
                            .length
                        }
                      </Td>
                      <Td>
                        {Math.round(
                          (deck.cards.filter((c) => c.difficulty === "hard")
                            .length /
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
      collectionId
      name
    }
  }
`;
