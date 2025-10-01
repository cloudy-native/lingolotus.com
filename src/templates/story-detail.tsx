import React, { useId, useMemo, useState } from "react";

import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Icon,
    Image,
    Stack,
    Switch,
    Tag,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import type { PageProps } from "gatsby";
import { graphql, HeadFC, Link } from "gatsby";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { TextToSpeech } from "../components/speech/TextToSpeech";
import { semanticColors, tagColorSchemes } from "../theme/colors";
import type { Book, ReadingSentence, ReadingStory } from "../types";
import { bookDetailPath, readingPath } from "../utils/paths";

interface StoryDetailPageData {
    book: Book;
    story: ReadingStory;
    grammar?: {
        rawMarkdownBody: string;
    };
    language?: {
        languageCode: string;
    };
}

const StoryDetailTemplate = ({ data }: PageProps<StoryDetailPageData>) => {
    const { book, story } = data;
    const [showTarget, setShowTarget] = useState(true);
    const [showPhonetic, setShowPhonetic] = useState(true);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [sourceTextSize, setSourceTextSize] = useState<"sm" | "md" | "xl">(
        "md",
    );
    const { isOpen, onOpen, onClose } = useDisclosure();

    const headerBg = semanticColors.header.reading;
    const headerBorder = semanticColors.border.header.reading;
    const metaColor = semanticColors.text.secondary;
    const phoneticColor = semanticColors.text.phonetic;
    const breakdownBorderColor = semanticColors.breakdown.border;
    const breakdownAccentColor = semanticColors.breakdown.accent;

    const translateToggleId = useId();
    const phoneticToggleId = useId();
    const breakdownToggleId = useId();
    const fontChoiceId = useId();

    // Check if any sentence has breakdown data
    const hasBreakdowns = story.sentences?.some(
        (sentence) => sentence.breakdown && sentence.breakdown.length > 0,
    );

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
                            <BreadcrumbLink as={Link} to={readingPath()}>
                                Reading
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={Link}
                                to={bookDetailPath(book.bookId)}
                            >
                                {book.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink>
                                {story.title.target}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>

                    <Flex
                        direction={{ base: "column", md: "row" }}
                        gap={6}
                        align="flex-start"
                    >
                        {book.imageUrl && (
                            <Image
                                src={book.imageUrl}
                                alt={book.name}
                                borderRadius="lg"
                                boxSize={{ base: "100%", md: "240px" }}
                                objectFit="cover"
                            />
                        )}

                        <Box flex="1">
                            <Heading as="h1" size="xl" mb={1}>
                                {story.title.source}
                            </Heading>
                            <Text fontSize="lg" color={metaColor} mb={3}>
                                {story.title.target}
                            </Text>

                            {story.summary && (
                                <Text
                                    fontSize="lg"
                                    mb={4}
                                    color={metaColor}
                                ></Text>
                            )}

                            <Stack spacing={3}>
                                <Stack direction="row" spacing={3} wrap="wrap">
                                    <Tag
                                        colorScheme={tagColorSchemes.language}
                                        textTransform="uppercase"
                                    >
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
                                    {/* <Tag colorScheme="teal">{sentenceCountLabel}</Tag> */}
                                </Stack>
                                <Button
                                    colorScheme="primary"
                                    onClick={onOpen}
                                    width={{ base: "100%", sm: "auto" }}
                                    maxWidth="200px"
                                >
                                    Grammar Cheatsheet
                                </Button>
                            </Stack>
                        </Box>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={10}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    mb={8}
                    gap={6}
                >
                    <Stack
                        direction={{ base: "column", sm: "row" }}
                        spacing={4}
                        align="center"
                    >
                        <FormControl
                            display="flex"
                            alignItems="center"
                            width="auto"
                        >
                            <ButtonGroup size="md" isAttached>
                                <Button
                                    variant={
                                        sourceTextSize === "sm"
                                            ? "solid"
                                            : "outline"
                                    }
                                    onClick={() => setSourceTextSize("sm")}
                                    title="Small text"
                                >
                                    <Text fontSize="sm">A</Text>
                                </Button>
                                <Button
                                    variant={
                                        sourceTextSize === "md"
                                            ? "solid"
                                            : "outline"
                                    }
                                    onClick={() => setSourceTextSize("md")}
                                    title="Medium text"
                                >
                                    <Text fontSize="md">A</Text>
                                </Button>
                                <Button
                                    variant={
                                        sourceTextSize === "xl"
                                            ? "solid"
                                            : "outline"
                                    }
                                    onClick={() => setSourceTextSize("xl")}
                                    title="Large text"
                                >
                                    <Text fontSize="lg">A</Text>
                                </Button>
                            </ButtonGroup>
                        </FormControl>

                        <FormControl
                            display="flex"
                            alignItems="center"
                            width="auto"
                        >
                            <FormLabel
                                htmlFor={translateToggleId}
                                mb="0"
                                fontWeight="medium"
                            >
                                Translate
                            </FormLabel>
                            <Switch
                                id={translateToggleId}
                                colorScheme="primary"
                                isChecked={showTarget}
                                onChange={(event) =>
                                    setShowTarget(event.target.checked)
                                }
                            />
                        </FormControl>

                        <FormControl
                            display="flex"
                            alignItems="center"
                            width="auto"
                        >
                            <FormLabel
                                htmlFor={phoneticToggleId}
                                mb="0"
                                fontWeight="medium"
                            >
                                Phonetics
                            </FormLabel>
                            <Switch
                                id={phoneticToggleId}
                                colorScheme="teal"
                                isChecked={showPhonetic}
                                onChange={(event) =>
                                    setShowPhonetic(event.target.checked)
                                }
                            />
                        </FormControl>

                        {hasBreakdowns && (
                            <FormControl
                                display="flex"
                                alignItems="center"
                                width="auto"
                            >
                                <FormLabel
                                    htmlFor={breakdownToggleId}
                                    mb="0"
                                    fontWeight="medium"
                                >
                                    Break it down
                                </FormLabel>
                                <Switch
                                    id={breakdownToggleId}
                                    colorScheme="orange"
                                    isChecked={showBreakdown}
                                    onChange={(event) =>
                                        setShowBreakdown(event.target.checked)
                                    }
                                />
                            </FormControl>
                        )}
                    </Stack>
                </Flex>
                <Stack spacing={6}>
                    {story.sentences.map(
                        (sentence: ReadingSentence, index: number) => (
                            <Stack
                                key={`${story.storyId}-${index}`}
                                spacing={3}
                            >
                                <Text fontSize={sourceTextSize}>
                                    <TextToSpeech
                                        text={sentence.source}
                                        lang={story.language}
                                    />{" "}
                                    {sentence.source}
                                </Text>

                                {showPhonetic && (
                                    <Text
                                        fontSize="sm"
                                        fontStyle="italic"
                                        color={phoneticColor}
                                    >
                                        {sentence.phonetic}
                                    </Text>
                                )}

                                {showTarget && (
                                    <Text fontSize="lg" color={metaColor}>
                                        {sentence.target}
                                    </Text>
                                )}

                                {showBreakdown &&
                                    sentence.breakdown &&
                                    sentence.breakdown.length > 0 && (
                                        <Stack
                                            spacing={1}
                                            pl={4}
                                            borderLeft="2px"
                                            borderColor={breakdownBorderColor}
                                        >
                                            {sentence.breakdown.map(
                                                (word, wordIndex) => (
                                                    <Text
                                                        key={`${story.storyId}-${index}-${wordIndex}`}
                                                        fontSize="sm"
                                                        color={metaColor}
                                                    >
                                                        <Text
                                                            as="span"
                                                            fontWeight="semibold"
                                                            color={
                                                                breakdownAccentColor
                                                            }
                                                        >
                                                            <TextToSpeech
                                                                text={
                                                                    word.source
                                                                }
                                                                lang={
                                                                    story.language
                                                                }
                                                            />{" "}
                                                            {word.source}
                                                        </Text>{" "}
                                                        <Text
                                                            as="span"
                                                            fontStyle="italic"
                                                            color={
                                                                phoneticColor
                                                            }
                                                        >
                                                            {word.phonetic}
                                                        </Text>
                                                        {" → "}
                                                        {word.target}
                                                        {word.partOfSpeech && (
                                                            <Text
                                                                as="span"
                                                                color={
                                                                    phoneticColor
                                                                }
                                                            >
                                                                {` (${word.partOfSpeech})`}
                                                            </Text>
                                                        )}
                                                    </Text>
                                                ),
                                            )}
                                        </Stack>
                                    )}
                            </Stack>
                        ),
                    )}
                </Stack>
            </Container>
            <Drawer
                isOpen={isOpen}
                placement="right"
                size="full"
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Grammar Guide</DrawerHeader>
                    <DrawerBody>
                        {data.grammar?.rawMarkdownBody && (
                            <Box
                                className="markdown-content"
                                sx={{
                                    "h1, h2, h3": {
                                        mt: 6,
                                        mb: 4,
                                        fontWeight: "bold",
                                    },
                                    h1: {
                                        fontSize: "2xl",
                                    },
                                    h2: {
                                        fontSize: "xl",
                                    },
                                    p: {
                                        mb: 4,
                                    },
                                    table: {
                                        my: 4,
                                        borderCollapse: "collapse",
                                        width: "100%",
                                    },
                                    "th, td": {
                                        border: "1px solid",
                                        borderColor: "gray.200",
                                        p: 2,
                                        textAlign: "left",
                                    },
                                    th: {
                                        bg: "gray.50",
                                        fontWeight: "bold",
                                    },
                                    ul: {
                                        listStyleType: "disc",
                                        ml: 6,
                                        mb: 3,
                                    },
                                    ol: {
                                        listStyleType: "decimal",
                                        ml: 6,
                                        mb: 3,
                                    },
                                    li: {
                                        mb: 2,
                                    },
                                }}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {data.grammar.rawMarkdownBody}
                                </ReactMarkdown>
                            </Box>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default StoryDetailTemplate;

export const Head: HeadFC<any> = ({ data }) => {
    const story = data?.story;
    const book = data?.book;
    const storyTitle = story?.title?.target || story?.title?.source || "Story";
    const bookName = book?.name || "";

    return (
        <>
            <title>
                {storyTitle} - {bookName} | Lingo Lotus
            </title>
            <meta
                name="description"
                content={
                    story?.summary ||
                    book?.description ||
                    `Read ${storyTitle} on Lingo Lotus`
                }
            />
        </>
    );
};

export const query = graphql`
    query StoryDetail($bookId: String!, $storyId: String!, $storyLanguage: String!) {
      book: bookJson(bookId: { eq: $bookId }) {
        bookId
        name
        description
        sourceLanguage
        targetLanguage
        imageUrl
      }
      story: bookStoryJson(storyId: { eq: $storyId }) {
        storyId
        bookId
        title {
          source
          target
        }
        summary
        language
        difficulty
        sentences {
          source
          target
          phonetic
          breakdown {
            source
            target
            phonetic
            partOfSpeech
          }
        }
        createdAt
        updatedAt
      }

      language: language(languageCode: { eq: $storyLanguage }) {
        languageCode
      }

      grammar: markdownRemark(fileAbsolutePath: { regex: "/grammar/th.md/" }) {
        rawMarkdownBody
      }
    }
`;
