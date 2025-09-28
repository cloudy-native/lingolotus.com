module.exports = {
  siteMetadata: {
    title: `Lingo Lotus Flashcard App`,
    description: `A modern flashcard app for language learning built with GatsbyJS, ChakraUI and TypeScript`,
    author: `Stephen Harrison <stephen@harrison.org>`,
    siteUrl: `https://lingolotus.com`,
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/static/images`,
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,

    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "collections",
        path: `${__dirname}/data/flash-cards/collections`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "decks",
        path: `${__dirname}/data/flash-cards/decks`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "books",
        path: `${__dirname}/data/books`,
        ignore: ["**/stories/**"],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "bookStories",
        path: `${__dirname}/data/books/stories`,
      },
    },
    {
      resolve: `gatsby-transformer-json`,
      options: {
        typeName: ({ node }: { node: { sourceInstanceName?: string } }) => {
          switch (node.sourceInstanceName) {
            case "collections":
              return "CollectionsJson";
            case "decks":
              return "DecksJson";
            case "books":
              return "BookJson";
            case "bookStories":
              return "BookStoryJson";
            default:
              return "Json";
          }
        },
      },
    },

    // TypeScript support
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true,
        jsxPragma: `jsx`,
        allExtensions: true,
      },
    },
  ],
};
