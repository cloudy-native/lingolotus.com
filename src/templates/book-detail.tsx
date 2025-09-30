import React from "react";

import {
	Box,
	Container,
	Flex,
	Heading,
	Icon,
	SimpleGrid,
	Stack,
	Tag,
	Text,
} from "@chakra-ui/react";
import { graphql, Link } from "gatsby";
import { Library } from "lucide-react";

import { PageHeader } from "../components/PageHeader";
import { semanticColors, tagColorSchemes } from "../theme/colors";
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

	const headerBg = semanticColors.header.reading;
	const headerBorder = semanticColors.border.header.reading;
	const cardBg = semanticColors.card.bg;
	const cardBorder = semanticColors.card.border;
	const storyMetaColor = semanticColors.text.secondary;

	return (
		<>
			<PageHeader
				bg={headerBg}
				borderColor={headerBorder}
				breadcrumbItems={[
					{ label: "Home", path: "/" },
					{ label: "Reading", path: readingPath() },
					{ label: book.name, isCurrentPage: true },
				]}
				title={book.name}
				subtitle={book.description}
				imageUrl={book.imageUrl}
				imageAlt={book.name}
				tags={
					<Stack
						direction={{ base: "column", sm: "row" }}
						spacing={3}
						wrap="wrap"
					>
						<Tag colorScheme={tagColorSchemes.language}>{book.sourceLanguage}</Tag>
						{book.targetLanguage && (
							<Tag colorScheme={tagColorSchemes.targetLanguage}>
								{book.targetLanguage}
							</Tag>
						)}
						{book.difficulty && (
							<Tag colorScheme={tagColorSchemes.difficulty}>{book.difficulty}</Tag>
						)}
						{book.category && (
							<Tag colorScheme={tagColorSchemes.category}>{book.category}</Tag>
						)}
						{book.featured && (
							<Tag colorScheme={tagColorSchemes.featured}>Featured</Tag>
						)}
					</Stack>
				}
			>
				<Flex align="center" mb={3}>
					<Icon as={Library} color="primary.400" boxSize={6} mr={2} />
				</Flex>
			</PageHeader>

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
								<Stack
									direction={{ base: "column", sm: "row" }}
									spacing={2}
									wrap="wrap"
								>
									<Tag colorScheme={tagColorSchemes.language}>{story.language}</Tag>
									{story.difficulty && (
										<Tag colorScheme={tagColorSchemes.difficulty}>
											{story.difficulty}
										</Tag>
									)}
								</Stack>

								<Text mt={4} fontWeight="semibold" color="primary.500">
									Read story →
								</Text>
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
