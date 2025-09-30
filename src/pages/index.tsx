import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Image,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { BookOpen, ChevronRight, CreditCard } from "lucide-react";
import React from "react";

import type { Book, Collection } from "../types";
import {
    bookDetailPath,
    collectionDetailPath,
    flashcardListPath,
    readingPath,
} from "../utils/paths";

interface HomePageProps {
    data: {
        featuredCollections: {
            nodes: Collection[];
        };
        featuredBooks: {
            nodes: Book[];
        };
        allCollections: {
            group: Array<{
                fieldValue: string;
                totalCount: number;
            }>;
        };
        allBooks: {
            group: Array<{
                fieldValue: string;
                totalCount: number;
            }>;
        };
    };
}

const HomePage: React.FC<HomePageProps> = ({ data }) => {
    const featuredCollections = data.featuredCollections.nodes;
    const featuredBooks = data.featuredBooks.nodes;
    const collectionsByLanguage = data.allCollections.group;
    const booksByLanguage = data.allBooks.group;

    const boxBg = "white";
    const borderColor = "gray.200";
    const heroBg = "blue.50";
    const flashcardHoverBg = "blue.50";
    const readingHoverBg = "green.50";

    return (
        <>
            {/* Hero Section */}
            <Box bg={heroBg} py={{ base: 12, md: 16 }} mb={12}>
                <Container maxW="container.xl">
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        align="center"
                        gap={8}
                    >
                        <Box flex="1">
                            <Heading
                                as="h1"
                                size="2xl"
                                fontWeight="bold"
                                mb={4}
                                textAlign={{ base: "center", md: "left" }}
                            >
                                Lingo Lotus
                            </Heading>
                            <Text
                                fontSize={{ base: "xl", md: "2xl" }}
                                fontWeight="semibold"
                                mb={3}
                                textAlign={{ base: "center", md: "left" }}
                            >
                                Language learning made easy
                            </Text>
                            <Text
                                fontSize={{ base: "md", md: "lg" }}
                                textAlign={{ base: "center", md: "left" }}
                                color="gray.700"
                            >
                                Master vocabulary with spaced repetition
                                flashcards and build reading comprehension with
                                stories that include phonetics and word-by-word
                                breakdowns. Everything you need to learn
                                naturally and effectively.
                            </Text>
                        </Box>
                        <Box
                            flex="1"
                            maxW={{ base: "100%", md: "400px" }}
                            h={{ base: "250px", md: "300px" }}
                        >
                            <Image
                                src="/images/bangkok-rainbow.jpeg"
                                alt="Language learning"
                                borderRadius="lg"
                                boxShadow="xl"
                                objectFit="cover"
                                w="100%"
                                h="100%"
                            />
                        </Box>
                    </Flex>
                </Container>
            </Box>

            {/* Two Column Layout */}
            <Container maxW="container.xl" mb={16}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                    {/* Flashcards Column */}
                    <Box>
                        <Box mb={6}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <HStack spacing={3}>
                                    <Icon
                                        as={CreditCard}
                                        boxSize={7}
                                        color="blue.500"
                                    />
                                    <Heading as="h2" size="lg">
                                        Flashcards
                                    </Heading>
                                </HStack>
                                <Button
                                    as={Link}
                                    to={flashcardListPath()}
                                    rightIcon={<Icon as={ChevronRight} />}
                                    colorScheme="blue"
                                    size="sm"
                                >
                                    Browse All
                                </Button>
                            </Flex>
                            <Image
                                src="/images/IMG_5492.jpeg"
                                alt="Flashcards"
                                borderRadius="md"
                                h="200px"
                                w="100%"
                                objectFit="cover"
                                mb={4}
                            />
                            <Text color="gray.600" mb={4}>
                                Learn vocabulary with spaced repetition. Each
                                card includes translations, phonetics, and
                                example sentences. Perfect for building your
                                word bank.
                            </Text>
                        </Box>

                        {/* Featured Flashcards */}
                        {featuredCollections.length > 0 && (
                            <Box mb={6}>
                                <Heading size="sm" mb={3}>
                                    Featured
                                </Heading>
                                <Stack spacing={3}>
                                    {featuredCollections.map((collection) => (
                                        <Link
                                            to={collectionDetailPath(
                                                collection.collectionId,
                                            )}
                                            key={collection.collectionId}
                                        >
                                            <Flex
                                                bg={boxBg}
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                borderRadius="md"
                                                overflow="hidden"
                                                transition="all 0.2s"
                                                _hover={{
                                                    transform:
                                                        "translateY(-2px)",
                                                    shadow: "md",
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        collection.imageUrl ||
                                                        "/images/bangkok-rainbow.jpeg"
                                                    }
                                                    alt={collection.name}
                                                    w="120px"
                                                    h="100px"
                                                    objectFit="cover"
                                                    flexShrink={0}
                                                />
                                                <Box p={4} flex="1">
                                                    <Heading size="sm" mb={2}>
                                                        {collection.name}
                                                    </Heading>
                                                    <Text
                                                        fontSize="sm"
                                                        color="gray.500"
                                                        noOfLines={2}
                                                        mb={2}
                                                    >
                                                        {collection.description}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Tag
                                                            size="sm"
                                                            colorScheme="green"
                                                        >
                                                            {
                                                                collection.sourceLanguage
                                                            }{" "}
                                                            →{" "}
                                                            {
                                                                collection.targetLanguage
                                                            }
                                                        </Tag>
                                                        {collection.difficulty && (
                                                            <Tag
                                                                size="sm"
                                                                colorScheme="purple"
                                                            >
                                                                {
                                                                    collection.difficulty
                                                                }
                                                            </Tag>
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </Flex>
                                        </Link>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Flashcards by Language */}
                        <Box>
                            <Heading size="sm" mb={3}>
                                By Language
                            </Heading>
                            <SimpleGrid columns={2} spacing={3}>
                                {collectionsByLanguage.map((group) => (
                                    <Link
                                        to={flashcardListPath()}
                                        key={group.fieldValue}
                                        state={{ language: group.fieldValue }}
                                    >
                                        <Box
                                            bg={boxBg}
                                            borderWidth="1px"
                                            borderColor={borderColor}
                                            borderRadius="md"
                                            p={3}
                                            textAlign="center"
                                            transition="all 0.2s"
                                            _hover={{ bg: flashcardHoverBg }}
                                        >
                                            <Text
                                                fontWeight="bold"
                                                fontSize="sm"
                                                mb={1}
                                            >
                                                {group.fieldValue}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                            >
                                                {group.totalCount} collection
                                                {group.totalCount !== 1
                                                    ? "s"
                                                    : ""}
                                            </Text>
                                        </Box>
                                    </Link>
                                ))}
                            </SimpleGrid>
                        </Box>
                    </Box>

                    {/* Reading Column */}
                    <Box>
                        <Box mb={6}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <HStack spacing={3}>
                                    <Icon
                                        as={BookOpen}
                                        boxSize={7}
                                        color="green.500"
                                    />
                                    <Heading as="h2" size="lg">
                                        Reading
                                    </Heading>
                                </HStack>
                                <Button
                                    as={Link}
                                    to={readingPath()}
                                    rightIcon={<Icon as={ChevronRight} />}
                                    colorScheme="green"
                                    size="sm"
                                >
                                    Browse All
                                </Button>
                            </Flex>
                            <Image
                                src="/images/IMG_5673.jpeg"
                                alt="Reading"
                                borderRadius="md"
                                h="200px"
                                w="100%"
                                objectFit="cover"
                                mb={4}
                            />
                            <Text color="gray.600" mb={4}>
                                Practice reading with stories that include
                                phonetics and word-by-word breakdowns. Build
                                comprehension and learn grammar in context.
                            </Text>
                        </Box>

                        {/* Featured Books */}
                        {featuredBooks.length > 0 && (
                            <Box mb={6}>
                                <Heading size="sm" mb={3}>
                                    Featured
                                </Heading>
                                <Stack spacing={3}>
                                    {featuredBooks.map((book) => (
                                        <Link
                                            to={bookDetailPath(book.bookId)}
                                            key={book.bookId}
                                        >
                                            <Flex
                                                bg={boxBg}
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                borderRadius="md"
                                                overflow="hidden"
                                                transition="all 0.2s"
                                                _hover={{
                                                    transform:
                                                        "translateY(-2px)",
                                                    shadow: "md",
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        book.imageUrl ||
                                                        "/images/bangkok-rainbow.jpeg"
                                                    }
                                                    alt={book.name}
                                                    w="120px"
                                                    h="100px"
                                                    objectFit="cover"
                                                    flexShrink={0}
                                                />
                                                <Box p={4} flex="1">
                                                    <Heading size="sm" mb={2}>
                                                        {book.name}
                                                    </Heading>
                                                    <Text
                                                        fontSize="sm"
                                                        color="gray.500"
                                                        noOfLines={2}
                                                        mb={2}
                                                    >
                                                        {book.description}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Tag
                                                            size="sm"
                                                            colorScheme="green"
                                                        >
                                                            {
                                                                book.sourceLanguage
                                                            }
                                                        </Tag>
                                                        {book.difficulty && (
                                                            <Tag
                                                                size="sm"
                                                                colorScheme="purple"
                                                            >
                                                                {
                                                                    book.difficulty
                                                                }
                                                            </Tag>
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </Flex>
                                        </Link>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Reading by Language */}
                        <Box>
                            <Heading size="sm" mb={3}>
                                By Language
                            </Heading>
                            <SimpleGrid columns={2} spacing={3}>
                                {booksByLanguage.map((group) => (
                                    <Link
                                        to={readingPath()}
                                        key={group.fieldValue}
                                        state={{ language: group.fieldValue }}
                                    >
                                        <Box
                                            bg={boxBg}
                                            borderWidth="1px"
                                            borderColor={borderColor}
                                            borderRadius="md"
                                            p={3}
                                            textAlign="center"
                                            transition="all 0.2s"
                                            _hover={{ bg: readingHoverBg }}
                                        >
                                            <Text
                                                fontWeight="bold"
                                                fontSize="sm"
                                                mb={1}
                                            >
                                                {group.fieldValue}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                            >
                                                {group.totalCount} book
                                                {group.totalCount !== 1
                                                    ? "s"
                                                    : ""}
                                            </Text>
                                        </Box>
                                    </Link>
                                ))}
                            </SimpleGrid>
                        </Box>
                    </Box>
                </SimpleGrid>
            </Container>
        </>
    );
};

export default HomePage;

export const query = graphql`
  query HomePage {
    featuredCollections: allCollectionsJson(
      filter: { featured: { eq: true } }
      limit: 3
    ) {
      nodes {
        collectionId
        name
        description
        sourceLanguage
        targetLanguage
        difficulty
        imageUrl
      }
    }
    featuredBooks: allBookJson(filter: { featured: { eq: true } }, limit: 3) {
      nodes {
        bookId
        name
        description
        sourceLanguage
        difficulty
        imageUrl
      }
    }
    allCollections: allCollectionsJson {
      group(field: { sourceLanguage: SELECT }) {
        fieldValue
        totalCount
      }
    }
    allBooks: allBookJson {
      group(field: { sourceLanguage: SELECT }) {
        fieldValue
        totalCount
      }
    }
  }
`;
