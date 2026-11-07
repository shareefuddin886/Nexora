import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  FlaskConical,
  History,
  Lightbulb,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  RotateCcw,
  Send,
  Terminal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CodeMirrorEditor } from "@/components/workspace/CodeMirrorEditor";
import {
  RUNNABLE_LANGUAGES,
  isPythonLoaded,
  outputsMatch,
  runCases,
  warmUpPython,
  type RunnableLanguage,
} from "@/lib/code-runner";
import { namedInput, parseArgs, splitArgs } from "@/lib/problem-format";
import type { TestCase } from "@/lib/dsa-curriculum";

/* ------------------------------------------------------------------ types */

export interface WorkspaceProblem {
  /** Unique key used for drafts and submission history. */
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Problem statement, rendered by the caller. */
  statement: ReactNode;
  examples: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
  hints?: string[];
  links?: { label: string; url: string }[];
  /** Small labels under the title, e.g. the pattern or topic. */
  tags?: string[];
  /** Extra sections rendered after the hints (e.g. "Now your turn", doubts). */
  extras?: ReactNode;
  functionName: string;
  paramNames: string[];
  languages: RunnableLanguage[];
  starters: Partial<Record<RunnableLanguage, string>>;
  /** Trusted JavaScript solution; computes expected output for custom cases. */
  referenceJs: string;
  /** Code shown in the Editorial tab (may include languages that can't run here). */
  solutions: { label: string; code: string }[];
  editorial?: ReactNode;
  testCases: TestCase[];
}

type Verdict =
  "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "time_limit_exceeded";

interface CaseResult {
  input: string;
  output: string;
  expected: string;
  stdout: string;
  passed: boolean;
  error?: string;
}

interface Outcome {
  mode: "run" | "submit";
  verdict: Verdict;
  runtimeMs?: number;
  passed: number;
  total: number;
  cases: CaseResult[];
  error?: string;
}

interface Submission {
  verdict: Verdict;
  language: RunnableLanguage;
  passed: number;
  total: number;
  runtimeMs?: number;
  at: string;
  code: string;
}

const VERDICT_LABEL: Record<Verdict, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  runtime_error: "Runtime Error",
  compile_error: "Compile Error",
  time_limit_exceeded: "Time Limit Exceeded",
};

const DIFFICULTY_CLASS = {
  Easy: "text-emerald-400 bg-emerald-500/10",
  Medium: "text-amber-400 bg-amber-500/10",
  Hard: "text-rose-400 bg-rose-500/10",
};

/* ------------------------------------------------------------ storage */

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable: drafts are a convenience.
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
const draftKey = (id: string, lang: RunnableLanguage) => `nexora_ws_draft:${id}:${lang}`;
const langKey = (id: string) => `nexora_ws_lang:${id}`;
const historyKey = (id: string) => `nexora_ws_history:${id}`;

function readHistory(id: string): Submission[] {
  try {
    return JSON.parse(store.get(historyKey(id)) ?? "[]") as Submission[];
  } catch {
    return [];
  }
}

const fmtMs = (ms?: number) =>
  ms === undefined ? "—" : ms < 1 ? `${ms.toFixed(2)} ms` : `${Math.round(ms)} ms`;

/* ---------------------------------------------------------- component */

export function ProblemWorkspace({
  problem,
  solved,
  onAccepted,
}: {
  problem: WorkspaceProblem;
  solved: boolean;
  onAccepted: (code: string, language: RunnableLanguage) => void;
}) {
  const languages = RUNNABLE_LANGUAGES.filter((l) => problem.languages.includes(l.id));
  const [language, setLanguage] = useState<RunnableLanguage>(problem.languages[0]);
  // Read starters through a ref so a new problem object on re-render never resets the editor.
  const startersRef = useRef(problem.starters);
  startersRef.current = problem.starters;
  const starter = useCallback((lang: RunnableLanguage) => startersRef.current[lang] ?? "", []);
  const [code, setCode] = useState(() => starter(problem.languages[0]));

  const samples = useMemo(() => problem.testCases.filter((c) => !c.isHidden), [problem.testCases]);
  const sampleArgs = useMemo(() => samples.map((c) => splitArgs(c.input)), [samples]);
  const [cases, setCases] = useState<string[][]>(sampleArgs);
  const [activeCase, setActiveCase] = useState(0);

  const [leftTab, setLeftTab] = useState<"description" | "editorial" | "submissions">(
    "description",
  );
  const [bottomTab, setBottomTab] = useState<"testcase" | "result">("testcase");
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [activeResult, setActiveResult] = useState(0);
  const [history, setHistory] = useState<Submission[]>([]);
  const [showEditorial, setShowEditorial] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [vertical, setVertical] = useState(false);

  // Restore language, draft and history (browser-only).
  useEffect(() => {
    const savedLang = store.get(langKey(problem.id)) as RunnableLanguage | null;
    const lang =
      savedLang && problem.languages.includes(savedLang) ? savedLang : problem.languages[0];
    setLanguage(lang);
    setCode(store.get(draftKey(problem.id, lang)) ?? starter(lang));
    setHistory(readHistory(problem.id));
    if (lang === "python") warmUpPython();
    // Only when the problem itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id]);

  // Autosave the draft.
  useEffect(() => {
    const id = setTimeout(() => {
      if (code !== starter(language)) store.set(draftKey(problem.id, language), code);
    }, 400);
    return () => clearTimeout(id);
  }, [code, language, problem.id, starter]);

  // Stack the panels vertically on narrow screens.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setVertical(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Esc leaves fullscreen.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const changeLanguage = (lang: RunnableLanguage) => {
    setLanguage(lang);
    store.set(langKey(problem.id), lang);
    setCode(store.get(draftKey(problem.id, lang)) ?? starter(lang));
    if (lang === "python") warmUpPython();
  };

  const resetCode = () => {
    if (!confirm("Reset to the starter code? Your current code for this language will be lost."))
      return;
    store.remove(draftKey(problem.id, language));
    setCode(starter(language));
  };

  /* ------------------------------------------------------------ run */

  const execute = async (mode: "run" | "submit") => {
    if (busy) return;
    if (language === "python" && !isPythonLoaded())
      toast.info("Loading Python for the first time…");
    setBusy(mode);
    setBottomTab("result");
    try {
      let inputs: string[];
      let expected: string[];
      if (mode === "run") {
        const invalid = cases.findIndex((args) => parseArgs(args.join(", ")) === null);
        if (invalid !== -1) {
          setOutcome({
            mode,
            verdict: "compile_error",
            passed: 0,
            total: cases.length,
            cases: [],
            error: `Case ${invalid + 1} has an invalid value. Each parameter must be valid JSON, e.g. [1,2,3] or "text".`,
          });
          return;
        }
        inputs = cases.map((args) => args.join(", "));
        // Unchanged samples keep their stored answer; edited or new cases use the reference solution.
        const needRef = inputs.map(
          (inp, i) => !(i < samples.length && sameArgs(cases[i], sampleArgs[i])),
        );
        const refInputs = inputs.filter((_, i) => needRef[i]);
        const refRun = refInputs.length
          ? await runCases("javascript", problem.referenceJs, problem.functionName, refInputs)
          : null;
        let r = 0;
        expected = inputs.map((_, i) => {
          if (!needRef[i]) return samples[i].expectedOutput;
          const res = refRun && refRun.kind === "ok" ? refRun.results[r++] : null;
          return res && !res.error ? res.actual : "(no expected output for this input)";
        });
      } else {
        inputs = problem.testCases.map((c) => c.input);
        expected = problem.testCases.map((c) => c.expectedOutput);
      }

      const run = await runCases(language, code, problem.functionName, inputs);
      let next: Outcome;
      if (run.kind !== "ok") {
        next = {
          mode,
          verdict: run.kind,
          passed: 0,
          total: inputs.length,
          cases: [],
          error: run.error,
        };
      } else {
        const results: CaseResult[] = run.results.map((r, i) => ({
          input: inputs[i],
          output: r.error ? "" : r.actual,
          expected: expected[i],
          stdout: r.logs,
          error: r.error,
          passed: !r.error && outputsMatch(r.actual, expected[i]),
        }));
        const passed = results.filter((c) => c.passed).length;
        const firstError = results.find((c) => c.error);
        const verdict: Verdict =
          passed === results.length ? "accepted" : firstError ? "runtime_error" : "wrong_answer";
        // On submit, show only the first failing case (as LeetCode does).
        const shown =
          mode === "submit"
            ? verdict === "accepted"
              ? []
              : [results.find((c) => !c.passed)!]
            : results;
        next = {
          mode,
          verdict,
          runtimeMs: run.runtimeMs,
          passed,
          total: results.length,
          cases: shown,
          error: firstError?.error,
        };
      }
      setOutcome(next);
      setActiveResult(
        Math.max(
          0,
          next.cases.findIndex((c) => !c.passed),
        ),
      );

      if (mode === "submit") {
        const entry: Submission = {
          verdict: next.verdict,
          language,
          passed: next.passed,
          total: next.total,
          runtimeMs: next.runtimeMs,
          at: new Date().toISOString(),
          code,
        };
        const updated = [entry, ...readHistory(problem.id)].slice(0, 30);
        store.set(historyKey(problem.id), JSON.stringify(updated));
        setHistory(updated);
        if (next.verdict === "accepted") {
          toast.success("Accepted! All test cases passed.");
          onAccepted(code, language);
        }
      }
    } catch (err) {
      toast.error((err as Error)?.message || "Could not run your code");
    } finally {
      setBusy(null);
    }
  };

  /* ------------------------------------------------------- test cases */

  const updateArg = (caseIdx: number, argIdx: number, value: string) =>
    setCases((prev) =>
      prev.map((c, i) => (i === caseIdx ? c.map((a, j) => (j === argIdx ? value : a)) : c)),
    );
  const addCase = () => {
    setCases((prev) => [...prev, [...(prev[activeCase] ?? sampleArgs[0] ?? [])]]);
    setActiveCase(cases.length);
  };
  const removeCase = (idx: number) => {
    setCases((prev) => prev.filter((_, i) => i !== idx));
    setActiveCase((a) => Math.max(0, a >= idx ? a - 1 : a));
  };

  /* ---------------------------------------------------------- render */

  const leftPanel = (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-surface/40">
      <TabBar>
        <TabButton
          active={leftTab === "description"}
          onClick={() => setLeftTab("description")}
          icon={FileText}
        >
          Description
        </TabButton>
        <TabButton
          active={leftTab === "editorial"}
          onClick={() => setLeftTab("editorial")}
          icon={BookOpenText}
        >
          Editorial
        </TabButton>
        <TabButton
          active={leftTab === "submissions"}
          onClick={() => setLeftTab("submissions")}
          icon={History}
        >
          Submissions{history.length ? ` (${history.length})` : ""}
        </TabButton>
      </TabBar>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {leftTab === "description" && <Description problem={problem} solved={solved} />}
        {leftTab === "editorial" &&
          (showEditorial ? (
            <Editorial problem={problem} />
          ) : (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-foreground">Try it yourself first</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Struggling for a while is how patterns stick. Check the hints in the description
                before opening the solution.
              </p>
              <button
                onClick={() => setShowEditorial(true)}
                className="mt-5 cursor-pointer rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/60"
              >
                Show editorial
              </button>
            </div>
          ))}
        {leftTab === "submissions" && (
          <Submissions
            history={history}
            onLoad={(s) => {
              if (!confirm("Load this submission's code into the editor?")) return;
              if (s.language !== language) changeLanguage(s.language);
              setCode(s.code);
            }}
          />
        )}
      </div>
    </div>
  );

  const editorPanel = (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-[#0b0f19]">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-surface/50 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Code
          </span>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as RunnableLanguage)}
              aria-label="Language"
              className="cursor-pointer appearance-none rounded-md bg-transparent py-1 pl-2 pr-6 text-xs font-medium text-muted-foreground transition hover:bg-surface-2 hover:text-foreground focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id} className="bg-surface">
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton label="Reset to starter code" onClick={resetCode} icon={RotateCcw} />
          <IconButton
            label={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
            onClick={() => setFullscreen((f) => !f)}
            icon={fullscreen ? Minimize2 : Maximize2}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <CodeMirrorEditor
          value={code}
          onChange={setCode}
          language={language}
          onRun={() => void execute("run")}
          onSubmit={() => void execute("submit")}
        />
      </div>
    </div>
  );

  const consolePanel = (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-surface/40">
      <TabBar>
        <TabButton
          active={bottomTab === "testcase"}
          onClick={() => setBottomTab("testcase")}
          icon={CheckCircle2}
        >
          Testcase
        </TabButton>
        <TabButton
          active={bottomTab === "result"}
          onClick={() => setBottomTab("result")}
          icon={FlaskConical}
        >
          Test Result
        </TabButton>
      </TabBar>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {bottomTab === "testcase" ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {cases.map((_, i) => (
                <div key={i} className="group relative">
                  <button
                    onClick={() => setActiveCase(i)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeCase === i
                        ? "bg-surface-2 text-foreground"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    Case {i + 1}
                  </button>
                  {cases.length > 1 && (
                    <button
                      onClick={() => removeCase(i)}
                      aria-label={`Remove case ${i + 1}`}
                      className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 cursor-pointer place-items-center rounded-full bg-surface-2 text-muted-foreground hover:text-foreground group-hover:grid"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
              {cases.length < 8 && (
                <button
                  onClick={addCase}
                  aria-label="Add test case"
                  className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setCases(sampleArgs);
                  setActiveCase(0);
                }}
                className="ml-auto cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
              >
                Reset testcases
              </button>
            </div>
            {cases[activeCase] && (
              <div className="mt-3 space-y-3">
                {cases[activeCase].map((arg, j) => (
                  <label key={j} className="block">
                    <span className="text-xs text-muted-foreground">
                      {problem.paramNames[j] ?? `arg${j + 1}`} =
                    </span>
                    <textarea
                      value={arg}
                      onChange={(e) => updateArg(activeCase, j, e.target.value)}
                      rows={1}
                      spellCheck={false}
                      className="mt-1 w-full resize-y rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-[13px] text-foreground outline-none transition focus:border-primary/60"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ResultView
            outcome={outcome}
            busy={busy}
            paramNames={problem.paramNames}
            active={activeResult}
            onSelect={setActiveResult}
          />
        )}
      </div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <h2 className="truncate text-sm font-semibold text-foreground">{problem.title}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${DIFFICULTY_CLASS[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
        {solved && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Solved
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-muted-foreground xl:inline">
          Ctrl+Enter run · Ctrl+Shift+Enter submit
        </span>
        <button
          onClick={() => void execute("run")}
          disabled={busy !== null}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface-2 px-4 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-2/70 disabled:opacity-50"
        >
          {busy === "run" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Run
        </button>
        <button
          onClick={() => void execute("submit")}
          disabled={busy !== null}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
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
  );

  const handle = (dir: "h" | "v") => (
    <Separator
      className={`group flex items-center justify-center ${dir === "h" ? "w-2" : "h-2"} outline-none`}
    >
      <span
        className={`rounded-full bg-border/70 transition group-hover:bg-primary/70 group-data-[separator=active]:bg-primary ${
          dir === "h" ? "h-8 w-1" : "h-1 w-8"
        }`}
      />
    </Separator>
  );

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[70] flex flex-col bg-background p-3"
          : `flex flex-col ${vertical ? "" : "h-[calc(100vh-8rem)] min-h-[640px]"}`
      }
    >
      {toolbar}
      {vertical ? (
        <div className="flex flex-col gap-3">
          <div className="h-[520px]">{leftPanel}</div>
          <div className="h-[460px]">{editorPanel}</div>
          <div className="h-[340px]">{consolePanel}</div>
        </div>
      ) : (
        <Group orientation="horizontal" className="min-h-0 flex-1">
          <Panel defaultSize="42" minSize="25">
            {leftPanel}
          </Panel>
          {handle("h")}
          <Panel defaultSize="58" minSize="30">
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize="62" minSize="20">
                {editorPanel}
              </Panel>
              {handle("v")}
              <Panel defaultSize="38" minSize="15">
                {consolePanel}
              </Panel>
            </Group>
          </Panel>
        </Group>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ pieces */

function sameArgs(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => outputsMatch(v, b[i]));
}

function TabBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 border-b border-border/60 bg-surface/50 px-2 py-1">
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
        active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : ""}`} />
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: typeof FileText;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Description({ problem, solved }: { problem: WorkspaceProblem; solved: boolean }) {
  const [hintsOpen, setHintsOpen] = useState<number[]>([]);
  return (
    <div className="space-y-5 text-sm leading-7 text-foreground/90">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
        {solved && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_CLASS[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
        {problem.hints && problem.hints.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" /> {problem.hints.length} hints
          </span>
        )}
        {problem.tags?.map((t) => (
          <span
            key={t}
            className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div>{problem.statement}</div>
      <p className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
        <span className="font-semibold text-foreground">How it's checked:</span> complete the
        function and <span className="font-semibold text-foreground">return</span> the answer.
        Printed output is shown under Stdout for debugging, but only the returned value is judged.
      </p>

      {problem.examples.map((ex, i) => (
        <div key={i}>
          <p className="font-semibold text-foreground">Example {i + 1}:</p>
          <div className="mt-2 rounded-lg border-l-2 border-border bg-background/40 px-4 py-3 font-mono text-[13px] leading-6">
            <p>
              <span className="font-sans font-semibold text-foreground">Input: </span>
              <span className="text-muted-foreground">
                {namedInput(ex.input, problem.paramNames)}
              </span>
            </p>
            <p>
              <span className="font-sans font-semibold text-foreground">Output: </span>
              <span className="text-muted-foreground">{ex.output}</span>
            </p>
            {ex.explanation && (
              <p className="font-sans">
                <span className="font-semibold text-foreground">Explanation: </span>
                <span className="text-muted-foreground">{ex.explanation.replace(/`/g, "")}</span>
              </p>
            )}
          </div>
        </div>
      ))}

      {problem.constraints && problem.constraints.length > 0 && (
        <div>
          <p className="font-semibold text-foreground">Constraints:</p>
          <ul className="mt-2 space-y-1.5">
            {problem.constraints.map((c) => (
              <li key={c} className="flex gap-2.5">
                <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <code className="rounded-md bg-surface-2/70 px-1.5 py-0.5 font-mono text-[12.5px] text-foreground/90">
                  {c}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {problem.hints && problem.hints.length > 0 && (
        <div className="divide-y divide-border/50 rounded-lg border border-border/60">
          {problem.hints.map((h, i) => {
            const open = hintsOpen.includes(i);
            return (
              <div key={i}>
                <button
                  onClick={() => setHintsOpen((o) => (open ? o.filter((x) => x !== i) : [...o, i]))}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm text-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-primary" /> Hint {i + 1}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <p className="px-4 pb-3 text-sm text-muted-foreground">{h.replace(/`/g, "")}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {problem.extras}

      {problem.links && problem.links.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {problem.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Editorial({ problem }: { problem: WorkspaceProblem }) {
  const [tab, setTab] = useState(0);
  const sol = problem.solutions[tab];
  return (
    <div className="space-y-5 text-sm leading-7 text-foreground/90">
      {problem.editorial}
      {sol && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-[#0b0f19]">
          <div className="flex items-center justify-between border-b border-border/60 bg-surface/50 px-2 py-1">
            <div className="flex flex-wrap gap-1">
              {problem.solutions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setTab(i)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs transition ${
                    tab === i
                      ? "bg-surface-2 font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <IconButton
              label="Copy code"
              icon={Copy}
              onClick={() => {
                void navigator.clipboard?.writeText(sol.code);
                toast.success("Copied");
              }}
            />
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-[#d6deeb]">
            <code>{sol.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function Submissions({
  history,
  onLoad,
}: {
  history: Submission[];
  onLoad: (s: Submission) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-muted-foreground">
        No submissions yet. Press <span className="font-semibold text-foreground">Submit</span> to
        run all test cases.
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60">
      {history.map((s) => (
        <button
          key={s.at}
          onClick={() => onLoad(s)}
          className="grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-left transition hover:bg-surface/60"
        >
          <span>
            <span
              className={`block text-sm font-semibold ${s.verdict === "accepted" ? "text-emerald-400" : "text-rose-400"}`}
            >
              {VERDICT_LABEL[s.verdict]}
            </span>
            <span className="text-xs text-muted-foreground">{new Date(s.at).toLocaleString()}</span>
          </span>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">
            {RUNNABLE_LANGUAGES.find((l) => l.id === s.language)?.label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Clock className="h-3 w-3" /> {fmtMs(s.runtimeMs)}
          </span>
        </button>
      ))}
    </div>
  );
}

function ResultView({
  outcome,
  busy,
  paramNames,
  active,
  onSelect,
}: {
  outcome: Outcome | null;
  busy: "run" | "submit" | null;
  paramNames: string[];
  active: number;
  onSelect: (i: number) => void;
}) {
  if (busy) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {busy === "submit" ? "Judging against all test cases…" : "Running…"}
      </div>
    );
  }
  if (!outcome) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        You must run your code first.
      </p>
    );
  }
  const ok = outcome.verdict === "accepted";
  const current = outcome.cases[active];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`text-lg font-semibold ${ok ? "text-emerald-400" : "text-rose-400"}`}>
          {VERDICT_LABEL[outcome.verdict]}
        </span>
        {outcome.runtimeMs !== undefined && (
          <span className="text-xs text-muted-foreground">Runtime: {fmtMs(outcome.runtimeMs)}</span>
        )}
        {outcome.mode === "submit" && outcome.cases.length + (ok ? 1 : 0) > 0 && (
          <span className="text-xs text-muted-foreground">
            {outcome.passed} / {outcome.total} testcases passed
          </span>
        )}
      </div>

      {outcome.error && outcome.cases.length === 0 && (
        <pre className="whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 font-mono text-xs leading-5 text-rose-300">
          {outcome.error}
        </pre>
      )}

      {outcome.mode === "submit" && ok && (
        <p className="flex items-center gap-2 text-sm text-foreground/90">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Your solution passed every test,
          including the hidden ones.
        </p>
      )}

      {outcome.cases.length > 0 && (
        <>
          {outcome.mode === "run" ? (
            <div className="flex flex-wrap gap-2">
              {outcome.cases.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active === i
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:bg-surface"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${c.passed ? "bg-emerald-400" : "bg-rose-400"}`}
                  />
                  Case {i + 1}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">Last executed input</p>
          )}
          {current && (
            <div className="space-y-2.5">
              {splitArgs(current.input).map((v, j) => (
                <Field key={j} label={`${paramNames[j] ?? `arg${j + 1}`} =`} value={v} />
              ))}
              {current.error ? (
                <Field label="Error" value={current.error} tone="error" />
              ) : (
                <Field
                  label="Output"
                  value={current.output}
                  tone={current.passed ? undefined : "error"}
                />
              )}
              <Field label="Expected" value={current.expected} tone="ok" />
              {current.stdout && <Field label="Stdout" value={current.stdout} />}
              {!current.passed && !current.error && current.output === "null" && current.stdout && (
                <p className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs leading-5 text-amber-200">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  It looks like you printed the answer instead of returning it. Use{" "}
                  <code className="font-mono">return</code> — print() / console.log() output only
                  appears in Stdout and is not checked.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "ok" | "error" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <pre
        className={`mt-1 whitespace-pre-wrap break-all rounded-lg bg-background/60 px-3 py-2 font-mono text-[13px] ${
          tone === "error"
            ? "text-rose-300"
            : tone === "ok"
              ? "text-emerald-300"
              : "text-foreground"
        }`}
      >
        {value === "" ? " " : value}
      </pre>
    </div>
  );
}
