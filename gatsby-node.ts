import { GatsbyNode } from "gatsby";
import path from "path";
import {
  collectionDetailPath,
  collectionListPath,
  deckDetailPath,
  deckReviewPath,
  studyDeckPath,
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
    reporter.panicOnBuild(`Error while running GraphQL query for collections.`);
    return;
  }

  reporter.info("Fetched collections " + JSON.stringify(collectionsResult));

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
    "./src/templates/collection-list.tsx",
  );
  createPage({
    path: collectionListPath(),
    component: collectionListTemplate,
    context: {},
  });

  reporter.info(
    `Created collection list page ${collectionListPath()} with context: ${JSON.stringify({})}`,
  );

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

  // Create deck review pages
  const deckReviewTemplate = path.resolve("./src/templates/deck-review.tsx");
  decksResult.data?.allDecksJson.nodes.forEach((deck) => {
    const path = deckReviewPath(deck.collectionId, deck.deckId);
    const context = {
      collectionId: deck.collectionId,
      deckId: deck.deckId,
      sessionId: "mock-session-id", // In a real app, this would be dynamic
    };

    createPage({
      path,
      component: deckReviewTemplate,
      context,
    });
    reporter.info(
      `Created deck review page ${path} with context: ${JSON.stringify(context)}`,
    );
  });

  // Create the homepage
  createPage({
    path: "/",
    component: path.resolve("./src/templates/collection-list.tsx"), // Reuse the collection list template for homepage
    context: {
      featured: true, // Only show featured collections on homepage
    },
  });
  reporter.info(
    "Created homepage with context: " + JSON.stringify({ featured: true }),
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

    type CardJson {
      cardId: String!
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
  `;

    createTypes(typeDefs);
  };

// Make sure createPages has node data already processed
export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
  reporter,
}) => {
  const { createNodeField } = actions;

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
};
