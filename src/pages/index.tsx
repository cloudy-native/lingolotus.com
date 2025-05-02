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
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { ChevronRight, Star } from "lucide-react";
import React from "react";
import { FaBookOpen, FaChalkboardTeacher, FaLanguage } from "react-icons/fa";

import { Collection } from "../types";
import { collectionDetailPath, collectionListPath } from "../utils/paths";

interface HomePageProps {
  data: {
    featuredCollections: {
      nodes: Collection[];
    };
    totalCollections: {
      totalCount: number;
    };
  };
}

const HomePage: React.FC<HomePageProps> = ({ data }) => {
  const featuredCollections = data.featuredCollections.nodes;
  const totalCollectionCount = data.totalCollections.totalCount;

  const boxBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const heroBg = useColorModeValue("blue.50", "blue.900");

  return (
    <>
      {/* Hero Section */}
      <Box bg={heroBg} py={{ base: 12, md: 20 }} mb={12}>
        <Container maxW="container.xl">
          <Flex direction={{ base: "column", md: "row" }} align="center">
            <Box flex="1" pr={{ md: 10 }} mb={{ base: 10, md: 0 }}>
              <Heading
                as="h1"
                size="2xl"
                lineHeight="shorter"
                fontWeight="bold"
                mb={5}
              >
                Master Languages with Smart Flashcards
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} mb={8}>
                Enhance your vocabulary, improve pronunciation, and boost
                fluency with our spaced repetition flashcard system. Learn at
                your own pace, anytime, anywhere.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                <Button
                  as={Link}
                  to={collectionListPath()}
                  colorScheme="blue"
                  size="lg"
                  height="56px"
                  px={8}
                  rightIcon={<Icon as={ChevronRight} />}
                >
                  Browse Collections
                </Button>
                {/* <Button
                  as={Link}
                  to="/about"
                  colorScheme="blue"
                  variant="outline"
                  size="lg"
                  height="56px"
                >
                  Learn More
                </Button> */}
              </Stack>
            </Box>
            <Box
              flex="1"
              maxW={{ base: "100%", md: "500px" }}
              h={{ base: "auto", md: "400px" }}
              position="relative"
            >
              <Image
                src="/images/hero-flashcards.png"
                alt="Language flashcards app preview"
                borderRadius="lg"
                boxShadow="xl"
                objectFit="cover"
                w="100%"
                h="100%"
                fallbackSrc="https://via.placeholder.com/800x600?text=Language+Flashcards"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Featured Collections Section */}
      <Container maxW="container.xl" mb={16}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading as="h2" size="xl">
            Featured Collections
          </Heading>
          <Button
            as={Link}
            to="/collections"
            rightIcon={<Icon as={ChevronRight} />}
            variant="ghost"
            colorScheme="blue"
          >
            View All ({totalCollectionCount})
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {featuredCollections.map((collection) => (
            <Link
              to={collectionDetailPath(collection.collectionId)}
              key={collection.collectionId}
            >
              <Box
                bg={boxBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                h="100%"
              >
                {collection.imageUrl && (
                  <Box position="relative">
                    <Image
                      src={collection.imageUrl}
                      alt={collection.name}
                      h="180px"
                      w="100%"
                      objectFit="cover"
                      fallbackSrc={`https://via.placeholder.com/800x450?text=${collection.name}`}
                    />
                    <Tag
                      position="absolute"
                      top="10px"
                      right="10px"
                      colorScheme="blue"
                      p={2}
                      borderRadius="md"
                    >
                      <Flex align="center">
                        <Icon as={Star} mr={1} />
                        Featured
                      </Flex>
                    </Tag>
                  </Box>
                )}
                <Box p={5}>
                  <Heading size="md" mb={2}>
                    {collection.name}
                  </Heading>
                  <Text color="gray.500" noOfLines={2} mb={4}>
                    {collection.description}
                  </Text>
                  <HStack spacing={2} mb={3}>
                    <Tag colorScheme="green">
                      {collection.sourceLanguage} → {collection.targetLanguage}
                    </Tag>
                    <Tag colorScheme="purple">
                      {collection.difficulty || "Mixed"}
                    </Tag>
                  </HStack>
                </Box>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Box py={16} bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl">
              Why Learn with Flashcards?
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="800px">
              Our flashcard system is designed specifically for language
              learning, with features that help you memorize vocabulary
              efficiently and track your progress over time.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <VStack
              align="start"
              p={6}
              bg={boxBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex
                w="60px"
                h="60px"
                align="center"
                justify="center"
                color="white"
                rounded="full"
                bg="blue.500"
                mb={4}
              >
                <Icon as={FaLanguage} boxSize={6} />
              </Flex>
              <Heading as="h3" size="md" mb={3}>
                Multiple Languages
              </Heading>
              <Text>
                Learn vocabulary in various languages with tailored collections
                for beginners to advanced learners. Each card includes
                pronunciation guides.
              </Text>
            </VStack>

            <VStack
              align="start"
              p={6}
              bg={boxBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex
                w="60px"
                h="60px"
                align="center"
                justify="center"
                color="white"
                rounded="full"
                bg="teal.500"
                mb={4}
              >
                <Icon as={FaBookOpen} boxSize={6} />
              </Flex>
              <Heading as="h3" size="md" mb={3}>
                Spaced Repetition
              </Heading>
              <Text>
                Our system uses proven spaced repetition techniques to help you
                review cards at optimal intervals, strengthening your memory and
                retention.
              </Text>
            </VStack>

            <VStack
              align="start"
              p={6}
              bg={boxBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex
                w="60px"
                h="60px"
                align="center"
                justify="center"
                color="white"
                rounded="full"
                bg="purple.500"
                mb={4}
              >
                <Icon as={FaChalkboardTeacher} boxSize={6} />
              </Flex>
              <Heading as="h3" size="md" mb={3}>
                Progress Tracking
              </Heading>
              <Text>
                Track your learning journey with detailed statistics. See which
                words you've mastered and which ones need more practice.
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={16}>
        <Container maxW="container.md" textAlign="center">
          <Heading as="h2" size="xl" mb={4}>
            Ready to Start Learning?
          </Heading>
          <Text fontSize="lg" mb={8}>
            Browse our collection of flashcard decks and start improving your
            language skills today.
          </Text>
          <Button
            as={Link}
            to="/collections"
            size="lg"
            height="60px"
            px={8}
            colorScheme="blue"
            fontSize="lg"
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

export const query = graphql`
  query HomePage {
    featuredCollections: allCollectionsJson(
      filter: { featured: { eq: true } }
      limit: 6
    ) {
      nodes {
        collectionId
        name
        description
        sourceLanguage
        targetLanguage
        difficulty
        imageUrl
        featured
      }
    }
    totalCollections: allCollectionsJson {
      totalCount
    }
  }
`;
