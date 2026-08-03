import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SpeechButtonProps {
  text: string;
  languageCode: string;
  className?: string;
}

/**
 * SpeechButton island — Web Speech API TTS control.
 * Designed to read clearly next to Thai/English text (emoji + solid chip).
 */
export default function SpeechButton({
  text,
  languageCode,
  className,
}: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
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
      setHasVoice(match);
    };

    checkVoices();
    window.speechSynthesis.addEventListener("voiceschanged", checkVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", checkVoices);
      window.speechSynthesis.cancel();
    };
  }, [languageCode]);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || isSpeaking) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;

    const voices = window.speechSynthesis.getVoices();
    const exactMatch = voices.find((v) => v.lang === languageCode);
    const prefixMatch = voices.find((v) =>
      v.lang.startsWith(`${languageCode}-`),
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

  const handleClick = (e: { stopPropagation: () => void; preventDefault: () => void }) => {
    e.stopPropagation();
    e.preventDefault();
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
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={title}
      title={title}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-all",
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
