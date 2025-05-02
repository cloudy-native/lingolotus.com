import React, { useState, useEffect, useRef } from "react";

export interface TextToSpeechProps {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceName?: string;
  buttonLabel?: string;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  lang,
  rate = 1,
  pitch = 1,
  voiceName,
  buttonLabel = "🔊",
  className,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load voices asynchronously
    const handleVoicesChanged = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  useEffect(() => {
    // Stop speech if component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Find the best voice for a given language code
  function findBestVoice(langCode?: string, preferredName?: string): SpeechSynthesisVoice | undefined {
    if (!langCode) return undefined;
    // 1. Exact match for both lang and name
    if (preferredName) {
      const exact = availableVoices.find(v => v.lang === langCode && v.name === preferredName);
      if (exact) return exact;
    }
    // 2. Exact match for lang
    const exactLang = availableVoices.find(v => v.lang === langCode);
    if (exactLang) return exactLang;
    // 3. Match prefix (e.g., "th" for "th-TH")
    const prefix = langCode.split('-')[0].toLowerCase();
    const prefixMatch = availableVoices.find(v => v.lang.toLowerCase().startsWith(prefix + '-'));
    if (prefixMatch) return prefixMatch;
    // 4. No match
    return undefined;
  }

  const handleSpeak = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!text) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang || "en-US";
    utterance.rate = rate;
    utterance.pitch = pitch;
    // Always try to find the best voice
    const bestVoice = findBestVoice(lang, voiceName);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!text}
      aria-label={speaking ? "Stop speaking" : `Speak: ${text}`}
      className={className}
    >
      {speaking ? "⏹️" : buttonLabel}
    </button>
  );
};

export default TextToSpeech;
