import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SpeechButtonProps {
  text: string;
  languageCode: string;
}

/**
 * SpeechButton island component.
 * Invokes the Web Speech API to speak text in the given language.
 * Hydrates with `client:visible` on story detail pages.
 */
export default function SpeechButton({ text, languageCode }: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is available
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAvailable(false);
      return;
    }

    setIsAvailable(true);

    // Voices may load asynchronously — check immediately and listen for changes
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.some(
        (voice) =>
          voice.lang === languageCode ||
          voice.lang.startsWith(`${languageCode}-`)
      );
      setHasVoice(match);
    };

    checkVoices();
    window.speechSynthesis.addEventListener("voiceschanged", checkVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", checkVoices);
      // Cancel any ongoing speech on unmount
      window.speechSynthesis.cancel();
    };
  }, [languageCode]);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || isSpeaking) {
      return;
    }

    // Cancel any previous utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;

    // Try to find the best matching voice
    const voices = window.speechSynthesis.getVoices();
    const exactMatch = voices.find((v) => v.lang === languageCode);
    const prefixMatch = voices.find((v) =>
      v.lang.startsWith(`${languageCode}-`)
    );
    const voice = exactMatch || prefixMatch;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, languageCode, isSpeaking]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  };

  const isDisabled = !isAvailable || !hasVoice;

  const title = isDisabled
    ? !isAvailable
      ? "Speech synthesis is not supported in this browser"
      : "No voice available for this language"
    : isSpeaking
      ? "Stop speaking"
      : `Speak: ${text}`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={title}
      title={title}
      className={cn(
        "h-8 w-8 shrink-0",
        isSpeaking && "text-primary-600 ",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      {isSpeaking ? (
        <SpeakingIcon />
      ) : (
        <IdleIcon />
      )}
    </Button>
  );
}

/** Volume/speaker icon shown when idle */
function IdleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

/** Animated speaker icon shown while speaking */
function SpeakingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 animate-pulse"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
