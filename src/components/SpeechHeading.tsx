import React from "react";
import { HStack, Heading } from "@chakra-ui/react";
import { TextToSpeech } from "./TextToSpeech";

export interface SpeechHeadingProps {
  text: string;
  lang: string;
  headingSize?: string;
  mb?: number;
}

export const SpeechHeading: React.FC<SpeechHeadingProps> = ({
  text,
  lang,
  headingSize = "lg",
  mb = 2,
}) => (
  <HStack spacing={2} align="center">
    <TextToSpeech text={text} lang={lang} />
    <Heading size={headingSize} mb={mb} textAlign="left">
      {text}
    </Heading>
  </HStack>
);

export default SpeechHeading;
