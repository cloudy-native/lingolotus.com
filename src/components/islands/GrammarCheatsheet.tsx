import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpeechButton from "@/components/islands/SpeechButton";
import {
  CLASSIFIERS,
  CONSONANT_CLASSES,
  defaultSectionForLevel,
  GRAMMAR_SECTIONS,
  NEGATION_TIME,
  PARTICLES,
  QUICK_FACTS,
  TONE_MARKS,
  TONE_PAIRS,
  TONE_RULE_ROWS,
  type GrammarSectionId,
  type SpeakExample,
} from "@/lib/grammar-data";
import { cn } from "@/lib/utils";

export interface GrammarCheatsheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional full reference markdown (consonants/vowels tables) */
  referenceMarkdown?: string | null;
  /** Learner level → default tab */
  level?: string | null;
  languageCode?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1 &&
      !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
  );
}

function ExampleRow({
  ex,
  languageCode,
}: {
  ex: SpeakExample;
  languageCode: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
      <SpeechButton text={ex.thai} languageCode={languageCode} />
      <div className="min-w-0 flex-1">
        <p className="font-thai text-lg font-semibold text-slate-900">
          {ex.thai}
        </p>
        <p className="text-xs text-slate-500">
          {ex.phonetic}
          {ex.en ? ` · ${ex.en}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function GrammarCheatsheet({
  open,
  onClose,
  referenceMarkdown = null,
  level = null,
  languageCode = "th",
}: GrammarCheatsheetProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [section, setSection] = useState<GrammarSectionId>(() =>
    defaultSectionForLevel(level),
  );
  const [showFullConsonants, setShowFullConsonants] = useState(false);
  const [showFullVowels, setShowFullVowels] = useState(false);
  const [mdReady, setMdReady] = useState(false);

  // Reset default section when opening with a level
  useEffect(() => {
    if (open) {
      setSection(defaultSectionForLevel(level));
    }
  }, [open, level]);

  // Focus trap, Escape, scroll lock, initial focus, return focus on close
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;

      const focusables = getFocusableElements(root);
      if (focusables.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? root.contains(active) : false;

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevBodyPad = document.body.style.paddingRight;
    // Avoid layout shift + nested page scrollbars
    const scrollbarGap = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    document.addEventListener("keydown", onKeyDown, true);

    // Focus close control after paint (dialog is mounted)
    const focusTimer = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusTimer);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.style.paddingRight = prevBodyPad;
      document.removeEventListener("keydown", onKeyDown, true);

      const prev = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      // Restore focus to opener (Grammar button) when possible
      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [open, onClose]);

  // Lazy: only mount heavy markdown after first open of ref sections
  useEffect(() => {
    if (
      open &&
      (section === "consonants" || section === "vowels" || showFullConsonants)
    ) {
      setMdReady(true);
    }
  }, [open, section, showFullConsonants]);

  const scrollTo = useCallback((id: GrammarSectionId) => {
    setSection(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`grammar-sec-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const referenceBlock = useMemo(() => {
    if (!referenceMarkdown || !mdReady) return null;
    return (
      <div
        className={cn(
          "prose prose-slate max-w-none prose-sm",
          "prose-th:bg-slate-50 prose-th:text-left prose-th:text-xs prose-th:font-semibold",
          "prose-td:text-sm prose-td:align-top",
          // Horizontal scroll only on tables — no nested vertical scrollport
          "[&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto",
          "[&_td:first-child]:font-thai [&_td:first-child]:text-lg [&_td:first-child]:font-semibold",
          "[&_th]:whitespace-nowrap",
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {referenceMarkdown}
        </ReactMarkdown>
      </div>
    );
  }, [referenceMarkdown, mdReady]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden overscroll-none"
      role="presentation"
    >
      {/* Backdrop: click to close, not in tab order (dialog holds focus) */}
      <div
        className="absolute inset-0 bg-slate-900/45"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex h-full max-h-[100dvh] w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:max-w-2xl"
      >
        {/* Fixed chrome — not inside the scroll pane */}
        <div className="shrink-0 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div>
              <h2
                id={titleId}
                className="text-lg font-bold text-slate-900"
              >
                📖 Thai grammar
              </h2>
              <p id={descId} className="text-xs text-slate-500">
                Cheatsheet · Paiboon-like · tap 🔈 to hear. Press Escape to
                close.
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Close grammar cheatsheet"
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

          {/* Section chips */}
          <nav
            className="flex gap-1.5 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:px-5"
            aria-label="Grammar sections"
          >
            {GRAMMAR_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                aria-current={section === s.id ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
                  section === s.id
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Single vertical scroll region */}
        <div className="min-h-0 flex-1 space-y-10 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          {/* QUICK */}
          <section id="grammar-sec-quick" className="scroll-mt-28">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              Quick sheet
            </h3>
            <ul className="mb-4 space-y-2 text-sm text-slate-700">
              {QUICK_FACTS.map((f) => (
                <li
                  key={f}
                  className="flex gap-2 rounded-lg bg-teal-50/80 px-3 py-2 ring-1 ring-teal-100"
                >
                  <span aria-hidden="true">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hear tone pairs
            </p>
            <div className="space-y-2">
              {TONE_PAIRS.slice(0, 2).map((pair) => (
                <div
                  key={pair.a.thai + pair.b.thai}
                  className="grid grid-cols-2 gap-2"
                >
                  <ExampleRow ex={pair.a} languageCode={languageCode} />
                  <ExampleRow ex={pair.b} languageCode={languageCode} />
                </div>
              ))}
            </div>
          </section>

          {/* TONES */}
          <section id="grammar-sec-tones" className="scroll-mt-28">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              Tone marks
            </h3>
            <p className="mb-3 text-sm text-slate-600">
              Four written marks sit above consonants. Actual pitch also depends
              on consonant class and live/dead syllables.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Mark</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Tone (typical)</th>
                    <th className="px-3 py-2">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {TONE_MARKS.map((row) => (
                    <tr
                      key={row.name}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2.5 font-thai text-2xl font-semibold text-slate-900">
                        {row.symbol}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{row.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.tone}</td>
                      <td className="px-3 py-2.5">
                        <ExampleRow
                          ex={row.example}
                          languageCode={languageCode}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Minimal pairs
              </p>
              {TONE_PAIRS.map((pair) => (
                <div key={pair.note}>
                  <p className="mb-1 text-xs text-slate-500">{pair.note}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <ExampleRow ex={pair.a} languageCode={languageCode} />
                    <ExampleRow ex={pair.b} languageCode={languageCode} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PARTICLES */}
          <section id="grammar-sec-particles" className="scroll-mt-28">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              Particles & politeness
            </h3>
            <div className="space-y-2">
              {PARTICLES.map((p) => (
                <div
                  key={p.thai}
                  className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                >
                  <SpeechButton text={p.thai} languageCode={languageCode} />
                  <div>
                    <p className="font-thai text-xl font-bold text-slate-900">
                      {p.thai}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        {p.phonetic}
                      </span>
                    </p>
                    <p className="text-sm text-slate-700">{p.en}</p>
                    <p className="text-xs text-slate-500">{p.tip}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Negation & time
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {NEGATION_TIME.map((item) => (
                  <ExampleRow
                    key={item.thai}
                    ex={{
                      thai: item.thai,
                      phonetic: item.phonetic,
                      en: item.en,
                    }}
                    languageCode={languageCode}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* CLASSIFIERS */}
          <section id="grammar-sec-classifiers" className="scroll-mt-28">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              Classifiers
            </h3>
            <p className="mb-3 text-sm text-slate-600">
              When counting:{" "}
              <strong className="font-thai">หมา สอง ตัว</strong> — noun + number
              + classifier.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Classifier</th>
                    <th className="px-3 py-2">Used for</th>
                    <th className="px-3 py-2">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSIFIERS.map((c) => (
                    <tr key={c.thai} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <SpeechButton
                            text={c.thai}
                            languageCode={languageCode}
                          />
                          <div>
                            <span className="font-thai text-xl font-bold">
                              {c.thai}
                            </span>
                            <span className="ml-1 text-xs text-slate-500">
                              {c.phonetic}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{c.usedFor}</td>
                      <td className="px-3 py-2">
                        <ExampleRow
                          ex={c.example}
                          languageCode={languageCode}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TONE RULES */}
          <section id="grammar-sec-tone-rules" className="scroll-mt-28">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              Tone rules (teaching sketch)
            </h3>
            <p className="mb-3 text-sm text-slate-600">
              Simplified for learners: consonant class + tone mark. Live/dead
              syllables and vowel length also matter — use ears + this map.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[20rem] text-center text-sm">
                <thead className="bg-violet-50 text-xs font-semibold text-violet-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Class</th>
                    <th className="px-3 py-2">No mark</th>
                    <th className="px-3 py-2">่ mai ek</th>
                    <th className="px-3 py-2">้ mai tho</th>
                  </tr>
                </thead>
                <tbody>
                  {TONE_RULE_ROWS.map((row) => (
                    <tr key={row.className} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 text-left font-semibold text-slate-800">
                        {row.className}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-900 ring-1 ring-emerald-100">
                          {row.noMark}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-900 ring-1 ring-sky-100">
                          {row.maiEk}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-900 ring-1 ring-amber-100">
                          {row.maiTho}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              *Defaults shift with live/dead syllables. Mai tri ๊ / chattawa ๋
              mainly on mid-class forms in everyday words.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {CONSONANT_CLASSES.map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-bold text-slate-900">
                    {c.name}{" "}
                    <span className="font-normal text-slate-500">
                      ({c.count})
                    </span>
                  </p>
                  <p className="mt-1 font-thai text-base text-slate-800">
                    {c.examples}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{c.tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CONSONANTS full */}
          <section id="grammar-sec-consonants" className="scroll-mt-28">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Full consonant list
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowFullConsonants((v) => !v);
                  setMdReady(true);
                }}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                {showFullConsonants ? "Hide" : "Show"} table
              </button>
            </div>
            <p className="mb-2 text-sm text-slate-600">
              ฃ and ฅ are obsolete — ignore for modern reading.
            </p>
            {showFullConsonants && referenceBlock}
            {!showFullConsonants && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-100">
                Collapsed by default so the cheatsheet stays scannable.
              </p>
            )}
          </section>

          {/* VOWELS full */}
          <section id="grammar-sec-vowels" className="scroll-mt-28">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Full vowel list
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowFullVowels((v) => !v);
                  setMdReady(true);
                  setSection("vowels");
                }}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                {showFullVowels ? "Hide" : "Show"} table
              </button>
            </div>
            {showFullVowels && referenceBlock}
            {!showFullVowels && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-100">
                Open when you need vowel positions and length pairs.
              </p>
            )}
          </section>

          <p className="pb-8 text-center text-xs text-slate-400">
            Lingo Lotus · free grammar helper · same device as your progress
          </p>
        </div>
      </div>
    </div>
  );
}

/** Shared open button styling */
export function GrammarOpenButton({
  onClick,
  className,
  expanded = false,
}: {
  onClick: () => void;
  className?: string;
  /** Reflect dialog open state for assistive tech */
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      <span aria-hidden="true">📖</span>
      Grammar
    </button>
  );
}
