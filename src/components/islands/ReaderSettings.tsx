import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  applyThaiStyleToDocument,
  loadReaderSettings,
  patchReaderSettings,
  READER_SETTINGS_EVENT,
  type FontSize,
  type ReaderSettings,
  type ThaiStyle,
} from "@/lib/reader-settings";
import { cn } from "@/lib/utils";

export interface ReaderSettingsProps {
  /** Compact gear for the site header */
  variant?: "nav" | "default";
  className?: string;
  /** Show Parts of speech toggle (only useful when stories have breakdowns) */
  showPosOption?: boolean;
}

/**
 * Gear control + settings dialog for Thai display prefs.
 * State lives in localStorage and syncs across all mounts.
 */
export default function ReaderSettings({
  variant = "default",
  className,
  showPosOption = true,
}: ReaderSettingsProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(() =>
    loadReaderSettings(),
  );

  // Hydrate + listen for changes from other gear instances
  useEffect(() => {
    const current = loadReaderSettings();
    setSettings(current);
    applyThaiStyleToDocument(current.thaiStyle);

    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<ReaderSettings>).detail;
      if (detail) setSettings(detail);
      else setSettings(loadReaderSettings());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lingolotus.readerSettings" || e.key === "lingolotus.thaiStyle") {
        const s = loadReaderSettings();
        setSettings(s);
        applyThaiStyleToDocument(s.thaiStyle);
      }
    };
    window.addEventListener(READER_SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(READER_SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    const next = patchReaderSettings(patch);
    setSettings(next);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
            role="presentation"
          >
            <div
              className="absolute inset-0 bg-slate-900/40"
              aria-hidden="true"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2
                  id={titleId}
                  className="text-base font-bold text-slate-900"
                >
                  Reading settings
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close settings"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-5 px-4 py-4">
                {/* Thai style */}
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thai script style
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <StyleCard
                      active={settings.thaiStyle === "looped"}
                      onClick={() => update({ thaiStyle: "looped" })}
                      sampleStyle="looped"
                      title="Textbook"
                      subtitle="Looped · หัวกลม"
                    />
                    <StyleCard
                      active={settings.thaiStyle === "modern"}
                      onClick={() => update({ thaiStyle: "modern" })}
                      sampleStyle="modern"
                      title="Street"
                      subtitle="Loop-less · หัวตัด"
                    />
                  </div>
                </fieldset>

                {/* Text size */}
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Text size
                  </legend>
                  <div
                    className="inline-flex w-full items-end justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2"
                    role="group"
                    aria-label="Text size"
                  >
                    {(
                      [
                        { size: "sm" as const, box: "h-9 min-w-9 text-sm" },
                        { size: "base" as const, box: "h-11 min-w-11 text-lg" },
                        { size: "lg" as const, box: "h-12 min-w-12 text-2xl" },
                      ] as const
                    ).map(({ size, box }) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => update({ fontSize: size })}
                        aria-pressed={settings.fontSize === size}
                        className={cn(
                          "inline-flex flex-1 items-center justify-center rounded-lg font-thai font-semibold transition-colors",
                          box,
                          settings.fontSize === size
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                        )}
                      >
                        ก
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Toggles */}
                <fieldset className="space-y-3">
                  <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Display
                  </legend>
                  <ToggleRow
                    label="Phonetics"
                    description="Paiboon above each word (beginner stories)"
                    checked={settings.showPhonetics}
                    onChange={(v) => update({ showPhonetics: v })}
                  />
                  {showPosOption ? (
                    <ToggleRow
                      label="Parts of speech"
                      description="Color underlines by word type"
                      checked={settings.showPos}
                      onChange={(v) => update({ showPos: v })}
                    />
                  ) : null}
                </fieldset>
              </div>

              <div className="border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Reading settings"
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          variant === "nav"
            ? "h-8 w-8 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
            : "h-9 w-9 bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900",
          className,
        )}
      >
        <span className="sr-only">Reading settings</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>
      {dialog}
    </>
  );
}

function StyleCard({
  active,
  onClick,
  sampleStyle,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  sampleStyle: ThaiStyle;
  title: string;
  subtitle: string;
}) {
  // Inline family so samples always show the right face, even if global CSS lags
  const family =
    sampleStyle === "modern"
      ? '"Prompt", "Noto Sans Thai", sans-serif'
      : '"Sarabun", "Noto Sans Thai", sans-serif';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-thai-style={sampleStyle}
      className={cn(
        "rounded-xl border px-3 py-3 text-left transition-colors",
        active
          ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span
        className="block text-2xl font-semibold text-slate-900"
        style={{ fontFamily: family }}
        lang="th"
      >
        สวัสดี
      </span>
      <span className="mt-1 block text-sm font-bold text-slate-900">
        {title}
      </span>
      <span className="block text-xs text-slate-500">{subtitle}</span>
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-teal-500" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

/** Hook for consumers that need live settings without rendering the gear */
export function useReaderSettings(): ReaderSettings {
  const [settings, setSettings] = useState<ReaderSettings>(() =>
    loadReaderSettings(),
  );

  useEffect(() => {
    const current = loadReaderSettings();
    setSettings(current);
    applyThaiStyleToDocument(current.thaiStyle);

    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<ReaderSettings>).detail;
      setSettings(detail ?? loadReaderSettings());
    };
    window.addEventListener(READER_SETTINGS_EVENT, onSync);
    return () => window.removeEventListener(READER_SETTINGS_EVENT, onSync);
  }, []);

  return settings;
}
