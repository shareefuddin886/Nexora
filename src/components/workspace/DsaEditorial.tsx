import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  HelpCircle,
  Info,
  MessageSquareQuote,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RichText } from "@/components/tracks/TrackUi";
import type { Approach, DsaProblem } from "@/lib/dsa-problems";

const LANGS: { id: keyof Approach["code"]; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

const APPROACH_TONE: Record<Approach["name"], string> = {
  "Brute Force": "text-rose-300 border-rose-500/30 bg-rose-500/10",
  Better: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  Optimal: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
};

function SubHeading({ children }: { children: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h4>
  );
}

/** Brute force → better → optimal, each with intuition, steps, dry run, code and complexity. */
export function ProblemEditorial({ problem }: { problem: DsaProblem }) {
  const [active, setActive] = useState(problem.approaches.length - 1);
  const [lang, setLang] = useState<keyof Approach["code"]>("javascript");
  const a = problem.approaches[active];

  return (
    <div className="space-y-6 text-sm leading-7 text-foreground/90">
      {/* Overview of all approaches */}
      <div>
        <SubHeading>Approaches at a glance</SubHeading>
        <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-xs">
            <thead className="bg-surface/60 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Approach</th>
                <th className="px-3 py-2 font-medium">Idea</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Space</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {problem.approaches.map((ap, i) => (
                <tr
                  key={ap.name}
                  onClick={() => setActive(i)}
                  className={`cursor-pointer transition hover:bg-surface/50 ${i === active ? "bg-surface/40" : ""}`}
                >
                  <td className="px-3 py-2 font-medium text-foreground">{ap.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <RichText text={ap.summary} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono">{ap.time}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono">{ap.space}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approach tabs */}
      <div className="flex flex-wrap gap-2">
        {problem.approaches.map((ap, i) => (
          <button
            key={ap.name}
            onClick={() => setActive(i)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition ${
              i === active
                ? APPROACH_TONE[ap.name]
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {ap.name}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">{a.name}</h3>
          <p className="mt-1 text-muted-foreground">
            <RichText text={a.summary} />
          </p>
        </div>

        <div className="space-y-2">
          <SubHeading>Intuition</SubHeading>
          {a.intuition.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <SubHeading>Algorithm</SubHeading>
          <ol className="space-y-1.5">
            {a.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-foreground">
                  {i + 1}
                </span>
                <span>
                  <RichText text={s} />
                </span>
              </li>
            ))}
          </ol>
        </div>

        {a.dryRun && (
          <div className="space-y-2">
            <SubHeading>Dry run</SubHeading>
            <p className="font-mono text-xs text-muted-foreground">{a.dryRun.title}</p>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-xs">
                <thead className="bg-surface/60 text-left text-muted-foreground">
                  <tr>
                    {a.dryRun.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {a.dryRun.rows.map((row, i) => (
                    <tr key={i} className="odd:bg-surface/20">
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-1.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs">
              <span className="font-semibold text-emerald-300">Result: </span>
              <span className="font-mono">{a.dryRun.result}</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <SubHeading>Code</SubHeading>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-[#0b0f19]">
            <div className="flex items-center justify-between border-b border-border/60 bg-surface/50 px-2 py-1">
              <div className="flex flex-wrap gap-1">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs transition ${
                      lang === l.id
                        ? "bg-surface-2 font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(a.code[lang]);
                  toast.success("Code copied");
                }}
                aria-label="Copy code"
                title="Copy code"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-[#d6deeb]">
              <code>{a.code[lang]}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-2">
          <SubHeading>Complexity</SubHeading>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2">
            <div className="bg-surface px-4 py-2.5">
              <span className="text-muted-foreground">Time </span>
              <span className="font-mono font-semibold text-foreground">{a.time}</span>
            </div>
            <div className="bg-surface px-4 py-2.5">
              <span className="text-muted-foreground">Space </span>
              <span className="font-mono font-semibold text-foreground">{a.space}</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            <RichText text={a.complexityNote} />
          </p>
        </div>
      </div>
    </div>
  );
}

/** Extra sections under the problem statement: judge note, "Now your turn", doubts and follow-ups. */
export function ProblemExtras({ problem }: { problem: DsaProblem }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [openDoubt, setOpenDoubt] = useState<number | null>(null);
  const { check } = problem;

  return (
    <div className="space-y-5">
      {problem.judgeNote && (
        <p className="flex gap-2 rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-xs leading-5 text-sky-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <RichText text={problem.judgeNote} />
          </span>
        </p>
      )}

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Now your turn
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Predict the output before you write any code.
        </p>
        <p className="mt-3 font-mono text-[13px] text-foreground">{check.prompt}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {check.options.map((opt, i) => {
            const chosen = picked === i;
            const correct = i === check.correctIndex;
            const state =
              picked === null
                ? "border-border/60 hover:border-primary/60"
                : correct
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : chosen
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-200"
                    : "border-border/40 opacity-60";
            return (
              <button
                key={opt}
                onClick={() => picked === null && setPicked(i)}
                disabled={picked !== null}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left font-mono text-xs transition ${state}`}
              >
                {opt}
                {picked !== null && correct && <CheckCircle2 className="h-3.5 w-3.5" />}
                {picked !== null && chosen && !correct && <XCircle className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-3 flex items-start justify-between gap-3 text-xs leading-5 text-muted-foreground">
            <p>
              <span
                className={`font-semibold ${picked === check.correctIndex ? "text-emerald-300" : "text-rose-300"}`}
              >
                {picked === check.correctIndex ? "Correct. " : "Not quite. "}
              </span>
              {check.explanation}
            </p>
            <button
              onClick={() => setPicked(null)}
              className="shrink-0 cursor-pointer text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {problem.doubts.length > 0 && (
        <div>
          <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <HelpCircle className="h-4 w-4 text-primary" /> Frequently asked doubts
          </p>
          <div className="mt-2 divide-y divide-border/50 rounded-lg border border-border/60">
            {problem.doubts.map((d, i) => {
              const open = openDoubt === i;
              return (
                <div key={d.q}>
                  <button
                    onClick={() => setOpenDoubt(open ? null : i)}
                    className="flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-2.5 text-left text-sm text-foreground"
                  >
                    {d.q}
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <p className="px-4 pb-3 text-sm text-muted-foreground">
                      <RichText text={d.a} />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {problem.followUps.length > 0 && (
        <div>
          <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <MessageSquareQuote className="h-4 w-4 text-primary" /> Interview follow-ups
          </p>
          <ul className="mt-2 space-y-1.5">
            {problem.followUps.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>
                  <RichText text={f} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
