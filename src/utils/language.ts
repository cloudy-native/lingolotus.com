export interface LanguageInfo {
  code: string;
  flag: string;
  englishName: string;
  nativeName: string;
}

const LANGUAGES: Record<string, LanguageInfo> = {
  en: {
    code: "en",
    flag: "🇬🇧",
    englishName: "English",
    nativeName: "English",
  },
  th: {
    code: "th",
    flag: "🇹🇭",
    englishName: "Thai",
    nativeName: "ไทย",
  },
  // TODO: add more languages
};

export function getLanguageInfo(code: string): LanguageInfo {
  return (
    LANGUAGES[code] || {
      code,
      flag: "🏳️",
      englishName: code,
      nativeName: code,
    }
  );
}
