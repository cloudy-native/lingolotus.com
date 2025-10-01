import React from "react";

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Link,
    Text,
} from "@chakra-ui/react";
import { Link as GatsbyLink } from "gatsby";
import { BookOpen, Home, Info, LibraryBig } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { semanticColors } from "../theme/colors";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const bgColor = semanticColors.layout.bg;
    const textColor = semanticColors.text.primary;
    const borderColor = semanticColors.border.default;

    return (
        <Box minH="100vh" display="flex" flexDirection="column">
            {/* Header/Navigation */}
            <Box
                as="header"
                py={4}
                bg={bgColor}
                color={textColor}
                borderBottomWidth="1px"
                borderColor={borderColor}
                position="sticky"
                top={0}
                zIndex={10}
                boxShadow="sm"
            >
                <Container maxW="container.xl">
                    <Flex justify="space-between" align="center">
                        {/* Logo/Brand */}
                        <HStack as={GatsbyLink} to="/" spacing={2}>
                            <Text fontSize="2xl">🪷</Text>
                            <Heading size="md">Lingo Lotus</Heading>
                        </HStack>

                        {/* Navigation Links */}
                        <HStack
                            spacing={8}
                            display={{ base: "none", md: "flex" }}
                        >
                            <Link
                                as={GatsbyLink}
                                to="/"
                                _hover={{ textDecoration: "none" }}
                            >
                                <HStack spacing={1}>
                                    <Icon as={Home} size="24px" />
                                    <Text fontSize="md">Home</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/flash-cards"
                                _hover={{ textDecoration: "none" }}
                            >
                                <HStack spacing={1}>
                                    <Icon as={LibraryBig} size="24px" />
                                    <Text>Flash Cards</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/reading"
                                _hover={{ textDecoration: "none" }}
                            >
                                <HStack spacing={1}>
                                    <Icon as={BookOpen} size="24px" />
                                    <Text>Reading</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/about"
                                _hover={{ textDecoration: "none" }}
                            >
                                <HStack spacing={1}>
                                    <Icon as={Info} size="24px" />
                                    <Text>About</Text>
                                </HStack>
                            </Link>
                        </HStack>

                        <HStack>
                            <Button
                                as={Link}
                                variant="ghost"
                                colorScheme="primary"
                                href="https://github.com/cloudy-native/lingolotus.com"
                                _hover={{ textDecoration: "none" }}
                                aria-label="Fork me on GitHub"
                                leftIcon={<Icon as={FaGithub} w={5} h={5} />}
                                isExternal
                            >
                                Fork me on GitHub
                            </Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Main Content */}
            <Box as="main" flex="1">
                {children}
            </Box>

            {/* Footer */}
            <Box
                as="footer"
                py={8}
                bg="gray.100"
                color={textColor}
                borderTopWidth="1px"
                borderColor={borderColor}
            >
                <Container maxW="container.xl">
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        justify="space-between"
                        align="center"
                        textAlign={{ base: "center", md: "left" }}
                    >
                        <Box mb={{ base: 4, md: 0 }}>
                            <HStack
                                justify={{ base: "center", md: "flex-start" }}
                                mb={2}
                            >
                                <Text fontSize="2xl">🪷</Text>
                                <Heading size="md">Lingo Lotus</Heading>
                            </HStack>
                            <Box fontSize="sm">
                                © {new Date().getFullYear()} Lingo Lotus. All
                                rights reserved.
                            </Box>
                            <Box fontSize="sm" mt={2}>
                                <span>Made with ❤️ by </span>
                                <Link
                                    as="a"
                                    href="https://www.linkedin.com/in/stephenharrison/"
                                    isExternal
                                    color="blue.500"
                                    fontWeight="semibold"
                                >
                                    Stephen Harrison
                                </Link>
                            </Box>
                        </Box>

                        <Box fontSize="sm" color="gray.600">
                            Built with{" "}
                            <Link
                                as="a"
                                href="https://www.gatsbyjs.com/"
                                isExternal
                                color="purple.500"
                                fontWeight="medium"
                            >
                                Gatsby
                            </Link>
                            ,{" "}
                            <Link
                                as="a"
                                href="https://www.typescriptlang.org/"
                                isExternal
                                color="blue.500"
                                fontWeight="medium"
                            >
                                TypeScript
                            </Link>
                            {" "}&{" "}
                            <Link
                                as="a"
                                href="https://chakra-ui.com/"
                                isExternal
                                color="teal.500"
                                fontWeight="medium"
                            >
                                Chakra UI
                            </Link>
                            . Hosted on{" "}
                            <Link
                                as="a"
                                href="https://aws.amazon.com/"
                                isExternal
                                color="orange.500"
                                fontWeight="medium"
                            >
                                AWS
                            </Link>
                            .
                        </Box>
                    </Flex>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
