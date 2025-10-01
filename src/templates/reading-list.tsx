import React from "react";

import {
    Box,
    Container,
    Flex,
    Heading,
    HStack,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import type { PageProps } from "gatsby";
import { graphql, HeadFC, Link } from "gatsby";

import { LanguageCard } from "../components/LanguageCard";
import { LazyImage } from "../components/LazyImage";
import { semanticColors, tagColorSchemes } from "../theme/colors";
import { tokens } from "../theme/tokens";
import type { Book } from "../types";
import type { LanguageConfig } from "../types/language";
import { bookDetailPath } from "../utils/paths";

type ReadingPageData = {
    allBookJson: {
        nodes: Book[];
    };
    allLanguagesJson: {
        nodes: LanguageConfig[];
    };
};

const ReadingListTemplate = ({ data }: PageProps<ReadingPageData>) => {
    const heroBg = semanticColors.hero.reading;
    const sectionBg = semanticColors.section.bg;
    const borderColor = semanticColors.border.default;
    const _cardBg = semanticColors.card.bg;
    const _cardBorderColor = semanticColors.card.border;
    const supportingTextColor = semanticColors.text.supporting;

    const books = data.allBookJson.nodes;
    const languages = data.allLanguagesJson.nodes;

    // Create a map of language codes to language configs
    const languageMap = new Map(
        languages.map((lang) => [lang.languageCode, lang]),
    );

    // Group books by language
    const booksByLanguage: { [key: string]: Book[] } = {};
    books.forEach((book) => {
        const lang = book.sourceLanguage;
        if (!booksByLanguage[lang]) {
            booksByLanguage[lang] = [];
        }
        booksByLanguage[lang].push(book);
    });

    // Sort books within each language by difficulty
    const difficultyOrder = ["Beginner", "Intermediate", "Advanced"];
    Object.keys(booksByLanguage).forEach((lang) => {
        booksByLanguage[lang].sort((a, b) => {
            const diffA = a.difficulty || "Other";
            const diffB = b.difficulty || "Other";
            const indexA = difficultyOrder.indexOf(diffA);
            const indexB = difficultyOrder.indexOf(diffB);
            return (
                (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
            );
        });
    });

    return (
        <>
            {/* Hero */}
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
                                Practice Reading
                            </Heading>
                            <Text fontSize={{ base: "lg", md: "xl" }} mb={6}>
                                Build comprehension and confidence with
                                bite-sized passages and helpful tools.
                            </Text>
                            <Text
                                fontSize={{ base: "md", md: "lg" }}
                                color={supportingTextColor}
                            >
                                Start with beginner stories to build your
                                foundation, but don't be afraid to dip into
                                intermediate content when you're feeling
                                confident—or go back to practice what you've
                                already learned. Learning is not always linear!
                            </Text>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            {/* Books List */}
            <Container maxW="container.xl" mb={16}>
                {books.length === 0 ? (
                    <Box
                        bg={sectionBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="lg"
                        p={8}
                        textAlign="center"
                    >
                        <Text>
                            No reading collections available yet. Check back
                            soon!
                        </Text>
                    </Box>
                ) : (
                    <Stack spacing={12}>
                        {Object.keys(booksByLanguage).map((languageCode) => {
                            const languageConfig =
                                languageMap.get(languageCode);
                            const languageName =
                                languageConfig?.language ||
                                languageCode.toUpperCase();
                            const flag = languageConfig?.flag || "";

                            return (
                                <Box key={languageCode}>
                                    <Heading as="h2" size="xl" mb={6}>
                                        {flag && (
                                            <span
                                                style={{
                                                    marginRight: "0.5rem",
                                                }}
                                            >
                                                {flag}
                                            </span>
                                        )}
                                        {languageName} (
                                        {languageConfig?.english})
                                    </Heading>
                                    <SimpleGrid
                                        columns={{ base: 1, md: 2, lg: 3 }}
                                        spacing={8}
                                    >
                                        {booksByLanguage[languageCode].map(
                                            (book: Book) => (
                                                <Link
                                                    to={bookDetailPath(
                                                        book.bookId,
                                                    )}
                                                    key={book.bookId}
                                                    style={{ height: "100%" }}
                                                >
                                                    <LanguageCard
                                                        display="flex"
                                                        flexDirection="column"
                                                        height="100%"
                                                    >
                                                        {book.imageUrl && (
                                                            <LazyImage
                                                                src={
                                                                    book.imageUrl
                                                                }
                                                                alt={book.name}
                                                                w="100%"
                                                                h={
                                                                    tokens.card
                                                                        .imageHeight
                                                                }
                                                                objectFit="cover"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <Box
                                                            p={
                                                                tokens.card
                                                                    .padding
                                                            }
                                                            flex="1"
                                                            display="flex"
                                                            flexDirection="column"
                                                        >
                                                            <Heading
                                                                as="h4"
                                                                size="md"
                                                                mb={2}
                                                            ></Heading>
                                                            <Text
                                                                color={
                                                                    supportingTextColor
                                                                }
                                                                mb={4}
                                                                flex="1"
                                                            >
                                                                {
                                                                    book.description
                                                                }
                                                            </Text>
                                                            <HStack
                                                                spacing={2}
                                                                flexWrap="wrap"
                                                                mt="auto"
                                                            >
                                                                <Tag
                                                                    colorScheme={
                                                                        tagColorSchemes.language
                                                                    }
                                                                    textTransform="uppercase"
                                                                >
                                                                    {
                                                                        book.sourceLanguage
                                                                    }
                                                                </Tag>
                                                                {book.targetLanguage && (
                                                                    <Tag
                                                                        colorScheme={
                                                                            tagColorSchemes.targetLanguage
                                                                        }
                                                                        textTransform="uppercase"
                                                                    >
                                                                        {
                                                                            book.targetLanguage
                                                                        }
                                                                    </Tag>
                                                                )}
                                                                {book.difficulty && (
                                                                    <Tag
                                                                        colorScheme={
                                                                            tagColorSchemes.difficulty
                                                                        }
                                                                    >
                                                                        {
                                                                            book.difficulty
                                                                        }
                                                                    </Tag>
                                                                )}
                                                                {book.featured && (
                                                                    <Tag
                                                                        colorScheme={
                                                                            tagColorSchemes.featured
                                                                        }
                                                                    >
                                                                        Featured
                                                                    </Tag>
                                                                )}
                                                            </HStack>
                                                        </Box>
                                                    </LanguageCard>
                                                </Link>
                                            ),
                                        )}
                                    </SimpleGrid>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Container>
        </>
    );
};

export default ReadingListTemplate;

export const Head: HeadFC = () => <title>Reading | Lingo Lotus</title>;

export const query = graphql`
  query ReadingList {
    allBookJson {
      nodes {
        bookId
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
    allLanguagesJson {
      nodes {
        languageCode
        language
        english
        flag
      }
    }
  }
`;
