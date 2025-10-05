import React from "react";

import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import { graphql, HeadFC, Link } from "gatsby";
import { ChevronRight, Clock, Star } from "lucide-react";

import { LanguageCard } from "../components/LanguageCard";
import { LazyImage } from "../components/LazyImage";
import { semanticColors } from "../theme/colors";
import { tokens } from "../theme/tokens";
import type { Collection, Deck } from "../types";
import { collectionDetailPath, deckDetailPath, flashcardListPath } from "../utils/paths";

interface CollectionDetailTemplateProps {
    data: {
        collectionsJson: Collection;
        allDecksJson: {
            nodes: Deck[];
        };
        otherCollections: {
            nodes: Collection[];
        };
    };
}

const DeckCard: React.FC<{ deck: Deck }> = ({ deck }) => {
    return (
        <Link to={deckDetailPath(deck.collectionId, deck.deckId)}>
            <LanguageCard height="100%">
                <Flex direction="column" height="100%" p={tokens.card.padding}>
                    <Box flex="1">
                        <Heading as="h3" size="md" fontWeight="semibold" mb={2}>
                            {deck.name}
                        </Heading>

                        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
                            {deck.description}
                        </Text>

                        <Flex align="center" justify="space-between" mb={3}>
                            <Flex align="center">
                                <Icon as={Clock} mr={1} color="gray.500" />
                                <Text fontSize="sm" color="gray.500">
                                    {new Date(
                                        deck.updatedAt,
                                    ).toLocaleDateString()}
                                </Text>
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium">
                                {deck.cards.length} cards
                            </Text>
                        </Flex>
                    </Box>

                    <Stack spacing={3} mt="auto">
                        <Flex align="center" justify="space-between">
                            <Tag colorScheme="primary">{deck.theme}</Tag>
                            <Tag colorScheme="secondary">{deck.difficulty}</Tag>
                        </Flex>

                        <Button size="sm" width="100%">
                            <Flex align="center">
                                <Icon as={Star} mr={1} color="yellow.400" />
                                Study Deck
                            </Flex>
                        </Button>
                    </Stack>
                </Flex>
            </LanguageCard>
        </Link>
    );
};

const CollectionCard: React.FC<{ collection: Collection }> = ({ collection }) => {
    return (
        <Link to={collectionDetailPath(collection.collectionId)}>
            <LanguageCard height="100%">
                <Flex direction="column" height="100%" p={tokens.card.padding}>
                    <Box flex="1">
                        {collection.imageUrl && (
                            <LazyImage
                                src={collection.imageUrl}
                                alt={collection.name}
                                borderRadius="md"
                                width="100%"
                                height="120px"
                                objectFit="cover"
                                loading="lazy"
                                mb={3}
                            />
                        )}

                        <Flex align="center" mb={2}>
                            <Heading as="h3" size="md" fontWeight="semibold" mr={2}>
                                {collection.name}
                            </Heading>
                            {collection.featured && (
                                <Icon as={Star} color="yellow.400" boxSize={4} />
                            )}
                        </Flex>

                        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
                            {collection.description}
                        </Text>
                    </Box>

                    <Stack spacing={2} mt="auto">
                        <Flex gap={2} wrap="wrap">
                            <Tag size="sm" colorScheme="purple">
                                {collection.difficulty}
                            </Tag>
                            {collection.category && (
                                <Tag size="sm" colorScheme="blue">
                                    {collection.category}
                                </Tag>
                            )}
                        </Flex>

                        <Button size="sm" width="100%">
                            View Collection
                        </Button>
                    </Stack>
                </Flex>
            </LanguageCard>
        </Link>
    );
};

const CollectionDetailTemplate: React.FC<CollectionDetailTemplateProps> = ({
    data,
}) => {
    const collection = data.collectionsJson;
    const decks = data.allDecksJson.nodes;
    const otherCollections = data.otherCollections.nodes;

    const headerBg = semanticColors.header.flashcards;
    const headerBorder = semanticColors.border.header.flashcards;

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
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink>{collection.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>

                    <Flex
                        direction={{ base: "column", md: "row" }}
                        align={{ md: "center" }}
                        gap={6}
                    >
                        {collection.imageUrl && (
                            <LazyImage
                                src={collection.imageUrl}
                                alt={collection.name}
                                borderRadius="lg"
                                boxSize={{ base: "100%", md: "180px" }}
                                objectFit="cover"
                                loading="lazy"
                            />
                        )}

                        <Box flex="1">
                            <Flex align="center" mb={2}>
                                <Heading as="h1" size="xl" mr={2}>
                                    {collection.name}
                                </Heading>
                                {collection.featured && (
                                    <Flex align="center">
                                        <Icon
                                            as={Star}
                                            color="yellow.400"
                                            mr={1}
                                        />
                                        <Tag colorScheme="yellow">Featured</Tag>
                                    </Flex>
                                )}
                            </Flex>

                            <Text fontSize="lg" mb={4}>
                                {collection.description}
                            </Text>

                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                spacing={4}
                                wrap="wrap"
                            >
                                <Tag colorScheme="green">
                                    {collection.sourceLanguage} →{" "}
                                    {collection.targetLanguage}
                                </Tag>
                                <Tag colorScheme="purple">
                                    {collection.difficulty || "Mixed"}
                                </Tag>
                                {collection.category && (
                                    <Tag colorScheme="blue">
                                        {collection.category}
                                    </Tag>
                                )}
                            </Stack>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={8}>
                <Heading as="h2" size="lg" mb={6}>
                    Decks in this Collection
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {decks.map((deck) => (
                        <DeckCard key={deck.id} deck={deck} />
                    ))}
                </SimpleGrid>
            </Container>

            {otherCollections.length > 0 && (
                <Container maxW="container.xl" py={8}>
                    <Heading as="h2" size="lg" mb={6}>
                        You May Also Like
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {otherCollections.map((otherCollection) => (
                            <CollectionCard
                                key={otherCollection.id}
                                collection={otherCollection}
                            />
                        ))}
                    </SimpleGrid>
                </Container>
            )}
        </>
    );
};

export const query = graphql`
  query CollectionById($collectionId: String!) {
    collectionsJson(collectionId: { eq: $collectionId }) {
      id
      collectionId
      name
      description
      sourceLanguage
      targetLanguage
      createdAt
      updatedAt
      category
      difficulty
      imageUrl
      featured
    }
    allDecksJson(filter: { collectionId: { eq: $collectionId } }) {
      nodes {
        id
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
    }
    otherCollections: allCollectionsJson(
      filter: { collectionId: { ne: $collectionId } }
      limit: 3
    ) {
      nodes {
        id
        collectionId
        name
        description
        sourceLanguage
        targetLanguage
        category
        difficulty
        imageUrl
        featured
      }
    }
  }
`;

export default CollectionDetailTemplate;

export const Head: HeadFC<any> = ({ data }) => {
    const collection = data?.collectionsJson;
    const collectionName = collection?.name || "Flashcard Collection";

    return (
        <>
            <title>{collectionName} | Lingo Lotus</title>
            <meta
                name="description"
                content={
                    collection?.description ||
                    `Study ${collectionName} flashcards on Lingo Lotus`
                }
            />
        </>
    );
};
