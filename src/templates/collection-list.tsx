import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import React from "react";

import { Collection } from "../types";
import { collectionDetailPath } from "../utils/paths";

interface CollectionListTemplateProps {
  data: {
    allCollectionsJson: {
      nodes: Collection[];
    };
  };
}

const CollectionCard: React.FC<{ collection: Collection }> = ({
  collection,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <Link to={collectionDetailPath(collection.collectionId)}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        borderColor={cardBorder}
        overflow="hidden"
        bg={cardBg}
        transition="all 0.3s"
        _hover={{ transform: "translateY(-4px)", shadow: "md" }}
      >
        {collection.imageUrl && (
          <Image
            src={collection.imageUrl}
            alt={collection.name}
            height="200px"
            width="100%"
            objectFit="cover"
          />
        )}
        <Box p={5}>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading as="h3" size="md" fontWeight="semibold">
              {collection.name}
            </Heading>
            {collection.featured && (
              <Badge colorScheme="blue" fontSize="0.8em">
                Featured
              </Badge>
            )}
          </Flex>

          <Text fontSize="sm" color="gray.500" noOfLines={2} mb={3}>
            {collection.description}
          </Text>

          <Stack direction="row" align="center" justify="space-between">
            <Flex align="center">
              <Badge colorScheme="green" mr={2}>
                {collection.sourceLanguage} → {collection.targetLanguage}
              </Badge>
              <Badge colorScheme="purple">
                {collection.difficulty || "Mixed"}
              </Badge>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Link>
  );
};

const CollectionListTemplate: React.FC<CollectionListTemplateProps> = ({
  data,
}) => {
  const collections = data.allCollectionsJson.nodes;
  const featuredCollections = collections.filter((c) => c.featured);
  const regularCollections = collections.filter((c) => !c.featured);

  return (
    <>
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" mb={8}>
          Language Collections
        </Heading>

        {featuredCollections.length > 0 && (
          <>
            <Heading as="h2" size="lg" mb={4}>
              Featured Collections
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={12}>
              {featuredCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </SimpleGrid>
          </>
        )}

        <Heading as="h2" size="lg" mb={4}>
          All Collections
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {regularCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default CollectionListTemplate;

export const query = graphql`
  query AllCollections {
    allCollectionsJson {
      nodes {
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
    }
  }
`;
