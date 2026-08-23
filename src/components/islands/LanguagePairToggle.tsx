import { getLangInfo } from "@/lib/languages";
import { cn } from "@/lib/utils";

export type LanguageSide = "target" | "source";

interface LanguagePairToggleProps {
    sourceCode: string;
    targetCode?: string;
    value: LanguageSide;
    onChange: (side: LanguageSide) => void;
    ariaLabel?: string;
}

function LangButton({
    code,
    pressed,
    selectedClass,
    onClick,
}: {
    code: string;
    pressed: boolean;
    selectedClass: string;
    onClick: () => void;
}) {
    const lang = getLangInfo(code);
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pressed
                    ? selectedClass
                    : "border border-stone-200 bg-paper text-stone-700 hover:bg-stone-50",
            )}
            aria-pressed={pressed}
            aria-label={lang.native}
        >
            <span aria-hidden="true">{lang.flag}</span>
            {lang.native}
        </button>
    );
}

export default function LanguagePairToggle({
    sourceCode,
    targetCode = "en",
    value,
    onChange,
    ariaLabel = "Language",
}: LanguagePairToggleProps) {
    return (
        <div className="flex gap-2" role="group" aria-label={ariaLabel}>
            <LangButton
                code={sourceCode}
                pressed={value === "source"}
                selectedClass="bg-orange-800 text-white"
                onClick={() => onChange("source")}
            />
            <LangButton
                code={targetCode}
                pressed={value === "target"}
                selectedClass="bg-stone-800 text-white"
                onClick={() => onChange("target")}
            />
        </div>
    );
}
