import type { LanguageConfig } from "../types/language";

// In a Gatsby environment, we need to use webpack to import JSON files
// This function will dynamically import language font configurations
export async function getLanguageFontConfig(languageCode: string): Promise<LanguageConfig | null> {
  try {
    // Use dynamic import to load the language font configuration
    const module = await import(`../../data/languages/${languageCode}.json`);
    return module.default as LanguageConfig;
  } catch (error) {
    // If the language file doesn't exist, return null
    console.warn(`Font configuration not found for language: ${languageCode}`, error);
    return null;
  }
}

export function getFontFamilyFromConfig(
  config: LanguageConfig,
  variantKey: string
): string {
  if (!config.fonts || !config.fonts.variants) return "";
  const variant = config.fonts.variants[variantKey];
  return variant ? variant.fontFamily : "";
}

export function getDefaultFontVariant(config: LanguageConfig): string {
  if (!config.fonts || !config.fonts.default) return "serif";
  return config.fonts.default;
}
