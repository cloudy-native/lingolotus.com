import type { Node } from "gatsby";
import type { LanguageConfig } from "./language";

export interface LanguageFonts {
    label: string;
    variants: Record<string, LanguageFontVariant>;
    default: string;
}

export interface LanguageFontVariant {
    name: string;
    fontFamily: string;
    description: string;
}

export interface LanguageNode extends Node {
    languageCode: string;
    fonts?: LanguageConfig["fonts"];
}
