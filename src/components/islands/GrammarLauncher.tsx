import { useState } from "react";
import GrammarCheatsheet, {
  GrammarOpenButton,
} from "@/components/islands/GrammarCheatsheet";
import { cn } from "@/lib/utils";

export interface GrammarLauncherProps {
  languageCode?: string;
  level?: string | null;
  /** Header-friendly compact control */
  variant?: "nav" | "default";
  className?: string;
}

/**
 * Site-wide grammar entry: open button + cheatsheet dialog.
 * Mount in PageLayout so Grammar is available on almost every page.
 */
export default function GrammarLauncher({
  languageCode = "th",
  level = null,
  variant = "nav",
  className,
}: GrammarLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GrammarOpenButton
        onClick={() => setOpen(true)}
        expanded={open}
        className={cn(
          variant === "nav" &&
            "!bg-rose-50 !px-3 !py-1.5 !text-xs !font-semibold !text-rose-900 !shadow-none ring-1 ring-rose-200 hover:!bg-rose-100 hover:!text-rose-950",
          className,
        )}
      />
      <GrammarCheatsheet
        open={open}
        onClose={() => setOpen(false)}
        languageCode={languageCode}
        level={level}
      />
    </>
  );
}
