import React from "react";

import {
    Box,
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import { graphql, HeadFC, Link } from "gatsby";

import { LanguageCard } from "../components/LanguageCard";
import { LazyImage } from "../components/LazyImage";
import { semanticColors, tagColorSchemes } from "../theme/colors";
import type { Collection } from "../types";
import { collectionDetailPath } from "../utils/paths";

interface CollectionListTemplateProps {
    data: {
        allCollectionsJson: {
            nodes: Collection[];
        };
    };
}

const CollectionCard: React.FC<{ collection: Collection }> = ({
    collection,
}) => {
    return (
        <Link to={collectionDetailPath(collection.collectionId)}>
            <LanguageCard>
                {collection.imageUrl && (
                    <LazyImage
                        src={collection.imageUrl}
                        alt={collection.name}
                        height="200px"
                        width="100%"
                        objectFit="cover"
                        loading="lazy"
                    />
                )}
                <Box p={5}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Heading as="h3" size="md" fontWeight="semibold">
                            {collection.name}
                        </Heading>
                        {collection.featured && (
                            <Tag colorScheme={tagColorSchemes.featured}>
                                Featured
                            </Tag>
                        )}
                    </Flex>

                    <Text fontSize="sm" color="gray.500" noOfLines={2} mb={3}>
                        {collection.description}
                    </Text>

                    <Stack
                        direction="row"
                        align="center"
                        justify="space-between"
                    >
                        <Flex align="center">
                            <Tag colorScheme={tagColorSchemes.language} mr={2}>
                                {collection.sourceLanguage} →{" "}
                                {collection.targetLanguage}
                            </Tag>
                            <Tag colorScheme={tagColorSchemes.difficulty}>
                                {collection.difficulty || "Mixed"}
                            </Tag>
                        </Flex>
                    </Stack>
                </Box>
            </LanguageCard>
        </Link>
    );
};

const CollectionListTemplate: React.FC<CollectionListTemplateProps> = ({
    data,
}) => {
    const collections = data.allCollectionsJson.nodes;
    const featuredCollections = collections.filter((c) => c.featured);
    const regularCollections = collections.filter((c) => !c.featured);

    const heroBg = semanticColors.hero.flashcards;
    const supportingTextColor = semanticColors.text.supporting;

    return (
        <>
            {/* Hero Section */}
            <Box bg={heroBg} py={{ base: 12, md: 20 }} mb={12}>
                <Container maxW="container.xl">
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        align="center"
                    >
                        <Box flex="1" pr={{ md: 10 }} mb={{ base: 10, md: 0 }}>
                            <Heading
                                as="h1"
                                size="2xl"
                                lineHeight="shorter"
                                fontWeight="bold"
                                mb={5}
                            >
                                Master Vocabulary with Flashcards
                            </Heading>
                            <Text fontSize={{ base: "lg", md: "xl" }} mb={6}>
                                Build your vocabulary systematically with spaced
                                repetition and interactive flashcards.
                            </Text>
                            <Text
                                fontSize={{ base: "md", md: "lg" }}
                                color={supportingTextColor}
                            >
                                Choose from curated decks organized by theme,
                                difficulty, and real-world scenarios. Practice
                                at your own pace and track your progress as you
                                build fluency one word at a time.
                            </Text>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            {/* Collections List */}
            <Container maxW="container.xl" mb={16}>
                {featuredCollections.length > 0 && (
                    <>
                        <Heading as="h2" size="lg" mb={4}>
                            Featured Flashcard Collections
                        </Heading>
                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={6}
                            mb={12}
                        >
                            {featuredCollections.map((collection) => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                />
                            ))}
                        </SimpleGrid>
                    </>
                )}

                {regularCollections.length > 0 && (
                    <>
                        <Heading as="h2" size="lg" mb={4}>
                            All Flashcard Collections
                        </Heading>
                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={6}
                        >
                            {regularCollections.map((collection) => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                />
                            ))}
                        </SimpleGrid>
                    </>
                )}
            </Container>
        </>
    );
};

export default CollectionListTemplate;

export const Head: HeadFC = () => <title>Flashcards | Lingo Lotus</title>;

export const query = graphql`
  query AllCollections {
    allCollectionsJson {
      nodes {
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
    }
  }
`;
