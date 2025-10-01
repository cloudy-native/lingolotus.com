import React from "react";

import { HeadFC } from "gatsby";

export const Head: HeadFC<any> = ({ data }) => {
    const deck = data?.decksJson;
    const deckName = deck?.name || "Flashcard";

    return <title>{deckName} | Lingo Lotus</title>;
};

/*
export const query = graphql`
  query CollectionById($collectionId: String!) {
    collectionsJson(collectionId: { eq: $collectionId }) {
      collectionId
      name
      description
      sourceLanguage
      targetLanguage
      createdAt
      updatedAt
      category
      difficulty
      imageUrl
      featured
    }
    allDecksJson(filter: { collectionId: { eq: $collectionId } }) {
      nodes {
        id
        collectionId
        deckId
        name
        description
        sourceLanguage
        targetLanguage
        createdAt
        updatedAt
        theme
        difficulty
        cards {
          frontContent {
            type
            text
          }
          backContent {
            type
            text
          }
          tags
          difficulty
          sourceLanguage
          targetLanguage
          phonetic
          partOfSpeech
          context
          examples {
            original
            translation
            phonetic
          }
        }
      }
    }
  }
`;
*/
