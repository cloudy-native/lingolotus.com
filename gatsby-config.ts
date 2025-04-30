module.exports = {
  siteMetadata: {
    title: `Language Flashcard App`,
    description: `A modern flashcard app for language learning built with GatsbyJS, ChakraUI and TypeScript`,
    author: `@yourname`,
    siteUrl: `https://yourflashcardapp.com`,
  },
  plugins: [
    // Essential Gatsby plugins
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "tests",
        path: `${__dirname}/data/tests`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "decks",
        path: `${__dirname}/data/decks`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "collections",
        path: `${__dirname}/data/collections`,
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
