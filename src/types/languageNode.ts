import type { Node } from "gatsby";

export interface LanguageNode extends Node {
    languageCode: string;
}
