export type LangInfo = { native: string; flag: string };

const LANG_NAMES: Record<string, LangInfo> = {
    th: { native: "ไทย", flag: "🇹🇭" },
    en: { native: "English", flag: "🇬🇧" },
    ja: { native: "日本語", flag: "🇯🇵" },
    zh: { native: "中文", flag: "🇨🇳" },
    ko: { native: "한국어", flag: "🇰🇷" },
};

export function getLangInfo(code: string): LangInfo {
    return LANG_NAMES[code] || { native: code.toUpperCase(), flag: "🌐" };
}
