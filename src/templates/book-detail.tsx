import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { BookOpen, ChevronRight, Library } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Book, ReadingStory } from "../types";
import { readingPath, storyDetailPath } from "../utils/paths";

interface BookDetailTemplateProps {
  data: {
    book: Book;
    stories: {
      nodes: ReadingStory[];
    };
    grammar?: {
      rawMarkdownBody: string;
    };
  };
}

const BookDetailTemplate: React.FC<BookDetailTemplateProps> = ({ data }) => {
  const book = data.book;
  const stories = data.stories.nodes;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const headerBg = useColorModeValue("orange.50", "orange.900");
  const headerBorder = useColorModeValue("orange.100", "orange.800");
  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const storyMetaColor = useColorModeValue("gray.600", "gray.300");

  return (
    <>
      <Box bg={headerBg} borderBottom="1px" borderColor={headerBorder} py={8}>
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
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{book.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ md: "center" }}
            gap={6}
          >
            {book.imageUrl && (
              <Image
                src={book.imageUrl}
                alt={book.name}
                borderRadius="lg"
                boxSize={{ base: "100%", md: "220px" }}
                objectFit="cover"
              />
            )}

            <Box flex="1">
              <Flex align="center" mb={3}>
                <Icon as={Library} color="primary.400" boxSize={6} mr={2} />
                <Heading as="h1" size="xl">
                  {book.name}
                </Heading>
              </Flex>

              <Text fontSize="lg" mb={4}>
                {book.description}
              </Text>

              <Stack direction={{ base: "column", sm: "row" }} spacing={3} wrap="wrap" mb={4}>
                <Tag colorScheme="blue">{book.sourceLanguage}</Tag>
                {book.targetLanguage && (
                  <Tag colorScheme="teal">{book.targetLanguage}</Tag>
                )}
                {book.difficulty && <Tag colorScheme="purple">{book.difficulty}</Tag>}
                {book.category && <Tag colorScheme="orange">{book.category}</Tag>}
                {book.featured && <Tag colorScheme="yellow">Featured</Tag>}
              </Stack>

              {data.grammar && (
                <Button
                  onClick={onOpen}
                  leftIcon={<Icon as={BookOpen} />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                >
                  Grammar Cheatsheet
                </Button>
              )}
            </Box>
          </Flex>
        </Container>
      </Box>

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
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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
                _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
              >
                <Heading as="h3" size="md" mb={2}>
                  {story.title.target}
                </Heading>

                {story.title.source && (
                  <Text fontSize="sm" color={storyMetaColor} mb={3}>
                    ({story.title.source})
                  </Text>
                )}

                {story.summary && (
                  <Text color={storyMetaColor} mb={3}>
                    {story.summary}
                  </Text>
                )}

                <Stack direction={{ base: "column", sm: "row" }} spacing={2} wrap="wrap">
                  <Tag colorScheme="blue">{story.language}</Tag>
                  {story.difficulty && <Tag colorScheme="purple">{story.difficulty}</Tag>}
                </Stack>

                <Text mt={4} fontWeight="semibold" color="primary.500">
                  Read story →
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Grammar Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Grammar Guide</DrawerHeader>
          <DrawerBody>
            {data.grammar?.rawMarkdownBody && (
              <Box
                className="markdown-content"
                sx={{
                  "& h1": {
                    fontSize: "2xl",
                    fontWeight: "bold",
                    mb: 4,
                    mt: 6,
                  },
                  "& h2": {
                    fontSize: "xl",
                    fontWeight: "bold",
                    mb: 3,
                    mt: 5,
                  },
                  "& h3": {
                    fontSize: "lg",
                    fontWeight: "semibold",
                    mb: 2,
                    mt: 4,
                  },
                  "& p": {
                    mb: 3,
                  },
                  "& ul, & ol": {
                    ml: 6,
                    mb: 3,
                  },
                  "& li": {
                    mb: 1,
                  },
                  "& code": {
                    bg: "gray.100",
                    px: 1,
                    py: 0.5,
                    borderRadius: "sm",
                    fontSize: "sm",
                  },
                  "& pre": {
                    bg: "gray.100",
                    p: 3,
                    borderRadius: "md",
                    overflow: "auto",
                    mb: 3,
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

export default BookDetailTemplate;

export const query = graphql`
  query BookDetail($bookId: String!, $sourceLanguage: String!) {
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
        summary
      }
    }
    grammar: markdownRemark(
      fileAbsolutePath: { regex: $sourceLanguage }
    ) {
      rawMarkdownBody
    }
  }
`;
