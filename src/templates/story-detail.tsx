import React, { useId, useMemo, useState } from "react";

import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Collapse,
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
    const [mode, setMode] = useState<"read" | "translate">("read");
    const [showPhonetic, setShowPhonetic] = useState(true);
    const [sourceTextSize, setSourceTextSize] = useState<"sm" | "md" | "xl">(
        "md",
    );
    const [revealedSentences, setRevealedSentences] = useState<Set<number>>(
        new Set(),
    );
    const [breakdownSentences, setBreakdownSentences] = useState<Set<number>>(
        new Set(),
    );
    const { isOpen, onOpen, onClose } = useDisclosure();

    const headerBg = semanticColors.header.reading;
    const headerBorder = semanticColors.border.header.reading;
    const metaColor = semanticColors.text.secondary;
    const phoneticColor = semanticColors.text.phonetic;
    const breakdownBorderColor = semanticColors.breakdown.border;
    const breakdownAccentColor = semanticColors.breakdown.accent;

    const phoneticToggleId = useId();
    const fontChoiceId = useId();

    const toggleSentenceReveal = (index: number) => {
        setRevealedSentences((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const toggleBreakdown = (index: number) => {
        setBreakdownSentences((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const revealAll = () => {
        setRevealedSentences(
            new Set(story.sentences.map((_: ReadingSentence, index: number) => index)),
        );
    };

    const hideAll = () => {
        setRevealedSentences(new Set());
    };

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
                                <Box mb={4}>
                                    <Text
                                        fontSize="lg"
                                        fontWeight="medium"
                                        mb={1}
                                    >
                                        {story.summary.source}
                                    </Text>
                                    <Text
                                        fontSize="md"
                                        color={metaColor}
                                    >
                                        {story.summary.target}
                                    </Text>
                                </Box>
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

            <Box maxW={{ base: "100%", md: "700px", lg: "800px" }} mx="auto" px={4} py={10}>
                {/* Mode Toggle */}
                <Flex justify="center" mb={6}>
                    <ButtonGroup size="lg" isAttached variant="outline">
                        <Button
                            onClick={() => {
                                setMode("read");
                                hideAll();
                            }}
                            colorScheme={mode === "read" ? "blue" : "gray"}
                            variant={mode === "read" ? "solid" : "outline"}
                            px={8}
                        >
                            📖 Read Mode
                        </Button>
                        <Button
                            onClick={() => {
                                setMode("translate");
                                hideAll();
                            }}
                            colorScheme={mode === "translate" ? "green" : "gray"}
                            variant={mode === "translate" ? "solid" : "outline"}
                            px={8}
                        >
                            ✍️ Translate Mode
                        </Button>
                    </ButtonGroup>
                </Flex>

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
                        align={{ base: "stretch", sm: "center" }}
                        width={{ base: "100%", sm: "auto" }}
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
                                    <Text fontSize="sm">ก</Text>
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
                                    <Text fontSize="lg">ก</Text>
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
                                    <Text fontSize="xl">ก</Text>
                                </Button>
                            </ButtonGroup>
                        </FormControl>

                        {mode === "read" && (
                            <>
                                <Flex gap={3}>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={revealAll}
                                    >
                                        Reveal All
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={hideAll}
                                    >
                                        Hide All
                                    </Button>
                                </Flex>

                                <FormControl
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    width={{ base: "100%", sm: "auto" }}
                                    gap={3}
                                >
                                    <FormLabel
                                        htmlFor={phoneticToggleId}
                                        mb="0"
                                        fontWeight="medium"
                                    >
                                        Show Phonetics
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
                            </>
                        )}

                        {mode === "translate" && (
                            <>
                                <Flex gap={3}>
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        variant="outline"
                                        onClick={revealAll}
                                    >
                                        Reveal All
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={hideAll}
                                    >
                                        Hide All
                                    </Button>
                                </Flex>

                                <FormControl
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    width={{ base: "100%", sm: "auto" }}
                                    gap={3}
                                >
                                    <FormLabel
                                        htmlFor={phoneticToggleId}
                                        mb="0"
                                        fontWeight="medium"
                                    >
                                        Show Phonetics
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
                            </>
                        )}
                    </Stack>
                </Flex>
                <Stack spacing={6}>
                    {story.sentences.map(
                        (sentence: ReadingSentence, index: number) => {
                            const isRevealed = revealedSentences.has(index);
                            const showBreakdownForSentence = breakdownSentences.has(index);
                            const hasBreakdown = sentence.breakdown && sentence.breakdown.length > 0;

                            if (mode === "translate") {
                                const cardBg = isRevealed ? "green.50" : "white";
                                const cardBorder = isRevealed ? "green.200" : "gray.200";
                                const cardHoverBorder = isRevealed ? "green.300" : "gray.300";

                                return (
                                    <Box
                                        key={`${story.storyId}-${index}`}
                                        borderWidth="1px"
                                        borderColor={cardBorder}
                                        borderRadius="md"
                                        p={4}
                                        bg={cardBg}
                                        transition="all 0.2s"
                                        _hover={{
                                            borderColor: cardHoverBorder,
                                            shadow: "sm",
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="medium"
                                            >
                                                {sentence.target}
                                            </Text>

                                            {!isRevealed && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="green"
                                                    onClick={() => toggleSentenceReveal(index)}
                                                    width="fit-content"
                                                >
                                                    Show Answer
                                                </Button>
                                            )}

                                            <Collapse
                                                in={isRevealed}
                                                animateOpacity
                                            >
                                                <Stack spacing={3} pt={2}>
                                                    <Text
                                                        fontSize={sourceTextSize}
                                                        fontWeight="semibold"
                                                    >
                                                        <TextToSpeech
                                                            text={sentence.source}
                                                            lang={story.language}
                                                        />{" "}
                                                        {sentence.source}
                                                    </Text>

                                                    {showPhonetic && (
                                                        <Flex align="center" gap={2}>
                                                            {hasBreakdown && (
                                                                <Button
                                                                    size="xs"
                                                                    colorScheme="orange"
                                                                    variant={showBreakdownForSentence ? "solid" : "outline"}
                                                                    onClick={() => toggleBreakdown(index)}
                                                                    flexShrink={0}
                                                                >
                                                                    {showBreakdownForSentence ? "−" : "+"}
                                                                </Button>
                                                            )}
                                                            <Text
                                                                fontSize="sm"
                                                                fontStyle="italic"
                                                                color={phoneticColor}
                                                            >
                                                                {sentence.phonetic}
                                                            </Text>
                                                        </Flex>
                                                    )}

                                                    {showBreakdownForSentence && hasBreakdown && (
                                                            <Stack
                                                                spacing={1}
                                                                pl={4}
                                                                borderLeft="2px"
                                                                borderColor={
                                                                    breakdownBorderColor
                                                                }
                                                            >
                                                                {sentence.breakdown!.map(
                                                                    (word, wordIndex) => (
                                                                        <Text
                                                                            key={`${story.storyId}-${index}-${wordIndex}`}
                                                                            fontSize="sm"
                                                                            color={
                                                                                metaColor
                                                                            }
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
                                                                                {
                                                                                    word.source
                                                                                }
                                                                            </Text>{" "}
                                                                            <Text
                                                                                as="span"
                                                                                fontStyle="italic"
                                                                                color={
                                                                                    phoneticColor
                                                                                }
                                                                            >
                                                                                {
                                                                                    word.phonetic
                                                                                }
                                                                            </Text>
                                                                            {
                                                                                " → "
                                                                            }
                                                                            {
                                                                                word.target
                                                                            }
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

                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => toggleSentenceReveal(index)}
                                                        width="fit-content"
                                                    >
                                                        Hide Answer
                                                    </Button>
                                                </Stack>
                                            </Collapse>
                                        </Stack>
                                    </Box>
                                );
                            }

                            // Read mode
                            const cardBg = isRevealed ? "blue.50" : "white";
                            const cardBorder = isRevealed ? "blue.200" : "gray.200";
                            const cardHoverBorder = isRevealed ? "blue.300" : "gray.300";

                            return (
                                <Box
                                    key={`${story.storyId}-${index}`}
                                    borderWidth="1px"
                                    borderColor={cardBorder}
                                    borderRadius="md"
                                    p={4}
                                    bg={cardBg}
                                    transition="all 0.2s"
                                    _hover={{
                                        borderColor: cardHoverBorder,
                                        shadow: "sm",
                                    }}
                                >
                                    <Stack spacing={3}>
                                        <Text
                                            fontSize={sourceTextSize}
                                            fontWeight="semibold"
                                        >
                                            <TextToSpeech
                                                text={sentence.source}
                                                lang={story.language}
                                            />{" "}
                                            {sentence.source}
                                        </Text>

                                        {!isRevealed && (
                                            <>
                                                {showPhonetic && (
                                                    <Text
                                                        fontSize="sm"
                                                        fontStyle="italic"
                                                        color={phoneticColor}
                                                    >
                                                        {sentence.phonetic}
                                                    </Text>
                                                )}
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => toggleSentenceReveal(index)}
                                                    width="fit-content"
                                                >
                                                    Show Translation
                                                </Button>
                                            </>
                                        )}

                                        <Collapse
                                            in={isRevealed}
                                            animateOpacity
                                        >
                                            <Stack spacing={3} pt={2}>
                                                <Text fontSize="lg" color={metaColor}>
                                                    {sentence.target}
                                                </Text>

                                                {showPhonetic && (
                                                    <Flex align="center" gap={2}>
                                                        {hasBreakdown && (
                                                            <Button
                                                                size="xs"
                                                                colorScheme="orange"
                                                                variant={showBreakdownForSentence ? "solid" : "outline"}
                                                                onClick={() => toggleBreakdown(index)}
                                                                flexShrink={0}
                                                            >
                                                                {showBreakdownForSentence ? "−" : "+"}
                                                            </Button>
                                                        )}
                                                        <Text
                                                            fontSize="sm"
                                                            fontStyle="italic"
                                                            color={phoneticColor}
                                                        >
                                                            {sentence.phonetic}
                                                        </Text>
                                                    </Flex>
                                                )}

                                                {showBreakdownForSentence && hasBreakdown && (
                                                        <Stack
                                                            spacing={1}
                                                            pl={4}
                                                            borderLeft="2px"
                                                            borderColor={
                                                                breakdownBorderColor
                                                            }
                                                        >
                                                            {sentence.breakdown!.map(
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

                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => toggleSentenceReveal(index)}
                                                    width="fit-content"
                                                >
                                                    Hide Translation
                                                </Button>
                                            </Stack>
                                        </Collapse>
                                    </Stack>
                                </Box>
                            );
                        },
                    )}
                </Stack>
            </Box>
            <Drawer
                isOpen={isOpen}
                placement="right"
                size="full"
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent onClick={onClose}>
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
                    story?.summary?.target ||
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
        summary {
          source
          target
        }
        language
        difficulty
        sentences {
          source
          target
          phonetic
          breakdown {
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
