import React from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	Icon,
} from "@chakra-ui/react";
import { Link } from "gatsby";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItemData {
	label: string;
	path?: string;
	isCurrentPage?: boolean;
}

interface AppBreadcrumbProps {
	items: BreadcrumbItemData[];
}

/**
 * Reusable breadcrumb component with consistent styling.
 * Automatically handles navigation links and current page styling.
 */
export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items }) => {
	return (
		<Breadcrumb
			spacing="8px"
			separator={<Icon as={ChevronRight} color="gray.500" />}
			mb={4}
		>
			{items.map((item, idx) => (
				<BreadcrumbItem key={idx} isCurrentPage={item.isCurrentPage}>
					{item.path ? (
						<BreadcrumbLink as={Link} to={item.path}>
							{item.label}
						</BreadcrumbLink>
					) : (
						<BreadcrumbLink>{item.label}</BreadcrumbLink>
					)}
				</BreadcrumbItem>
			))}
		</Breadcrumb>
	);
};
