import React from "react";

import { Box, Container, Flex, Heading, Image, Text } from "@chakra-ui/react";

import { AppBreadcrumb, BreadcrumbItemData } from "./AppBreadcrumb";

interface PageHeaderProps {
	/** Background color for the header */
	bg: string;
	/** Border color for the bottom border */
	borderColor: string;
	/** Breadcrumb items to display */
	breadcrumbItems: BreadcrumbItemData[];
	/** Main title */
	title: string;
	/** Optional subtitle or description */
	subtitle?: string;
	/** Optional image URL */
	imageUrl?: string;
	/** Optional image alt text */
	imageAlt?: string;
	/** Optional tags or metadata to display */
	tags?: React.ReactNode;
	/** Optional action buttons or controls */
	actions?: React.ReactNode;
	/** Optional additional content to render in the header */
	children?: React.ReactNode;
}

/**
 * Reusable page header component with breadcrumbs, title, image, and metadata.
 * Provides consistent styling across detail pages.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
	bg,
	borderColor,
	breadcrumbItems,
	title,
	subtitle,
	imageUrl,
	imageAlt,
	tags,
	actions,
	children,
}) => {
	return (
		<Box bg={bg} borderBottom="1px" borderColor={borderColor} py={8}>
			<Container maxW="container.xl">
				<AppBreadcrumb items={breadcrumbItems} />

				<Flex
					direction={{ base: "column", md: "row" }}
					align={{ md: "center" }}
					gap={6}
				>
					{imageUrl && (
						<Image
							src={imageUrl}
							alt={imageAlt || title}
							borderRadius="lg"
							boxSize={{ base: "100%", md: "220px" }}
							objectFit="cover"
						/>
					)}

					<Box flex="1">
						<Heading as="h1" size="xl" mb={subtitle ? 2 : 4}>
							{title}
						</Heading>

						{subtitle && (
							<Text fontSize="lg" mb={4}>
								{subtitle}
							</Text>
						)}

						{tags && <Box mb={actions ? 4 : 0}>{tags}</Box>}

						{actions && <Box>{actions}</Box>}

						{children}
					</Box>
				</Flex>
			</Container>
		</Box>
	);
};
