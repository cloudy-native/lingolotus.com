import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle island — switches between  and light mode.
 *
 * Behavior:
 * - On first visit, defaults to OS preference (prefers-color-scheme)
 * - Toggles the "" class on document.documentElement
 * - Persists the user's choice in localStorage under key "theme"
 *
 * Hydrates with client:load in the layout.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "">("light");

  // On mount, read the current theme from the document (which was set by the
  // inline script in BaseLayout to prevent FOUC).
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("");
    setTheme(isDark ? "" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "" ? "light" : "";
    setTheme(next);
    document.documentElement.classList.toggle("", next === "");
    localStorage.setItem("theme", next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "" ? "Switch to light mode" : "Switch to  mode"}
      className={cn(
        "rounded-full text-slate-600 hover:text-slate-900",
      )}
    >
      {theme === "" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
