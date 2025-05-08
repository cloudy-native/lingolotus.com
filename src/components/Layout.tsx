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
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as GatsbyLink } from "gatsby";
import { Flower, Home, LibraryBig } from "lucide-react";
import React from "react";
import { FaGithub } from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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
              <Icon as={Flower} size="24px" />
              <Heading size="md">Lingo Lotus</Heading>
            </HStack>

            {/* Navigation Links */}
            <HStack spacing={8} display={{ base: "none", md: "flex" }}>
              <Link as={GatsbyLink} to="/" _hover={{ textDecoration: "none" }}>
                <HStack spacing={1}>
                  <Icon as={Home} size="24px" />
                  <Text fontSize="md">Home</Text>
                </HStack>
              </Link>
              <Link
                as={GatsbyLink}
                to="/collections"
                _hover={{ textDecoration: "none" }}
              >
                <HStack spacing={1}>
                  <Icon as={LibraryBig} size="24px" />
                  <Text>Collections</Text>
                </HStack>
              </Link>
            </HStack>

            <HStack>
              <Button
                as={Link}
                variant="ghost"
                colorScheme="primary"
                href="https://github.com/stephen/flashcards.com"
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
        bg={useColorModeValue("gray.100", "gray.900")}
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
              <HStack justify={{ base: "center", md: "flex-start" }} mb={2}>
                <Icon as={Flower} size="24px" />
                <Heading size="md">Lingo Lotus</Heading>
              </HStack>
              <Box fontSize="sm">
                © {new Date().getFullYear()} Lingo Lotus. All rights reserved.
              </Box>
            </Box>

            <HStack spacing={6}>
              <Link as={GatsbyLink} to="/">
                Home
              </Link>
              <Link as={GatsbyLink} to="/collections">
                Collections
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
