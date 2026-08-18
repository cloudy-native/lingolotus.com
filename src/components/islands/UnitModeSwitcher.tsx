import { DIR_ICONS } from "@/lib/content-icons";
import { getUnitPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface UnitModeSwitcherProps {
    unitId: string;
    unitTitle?: string | null;
    /** Which half of the unit is open */
    active: "cards" | "reading";
    cardsHref: string | null;
    storyHref: string | null;
    /** Optional short labels under each mode */
    cardsLabel?: string | null;
    storyLabel?: string | null;
    className?: string;
}

/**
 * Sticky unit chrome: Cards ↔ Story switch so the paired half is obvious.
 * Reading tools live in the site header only (avoid duplicate chrome).
 */
export default function UnitModeSwitcher({
    unitId,
    unitTitle,
    active,
    cardsHref,
    storyHref,
    cardsLabel,
    storyLabel,
    className,
}: UnitModeSwitcherProps) {
    // Mode switcher only when both halves exist
    if (!cardsHref || !storyHref) return null;

    const title = unitTitle?.trim() || "Unit";

    return (
        <div
            className={cn(
                // Below site header (sticky top-0); keep above page content
                "sticky top-16 z-40 sm:top-14",
                className,
            )}
        >
            <nav
                aria-label="Unit practice mode"
                className="overflow-hidden rounded-2xl border border-orange-200 bg-paper shadow-md shadow-orange-950/5"
            >
                {/* Unit context + dual mode — compact single block */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 bg-orange-50/60 px-3 py-1.5 sm:px-4">
                    <a
                        href={getUnitPath(unitId)}
                        className="min-w-0 truncate text-sm font-semibold text-stone-800 transition-colors hover:text-orange-900"
                        title={title}
                    >
                        {title}
                    </a>
                    <p className="text-[11px] font-medium text-stone-500 sm:text-xs">
                        Cards + story
                    </p>
                </div>

                <div
                    className="grid grid-cols-2 gap-1.5 p-1.5 sm:gap-2 sm:p-2"
                    role="tablist"
                    aria-label="Cards or story"
                >
                    <ModePanel
                        href={cardsHref}
                        active={active === "cards"}
                        icon={DIR_ICONS.cards}
                        title="Cards"
                        subtitle={
                            cardsLabel?.trim() ||
                            (active === "cards"
                                ? "You’re practicing here"
                                : "Practice the words")
                        }
                        hint={active === "reading" ? "Switch back" : undefined}
                        accent="cards"
                    />
                    <ModePanel
                        href={storyHref}
                        active={active === "reading"}
                        icon={DIR_ICONS.story}
                        title="Story"
                        subtitle={
                            storyLabel?.trim() ||
                            (active === "reading"
                                ? "You’re reading here"
                                : "Same words in sentences")
                        }
                        hint={active === "cards" ? "Read next →" : undefined}
                        accent="story"
                    />
                </div>
            </nav>
        </div>
    );
}

function ModePanel({
    href,
    active,
    icon,
    title,
    subtitle,
    hint,
    accent,
}: {
    href: string;
    active: boolean;
    icon: string;
    title: string;
    subtitle: string;
    /** Call-to-action chip when this half is the other option */
    hint?: string;
    accent: "cards" | "story";
}) {
    const isCards = accent === "cards";

    const className = cn(
        "relative flex min-h-[3.25rem] flex-col items-start justify-center gap-0.5 rounded-xl px-2.5 py-2 text-left transition sm:min-h-[3.75rem] sm:px-3 sm:py-2.5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        active &&
            isCards &&
            "bg-orange-800 text-white shadow-sm focus-visible:ring-orange-500",
        active &&
            !isCards &&
            "bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500",
        !active &&
            isCards &&
            "border border-dashed border-orange-300 bg-orange-50/80 text-orange-950 hover:border-orange-500 hover:bg-orange-100 focus-visible:ring-orange-500",
        !active &&
            !isCards &&
            "border border-dashed border-rose-400 bg-rose-50 text-rose-950 hover:border-rose-600 hover:bg-rose-100 focus-visible:ring-rose-500",
    );

    const body = (
        <>
            <span className="flex w-full items-center gap-1.5">
                <span className="text-lg sm:text-xl" aria-hidden="true">
                    {icon}
                </span>
                <span className="text-sm font-bold tracking-tight sm:text-base">
                    {title}
                </span>
                {active ? (
                    <span
                        className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            isCards
                                ? "bg-orange-800/80 text-white"
                                : "bg-rose-600/80 text-white",
                        )}
                    >
                        Here
                    </span>
                ) : hint ? (
                    <span
                        className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            isCards
                                ? "bg-orange-800 text-white"
                                : "bg-rose-600 text-white",
                        )}
                    >
                        {hint}
                    </span>
                ) : null}
            </span>
            <span
                className={cn(
                    "line-clamp-1 pl-7 text-[11px] font-medium leading-snug sm:pl-8 sm:text-xs",
                    active
                        ? "text-white/90"
                        : isCards
                          ? "text-orange-900/90"
                          : "text-rose-900/90",
                )}
            >
                {subtitle}
            </span>
        </>
    );

    if (active) {
        return (
            <span
                className={className}
                role="tab"
                tabIndex={0}
                aria-selected="true"
                aria-current="page"
            >
                {body}
            </span>
        );
    }

    return (
        <a
            href={href}
            className={className}
            role="tab"
            aria-selected="false"
            aria-label={`${title}: ${subtitle}`}
        >
            {body}
        </a>
    );
}
