import { graphql } from "gatsby";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container, Heading, Box } from "@chakra-ui/react";
import type { HeadFC, PageProps } from "gatsby";

interface AboutPageData {
    markdownRemark: {
        frontmatter: {
            title: string;
            description: string;
        };
        rawMarkdownBody: string;
    };
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
    const { markdownRemark } = data;
    const { frontmatter, rawMarkdownBody } = markdownRemark;

    return (
        <Container maxW="4xl" py={8}>
            <Heading as="h1" size="xl" mb={6} textAlign="center">
                {frontmatter.title}
            </Heading>
            <Box
                sx={{
                    "h1, h2, h3, h4, h5, h6": {
                        mt: 8,
                        mb: 4,
                        fontWeight: "bold",
                        lineHeight: "tight",
                    },
                    h1: { fontSize: "2xl" },
                    h2: { fontSize: "xl" },
                    h3: { fontSize: "lg" },
                    p: {
                        mb: 4,
                        lineHeight: "tall",
                    },
                    ul: {
                        mb: 4,
                        pl: 6,
                    },
                    li: {
                        mb: 2,
                    },
                    strong: {
                        fontWeight: "bold",
                    },
                    em: {
                        fontStyle: "italic",
                    },
                    blockquote: {
                        borderLeft: "4px solid",
                        borderColor: "blue.200",
                        pl: 4,
                        py: 2,
                        my: 4,
                        bg: "blue.50",
                        borderRadius: "md",
                    },
                    hr: {
                        my: 8,
                        borderColor: "gray.200",
                    },
                    a: {
                        color: "blue.500",
                        textDecoration: "underline",
                        _hover: {
                            color: "blue.700",
                        },
                    },
                }}
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {rawMarkdownBody}
                </ReactMarkdown>
            </Box>
        </Container>
    );
};

export default AboutPage;

export const query = graphql`
  query AboutPageQuery {
    markdownRemark(frontmatter: { title: { eq: "About Lingo Lotus" } }) {
      frontmatter {
        title
        description
      }
      rawMarkdownBody
    }
  }
`;

export const Head: HeadFC = () => <title>About | Lingo Lotus</title>;
