import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Container,
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
    useColorModeValue,
  } from "@chakra-ui/react";
  import type { PageProps } from "gatsby";
  import { graphql, Link } from "gatsby";
  import { BookOpen, ChevronRight } from "lucide-react";
  import React, { useId, useMemo, useState } from "react";
  
  import type { Book, ReadingSentence, ReadingStory } from "../types";
  import { bookDetailPath, readingPath } from "../utils/paths";
  
  interface StoryDetailPageData {
    book: Book;
    story: ReadingStory;
  }
  
  const StoryDetailTemplate = ({ data }: PageProps<StoryDetailPageData>) => {
    const { book, story } = data;
    const [showTarget, setShowTarget] = useState(true);
    const [showPhonetic, setShowPhonetic] = useState(true);
    const [showBreakdown, setShowBreakdown] = useState(false);
  
    const sentenceCountLabel = useMemo(
      () => `${story.sentences.length} sentence${story.sentences.length === 1 ? "" : "s"}`,
      [story.sentences.length],
    );
  
    const headerBg = useColorModeValue("orange.50", "orange.900");
    const headerBorder = useColorModeValue("orange.100", "orange.800");
    const metaColor = useColorModeValue("gray.600", "gray.300");
    const phoneticColor = useColorModeValue("gray.500", "gray.400");
    const breakdownBorderColor = useColorModeValue("orange.200", "orange.600");
    const breakdownAccentColor = useColorModeValue("orange.600", "orange.300");
  
    const translateToggleId = useId();
    const phoneticToggleId = useId();
    const breakdownToggleId = useId();
  
    return (
      <>
        <Box bg={headerBg} borderBottom="1px" borderColor={headerBorder} py={8}>
          <Container maxW="container.xl">
            <Breadcrumb spacing="8px" separator={<Icon as={ChevronRight} color="gray.500" />} mb={4}>
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
                <BreadcrumbLink as={Link} to={bookDetailPath(book.bookId)}>
                  {book.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{story.title.target}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
  
            <Flex direction={{ base: "column", md: "row" }} gap={6} align="flex-start">
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
                  <Text fontSize="lg" mb={4} color={metaColor}>
                    {story.summary}
                  </Text>
                )}
  
                <Stack direction={{ base: "column", sm: "row" }} spacing={3} wrap="wrap">
                  <Tag colorScheme="blue" textTransform="uppercase">
                    {story.language}
                  </Tag>
                  {story.difficulty && <Tag colorScheme="purple">{story.difficulty}</Tag>}
                  <Tag colorScheme="teal">{sentenceCountLabel}</Tag>
                </Stack>
              </Box>
  
              <Icon as={BookOpen} color="primary.400" boxSize={{ base: 16, md: 20 }} />
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
            <Heading as="h2" size="lg">
              Story
            </Heading>
  
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} align="center">
              <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel htmlFor={translateToggleId} mb="0" fontWeight="medium">
                  Translate
                </FormLabel>
                <Switch
                  id={translateToggleId}
                  colorScheme="primary"
                  isChecked={showTarget}
                  onChange={(event) => setShowTarget(event.target.checked)}
                />
              </FormControl>
  
              <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel htmlFor={phoneticToggleId} mb="0" fontWeight="medium">
                  Phonetics
                </FormLabel>
                <Switch
                  id={phoneticToggleId}
                  colorScheme="teal"
                  isChecked={showPhonetic}
                  onChange={(event) => setShowPhonetic(event.target.checked)}
                />
              </FormControl>
  
              <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel htmlFor={breakdownToggleId} mb="0" fontWeight="medium">
                  Break it down
                </FormLabel>
                <Switch
                  id={breakdownToggleId}
                  colorScheme="orange"
                  isChecked={showBreakdown}
                  onChange={(event) => setShowBreakdown(event.target.checked)}
                />
              </FormControl>
            </Stack>
          </Flex>
  
          <Stack spacing={6}>
            {story.sentences.map((sentence: ReadingSentence, index: number) => (
              <Stack key={`${story.storyId}-${index}`} spacing={3}>
                <Text fontSize="xl" fontWeight="semibold">
                  {sentence.source}
                </Text>
  
                {showTarget && (
                  <Text fontSize="lg" color={metaColor}>
                    {sentence.target}
                  </Text>
                )}
  
                {showPhonetic && (
                  <Text fontSize="sm" fontStyle="italic" color={phoneticColor}>
                    {sentence.phonetic}
                  </Text>
                )}
  
                {showBreakdown && sentence.breakdown && sentence.breakdown.length > 0 && (
                  <Stack spacing={1} pl={4} borderLeft="2px" borderColor={breakdownBorderColor}>
                    {sentence.breakdown.map((word, wordIndex) => (
                      <Text key={`${story.storyId}-${index}-${wordIndex}`} fontSize="sm" color={metaColor}>
                        <Text as="span" fontWeight="semibold" color={breakdownAccentColor}>
                          {word.source}
                        </Text>
                        {" → "}
                        {word.target}
                        {word.partOfSpeech && (
                          <Text as="span" color={phoneticColor}>
                            {` (${word.partOfSpeech})`}
                          </Text>
                        )}
                        <Text as="span" fontStyle="italic" color={phoneticColor}>
                          {` — ${word.phonetic}`}
                        </Text>
                      </Text>
                    ))}
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>
        </Container>
      </>
    );
  };
  
  export default StoryDetailTemplate;
  
  export const query = graphql`
    query StoryDetail($bookId: String!, $storyId: String!) {
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
    }
  `;