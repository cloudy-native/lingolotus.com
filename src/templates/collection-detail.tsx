import { ChevronRightIcon, StarIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import React from "react";

import { Collection, Deck } from "../types";
import { collectionListPath, collectionStudyPath, studyDeckPath } from "../utils/paths";

interface CollectionDetailTemplateProps {
  data: {
    collectionsJson: Collection;
    allDecksJson: {
      nodes: Deck[];
    };
  };
}

const DeckCard: React.FC<{ deck: Deck }> = ({ deck }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <Link to={studyDeckPath(deck.collectionId, deck.deckId)}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        borderColor={cardBorder}
        overflow="hidden"
        bg={cardBg}
        transition="all 0.3s"
        _hover={{ transform: "translateY(-4px)", shadow: "md" }}
        height="100%"
      >
        <Box p={5}>
          <Heading as="h3" size="md" fontWeight="semibold" mb={2}>
            {deck.name}
          </Heading>

          <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
            {deck.description}
          </Text>

          <Stack spacing={3} mt="auto">
            <Flex align="center" justify="space-between">
              <Badge colorScheme="teal">{deck.theme}</Badge>
              <Badge colorScheme="purple">{deck.difficulty}</Badge>
            </Flex>

            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Icon as={TimeIcon} mr={1} color="gray.500" />
                <Text fontSize="sm" color="gray.500">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">
                {deck.cards.length} cards
              </Text>
            </Flex>

            <Button colorScheme="blue" size="sm" width="100%" mt={2}>
              Study Deck
            </Button>
          </Stack>
        </Box>
      </Box>
    </Link>
  );
};

const CollectionDetailTemplate: React.FC<CollectionDetailTemplateProps> = ({
  data,
}) => {
  console.log(">>> data", data);
  const collection = data.collectionsJson;
  const decks = data.allDecksJson.nodes;

  const headerBg = useColorModeValue("blue.50", "blue.900");
  const headerBorder = useColorModeValue("blue.100", "blue.800");

  return (
    <>
      <Box bg={headerBg} borderBottom="1px" borderColor={headerBorder} py={8}>
        <Container maxW="container.xl">
          <Breadcrumb
            spacing="8px"
            separator={<ChevronRightIcon color="gray.500" />}
            mb={4}
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to={collectionListPath()}>
                Collections
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{collection.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ md: "center" }}
            gap={6}
          >
            {collection.imageUrl && (
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                borderRadius="lg"
                boxSize={{ base: "100%", md: "180px" }}
                objectFit="cover"
              />
            )}

            <Box flex="1">
              <Flex align="center" mb={2}>
                <Heading as="h1" size="xl" mr={2}>
                  {collection.name}
                </Heading>
                {collection.featured && (
                  <Flex align="center">
                    <Icon as={StarIcon} color="yellow.400" mr={1} />
                    <Badge colorScheme="yellow">Featured</Badge>
                  </Flex>
                )}
              </Flex>

              <Text fontSize="lg" mb={4}>
                {collection.description}
              </Text>

              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={4}
                wrap="wrap"
              >
                <Badge colorScheme="green" fontSize="0.9em" p={1}>
                  {collection.sourceLanguage} → {collection.targetLanguage}
                </Badge>
                <Badge colorScheme="purple" fontSize="0.9em" p={1}>
                  {collection.difficulty || "Mixed"}
                </Badge>
                {collection.category && (
                  <Badge colorScheme="blue" fontSize="0.9em" p={1}>
                    {collection.category}
                  </Badge>
                )}
              </Stack>

              {/* TODO: Add Study Entire Collection button */}
              {/* <Button
                colorScheme="blue"
                size="md"
                mt={4}
                as={Link}
                to={collectionStudyPath(collection.collectionId)}
              >
                Study Entire Collection
              </Button> */}
            </Box>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Heading as="h2" size="lg" mb={6}>
          Decks in this Collection
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default CollectionDetailTemplate;

export const query = graphql`
  query CollectionById($collectionId: String!) {
    collectionsJson(collectionId: { eq: $collectionId }) {
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
    allDecksJson(filter: { collectionId: { eq: $collectionId } }) {
      nodes {
        id
        collectionId
        deckId
        name
        description
        sourceLanguage
        targetLanguage
        createdAt
        updatedAt
        theme
        difficulty
        cards {
          cardId
        }
      }
    }
  }
`;
