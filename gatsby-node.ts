import { GatsbyNode } from "gatsby";
import path from "node:path";
import {
    collectionDetailPath,
    flashcardListPath,
    deckDetailPath,
    studyDeckPath,
    bookDetailPath,
    storyDetailPath,
    readingPath,
} from "./src/utils/paths";

export const createPages: GatsbyNode["createPages"] = async ({
    graphql,
    actions,
    reporter,
}) => {
    const { createPage } = actions;

    reporter.info("Starting createPages...");

    // Query for all collections
    const collectionsResult = await graphql<{
        allCollectionsJson: {
            nodes: {
                collectionId: string;
            }[];
        };
    }>(`
    query {
      allCollectionsJson {
        nodes {
          collectionId
        }
      }
    }
  `);

    if (collectionsResult.errors) {
        reporter.panicOnBuild(
            `Error while running GraphQL query for collections.`,
        );
        return;
    }

    reporter.info(`Fetched collections ${JSON.stringify(collectionsResult)}`);

    // Create collection pages
    const collectionDetailTemplate = path.resolve(
        "./src/templates/collection-detail.tsx",
    );
    collectionsResult.data?.allCollectionsJson.nodes.forEach((collection) => {
        const path = collectionDetailPath(collection.collectionId);
        const context = {
            collectionId: collection.collectionId,
        };

        createPage({
            path,
            component: collectionDetailTemplate,
            context,
        });
        reporter.info(
            `Created collection page ${path} with context: ${JSON.stringify(context)}`,
        );
    });

    // Create collection list page
    const collectionListTemplate = path.resolve(
        "./src/templates/flashcard-list.tsx",
    );
    createPage({
        path: flashcardListPath(),
        component: collectionListTemplate,
        context: {},
    });

    reporter.info(
        `Created collection list page ${flashcardListPath()} with context: ${JSON.stringify({})}`,
    );

    // Query for all books
    const booksResult = await graphql<{
        allBookJson: {
            nodes: {
                bookId: string;
                sourceLanguage: string;
            }[];
        };
    }>(`
    query {
      allBookJson {
        nodes {
          bookId
          sourceLanguage
        }
      }
    }
  `);

    if (booksResult.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query for books.`);
        return;
    }

    const bookDetailTemplate = path.resolve("./src/templates/book-detail.tsx");
    booksResult.data?.allBookJson.nodes.forEach((book) => {
        const pagePath = bookDetailPath(book.bookId);
        const context = {
            bookId: book.bookId,
            sourceLanguage: `/grammar/${book.sourceLanguage}.md/`,
        };

        createPage({
            path: pagePath,
            component: bookDetailTemplate,
            context,
        });

        reporter.info(
            `Created book detail page ${pagePath} with context: ${JSON.stringify(context)}`,
        );
    });

    // Create story detail pages
    type StoryNode = {
        storyId: string;
        bookId: string;
        language: string;
    };

    const storiesResult = (await graphql(`
    query {
      allBookStoryJson {
        nodes {
          storyId
          bookId
          language
        }
      }
    }
  `)) as {
        data?: {
            allBookStoryJson: {
                nodes: StoryNode[];
            };
        };
        errors?: unknown;
    };

    if (storiesResult.errors) {
        reporter.panicOnBuild(
            `Error while running GraphQL query for book stories.`,
        );
        return;
    }

    const stories = storiesResult.data?.allBookStoryJson?.nodes ?? [];
    reporter.info(`Fetched ${stories.length} stories`);

    const storyDetailTemplate = path.resolve(
        "./src/templates/story-detail.tsx",
    );
    stories.forEach((story: StoryNode) => {
        const pagePath = storyDetailPath(story.bookId, story.storyId);
        const context = {
            bookId: story.bookId,
            storyId: story.storyId,
            storyLanguage: story.language,
        };

        createPage({
            path: pagePath,
            component: storyDetailTemplate,
            context,
        });

        reporter.info(
            `Created story detail page ${pagePath} with context: ${JSON.stringify(context)}`,
        );
    });

    // Query for all decks
    const decksResult = await graphql<{
        allDecksJson: {
            nodes: {
                id: string;
                deckId: string;
                collectionId: string;
            }[];
        };
    }>(`
    query {
      allDecksJson {
        nodes {
          id
          deckId
          collectionId
        }
      }
    }
  `);

    if (decksResult.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query for decks.`);
        return;
    }
    reporter.info(
        `Fetched ${decksResult.data?.allDecksJson.nodes.length ?? 0} decks`,
    );

    // Create deck detail pages
    const deckDetailTemplate = path.resolve("./src/templates/deck-detail.tsx");
    decksResult.data?.allDecksJson.nodes.forEach((deck) => {
        const path = deckDetailPath(deck.collectionId, deck.deckId);
        const context = {
            collectionId: deck.collectionId,
            deckId: deck.deckId,
        };

        createPage({
            path,
            component: deckDetailTemplate,
            context,
        });
        reporter.info(
            `Created deck detail page ${path} with context: ${JSON.stringify(context)}`,
        );
    });

    // Create deck study pages
    const deckStudyTemplate = path.resolve("./src/templates/deck-study.tsx");
    decksResult.data?.allDecksJson.nodes.forEach((deck) => {
        const path = studyDeckPath(deck.collectionId, deck.deckId);
        const context = {
            collectionId: deck.collectionId,
            deckId: deck.deckId,
        };

        createPage({
            path,
            component: deckStudyTemplate,
            context,
        });
        reporter.info(
            `Created deck study page ${path} with context: ${JSON.stringify(context)}`,
        );
    });

    // Create the reading list page
    const readingListTemplate = path.resolve(
        "./src/templates/reading-list.tsx",
    );
    createPage({
        path: readingPath(),
        component: readingListTemplate,
        context: {},
    });
    reporter.info(
        `Created reading list page ${readingPath()} with context: ${JSON.stringify({})}`,
    );

    // Create the homepage
    createPage({
        path: "/",
        component: path.resolve("./src/templates/flashcard-list.tsx"), // Reuse the collection list template for homepage
        context: {
            featured: true, // Only show featured collections on homepage
        },
    });
    reporter.info(
        `Created homepage with context: ${JSON.stringify({ featured: true })}`,
    );
};

// Create schema customization to ensure consistent GraphQL types
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
    ({ actions }) => {
        const { createTypes } = actions;

        // Define types that might be missing from GraphQL if data is absent
        const typeDefs = `
    type CollectionJson implements Node {
      collectionId: String!
      name: String!
      description: String!
      sourceLanguage: String!
      targetLanguage: String!
      createdAt: Date!
      updatedAt: Date!
      category: String
      difficulty: String
      imageUrl: String
      featured: Boolean
    }

    type DeckJson implements Node {
      collectionId: String!
      deckId: String!
      name: String!
      description: String!
      sourceLanguage: String!
      targetLanguage: String!
      cards: [CardJson!]!
      createdAt: Date!
      updatedAt: Date!
      category: String
      theme: String!
      difficulty: String
    }

    type BookJson implements Node {
      bookId: String!
      name: String!
      description: String!
      sourceLanguage: String!
      targetLanguage: String
      createdAt: Date!
      updatedAt: Date!
      category: String
      difficulty: String
      imageUrl: String
      featured: Boolean
    }

    type BookStoryJson implements Node {
      storyId: String!
      bookId: String!
      language: String!
      title: BookStoryTitleJson!
      sentences: [BookSentenceJson!]!
      createdAt: Date!
      updatedAt: Date!
      difficulty: String
      summary: String
    }

    type BookStoryTitleJson {
      source: String!
      target: String!
    }

    type BookSentenceJson {
      source: String!
      target: String!
      phonetic: String!
      breakdown: [BookSentenceBreakdownJson!]
    }

    type BookSentenceBreakdownJson {
      source: String!
      target: String!
      phonetic: String!
      partOfSpeech: String
    }

    type CardJson {
      frontContent: Content!
      backContent: Content!
      tags: [String!]!
      difficulty: String!
      lastReviewed: Date
      nextReviewDate: Date
      sourceLanguage: String
      targetLanguage: String
      phonetic: String
      partOfSpeech: String
      context: String
      examples: [Example!]
    }

    type Content {
      type: String!
      text: String!
    }

    type Example {
      original: String!
      translation: String!
      phonetic: String
    }

    type Language implements Node {
      languageCode: String!
    }
  `;

        createTypes(typeDefs);
    };

// Make sure createPages has node data already processed
export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
    node,
    actions,
    getNode,
    reporter,
    createNodeId,
    createContentDigest,
}) => {
    const { createNodeField, createNode } = actions;

    // If we have a deck JSON, ensure it has a reference to its collection
    if (node.internal.type === "DeckJson") {
        const deckNode = node as any;

        reporter.info(`Processing deck node: ${JSON.stringify(deckNode)}`);

        if (deckNode.collectionId) {
            createNodeField({
                node,
                name: "collectionId",
                value: deckNode.collectionId,
            });
        }
    }

    // Create language nodes from JSON files
    if (node.internal.type === "LanguagesJson") {
        // Extract language code from the parent node's relative path
        // The parent node should have the file information
        const parentNode: any = getNode(node.parent);
        if (!parentNode || !parentNode.relativePath) {
            console.warn(
                `Skipping language node creation: no parent or relativePath found for node`,
                node,
            );
            return;
        }

        // Extract language code from the filename (e.g., "th" from "languages/th.json")
        const relativePath = parentNode.relativePath as string;
        const languageCode = relativePath
            .replace(/^languages\//, "")
            .replace(/\.json$/, "");

        // Safety check to ensure we have a valid language code
        if (!languageCode) {
            console.warn(
                `Skipping language node creation: no language code found for path ${relativePath}`,
                node,
            );
            return;
        }

        const languageNode = node as any;

        // Create a language node with the font configuration
        const languageNodeData = {
            languageCode,
            fonts: languageNode.fonts || null,
            id: createNodeId(`language-${languageCode}`),
            parent: node.id,
            children: [],
            internal: {
                type: "Language",
                contentDigest: createContentDigest(node),
            },
        };

        createNode(languageNodeData);
        reporter.info(`Created language node for ${languageCode}`);
    }
};
