import React from "react";

import {
    Box,
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
import { Library } from "lucide-react";

import { LazyImage } from "../components/LazyImage";
import { PageHeader } from "../components/PageHeader";
import { semanticColors, tagColorSchemes } from "../theme/colors";
import type { Book, ReadingStory } from "../types";
import { bookDetailPath, readingPath, storyDetailPath } from "../utils/paths";

interface BookDetailTemplateProps {
    data: {
        book: Book;
        stories: {
            nodes: ReadingStory[];
        };
        otherBooks: {
            nodes: Book[];
        };
        grammar?: {
            rawMarkdownBody: string;
        };
    };
}

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    const cardBg = semanticColors.card.bg;
    const cardBorder = semanticColors.card.border;

    return (
        <Link to={bookDetailPath(book.bookId)} style={{ height: "100%" }}>
            <Flex
                bg={cardBg}
                borderWidth="1px"
                borderColor={cardBorder}
                borderRadius="md"
                overflow="hidden"
                transition="all 0.2s"
                height="100%"
                _hover={{
                    transform: "translateY(-2px)",
                    shadow: "md",
                    borderColor: "green.300",
                }}
            >
                {book.imageUrl && (
                    <LazyImage
                        src={book.imageUrl}
                        alt={book.name}
                        w="120px"
                        h="100px"
                        objectFit="cover"
                        flexShrink={0}
                        loading="lazy"
                    />
                )}
                <Box p={4} flex="1">
                    <Heading size="sm" mb={2}>
                        {book.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" noOfLines={2} mb={2}>
                        {book.description}
                    </Text>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Tag size="sm" colorScheme={tagColorSchemes.language}>
                            {book.sourceLanguage}
                        </Tag>
                        {book.difficulty && (
                            <Tag
                                size="sm"
                                colorScheme={tagColorSchemes.difficulty}
                            >
                                {book.difficulty}
                            </Tag>
                        )}
                    </Stack>
                </Box>
            </Flex>
        </Link>
    );
};

const BookDetailTemplate: React.FC<BookDetailTemplateProps> = ({ data }) => {
    const book = data.book;
    const stories = data.stories.nodes;
    const otherBooks = data.otherBooks.nodes;

    const headerBg = semanticColors.header.reading;
    const headerBorder = semanticColors.border.header.reading;
    const cardBg = semanticColors.card.bg;
    const cardBorder = semanticColors.card.border;
    const storyMetaColor = semanticColors.text.secondary;

    return (
        <>
            <PageHeader
                bg={headerBg}
                borderColor={headerBorder}
                breadcrumbItems={[
                    { label: "Home", path: "/" },
                    { label: "Reading", path: readingPath() },
                    { label: book.name, isCurrentPage: true },
                ]}
                title={book.name}
                subtitle={book.description}
                imageUrl={book.imageUrl}
                imageAlt={book.name}
                tags={
                    <Stack
                        direction={{ base: "column", sm: "row" }}
                        spacing={3}
                        wrap="wrap"
                    >
                        <Tag colorScheme={tagColorSchemes.language}>
                            {book.sourceLanguage}
                        </Tag>
                        {book.targetLanguage && (
                            <Tag colorScheme={tagColorSchemes.targetLanguage}>
                                {book.targetLanguage}
                            </Tag>
                        )}
                        {book.difficulty && (
                            <Tag colorScheme={tagColorSchemes.difficulty}>
                                {book.difficulty}
                            </Tag>
                        )}
                        {book.category && (
                            <Tag colorScheme={tagColorSchemes.category}>
                                {book.category}
                            </Tag>
                        )}
                        {book.featured && (
                            <Tag colorScheme={tagColorSchemes.featured}>
                                Featured
                            </Tag>
                        )}
                    </Stack>
                }
            >
                <Flex align="center" mb={3}>
                    <Icon as={Library} color="primary.400" boxSize={6} mr={2} />
                </Flex>
            </PageHeader>

            <Container maxW="container.xl" py={10}>
                <Heading as="h2" size="lg" mb={6}>
                    Stories
                </Heading>

                {stories.length === 0 ? (
                    <Box
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={cardBorder}
                        bg={cardBg}
                        p={8}
                        textAlign="center"
                    >
                        <Text>No stories available yet. Check back soon!</Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                        {stories.map((story: ReadingStory) => (
                            <Box
                                as={Link}
                                to={storyDetailPath(book.bookId, story.storyId)}
                                key={story.storyId}
                                borderWidth="1px"
                                borderRadius="lg"
                                borderColor={cardBorder}
                                p={6}
                                transition="all 0.2s"
                                _hover={{
                                    transform: "translateY(-4px)",
                                    boxShadow: "md",
                                }}
                            >
                                <Heading as="h3" size="md" mb={2}>
                                    {story.title.source}
                                </Heading>

                                {story.title.source && (
                                    <Text
                                        fontSize="sm"
                                        color={storyMetaColor}
                                        mb={3}
                                    >
                                        {story.title.target}
                                    </Text>
                                )}

                                {story.summary && (
                                    <Box mb={3}>
                                        <Text fontWeight="medium" mb={1}>
                                            {story.summary.source}
                                        </Text>
                                        <Text
                                            color={storyMetaColor}
                                            fontSize="sm"
                                        >
                                            {story.summary.target}
                                        </Text>
                                    </Box>
                                )}
                                <Stack
                                    direction={{ base: "column", sm: "row" }}
                                    spacing={2}
                                    wrap="wrap"
                                >
                                    <Tag colorScheme={tagColorSchemes.language}>
                                        {story.language}
                                    </Tag>
                                    {story.difficulty && (
                                        <Tag
                                            colorScheme={
                                                tagColorSchemes.difficulty
                                            }
                                        >
                                            {story.difficulty}
                                        </Tag>
                                    )}
                                </Stack>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Container>

            {otherBooks.length > 0 && (
                <Container maxW="container.xl" py={8}>
                    <Heading as="h2" size="lg" mb={6}>
                        You May Also Like
                    </Heading>

                    <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={4}
                        alignItems="stretch"
                    >
                        {otherBooks.map((otherBook) => (
                            <BookCard key={otherBook.bookId} book={otherBook} />
                        ))}
                    </SimpleGrid>
                </Container>
            )}
        </>
    );
};

export default BookDetailTemplate;

export const Head: HeadFC<any> = ({ data }) => {
    const book = data?.book;
    const bookName = book?.name || "Reading";

    return (
        <>
            <title>{bookName} | Lingo Lotus</title>
            <meta
                name="description"
                content={book?.description || `Read ${bookName} on Lingo Lotus`}
            />
        </>
    );
};

export const query = graphql`
  query BookDetail($bookId: String!, $sourceLanguage: String!, $difficulty: String) {
    book: bookJson(bookId: { eq: $bookId }) {
      bookId
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
    stories: allBookStoryJson(filter: { bookId: { eq: $bookId } }) {
      nodes {
        storyId
        bookId
        language
        title {
          source
          target
        }
        sentences {
          source
          target
          phonetic
        }
        createdAt
        updatedAt
        difficulty
        summary {
          source
          target
        }
      }
    }
    otherBooks: allBookJson(
      filter: {
        bookId: { ne: $bookId }
        difficulty: { eq: $difficulty }
      }
      limit: 3
    ) {
      nodes {
        bookId
        name
        description
        sourceLanguage
        targetLanguage
        difficulty
        imageUrl
        category
        featured
      }
    }
    grammar: markdownRemark(
      fileAbsolutePath: { regex: $sourceLanguage }
    ) {
      rawMarkdownBody
    }
  }
`;
