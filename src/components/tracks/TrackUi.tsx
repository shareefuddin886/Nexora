import { Fragment, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  MessageSquareQuote,
  type LucideIcon,
} from "lucide-react";
import { SectionLabel } from "@/components/dsa/DsaUi";
import type { Lesson, LessonSection } from "@/lib/tracks/types";

/** Renders `code` and **bold** inside lesson text. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code
              key={i}
              className="rounded-md border border-border/60 bg-surface-2/70 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Text split into paragraphs (by array items or line breaks), with inline formatting. */
export function Paragraphs({ text }: { text: string | string[] }) {
  const parts = Array.isArray(text) ? text : text.split(/\n+/);
  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <p key={i}>
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}

const LANGUAGE_LABEL: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "React (TSX)",
  http: "HTTP",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  dockerfile: "Dockerfile",
  sql: "SQL",
  python: "Python",
  bash: "Shell",
  yaml: "YAML",
};

export function CodeBlock({
  language,
  code,
  caption,
}: {
  language: string;
  code: string;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border/70 bg-[#0b0f19]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
        <span>{caption ?? ""}</span>
        <span className="font-mono">{LANGUAGE_LABEL[language] ?? language}</span>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-emerald-200">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

const CALLOUT: Record<
  NonNullable<LessonSection["callout"]>["kind"],
  { icon: LucideIcon; label: string; cls: string }
> = {
  tip: { icon: Lightbulb, label: "Tip", cls: "border-sky-500/30 bg-sky-500/5 text-sky-300" },
  warning: {
    icon: AlertTriangle,
    label: "Watch out",
    cls: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  },
  interview: {
    icon: MessageSquareQuote,
    label: "Interview note",
    cls: "border-violet-500/30 bg-violet-500/5 text-violet-300",
  },
};

export function LessonArticle({ lesson, footer }: { lesson: Lesson; footer?: ReactNode }) {
  return (
    <article className="space-y-9">
      <p className="rounded-2xl border-l-2 border-primary bg-surface/60 px-5 py-4 text-sm leading-relaxed text-foreground/90 md:text-base">
        <RichText text={lesson.summary} />
      </p>

      <div className="rounded-2xl border border-border/60 bg-surface/30 p-5">
        <SectionLabel>By the end of this lesson you can</SectionLabel>
        <ul className="mt-3 space-y-2">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex gap-2.5 text-sm text-foreground/90">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {o}
            </li>
          ))}
        </ul>
      </div>

      {lesson.sections.map((sec, idx) => {
        const callout = sec.callout ? CALLOUT[sec.callout.kind] : null;
        return (
          <section key={idx} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">
              <span className="mr-2 font-mono text-sm text-primary/80">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <RichText text={sec.heading} />
            </h2>
            {sec.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-7 text-muted-foreground md:text-[15px]">
                <RichText text={p} />
              </p>
            ))}
            {sec.bullets && (
              <ul className="space-y-2 pl-1">
                {sec.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2.5 text-sm leading-6 text-muted-foreground md:text-[15px]"
                  >
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <RichText text={b} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {sec.code && <CodeBlock {...sec.code} />}
            {sec.callout && callout && (
              <div
                className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${callout.cls}`}
              >
                <callout.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-foreground/90">
                  <span className="font-semibold">{callout.label}: </span>
                  <RichText text={sec.callout.text} />
                </p>
              </div>
            )}
          </section>
        );
      })}

      <div className="rounded-2xl border border-border/60 bg-surface/40 p-5">
        <SectionLabel>Key takeaways</SectionLabel>
        <ul className="mt-3 space-y-2">
          {lesson.keyTakeaways.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm text-foreground/90">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <RichText text={t} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {footer}
    </article>
  );
}

export function InterviewPrep({ items }: { items: Lesson["interview"] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Questions interviewers commonly ask on this topic. Try answering out loud before opening the
        model answer.
      </p>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-xl border border-border/70 bg-surface/40"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <p className="border-t border-border/60 px-4 py-3.5 pl-[3.25rem] text-sm leading-7 text-muted-foreground">
                <RichText text={item.a} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
