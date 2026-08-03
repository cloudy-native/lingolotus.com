/**
 * Interactive grammar cheatsheet data (Paiboon-like romanization).
 * Matches site style: sà-wàt-dii, kráp, kâ, etc.
 */

export type GrammarSectionId =
  | "quick"
  | "tones"
  | "particles"
  | "classifiers"
  | "tone-rules"
  | "consonants"
  | "vowels";

export interface SpeakExample {
  thai: string;
  phonetic: string;
  en: string;
}

export const GRAMMAR_SECTIONS: {
  id: GrammarSectionId;
  label: string;
  short: string;
}[] = [
  { id: "quick", label: "Quick", short: "Start here" },
  { id: "tones", label: "Tones", short: "5 tones" },
  { id: "particles", label: "Particles", short: "ครับ/ค่ะ" },
  { id: "classifiers", label: "Classifiers", short: "คน ตัว เล่ม" },
  { id: "tone-rules", label: "Tone rules", short: "Class × mark" },
  { id: "consonants", label: "Consonants", short: "Full list" },
  { id: "vowels", label: "Vowels", short: "Full list" },
];

/** Default section by learner level */
export function defaultSectionForLevel(
  level?: string | null,
): GrammarSectionId {
  const n = (level || "").toLowerCase();
  if (n.includes("adv")) return "particles";
  if (n.includes("inter")) return "classifiers";
  if (n.includes("elem")) return "tones";
  return "quick";
}

export const TONE_MARKS: {
  name: string;
  symbol: string;
  tone: string;
  example: SpeakExample;
}[] = [
  {
    name: "Mai ek",
    symbol: "่",
    tone: "Low (often)",
    example: { thai: "หมา", phonetic: "mǎa", en: "dog" },
  },
  {
    name: "Mai tho",
    symbol: "้",
    tone: "Falling (often)",
    example: { thai: "ม้า", phonetic: "máa", en: "horse" },
  },
  {
    name: "Mai tri",
    symbol: "๊",
    tone: "High",
    example: { thai: "ก๊าซ", phonetic: "gáat", en: "gas" },
  },
  {
    name: "Mai chattawa",
    symbol: "๋",
    tone: "Rising",
    example: { thai: "ญี่ปุ่น", phonetic: "yîi-bpùn", en: "Japan" },
  },
  {
    name: "No mark",
    symbol: "—",
    tone: "Default mid / live-dead rules",
    example: { thai: "มา", phonetic: "maa", en: "come" },
  },
];

/** Minimal pairs good for ears + TTS */
export const TONE_PAIRS: { a: SpeakExample; b: SpeakExample; note: string }[] =
  [
    {
      a: { thai: "หมา", phonetic: "mǎa", en: "dog" },
      b: { thai: "ม้า", phonetic: "máa", en: "horse" },
      note: "Same letters, different tone mark",
    },
    {
      a: { thai: "ใกล้", phonetic: "glâi", en: "near" },
      b: { thai: "ไกล", phonetic: "glai", en: "far" },
      note: "Common travel pair",
    },
    {
      a: { thai: "ใหม่", phonetic: "mài", en: "new" },
      b: { thai: "ไหม", phonetic: "mǎi", en: "question particle" },
      note: "Tone changes meaning completely",
    },
  ];

export const PARTICLES: {
  thai: string;
  phonetic: string;
  en: string;
  tip: string;
}[] = [
  {
    thai: "ครับ",
    phonetic: "kráp",
    en: "Polite particle (male speaker)",
    tip: "Ends statements; softens requests",
  },
  {
    thai: "ค่ะ",
    phonetic: "kâ",
    en: "Polite particle (female speaker)",
    tip: "Statements; high falling feel",
  },
  {
    thai: "คะ",
    phonetic: "ká",
    en: "Polite question (female)",
    tip: "Use on questions instead of ค่ะ",
  },
  {
    thai: "ไหม",
    phonetic: "mǎi",
    en: "Yes/no question particle",
    tip: "…ไหมครับ / …ไหมคะ",
  },
  {
    thai: "นะ",
    phonetic: "ná",
    en: "Softener / soft insistence",
    tip: "Friendly: ไปนะ",
  },
  {
    thai: "สิ",
    phonetic: "sì",
    en: "Urge / obviousness",
    tip: "More direct than นะ",
  },
  {
    thai: "จัง",
    phonetic: "jang",
    en: "So / really (emphasis)",
    tip: "อร่อยจัง",
  },
  {
    thai: "เลย",
    phonetic: "ləəi",
    en: "Emphatic “really / then”",
    tip: "ดีเลย",
  },
];

export const CLASSIFIERS: {
  thai: string;
  phonetic: string;
  usedFor: string;
  example: SpeakExample;
}[] = [
  {
    thai: "คน",
    phonetic: "kon",
    usedFor: "People",
    example: {
      thai: "สองคน",
      phonetic: "sǎawng kon",
      en: "two people",
    },
  },
  {
    thai: "ตัว",
    phonetic: "dtua",
    usedFor: "Animals, some objects",
    example: {
      thai: "หมาสามตัว",
      phonetic: "mǎa sǎam dtua",
      en: "three dogs",
    },
  },
  {
    thai: "เล่ม",
    phonetic: "lêm",
    usedFor: "Books, knives",
    example: {
      thai: "หนังสือสองเล่ม",
      phonetic: "nǎng-sǔu sǎawng lêm",
      en: "two books",
    },
  },
  {
    thai: "คัน",
    phonetic: "kan",
    usedFor: "Vehicles, umbrellas",
    example: {
      thai: "รถสองคัน",
      phonetic: "rót sǎawng kan",
      en: "two cars",
    },
  },
  {
    thai: "ใบ",
    phonetic: "bai",
    usedFor: "Tickets, leaves, flat things",
    example: {
      thai: "ตั๋วสองใบ",
      phonetic: "dtǔa sǎawng bai",
      en: "two tickets",
    },
  },
  {
    thai: "อัน",
    phonetic: "an",
    usedFor: "General small objects",
    example: {
      thai: "สามอัน",
      phonetic: "sǎam an",
      en: "three (things)",
    },
  },
  {
    thai: "ชิ้น",
    phonetic: "chín",
    usedFor: "Pieces, slices",
    example: {
      thai: "เค้กสองชิ้น",
      phonetic: "kéek sǎawng chín",
      en: "two pieces of cake",
    },
  },
  {
    thai: "ฟอง",
    phonetic: "fɔɔng",
    usedFor: "Eggs",
    example: {
      thai: "ไข่สิบฟอง",
      phonetic: "kài sìp fɔɔng",
      en: "ten eggs",
    },
  },
  {
    thai: "ครั้ง",
    phonetic: "kráng",
    usedFor: "Times / occasions",
    example: {
      thai: "สองครั้ง",
      phonetic: "sǎawng kráng",
      en: "two times",
    },
  },
  {
    thai: "บาท",
    phonetic: "bàat",
    usedFor: "Money (baht)",
    example: {
      thai: "ห้าสิบบาท",
      phonetic: "hâa-sìp bàat",
      en: "fifty baht",
    },
  },
];

/** Simplified tone outcome grid (mid-class live syllable teaching frame) */
export const TONE_RULE_ROWS: {
  className: string;
  noMark: string;
  maiEk: string;
  maiTho: string;
}[] = [
  {
    className: "Mid",
    noMark: "Mid",
    maiEk: "Low",
    maiTho: "Falling",
  },
  {
    className: "High",
    noMark: "Rising*",
    maiEk: "Low",
    maiTho: "Falling",
  },
  {
    className: "Low",
    noMark: "Mid*",
    maiEk: "Falling",
    maiTho: "High",
  },
];

export const CONSONANT_CLASSES: {
  name: string;
  count: string;
  examples: string;
  tip: string;
}[] = [
  {
    name: "Mid",
    count: "9",
    examples: "ก ด ต บ ป จ ฎ ฏ อ",
    tip: "Clean baseline for tone rules",
  },
  {
    name: "High",
    count: "11",
    examples: "ข ฉ ฐ ถ ผ ฝ ศ ษ ส ห ฃ",
    tip: "Often rising when unmarked live",
  },
  {
    name: "Low",
    count: "24",
    examples: "ค ช ซ ท พ ฟ ม น ง ย ร ล ว …",
    tip: "Largest set; includes many common letters",
  },
];

export const QUICK_FACTS: string[] = [
  "Thai is tonal — pitch can change meaning (หมา dog vs ม้า horse).",
  "Polite endings: ครับ (kráp) male · ค่ะ (kâ) female · คะ (ká) female questions.",
  "Yes/no questions often end with ไหม (mǎi).",
  "Counting: noun + number + classifier (หมา สอง ตัว).",
  "No spaces between words in real Thai writing; learners use spaces for study.",
  "Romanization here matches Lingo Lotus (Paiboon-like with tone marks).",
];

export const NEGATION_TIME: { thai: string; phonetic: string; en: string }[] = [
  { thai: "ไม่", phonetic: "mâi", en: "not / no" },
  { thai: "ไม่ได้", phonetic: "mâi dâai", en: "cannot / did not (context)" },
  { thai: "ยังไม่", phonetic: "yang mâi", en: "not yet" },
  { thai: "แล้ว", phonetic: "lɛ́ɛo", en: "already" },
  { thai: "ตอนนี้", phonetic: "dton-níi", en: "now" },
  { thai: "เมื่อวาน", phonetic: "mûea-waan", en: "yesterday" },
  { thai: "พรุ่งนี้", phonetic: "prûng-níi", en: "tomorrow" },
];
