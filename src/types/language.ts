export interface FontVariant {
    name: string;
    fontFamily: string;
    description: string;
}

export interface LanguageFonts {
    variants: Record<string, FontVariant>;
    default: string;
}

export interface LanguageConfig {
    languageCode?: string;
    language?: string;
    english?: string;
    flag?: string;
    fonts?: LanguageFonts;
}
