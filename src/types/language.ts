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
  fonts?: LanguageFonts;
}
