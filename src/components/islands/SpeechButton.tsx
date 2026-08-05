import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SpeechButtonProps {
  text: string;
  languageCode: string;
  className?: string;
  /** Compact control for dense tables */
  size?: "md" | "sm";
  /** Optional label override for accessibility */
  label?: string;
}

/**
 * SpeechButton — Web Speech API TTS control.
 * Liberal: attempts speech even without a perfect language voice match.
 */
export default function SpeechButton({
  text,
  languageCode,
  className,
  size = "md",
  label,
}: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasLangVoice, setHasLangVoice] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAvailable(false);
      return;
    }

    setIsAvailable(true);

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.some(
        (voice) =>
          voice.lang === languageCode ||
          voice.lang.startsWith(`${languageCode}-`),
      );
      setHasLangVoice(match);
    };

    checkVoices();
    window.speechSynthesis.addEventListener("voiceschanged", checkVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", checkVoices);
      window.speechSynthesis.cancel();
    };
  }, [languageCode]);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Prefer requested language; browser may still speak with a fallback voice
    utterance.lang =
      languageCode.length === 2 ? `${languageCode}-TH` : languageCode;
    if (languageCode === "th") {
      utterance.lang = "th-TH";
    }

    const voices = window.speechSynthesis.getVoices();
    const exactMatch = voices.find((v) => v.lang === languageCode);
    const thMatch = voices.find(
      (v) =>
        v.lang === "th-TH" ||
        v.lang === "th" ||
        v.lang.startsWith("th-"),
    );
    const prefixMatch = voices.find((v) =>
      v.lang.startsWith(`${languageCode}-`),
    );
    const voice = exactMatch || thMatch || prefixMatch;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, languageCode]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const handleClick = (e: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  };

  // Only hard-disable when the API is missing entirely
  const isDisabled = !isAvailable || !text.trim();

  const title = isDisabled
    ? "Speech synthesis is not supported in this browser"
    : isSpeaking
      ? "Stop speaking"
      : label ||
        (hasLangVoice
          ? `Speak: ${text}`
          : `Speak: ${text} (may use a fallback voice)`);

  const dim = size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={title}
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full leading-none transition-all",
        dim,
        "shadow-sm ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        isSpeaking
          ? "bg-teal-600 text-white ring-teal-700 shadow-md scale-105 animate-pulse"
          : "bg-teal-50 text-teal-900 ring-teal-300 hover:bg-teal-100 hover:ring-teal-400 hover:scale-105",
        isDisabled &&
          "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200 opacity-60 hover:scale-100 hover:bg-slate-100",
        className,
      )}
    >
      <span aria-hidden="true">{isSpeaking ? "🔊" : "🔈"}</span>
    </button>
  );
}
