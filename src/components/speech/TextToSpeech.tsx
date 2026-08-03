import { useEffect, useState } from "react";

export interface TextToSpeechProps {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceName?: string;
  buttonLabel?: string;
  className?: string;
}

export const TextToSpeech = ({
  text,
  lang,
  rate = 1,
  pitch = 1,
  voiceName,
  buttonLabel = "🔊",
  className,
}: TextToSpeechProps) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang ?? "en-US";
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((voice) => voice.name === voiceName);
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

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
