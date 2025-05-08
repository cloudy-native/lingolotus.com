module.exports = {
  siteMetadata: {
    title: `Lingo Lotus Flashcard App`,
    description: `A modern flashcard app for language learning built with GatsbyJS, ChakraUI and TypeScript`,
    author: `@yourname`,
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
        path: `${__dirname}/data/collections`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "decks",
        path: `${__dirname}/data/decks`,
      },
    },
    `gatsby-transformer-json`,

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
