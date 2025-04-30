import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  VStack,
  Link,
  Flex,
  Button,
} from "@chakra-ui/react";
import { HeadFC, Link as GatsbyLink, PageProps } from "gatsby";
import * as React from "react";
import { FaCode, FaReact, FaGithub, FaRocket } from "react-icons/fa";
import { SiGatsby, SiTypescript, SiChakraui } from "react-icons/si";

const AboutHero = () => {
  const bgGradient = useColorModeValue(
    "linear(to-b, blue.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );

  const accentColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.700", "gray.100");

  return (
    <Box
      bg={useColorModeValue("blue.50", "gray.900")}
      bgGradient={bgGradient}
      pt={16}
      pb={10}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Stack spacing={6} textAlign="center">
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          fontWeight="bold"
          color={accentColor}
          lineHeight="1.2"
        >
          About This Starter
        </Heading>

        <Text
          fontSize={{ base: "md", md: "lg" }}
          color={textColor}
          maxW="3xl"
          mx="auto"
          lineHeight="1.8"
        >
          A modern, feature-rich starter template for building fast, responsive websites with Gatsby, TypeScript, and Chakra UI.
        </Text>
      </Stack>
    </Box>
  );
};

const Feature = ({ title, text, icon }: { title: string; text: string; icon: any }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      transition="transform 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        shadow: "lg",
      }}
    >
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg="blue.500"
        mb={4}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Heading fontSize="xl" mb={2}>{title}</Heading>
      <Text color={useColorModeValue("gray.600", "gray.400")}>{text}</Text>
    </Box>
  );
};

const AboutPage: React.FC<PageProps> = () => {
  const textColor = useColorModeValue("gray.700", "gray.300");
  const sectionBg = useColorModeValue("gray.50", "gray.800");
  
  return (
    <>
      <AboutHero />
      
      <Container maxW="6xl" py={12}>
        <VStack spacing={12}>
          {/* Project Overview */}
          <Box w="full">
            <Heading
              as="h2"
              size="lg"
              mb={6}
              textAlign="center"
              color={useColorModeValue("blue.600", "blue.300")}
            >
              Project Overview
            </Heading>
            
            <Text fontSize="lg" lineHeight="tall" textAlign="center" maxW="3xl" mx="auto" color={textColor}>
              This starter template combines the power of Gatsby, the type safety of TypeScript, and the 
              flexibility of Chakra UI to provide a solid foundation for your next web project. Whether 
              you're building a personal site, blog, or business website, this template gives you everything 
              you need to get started quickly.
            </Text>
          </Box>
          
          {/* Features */}
          <Box w="full" py={10} bg={sectionBg} borderRadius="lg">
            <Container maxW="5xl">
              <Heading
                as="h2"
                size="lg"
                mb={10}
                textAlign="center"
                color={useColorModeValue("blue.600", "blue.300")}
              >
                Key Features
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <Feature 
                  icon={SiGatsby}
                  title="Gatsby Framework"
                  text="Blazing-fast page loads and site performance with Gatsby's optimized build system and GraphQL data layer."
                />
                <Feature 
                  icon={SiTypescript}
                  title="TypeScript Integration"
                  text="Full TypeScript support for enhanced developer experience, better tooling, and reduced runtime errors."
                />
                <Feature 
                  icon={SiChakraui}
                  title="Chakra UI Components"
                  text="Beautiful, accessible, and responsive components with built-in dark mode and customizable theme support."
                />
                <Feature 
                  icon={FaRocket}
                  title="Production Ready"
                  text="SEO optimization, responsive design, and accessibility features ready to deploy for your next project."
                />
              </SimpleGrid>
            </Container>
          </Box>
          
          {/* Customization */}
          <Box w="full" my={6}>
            <Heading
              as="h2"
              size="lg"
              mb={6}
              textAlign="center"
              color={useColorModeValue("blue.600", "blue.300")}
            >
              Easy Customization
            </Heading>
            
            <Text fontSize="md" lineHeight="tall" mb={4} color={textColor}>
              This starter is designed to be easily customizable. The theme system uses Chakra UI's powerful 
              theming capabilities, allowing you to change colors, fonts, and component styles with minimal effort.
              Simply edit the theme file in <code>src/theme/index.ts</code> to make global style changes.
            </Text>
            
            <Text fontSize="md" lineHeight="tall" mb={4} color={textColor}>
              The component structure is modular and follows best practices for React and TypeScript development. 
              Each component is properly typed and organized for easy maintenance and scalability. Add new pages, 
              components, or features by following the existing patterns in the codebase.
            </Text>
            
            <Text fontSize="md" lineHeight="tall" color={textColor}>
              The blog functionality uses Gatsby's data layer with Markdown support, making it easy to create, 
              manage, and style your blog posts. Add new posts by creating Markdown files in the content directory.
            </Text>
          </Box>
          
          {/* Get Started */}
          <Box w="full" py={10} bg={sectionBg} borderRadius="lg" textAlign="center">
            <Heading
              as="h2"
              size="lg"
              mb={6}
              color={useColorModeValue("blue.600", "blue.300")}
            >
              Ready to Get Started?
            </Heading>
            
            <Text fontSize="lg" maxW="2xl" mx="auto" mb={8} color={textColor}>
              Clone the repository, customize it to your needs, and start building your next web project with 
              the power of Gatsby, TypeScript, and Chakra UI!
            </Text>
            
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="center">
              <Button
                as={Link}
                href="https://github.com/cloudy-native/gatsby-typescript-chakraui"
                isExternal
                leftIcon={<FaGithub />}
                colorScheme="blue"
                size="lg"
                rounded="full"
              >
                View on GitHub
              </Button>
              <Button
                as={Link}
                href="https://chakra-ui.com/docs/getting-started"
                isExternal
                leftIcon={<FaCode />}
                colorScheme="teal"
                size="lg"
                rounded="full"
              >
                Chakra UI Docs
              </Button>
            </Stack>
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default AboutPage;

export const Head: HeadFC = () => <title>About | Gatsby TypeScript ChakraUI Starter</title>;