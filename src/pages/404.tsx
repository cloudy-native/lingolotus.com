import * as React from "react";
import { Link, HeadFC, PageProps } from "gatsby";
import { Button, Container, Heading, Text, VStack } from "@chakra-ui/react";

import Layout from "../components/Layout";

const NotFoundPage: React.FC<PageProps> = () => {
    return (
        <Layout>
            <Container maxW="container.md" py={16}>
                <VStack spacing={6} textAlign="center">
                    <Heading as="h1" size="2xl">
                        404
                    </Heading>
                    <Heading as="h2" size="lg">
                        Page Not Found
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        Sorry, we couldn't find what you were looking for.
                    </Text>
                    <Button as={Link} to="/" colorScheme="blue" size="lg">
                        Return Home
                    </Button>
                </VStack>
            </Container>
        </Layout>
    );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Not found | Lingo Lotus</title>;
