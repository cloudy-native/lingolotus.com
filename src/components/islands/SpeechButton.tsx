import {
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface SpeechButtonProps {
    text: string;
    languageCode: string;
    className?: string;
    /** Compact control for dense tables */
    size?: "md" | "sm";
    /** Optional label override for accessibility */
    label?: string;
    /** When set, replaces the default speaker glyph (e.g. a labeled Listen chip). */
    children?: ReactNode;
    /** Kept for call sites; warm paper is the only tone. */
    tone?: "default" | "warm";
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
    children,
    tone: _tone = "default",
}: SpeechButtonProps) {
    void _tone;
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
            window.speechSynthesis.removeEventListener(
                "voiceschanged",
                checkVoices,
            );
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
    const labeled = children != null;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            aria-label={title}
            title={title}
            className={cn(
                "inline-flex shrink-0 items-center justify-center leading-none transition-all",
                labeled
                    ? "gap-1.5 rounded-full px-3 py-2 text-sm font-semibold"
                    : `rounded-full ${dim}`,
                "shadow-sm ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                isSpeaking
                    ? "bg-orange-800 text-white ring-orange-900 shadow-md"
                    : "bg-orange-50 text-orange-950 ring-orange-200 hover:bg-orange-100 hover:ring-orange-300 hover:scale-105",
                isDisabled &&
                    "cursor-not-allowed bg-stone-100 text-stone-400 ring-stone-200 opacity-60 hover:scale-100 hover:bg-stone-100",
                className,
            )}
        >
            {labeled ? (
                children
            ) : (
                <span aria-hidden="true">{isSpeaking ? "🔊" : "🔈"}</span>
            )}
        </button>
    );
}
