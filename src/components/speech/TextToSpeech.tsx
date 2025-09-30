import React from "react";
import useSpeechSynthesis from "../../hooks/useSpeechSynthesis";

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
    const { speaking, speak, stop } = useSpeechSynthesis();

    const handleSpeak = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!text) return;

        if (speaking) {
            stop();
            return;
        }

        speak(text, lang, voiceName, rate, pitch);
    };

    return (
        <button
            type="button"
            onClick={handleSpeak}
            disabled={!text}
            aria-label={speaking ? "Stop speaking" : `Speak: ${text}`}
        >
            {speaking ? "⏹️" : buttonLabel}
        </button>
    );
};

export default TextToSpeech;
