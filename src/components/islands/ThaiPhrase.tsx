import SpeechButton from "@/components/islands/SpeechButton";
import type { FontSize } from "@/lib/reader-settings";
import { cn } from "@/lib/utils";

/**
 * Shared Thai + Paiboon + speech (stories & flashcards).
 *
 *   sà-wàt-dii     ← phonetics above (optional)
 * 🔈 สวัสดี         ← speech immediately before Thai
 *   hello          ← translation (optional)
 */
export function ThaiPhrase({
  thai,
  phonetic,
  translation,
  languageCode = "th",
  showPhonetics = true,
  showTranslation = false,
  fontSize = "base",
  partOfSpeech,
  showPos = false,
  align = "start",
  size = "md",
  className,
}: {
  thai: string;
  phonetic?: string | null;
  translation?: string | null;
  languageCode?: string;
  showPhonetics?: boolean;
  showTranslation?: boolean;
  fontSize?: FontSize;
  partOfSpeech?: string | null;
  showPos?: boolean;
  align?: "start" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const thaiClass =
    size === "lg"
      ? {
          sm: "text-2xl",
          base: "text-3xl md:text-4xl",
          lg: "text-4xl md:text-5xl",
        }[fontSize]
      : size === "sm"
        ? {
            sm: "text-sm",
            base: "text-base",
            lg: "text-lg",
          }[fontSize]
        : {
            sm: "text-lg",
            base: "text-xl sm:text-2xl",
            lg: "text-2xl sm:text-3xl",
          }[fontSize];

  const phoneticClass =
    size === "lg"
      ? "text-sm sm:text-base"
      : size === "sm"
        ? "text-[11px]"
        : "text-xs sm:text-sm";

  const translationClass =
    size === "lg"
      ? "text-base sm:text-lg"
      : size === "sm"
        ? "text-xs"
        : "text-sm sm:text-base";

  const title = [
    thai,
    phonetic && `/${phonetic}/`,
    translation && `= ${translation}`,
    showPos && partOfSpeech && `· ${partOfSpeech}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        "flex gap-2",
        align === "center" ? "flex-col items-center text-center" : "items-start",
        className,
      )}
      title={title}
    >
      {align === "center" ? (
        <div className="flex flex-col items-center">
          {showPhonetics && phonetic ? (
            <p
              className={cn(
                // Extra room so Paiboon clears tall Thai vowel marks
                "mb-2.5 font-medium italic leading-snug text-orange-800/80 sm:mb-3",
                phoneticClass,
              )}
            >
              {phonetic}
            </p>
          ) : null}
          <div className="flex items-center justify-center gap-2">
            <SpeechButton text={thai} languageCode={languageCode} size="sm" />
            <p
              className={cn(
                "font-thai font-bold leading-normal text-stone-900",
                thaiClass,
              )}
            >
              {thai}
            </p>
          </div>
          {showTranslation && translation ? (
            <p
              className={cn(
                "mt-2 font-medium text-stone-600",
                translationClass,
              )}
            >
              {translation}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <SpeechButton
            text={thai}
            languageCode={languageCode}
            size="sm"
            className={cn(
              "shrink-0",
              showPhonetics && phonetic ? "mt-6" : "mt-0.5",
            )}
          />
          <div className="min-w-0">
            {showPhonetics && phonetic ? (
              <p
                className={cn(
                  "mb-2 font-medium italic leading-snug text-orange-800/80 sm:mb-2.5",
                  phoneticClass,
                )}
              >
                {phonetic}
              </p>
            ) : null}
            <p
              className={cn(
                "font-thai font-bold leading-normal text-stone-900",
                thaiClass,
              )}
            >
              {thai}
            </p>
            {showTranslation && translation ? (
              <p
                className={cn(
                  "mt-1 font-medium text-stone-600",
                  translationClass,
                )}
              >
                {translation}
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
