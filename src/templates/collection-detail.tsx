import React from "react";

import {
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
	Tag,
	Text,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { ChevronRight, Clock, Star } from "lucide-react";

import { semanticColors, tagColorSchemes } from "../theme/colors";
import type { Collection, Deck } from "../types";
import { deckDetailPath, flashcardListPath } from "../utils/paths";

interface CollectionDetailTemplateProps {
	data: {
		collectionsJson: Collection;
		allDecksJson: {
			nodes: Deck[];
		};
	};
}

const DeckCard: React.FC<{ deck: Deck }> = ({ deck }) => {
	const cardBg = semanticColors.card.bg;
	const cardBorder = semanticColors.card.border;

	return (
		<Link to={deckDetailPath(deck.collectionId, deck.deckId)}>
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
							<Tag colorScheme="primary">{deck.theme}</Tag>
							<Tag colorScheme="secondary">{deck.difficulty}</Tag>
						</Flex>

						<Flex align="center" justify="space-between">
							<Flex align="center">
								<Icon as={Clock} mr={1} color="gray.500" />
								<Text fontSize="sm" color="gray.500">
									{new Date(deck.updatedAt).toLocaleDateString()}
								</Text>
							</Flex>
							<Text fontSize="sm" fontWeight="medium">
								{deck.cards.length} cards
							</Text>
						</Flex>

						<Button colorScheme="primary" size="sm" width="100%" mt={2}>
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
	const collection = data.collectionsJson;
	const decks = data.allDecksJson.nodes;

	const headerBg = semanticColors.header.flashcards;
	const headerBorder = semanticColors.border.header.flashcards;

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
							<BreadcrumbLink as={Link} to={flashcardListPath()}>
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
										<Icon as={Star} color="yellow.400" mr={1} />
										<Tag colorScheme="yellow">Featured</Tag>
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
								<Tag colorScheme="green">
									{collection.sourceLanguage} → {collection.targetLanguage}
								</Tag>
								<Tag colorScheme="purple">
									{collection.difficulty || "Mixed"}
								</Tag>
								{collection.category && (
									<Tag colorScheme="blue">{collection.category}</Tag>
								)}
							</Stack>
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
          frontContent {
            type
            text
          }
          backContent {
            type
            text
          }
          tags
          difficulty
          sourceLanguage
          targetLanguage
          phonetic
          partOfSpeech
          context
          examples {
            original
            translation
            phonetic
          }
        }
      }
    }
  }
`;
