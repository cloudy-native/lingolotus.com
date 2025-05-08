import { useState, useEffect, useRef } from "react";

// Voice mapping preferences for specific languages
const voiceMapping: { [key: string]: string } = {
  en: "Daniel",
};

interface UseSpeechSynthesisReturn {
  availableVoices: SpeechSynthesisVoice[];
  speaking: boolean;
  speak: (text: string, lang?: string, voiceName?: string, rate?: number, pitch?: number) => void;
  stop: () => void;
  findBestVoice: (langCode?: string, preferredName?: string) => SpeechSynthesisVoice | undefined;
}

/**
 * Custom hook for speech synthesis functionality
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
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
  const findBestVoice = (
    langCode?: string,
    preferredName?: string,
  ): SpeechSynthesisVoice | undefined => {
    if (!langCode) return undefined;
    
    const voicesForLang = availableVoices.filter((v) => v.lang.toLowerCase().includes(langCode.toLowerCase()));

    // Exact match for both lang and name
    if (preferredName) {
      const exact = voicesForLang.find((v) => v.name === preferredName);
      if (exact) return exact;
    }
    
    // Map language to voice name
    const mappedVoiceName = voiceMapping[langCode];
    if (mappedVoiceName) {
      const exact = voicesForLang.find((v) => v.name === mappedVoiceName);
      if (exact) return exact;
    }
    
    // Exact match for lang
    const exactLang = voicesForLang.find((v) => v.lang === langCode);
    if (exactLang) return exactLang;
    
    // Match prefix (e.g., "th" for "th-TH")
    const prefix = langCode.split("-")[0].toLowerCase();
    const prefixMatch = voicesForLang.find((v) =>
      v.lang.toLowerCase().startsWith(prefix + "-"),
    );
    if (prefixMatch) return prefixMatch;
    
    // No match
    return undefined;
  };

  const speak = (
    text: string, 
    lang?: string, 
    voiceName?: string, 
    rate: number = 1, 
    pitch: number = 1
  ) => {
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

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return {
    availableVoices,
    speaking,
    speak,
    stop,
    findBestVoice
  };
}

export default useSpeechSynthesis;
