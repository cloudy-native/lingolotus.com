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

export type ConsonantClass = "Mid" | "High" | "Low";

/**
 * Full Thai consonant inventory with traditional name-words (กอ ไก่ style).
 * `speak` is what TTS reads — letter + inherent อ + name word.
 */
export interface ThaiConsonant {
  letter: string;
  className: ConsonantClass;
  /** Acrophonic name word, e.g. ไก่ */
  nameWord: string;
  /** Paiboon-like for the name word */
  namePhonetic: string;
  /** English gloss of the name word */
  nameEn: string;
  /** TTS phrase: e.g. "กอ ไก่" (go-gai style) */
  speak: string;
  initial: string;
  final: string;
  notes?: string;
  obsolete?: boolean;
}

export const CONSONANTS: ThaiConsonant[] = [
  // Mid (9)
  { letter: "ก", className: "Mid", nameWord: "ไก่", namePhonetic: "gài", nameEn: "chicken", speak: "กอ ไก่", initial: "k", final: "k", notes: "Unaspirated (like “sky”)" },
  { letter: "จ", className: "Mid", nameWord: "จาน", namePhonetic: "jaan", nameEn: "plate", speak: "จอ จาน", initial: "j/ch", final: "t", notes: "Unaspirated affricate" },
  { letter: "ฎ", className: "Mid", nameWord: "ชฎา", namePhonetic: "chá-daa", nameEn: "crown", speak: "ฎอ ชฎา", initial: "d", final: "t", notes: "Rare" },
  { letter: "ฏ", className: "Mid", nameWord: "ปฏัก", namePhonetic: "bpà-dtàk", nameEn: "goad", speak: "ฏอ ปฏัก", initial: "dt", final: "t", notes: "Rare" },
  { letter: "ด", className: "Mid", nameWord: "เด็ก", namePhonetic: "dèk", nameEn: "child", speak: "ดอ เด็ก", initial: "d", final: "t" },
  { letter: "ต", className: "Mid", nameWord: "เต่า", namePhonetic: "dtào", nameEn: "turtle", speak: "ตอ เต่า", initial: "dt", final: "t", notes: "Unaspirated" },
  { letter: "บ", className: "Mid", nameWord: "ใบไม้", namePhonetic: "bai-máai", nameEn: "leaf", speak: "บอ ใบไม้", initial: "b", final: "p" },
  { letter: "ป", className: "Mid", nameWord: "ปลา", namePhonetic: "bplaa", nameEn: "fish", speak: "ปอ ปลา", initial: "bp", final: "p", notes: "Unaspirated" },
  { letter: "อ", className: "Mid", nameWord: "อ่าง", namePhonetic: "àang", nameEn: "basin", speak: "อ อ่าง", initial: "—", final: "—", notes: "Vowel carrier (*often treated mid)" },
  // High (11)
  { letter: "ข", className: "High", nameWord: "ไข่", namePhonetic: "kài", nameEn: "egg", speak: "ขอ ไข่", initial: "kh", final: "k", notes: "Aspirated" },
  { letter: "ฃ", className: "High", nameWord: "ขวด", namePhonetic: "kùuat", nameEn: "bottle", speak: "ฃอ ขวด", initial: "kh", final: "k", notes: "Obsolete", obsolete: true },
  { letter: "ฉ", className: "High", nameWord: "ฉิ่ง", namePhonetic: "chìng", nameEn: "cymbals", speak: "ฉอ ฉิ่ง", initial: "ch", final: "—", notes: "Aspirated" },
  { letter: "ฐ", className: "High", nameWord: "ฐาน", namePhonetic: "tǎan", nameEn: "base", speak: "ฐอ ฐาน", initial: "th", final: "t", notes: "Loanwords" },
  { letter: "ถ", className: "High", nameWord: "ถุง", namePhonetic: "tǔng", nameEn: "bag", speak: "ถอ ถุง", initial: "th", final: "t" },
  { letter: "ผ", className: "High", nameWord: "ผึ้ง", namePhonetic: "pûeng", nameEn: "bee", speak: "ผอ ผึ้ง", initial: "ph", final: "—" },
  { letter: "ฝ", className: "High", nameWord: "ฝา", namePhonetic: "fǎa", nameEn: "lid", speak: "ฝอ ฝา", initial: "f", final: "—" },
  { letter: "ศ", className: "High", nameWord: "ศาลา", namePhonetic: "sǎa-laa", nameEn: "pavilion", speak: "ศอ ศาลา", initial: "s", final: "t", notes: "Loanwords" },
  { letter: "ษ", className: "High", nameWord: "ฤๅษี", namePhonetic: "rʉʉ-sǐi", nameEn: "hermit", speak: "ษอ ฤๅษี", initial: "s", final: "t", notes: "Rare" },
  { letter: "ส", className: "High", nameWord: "เสือ", namePhonetic: "sʉ̌a", nameEn: "tiger", speak: "สอ เสือ", initial: "s", final: "t" },
  { letter: "ห", className: "High", nameWord: "หีบ", namePhonetic: "hìip", nameEn: "chest", speak: "หอ หีบ", initial: "h", final: "—" },
  // Low (24) — full set (was truncated to ค ช ซ ท พ ฟ ม น ง ย ร ล ว …)
  { letter: "ค", className: "Low", nameWord: "ควาย", namePhonetic: "kwaai", nameEn: "buffalo", speak: "คอ ควาย", initial: "kh", final: "k", notes: "Common" },
  { letter: "ฅ", className: "Low", nameWord: "คน", namePhonetic: "kon", nameEn: "person", speak: "ฅอ คน", initial: "kh", final: "k", notes: "Obsolete", obsolete: true },
  { letter: "ฆ", className: "Low", nameWord: "ระฆัง", namePhonetic: "rá-kang", nameEn: "bell", speak: "ฆอ ระฆัง", initial: "kh", final: "k", notes: "Rare / loanwords" },
  { letter: "ง", className: "Low", nameWord: "งู", namePhonetic: "nguu", nameEn: "snake", speak: "งอ งู", initial: "ng", final: "ng", notes: "Like “sing”" },
  { letter: "ช", className: "Low", nameWord: "ช้าง", namePhonetic: "cháang", nameEn: "elephant", speak: "ชอ ช้าง", initial: "ch", final: "t", notes: "Common" },
  { letter: "ซ", className: "Low", nameWord: "โซ่", namePhonetic: "sôo", nameEn: "chain", speak: "ซอ โซ่", initial: "s", final: "t" },
  { letter: "ฌ", className: "Low", nameWord: "เฌอ", namePhonetic: "chəə", nameEn: "tree", speak: "ฌอ เฌอ", initial: "ch", final: "—", notes: "Rare" },
  { letter: "ญ", className: "Low", nameWord: "หญิง", namePhonetic: "yǐng", nameEn: "woman", speak: "ญอ หญิง", initial: "y", final: "n" },
  { letter: "ฑ", className: "Low", nameWord: "มณโฑ", namePhonetic: "mon-too", nameEn: "Montho", speak: "ฑอ มณโฑ", initial: "th", final: "t", notes: "Loanwords" },
  { letter: "ฒ", className: "Low", nameWord: "เฒ่า", namePhonetic: "tâo", nameEn: "elder", speak: "ฒอ เฒ่า", initial: "th", final: "t", notes: "Rare" },
  { letter: "ณ", className: "Low", nameWord: "เณร", namePhonetic: "nen", nameEn: "novice", speak: "ณอ เณร", initial: "n", final: "n" },
  { letter: "ท", className: "Low", nameWord: "ทหาร", namePhonetic: "tá-hǎan", nameEn: "soldier", speak: "ทอ ทหาร", initial: "th", final: "t" },
  { letter: "ธ", className: "Low", nameWord: "ธง", namePhonetic: "tong", nameEn: "flag", speak: "ธอ ธง", initial: "th", final: "t", notes: "Loanwords" },
  { letter: "น", className: "Low", nameWord: "หนู", namePhonetic: "nǔu", nameEn: "mouse", speak: "นอ หนู", initial: "n", final: "n" },
  { letter: "พ", className: "Low", nameWord: "พาน", namePhonetic: "paan", nameEn: "tray", speak: "พอ พาน", initial: "ph", final: "p" },
  { letter: "ฟ", className: "Low", nameWord: "ฟัน", namePhonetic: "fan", nameEn: "teeth", speak: "ฟอ ฟัน", initial: "f", final: "p" },
  { letter: "ภ", className: "Low", nameWord: "สำเภา", namePhonetic: "sǎm-pao", nameEn: "junk (boat)", speak: "ภอ สำเภา", initial: "ph", final: "p", notes: "Loanwords" },
  { letter: "ม", className: "Low", nameWord: "ม้า", namePhonetic: "máa", nameEn: "horse", speak: "มอ ม้า", initial: "m", final: "m" },
  { letter: "ย", className: "Low", nameWord: "ยักษ์", namePhonetic: "yák", nameEn: "giant", speak: "ยอ ยักษ์", initial: "y", final: "—" },
  { letter: "ร", className: "Low", nameWord: "เรือ", namePhonetic: "rʉa", nameEn: "boat", speak: "รอ เรือ", initial: "r", final: "n", notes: "Often soft r/l" },
  { letter: "ล", className: "Low", nameWord: "ลิง", namePhonetic: "ling", nameEn: "monkey", speak: "ลอ ลิง", initial: "l", final: "n" },
  { letter: "ว", className: "Low", nameWord: "แหวน", namePhonetic: "wǎaen", nameEn: "ring", speak: "วอ แหวน", initial: "w", final: "—" },
  { letter: "ฬ", className: "Low", nameWord: "จุฬา", namePhonetic: "jù-laa", nameEn: "kite", speak: "ฬอ จุฬา", initial: "l", final: "n", notes: "Rare" },
  { letter: "ฮ", className: "Low", nameWord: "นกฮูก", namePhonetic: "nók-hûuk", nameEn: "owl", speak: "ฮอ นกฮูก", initial: "h", final: "—" },
];

export const CONSONANT_CLASSES: {
  name: ConsonantClass;
  count: string;
  /** Full letter list for this class (no ellipsis) */
  letters: string[];
  tip: string;
}[] = [
  {
    name: "Mid",
    count: "9",
    letters: CONSONANTS.filter((c) => c.className === "Mid").map((c) => c.letter),
    tip: "Clean baseline for tone rules",
  },
  {
    name: "High",
    count: "11",
    letters: CONSONANTS.filter((c) => c.className === "High").map((c) => c.letter),
    tip: "Often rising when unmarked live",
  },
  {
    name: "Low",
    count: "24",
    letters: CONSONANTS.filter((c) => c.className === "Low").map((c) => c.letter),
    tip: "Largest set; includes many common letters",
  },
];

export interface ThaiVowel {
  pattern: string;
  sound: string;
  length?: string;
  example: string;
  examplePhonetic: string;
  meaning: string;
  /** TTS for the example word */
  speak: string;
  kind: "simple" | "diphthong";
}

export const VOWELS: ThaiVowel[] = [
  { pattern: "◌า", sound: "aa", length: "long", example: "กา", examplePhonetic: "gaa", meaning: "crow", speak: "กา", kind: "simple" },
  { pattern: "◌ะ", sound: "a", length: "short", example: "จะ", examplePhonetic: "jà", meaning: "will", speak: "จะ", kind: "simple" },
  { pattern: "◌ิ", sound: "i", length: "short", example: "กิน", examplePhonetic: "gin", meaning: "eat", speak: "กิน", kind: "simple" },
  { pattern: "◌ี", sound: "ii", length: "long", example: "มี", examplePhonetic: "mii", meaning: "have", speak: "มี", kind: "simple" },
  { pattern: "◌ุ", sound: "u", length: "short", example: "ลุก", examplePhonetic: "lúk", meaning: "get up", speak: "ลุก", kind: "simple" },
  { pattern: "◌ู", sound: "uu", length: "long", example: "ดู", examplePhonetic: "duu", meaning: "look", speak: "ดู", kind: "simple" },
  { pattern: "เ◌", sound: "ee", length: "long", example: "เท", examplePhonetic: "tee", meaning: "pour", speak: "เท", kind: "simple" },
  { pattern: "แ◌", sound: "ɛɛ", length: "long", example: "แพ", examplePhonetic: "pɛɛ", meaning: "expensive (in compounds)", speak: "แพ", kind: "simple" },
  { pattern: "โ◌", sound: "oo", length: "long", example: "โต", examplePhonetic: "dtoo", meaning: "big/grow", speak: "โต", kind: "simple" },
  { pattern: "เ◌อ", sound: "əə", length: "long", example: "เธอ", examplePhonetic: "təə", meaning: "you (casual)", speak: "เธอ", kind: "simple" },
  { pattern: "เ◌า", sound: "ao", example: "เกา", examplePhonetic: "gao", meaning: "scratch", speak: "เกา", kind: "diphthong" },
  { pattern: "ใ◌ / ไ◌", sound: "ai", example: "ไป", examplePhonetic: "bpai", meaning: "go", speak: "ไป", kind: "diphthong" },
  { pattern: "เ◌ีย", sound: "iia", example: "เมีย", examplePhonetic: "miia", meaning: "wife", speak: "เมีย", kind: "diphthong" },
  { pattern: "เ◌ือ", sound: "ʉʉa", example: "มือ", examplePhonetic: "mʉʉ", meaning: "hand", speak: "มือ", kind: "diphthong" },
  { pattern: "ั◌ว", sound: "ua", example: "ตัว", examplePhonetic: "dtua", meaning: "body / classifier", speak: "ตัว", kind: "diphthong" },
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
