/**
 * Persistent display prefs for reading / Thai presentation.
 * Shared by story reader, study mode, and the site gear control.
 */

export type FontSize = "sm" | "base" | "lg";
/** looped = textbook หัวกลม · modern = street/poster หัวตัด */
export type ThaiStyle = "looped" | "modern";

export interface ReaderSettings {
  thaiStyle: ThaiStyle;
  fontSize: FontSize;
  showPhonetics: boolean;
  showPos: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  thaiStyle: "looped",
  fontSize: "base",
  showPhonetics: true,
  showPos: false,
};

const STORAGE_KEY = "lingolotus.readerSettings";
export const READER_SETTINGS_EVENT = "lingolotus:reader-settings";

function isFontSize(v: unknown): v is FontSize {
  return v === "sm" || v === "base" || v === "lg";
}

function isThaiStyle(v: unknown): v is ThaiStyle {
  return v === "looped" || v === "modern";
}

export function loadReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") return { ...DEFAULT_READER_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Migrate older single-key style preference
    const legacyStyle = window.localStorage.getItem("lingolotus.thaiStyle");
    if (!raw) {
      if (isThaiStyle(legacyStyle)) {
        return { ...DEFAULT_READER_SETTINGS, thaiStyle: legacyStyle };
      }
      return { ...DEFAULT_READER_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      thaiStyle: isThaiStyle(parsed.thaiStyle)
        ? parsed.thaiStyle
        : isThaiStyle(legacyStyle)
          ? legacyStyle
          : DEFAULT_READER_SETTINGS.thaiStyle,
      fontSize: isFontSize(parsed.fontSize)
        ? parsed.fontSize
        : DEFAULT_READER_SETTINGS.fontSize,
      showPhonetics:
        typeof parsed.showPhonetics === "boolean"
          ? parsed.showPhonetics
          : DEFAULT_READER_SETTINGS.showPhonetics,
      showPos:
        typeof parsed.showPos === "boolean"
          ? parsed.showPos
          : DEFAULT_READER_SETTINGS.showPos,
    };
  } catch {
    return { ...DEFAULT_READER_SETTINGS };
  }
}

/** Persist + broadcast + apply document-level Thai font */
export function saveReaderSettings(next: ReaderSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.localStorage.setItem("lingolotus.thaiStyle", next.thaiStyle);
  } catch {
    /* ignore quota */
  }
  applyThaiStyleToDocument(next.thaiStyle);
  window.dispatchEvent(
    new CustomEvent(READER_SETTINGS_EVENT, { detail: next }),
  );
}

export function applyThaiStyleToDocument(style: ThaiStyle): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-thai-style", style);
  // Set variable directly so we don't depend on CSS attribute-selector order
  root.style.setProperty(
    "--font-thai-family",
    style === "modern"
      ? "var(--font-thai-modern)"
      : "var(--font-thai-looped)",
  );
}

export function patchReaderSettings(
  patch: Partial<ReaderSettings>,
): ReaderSettings {
  const next = { ...loadReaderSettings(), ...patch };
  saveReaderSettings(next);
  return next;
}
