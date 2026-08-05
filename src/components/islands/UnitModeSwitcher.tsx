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
  className?: string;
}

/**
 * Sticky unit chrome: jump between Cards and Story without returning to the hub.
 * Sits under the site header while studying or reading.
 */
export default function UnitModeSwitcher({
  unitId,
  unitTitle,
  active,
  cardsHref,
  storyHref,
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
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-md shadow-slate-900/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/90"
      >
        <a
          href={getUnitPath(unitId)}
          className="min-w-0 max-w-[40%] truncate rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-teal-800 sm:max-w-[50%] sm:text-sm"
          title={title}
        >
          <span aria-hidden="true" className="mr-1">
            🗺️
          </span>
          {title}
        </a>

        <div
          className="ml-auto flex shrink-0 rounded-xl bg-slate-100 p-0.5"
          role="tablist"
          aria-label="Cards or story"
        >
          <ModeTab
            href={cardsHref}
            active={active === "cards"}
            icon={DIR_ICONS.cards}
            label="Cards"
          />
          <ModeTab
            href={storyHref}
            active={active === "reading"}
            icon={DIR_ICONS.story}
            label="Story"
          />
        </div>
      </nav>
    </div>
  );
}

function ModeTab({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
    active
      ? "bg-white text-teal-900 shadow-sm ring-1 ring-slate-200/80"
      : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
  );

  if (active) {
    return (
      <span
        className={className}
        role="tab"
        aria-selected="true"
        aria-current="page"
      >
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
    );
  }

  return (
    <a href={href} className={className} role="tab" aria-selected="false">
      <span aria-hidden="true">{icon}</span>
      {label}
    </a>
  );
}
