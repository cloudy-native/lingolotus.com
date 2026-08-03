import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Load language grammar cheatsheet markdown at build time.
 * Files live in languages/grammar/{lang}.md (e.g. th.md).
 */
export function loadGrammarMarkdown(languageCode: string): string | null {
  const code = (languageCode || "th").toLowerCase().trim();
  const filePath = path.join(
    process.cwd(),
    "languages",
    "grammar",
    `${code}.md`,
  );
  if (!existsSync(filePath)) {
    // Fallback to Thai guide if language-specific file missing
    const fallback = path.join(
      process.cwd(),
      "languages",
      "grammar",
      "th.md",
    );
    if (!existsSync(fallback) || code === "th") return null;
    try {
      return readFileSync(fallback, "utf-8");
    } catch {
      return null;
    }
  }
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}
