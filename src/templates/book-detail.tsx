import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { ChevronRight, Library } from "lucide-react";
import React from "react";

import type { Book, ReadingSentence, ReadingStory } from "../types";
import { readingPath } from "../utils/paths";

interface BookDetailTemplateProps {
  data: {
    book: Book;
    stories: {
      nodes: ReadingStory[];
    };
  };
}

const BookDetailTemplate: React.FC<BookDetailTemplateProps> = ({ data }) => {
  const book = data.book;
  const stories = data.stories.nodes;

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

              <Stack direction={{ base: "column", sm: "row" }} spacing={3} wrap="wrap">
                <Tag colorScheme="blue">{book.sourceLanguage}</Tag>
                {book.targetLanguage && (
                  <Tag colorScheme="teal">{book.targetLanguage}</Tag>
                )}
                {book.difficulty && <Tag colorScheme="purple">{book.difficulty}</Tag>}
                {book.category && <Tag colorScheme="orange">{book.category}</Tag>}
                {book.featured && <Tag colorScheme="yellow">Featured</Tag>}
              </Stack>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        <Heading as="h2" size="lg" mb={6}>
          Stories in this Book
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
                key={story.storyId}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={cardBorder}
                bg={cardBg}
                p={6}
              >
                <Heading as="h3" size="md" mb={2}>
                  {story.title}
                </Heading>

                {story.summary && (
                  <Text color={storyMetaColor} mb={3}>
                    {story.summary}
                  </Text>
                )}

                <Stack direction={{ base: "column", sm: "row" }} spacing={2} wrap="wrap" mb={4}>
                  <Tag colorScheme="blue">{story.language}</Tag>
                  {story.difficulty && <Tag colorScheme="purple">{story.difficulty}</Tag>}
                  <Tag colorScheme="gray">{story.sentences.length} sentences</Tag>
                </Stack>

                <Box borderLeftWidth="3px" borderColor={cardBorder} pl={4}>
                  <Heading as="h4" size="sm" mb={2}>
                    Sentences
                  </Heading>
                  <List spacing={3} stylePosition="inside">
                    {story.sentences.map((sentence: ReadingSentence, index: number) => (
                      <ListItem key={`${story.storyId}-sentence-${index}`}>
                        <Text fontWeight="medium">{sentence.source}</Text>
                        <Text color={storyMetaColor}>{sentence.target}</Text>
                        <Text fontSize="sm" fontStyle="italic" color={storyMetaColor}>
                          {sentence.phonetic}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};

export default BookDetailTemplate;

export const query = graphql`
  query BookDetail($bookId: String!) {
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
        title
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
  }
`;
