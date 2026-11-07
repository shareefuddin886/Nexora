import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Eye,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Terminal,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/CodeEditor";
import { DifficultyBadge } from "@/components/dsa/DsaUi";
import { RichText } from "@/components/tracks/TrackUi";
import {
  RUNNABLE_LANGUAGES,
  isPythonLoaded,
  runTests,
  warmUpPython,
  type CodeExecutionResult,
  type RunnableLanguage,
} from "@/lib/code-runner";
import type { PracticeExercise } from "@/lib/tracks/types";

const STATUS_LABEL: Record<CodeExecutionResult["status"], string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong answer",
  compile_error: "Compile error",
  runtime_error: "Runtime error",
  time_limit_exceeded: "Time limit exceeded",
};

const draftKey = (id: string, lang: RunnableLanguage) => `nexora_practice_draft:${id}:${lang}`;

function readDraft(id: string, lang: RunnableLanguage) {
  try {
    return localStorage.getItem(draftKey(id, lang));
  } catch {
    return null;
  }
}

export function PracticeWorkspace({
  exercise,
  draftId,
  solved,
  onSolved,
}: {
  exercise: PracticeExercise;
  /** Unique id used to keep the learner's draft between visits. */
  draftId: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const languages = RUNNABLE_LANGUAGES.filter((l) => exercise.languages.includes(l.id));
  const [language, setLanguage] = useState<RunnableLanguage>(exercise.languages[0]);
  const starter = (lang: RunnableLanguage) => exercise.starter[lang] ?? "";
  const [code, setCode] = useState(() => starter(exercise.languages[0]));
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempted, setAttempted] = useState(solved);

  // Restore the saved draft after mount (localStorage is browser-only).
  useEffect(() => {
    const saved = readDraft(draftId, exercise.languages[0]);
    if (saved) setCode(saved);
  }, [draftId, exercise.languages]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (code !== starter(language)) localStorage.setItem(draftKey(draftId, language), code);
      } catch {
        // Ignore: drafts are a convenience.
      }
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language, draftId]);

  const switchLanguage = (lang: RunnableLanguage) => {
    setLanguage(lang);
    if (lang === "python") warmUpPython();
    setCode(readDraft(draftId, lang) ?? starter(lang));
    setResult(null);
  };

  const run = async (mode: "run" | "submit") => {
    if (language === "python" && !isPythonLoaded())
      toast.info("Loading Python for the first time…");
    setBusy(mode);
    try {
      const res = await runTests({
        language,
        code,
        mode,
        functionName: exercise.functionName,
        testCases: exercise.testCases,
      });
      setResult(res);
      if (mode === "submit") {
        setAttempted(true);
        if (res.status === "accepted") {
          toast.success("All tests passed. Exercise complete!");
          onSolved();
        } else {
          toast.error(`${res.passedCount}/${res.totalCount} tests passed. Keep going.`);
        }
      }
    } catch (err) {
      toast.error((err as Error)?.message || "Could not run your code");
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    if (!confirm("Discard your code and start from the template?")) return;
    try {
      localStorage.removeItem(draftKey(draftId, language));
    } catch {
      // ignore
    }
    setCode(starter(language));
    setResult(null);
  };

  const showSolution = () => {
    const sol = exercise.solution[language];
    if (!sol) return;
    if (
      !confirm("Replace your code with the reference solution? Try the hints first if you haven't.")
    )
      return;
    setCode(sol);
  };

  const sampleCount = Math.min(2, exercise.testCases.length);
  const canSeeSolution = attempted || solved;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 shadow-card glass">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/70 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-foreground">{exercise.title}</h3>
          <DifficultyBadge value={exercise.difficulty} />
          {solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Solved
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {languages.length > 1 && (
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value as RunnableLanguage)}
              aria-label="Language"
              className="cursor-pointer rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => run("run")}
            disabled={busy !== null}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-foreground transition glass hover:bg-surface-2 disabled:opacity-50"
          >
            {busy === "run" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 text-primary" />
            )}
            Run samples
          </button>
          <button
            onClick={() => run("submit")}
            disabled={busy !== null}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition hover:scale-[1.03] disabled:opacity-50"
            style={{ background: "var(--gradient-gold)" }}
          >
            {busy === "submit" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit
          </button>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-12">
        {/* Problem */}
        <div className="space-y-5 overflow-y-auto border-b border-border/70 bg-surface/30 p-5 lg:col-span-5 lg:max-h-[640px] lg:border-b-0 lg:border-r">
          {exercise.prompt.map((p, i) => (
            <p key={i} className="text-sm leading-7 text-foreground/85">
              <RichText text={p} />
            </p>
          ))}

          <div className="space-y-3">
            {exercise.examples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Example {i + 1}
                </p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-5 text-foreground/90">
                  <span className="text-muted-foreground">Input: </span>
                  {ex.input}
                  {"\n"}
                  <span className="text-muted-foreground">Output: </span>
                  {ex.output}
                </pre>
                {ex.explanation && (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    <RichText text={ex.explanation} />
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Run samples</strong> checks {sampleCount} visible
            cases. <strong className="text-foreground">Submit</strong> checks all{" "}
            {exercise.testCases.length}, including hidden ones.
          </p>

          {/* Hints */}
          <div className="rounded-xl border border-border/60 bg-background/30 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-primary" /> Hints ({hintsShown}/
                {exercise.hints.length})
              </p>
              {hintsShown < exercise.hints.length && (
                <button
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  {hintsShown === 0 ? "Show a hint" : "Next hint"}
                </button>
              )}
            </div>
            {hintsShown > 0 && (
              <ol className="mt-2.5 space-y-1.5">
                {exercise.hints.slice(0, hintsShown).map((h, i) => (
                  <li key={i} className="text-xs leading-5 text-muted-foreground">
                    {i + 1}. <RichText text={h} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset code
            </button>
            <button
              onClick={showSolution}
              disabled={!canSeeSolution}
              title={canSeeSolution ? undefined : "Submit at least once to unlock the solution"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye className="h-3.5 w-3.5" />{" "}
              {canSeeSolution ? "Show solution" : "Solution unlocks after a submit"}
            </button>
          </div>
        </div>

        {/* Editor + console */}
        <div className="flex min-w-0 flex-col bg-[#0b0f19] lg:col-span-7">
          <div className="min-h-[340px] flex-1">
            <CodeEditor value={code} onChange={setCode} minHeight={340} />
          </div>
          <div className="max-h-[300px] overflow-y-auto border-t border-border/70 bg-background/60 p-4">
            <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" /> Console
            </p>
            {!result ? (
              <p className="text-xs text-muted-foreground">Run your code to see results here.</p>
            ) : (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    result.status === "accepted" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {result.status === "accepted" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {STATUS_LABEL[result.status]}
                  <span className="font-normal text-muted-foreground">
                    · {result.passedCount}/{result.totalCount} tests passed
                  </span>
                </div>
                {result.error && result.testResults.length === 0 && (
                  <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 font-mono text-xs text-rose-300">
                    {result.error}
                  </pre>
                )}
                {result.testResults.map((t) => (
                  <div
                    key={t.testIndex}
                    className={`rounded-lg border p-3 font-mono text-xs leading-5 ${
                      t.passed
                        ? "border-emerald-500/25 bg-emerald-500/5"
                        : "border-rose-500/25 bg-rose-500/5"
                    }`}
                  >
                    <p
                      className={`mb-1 font-sans font-semibold ${t.passed ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      Test {t.testIndex} {t.passed ? "passed" : "failed"}
                    </p>
                    <p className="break-all text-muted-foreground">
                      Input: <span className="text-foreground/90">{t.input}</span>
                    </p>
                    <p className="break-all text-muted-foreground">
                      Expected: <span className="text-foreground/90">{t.expected}</span>
                    </p>
                    <p className="break-all text-muted-foreground">
                      Got: <span className="text-foreground/90">{t.actual}</span>
                    </p>
                    {t.logs && (
                      <p className="mt-1 whitespace-pre-wrap break-all text-sky-300/90">
                        console: {t.logs}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
