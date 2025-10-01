import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Image,
    SimpleGrid,
    Stack,
    Tag,
    Text,
} from "@chakra-ui/react";
import { graphql, HeadFC, Link } from "gatsby";
import { ChevronRight, Clock, Star } from "lucide-react";
import React from "react";

import type { Collection, Deck } from "../types";
import { deckDetailPath, flashcardListPath } from "../utils/paths";

export const Head: HeadFC = () => <title>Flashcard | Lingo Lotus</title>;

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
