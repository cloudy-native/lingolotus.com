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
} from "@chakra-ui/react";
import type { PageProps } from "gatsby";
import { graphql, Link } from "gatsby";
import { BookOpen, ChevronRight } from "lucide-react";
import React from "react";

import type { Book } from "../types";
import { bookDetailPath } from "../utils/paths";

type ReadingPageData = {
	allBookJson: {
		nodes: Book[];
	};
};

const ReadingPage = ({ data }: PageProps<ReadingPageData>) => {
	const heroBg = useColorModeValue("blue.50", "blue.900");
	const sectionBg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const cardBg = useColorModeValue("white", "gray.900");
	const cardBorderColor = useColorModeValue("gray.200", "gray.700");
	const supportingTextColor = useColorModeValue("gray.600", "gray.300");
	const detailTextColor = useColorModeValue("gray.700", "gray.200");

	const books = data.allBookJson.nodes;

	return (
		<>
			{/* Hero */}
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
								Practice Reading in Your Target Language
							</Heading>
							<Text fontSize={{ base: "lg", md: "xl" }} mb={8}>
								Build comprehension and confidence with bite-sized passages and
								helpful tools.
							</Text>
							<Stack direction={{ base: "column", sm: "row" }} spacing={4}>
								<Button
									as={Link}
									to="/flash-cards"
									colorScheme="primary"
									size="lg"
									height="56px"
									px={8}
									rightIcon={<Icon as={ChevronRight} />}
									variant="outline"
								>
									Review Vocabulary
								</Button>
								<Button
									as={Link}
									to="/reading"
									colorScheme="primary"
									size="lg"
									height="56px"
									px={8}
									rightIcon={<Icon as={ChevronRight} />}
								>
									Start Reading
								</Button>
							</Stack>
						</Box>
						<Box
							flex="1"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Icon
								as={BookOpen}
								boxSize={{ base: 32, md: 44 }}
								color="primary.400"
							/>
						</Box>
					</Flex>
				</Container>
			</Box>

			{/* Books List */}
			<Container maxW="container.xl" mb={16}>
				<Stack spacing={3} mb={8} textAlign={{ base: "left", md: "center" }}>
					<Heading as="h2" size="xl">
						Your Library
					</Heading>
				</Stack>
				{books.length === 0 ? (
					<Box
						bg={sectionBg}
						borderWidth="1px"
						borderColor={borderColor}
						borderRadius="lg"
						p={8}
						textAlign="center"
					>
						<Text>No reading collections available yet. Check back soon!</Text>
					</Box>
				) : (
					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
						{books.map((book: Book) => (
							<Box
								as={Link}
								to={bookDetailPath(book.bookId)}
								key={book.bookId}
								bg={cardBg}
								borderWidth="1px"
								borderColor={cardBorderColor}
								borderRadius="lg"
								overflow="hidden"
								boxShadow="sm"
								display="flex"
								flexDirection="column"
								transition="all 0.2s"
								_hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
							>
								{book.imageUrl && (
									<Image
										src={book.imageUrl}
										alt={book.name}
										w="100%"
										h="180px"
										objectFit="cover"
									/>
								)}
								<Box p={6} flex="1" display="flex" flexDirection="column">
									<Heading as="h3" size="md" mb={2}>
										{book.name}
									</Heading>
									<Text color={supportingTextColor} noOfLines={3} mb={4}>
										{book.description}
									</Text>
									<HStack spacing={2} flexWrap="wrap" mt="auto">
										<Tag colorScheme="blue" textTransform="uppercase">
											{book.sourceLanguage}
										</Tag>
										{book.targetLanguage && (
											<Tag colorScheme="teal" textTransform="uppercase">
												{book.targetLanguage}
											</Tag>
										)}
										{book.difficulty && (
											<Tag colorScheme="purple">{book.difficulty}</Tag>
										)}
										{book.featured && <Tag colorScheme="yellow">Featured</Tag>}
									</HStack>
								</Box>
							</Box>
						))}
					</SimpleGrid>
				)}
			</Container>
		</>
	);
};

export default ReadingPage;

export const query = graphql`
  query ReadingPage {
    allBookJson {
      nodes {
        bookId
        name
        description
        sourceLanguage
        targetLanguage
        category
        difficulty
        imageUrl
        featured
      }
    }
  }
`;
