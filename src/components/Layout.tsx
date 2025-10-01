import React from "react";

import {
    Box,
    Button,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Link,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Link as GatsbyLink } from "gatsby";
import { BookOpen, Home, Info, LibraryBig, Menu } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { semanticColors } from "../theme/colors";
import { tokens } from "../theme/tokens";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
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
                zIndex={tokens.zIndex.header}
                boxShadow="sm"
            >
                <Container maxW="container.xl">
                    <Flex justify="space-between" align="center">
                        {/* Logo/Brand */}
                        <HStack
                            as={GatsbyLink}
                            to="/"
                            spacing={2}
                            aria-label="Lingo Lotus home"
                        >
                            <Text fontSize="2xl" aria-hidden="true">
                                🪷
                            </Text>
                            <Heading size="md">Lingo Lotus</Heading>
                        </HStack>

                        {/* Mobile Menu Button */}
                        <IconButton
                            aria-label="Open menu"
                            icon={<Icon as={Menu} />}
                            onClick={onOpen}
                            display={{ base: "flex", md: "none" }}
                            variant="ghost"
                        />

                        {/* Navigation Links */}
                        <HStack
                            spacing={8}
                            display={{ base: "none", md: "flex" }}
                        >
                            <Link
                                as={GatsbyLink}
                                to="/"
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to home page"
                            >
                                <HStack spacing={1}>
                                    <Icon
                                        as={Home}
                                        boxSize={tokens.iconSize.lg}
                                        aria-hidden="true"
                                    />
                                    <Text fontSize="md">Home</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/flash-cards"
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to flashcards"
                            >
                                <HStack spacing={1}>
                                    <Icon
                                        as={LibraryBig}
                                        boxSize={tokens.iconSize.lg}
                                        aria-hidden="true"
                                    />
                                    <Text>Flash Cards</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/reading"
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to reading materials"
                            >
                                <HStack spacing={1}>
                                    <Icon
                                        as={BookOpen}
                                        boxSize={tokens.iconSize.lg}
                                        aria-hidden="true"
                                    />
                                    <Text>Reading</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/about"
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to about page"
                            >
                                <HStack spacing={1}>
                                    <Icon
                                        as={Info}
                                        boxSize={tokens.iconSize.lg}
                                        aria-hidden="true"
                                    />
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

            {/* Mobile Navigation Drawer */}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <HStack spacing={2}>
                            <Text fontSize="2xl">🪷</Text>
                            <Text>Lingo Lotus</Text>
                        </HStack>
                    </DrawerHeader>

                    <DrawerBody>
                        <Stack spacing={4}>
                            <Link
                                as={GatsbyLink}
                                to="/"
                                onClick={onClose}
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to home page"
                            >
                                <HStack
                                    spacing={3}
                                    p={3}
                                    borderRadius="md"
                                    _hover={{ bg: "gray.100" }}
                                >
                                    <Icon
                                        as={Home}
                                        boxSize={tokens.iconSize.md}
                                        aria-hidden="true"
                                    />
                                    <Text fontSize="lg">Home</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/flash-cards"
                                onClick={onClose}
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to flashcards"
                            >
                                <HStack
                                    spacing={3}
                                    p={3}
                                    borderRadius="md"
                                    _hover={{ bg: "gray.100" }}
                                >
                                    <Icon
                                        as={LibraryBig}
                                        boxSize={tokens.iconSize.md}
                                        aria-hidden="true"
                                    />
                                    <Text fontSize="lg">Flash Cards</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/reading"
                                onClick={onClose}
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to reading materials"
                            >
                                <HStack
                                    spacing={3}
                                    p={3}
                                    borderRadius="md"
                                    _hover={{ bg: "gray.100" }}
                                >
                                    <Icon
                                        as={BookOpen}
                                        boxSize={tokens.iconSize.md}
                                        aria-hidden="true"
                                    />
                                    <Text fontSize="lg">Reading</Text>
                                </HStack>
                            </Link>
                            <Link
                                as={GatsbyLink}
                                to="/about"
                                onClick={onClose}
                                _hover={{ textDecoration: "none" }}
                                aria-label="Go to about page"
                            >
                                <HStack
                                    spacing={3}
                                    p={3}
                                    borderRadius="md"
                                    _hover={{ bg: "gray.100" }}
                                >
                                    <Icon
                                        as={Info}
                                        boxSize={tokens.iconSize.md}
                                        aria-hidden="true"
                                    />
                                    <Text fontSize="lg">About</Text>
                                </HStack>
                            </Link>
                            <Box pt={4} borderTopWidth="1px">
                                <Button
                                    as={Link}
                                    variant="outline"
                                    colorScheme="blue"
                                    href="https://github.com/cloudy-native/lingolotus.com"
                                    leftIcon={<Icon as={FaGithub} />}
                                    isExternal
                                    width="100%"
                                >
                                    Fork on GitHub
                                </Button>
                            </Box>
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

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
                            </Link>{" "}
                            &{" "}
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
