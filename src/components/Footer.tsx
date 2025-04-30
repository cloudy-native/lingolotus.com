import {
  Box,
  Container,
  Divider,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as GatsbyLink } from "gatsby";
import React from "react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import BuyMeCoffeeButton from "./BuyMeCoffeeButton";

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue("neutral.100", "neutral.800")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("primary.500", "primary.400"),
        color: "white",
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={"600"} fontSize={"lg"} mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  const bgColor = useColorModeValue("neutral.50", "neutral.900");
  const borderColor = useColorModeValue("neutral.200", "neutral.700");
  const textColor = useColorModeValue("neutral.700", "neutral.300");

  return (
    <Box
      as="footer"
      bg={bgColor}
      color={textColor}
      borderTop="1px"
      borderColor={borderColor}
    >
      <Container as={Stack} maxW={"container.xl"} py={10}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 2fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text
                as={GatsbyLink}
                to="/"
                fontFamily={"heading"}
                fontWeight="bold"
                fontSize="xl"
                color="primary.500"
              >
                Gatsby TypeScript ChakraUI
              </Text>
            </Box>
            <Text fontSize={"sm"}>
              A modern Gatsby starter template featuring TypeScript and Chakra UI
              for building fast, responsive websites with a great developer experience.
            </Text>
            <Stack direction={"row"} spacing={4}>
              <SocialButton label={"Twitter"} href={"https://twitter.com"}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={"LinkedIn"} href={"https://linkedin.com"}>
                <FaLinkedin />
              </SocialButton>
              <SocialButton label={"Facebook"} href={"https://facebook.com"}>
                <FaFacebook />
              </SocialButton>
            </Stack>
          </Stack>

          <Stack align={"flex-start"}>
            <ListHeader>Resources</ListHeader>
            <Link as={GatsbyLink} to="/blog">
              Blog
            </Link>
            <Link href="https://www.gatsbyjs.com/docs/" isExternal>
              Gatsby Docs
            </Link>
            <Link href="https://chakra-ui.com/docs/getting-started" isExternal>
              Chakra UI Docs
            </Link>
            <Link href="https://www.typescriptlang.org/docs/" isExternal>
              TypeScript Docs
            </Link>
          </Stack>

          <Stack align={"flex-start"}>
            <ListHeader>Site</ListHeader>
            {/* <Link as={GatsbyLink} to="/about">
              About
            </Link> */}
            <Link as={GatsbyLink} to="/blog">
              Blog
            </Link>
            <Link as={GatsbyLink} to="/">
              Home
            </Link>
          </Stack>

          <Stack align={"flex-start"}>
            <ListHeader>Support Me</ListHeader>
            <Text>
              If you like this and want to help a little bit, you can send small
              donation.
            </Text>
            <BuyMeCoffeeButton />
          </Stack>
        </SimpleGrid>
      </Container>

      <Divider borderColor={borderColor} />

      <Box py={4}>
        <Text pt={2} fontSize={"sm"} textAlign={"center"}>
          © {new Date().getFullYear()} Gatsby TypeScript ChakraUI Starter. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
