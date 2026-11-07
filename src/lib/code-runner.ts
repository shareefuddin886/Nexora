// Runs DSA solutions in the user's browser, inside a Web Worker, so user code
// can never touch the server and an infinite loop only kills its own worker.
// JavaScript runs directly, TypeScript is stripped to JavaScript with sucrase,
// and Python runs on Pyodide (real CPython compiled to WebAssembly).
import type { TestCase } from "./dsa-curriculum";

export type RunnableLanguage = "javascript" | "typescript" | "python";

export const RUNNABLE_LANGUAGES: { id: RunnableLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python 3" },
];

export interface CodeExecutionResult {
  status: "accepted" | "wrong_answer" | "compile_error" | "runtime_error" | "time_limit_exceeded";
  error?: string;
  passedCount: number;
  totalCount: number;
  testResults: {
    testIndex: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    logs?: string;
  }[];
  /** Total time spent inside the learner's function, in milliseconds. */
  runtimeMs?: number;
}

type CaseOutput = { actual: string; logs: string; error?: string; ms?: number };

type WorkerReply =
  | { ok: true; results: CaseOutput[] }
  | { ok: false; error: string; phase: "compile" | "runtime" };

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const JS_TIMEOUT_MS = 5000;
const PY_TIMEOUT_MS = 8000;
const PY_LOAD_TIMEOUT_MS = 60000;

// Worker source lives in a string so it needs no bundler configuration.
const WORKER_SOURCE = `
const fmt = (v) => {
  if (v === undefined) return "null";
  if (typeof v === "string") return JSON.stringify(v); // shown quoted, as LeetCode does
  if (typeof v === "object" && v !== null) return JSON.stringify(v);
  return String(v);
};

let pyodide = null;
async function loadPython(url) {
  if (!pyodide) {
    importScripts(url + "pyodide.js");
    pyodide = await loadPyodide({ indexURL: url });
  }
  return pyodide;
}

self.onmessage = async (e) => {
  const { language, code, functionName, inputs, pyodideUrl } = e.data;
  try {
    if (language === "python") {
      const py = await loadPython(pyodideUrl);
      self.postMessage({ type: "ready" });
      const results = [];
      let logs = [];
      py.setStdout({ batched: (s) => logs.push(s) });
      py.setStderr({ batched: (s) => logs.push(s) });
      const ns = py.toPy({});
      try {
        // LeetCode-style hints such as List[int] need the typing names.
        py.runPython("from typing import *", { globals: ns });
        py.runPython(code, { globals: ns });
      } catch (err) {
        self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: String(err.message || err) } });
        return;
      }
      // Either a plain function or a LeetCode-style "class Solution" method.
      let fn = ns.get(functionName);
      if (!fn) {
        const Sol = ns.get("Solution");
        if (Sol) fn = Sol()[functionName];
      }
      if (!fn) {
        self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: "Function '" + functionName + "' is not defined. Keep the function name from the template." } });
        return;
      }
      for (const input of inputs) {
        logs = [];
        const t0 = performance.now();
        try {
          const args = JSON.parse("[" + input + "]").map((a) => py.toPy(a));
          let out = fn(...args);
          if (out && typeof out.toJs === "function") {
            const js = out.toJs({ dict_converter: Object.fromEntries });
            out.destroy();
            out = js;
          }
          results.push({ actual: fmt(out), logs: logs.join("\\n"), ms: performance.now() - t0 });
        } catch (err) {
          results.push({ actual: "", logs: logs.join("\\n"), error: String(err.message || err), ms: performance.now() - t0 });
        }
      }
      self.postMessage({ type: "done", reply: { ok: true, results } });
      return;
    }

    // JavaScript (TypeScript arrives already transpiled).
    let factory;
    try {
      // Accept a plain function, "var f = function" or a LeetCode-style "class Solution".
      const F = functionName;
      factory = new Function(
        "console",
        '"use strict";\\n' + code +
          "\\nif (typeof " + F + ' === "function") return ' + F + ";" +
          '\\nif (typeof Solution === "function") { const s = new Solution(); if (typeof s.' + F + ' === "function") return s.' + F + ".bind(s); }" +
          "\\nreturn undefined;",
      );
    } catch (err) {
      self.postMessage({ type: "done", reply: { ok: false, phase: "compile", error: String(err.message || err) } });
      return;
    }
    const results = [];
    for (const input of inputs) {
      const logs = [];
      const out = (...a) => logs.push(a.map(fmt).join(" "));
      const consoleShim = { log: out, error: out, warn: out, info: out, debug: out };
      const t0 = performance.now();
      try {
        const fn = factory(consoleShim);
        if (!fn) throw new Error("Function '" + functionName + "' is not defined. Keep the function name from the template.");
        const args = JSON.parse("[" + input + "]");
        let value = fn(...args);
        if (value && typeof value.then === "function") value = await value;
        results.push({ actual: fmt(value), logs: logs.join("\\n"), ms: performance.now() - t0 });
      } catch (err) {
        results.push({ actual: "", logs: logs.join("\\n"), error: String(err.message || err), ms: performance.now() - t0 });
      }
    }
    self.postMessage({ type: "done", reply: { ok: true, results } });
  } catch (err) {
    self.postMessage({ type: "done", reply: { ok: false, phase: "runtime", error: String(err.message || err) } });
  }
};
`;

let workerUrl: string | null = null;
function newWorker() {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
  return new Worker(workerUrl);
}

// Python keeps one warm worker so Pyodide only downloads once per page.
let pyWorker: Worker | null = null;
let pyReady = false;

// The Python worker handles one job at a time, so Python jobs run in order.
let pyQueue: Promise<unknown> = Promise.resolve();

function execute(
  language: RunnableLanguage,
  code: string,
  functionName: string,
  inputs: string[],
): Promise<WorkerReply | "timeout" | "load_timeout"> {
  if (language !== "python") return executeNow(language, code, functionName, inputs);
  const job = pyQueue.then(() => executeNow(language, code, functionName, inputs));
  pyQueue = job.catch(() => undefined);
  return job;
}

function executeNow(
  language: RunnableLanguage,
  code: string,
  functionName: string,
  inputs: string[],
): Promise<WorkerReply | "timeout" | "load_timeout"> {
  const isPy = language === "python";
  const worker = isPy ? (pyWorker ??= newWorker()) : newWorker();

  return new Promise((resolve) => {
    let timer = setTimeout(
      onTimeout,
      isPy && !pyReady ? PY_LOAD_TIMEOUT_MS : isPy ? PY_TIMEOUT_MS : JS_TIMEOUT_MS,
    );

    function finish(value: WorkerReply | "timeout" | "load_timeout") {
      clearTimeout(timer);
      worker.onmessage = null;
      if (!isPy) worker.terminate();
      resolve(value);
    }
    function onTimeout() {
      const wasLoading = isPy && !pyReady;
      worker.terminate();
      if (isPy) {
        pyWorker = null;
        pyReady = false;
      }
      finish(wasLoading ? "load_timeout" : "timeout");
    }

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "ready" && !pyReady) {
        pyReady = true;
        clearTimeout(timer);
        timer = setTimeout(onTimeout, PY_TIMEOUT_MS);
      } else if (e.data.type === "done") {
        finish(e.data.reply);
      }
    };
    worker.postMessage({ language, code, functionName, inputs, pyodideUrl: PYODIDE_URL });
  });
}

function normalize(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str));
  } catch {
    return str.trim().replace(/\s+/g, "");
  }
}

export function isPythonLoaded() {
  return pyReady;
}

// Start downloading Python in the background (e.g. when the learner picks it),
// so the first Run doesn't wait for the ~10 MB download.
export function warmUpPython() {
  if (pyReady || pyWorker) return;
  void execute("python", "", "__warmup__", []);
}

/** Result of running code on raw inputs, before comparing with expected outputs. */
export type CaseRun =
  | { kind: "ok"; results: CaseOutput[]; runtimeMs: number }
  | { kind: "compile_error" | "runtime_error" | "time_limit_exceeded"; error: string };

/** Runs code on a list of inputs (each a comma-separated list of JSON arguments). */
export async function runCases(
  language: RunnableLanguage,
  source: string,
  functionName: string,
  inputs: string[],
): Promise<CaseRun> {
  let code = source;
  if (language === "typescript") {
    try {
      const { transform } = await import("sucrase");
      code = transform(code, { transforms: ["typescript"] }).code;
    } catch (err) {
      return { kind: "compile_error", error: (err as Error).message };
    }
  }

  const reply = await execute(language, code, functionName, inputs);
  if (reply === "timeout" || reply === "load_timeout") {
    return {
      kind: "time_limit_exceeded",
      error:
        reply === "load_timeout"
          ? "Python took too long to load. Check your internet connection and try again."
          : "Your code took too long. Check for an infinite loop.",
    };
  }
  if (!reply.ok) {
    return { kind: reply.phase === "compile" ? "compile_error" : "runtime_error", error: reply.error };
  }
  const runtimeMs = reply.results.reduce((sum, r) => sum + (r.ms ?? 0), 0);
  return { kind: "ok", results: reply.results, runtimeMs };
}

/** True when two printed outputs represent the same value. */
export function outputsMatch(actual: string, expected: string) {
  if (normalize(actual) === normalize(expected)) return true;
  // A stored answer may be a bare string (fl) while code prints it quoted ("fl"),
  // or the other way round. Only then compare the unquoted text; 12 and "12" stay different.
  const parse = (s: string): { ok: true; value: unknown } | { ok: false } => {
    try {
      return { ok: true, value: JSON.parse(s) };
    } catch {
      return { ok: false };
    }
  };
  const pa = parse(actual);
  const pe = parse(expected);
  if (pa.ok && typeof pa.value === "string" && !pe.ok) return pa.value === expected.trim();
  if (pe.ok && typeof pe.value === "string" && !pa.ok) return pe.value === actual.trim();
  return false;
}

/** Runs learner code against any list of test cases (used by DSA and the other tracks). */
export async function runTests(opts: {
  language: RunnableLanguage;
  code: string;
  mode: "run" | "submit";
  functionName: string;
  testCases: TestCase[];
}): Promise<CodeExecutionResult> {
  // "Run" checks the visible samples; "Submit" checks every case, hidden ones included.
  const cases = opts.mode === "run" ? opts.testCases.slice(0, 2) : opts.testCases;
  const empty = { passedCount: 0, totalCount: cases.length, testResults: [] };

  const run = await runCases(
    opts.language,
    opts.code,
    opts.functionName,
    cases.map((c) => c.input),
  );
  if (run.kind !== "ok") return { status: run.kind, error: run.error, ...empty };

  const testResults = cases.map((tc, i) => {
    const r = run.results[i];
    const actual = r.error ? `Error: ${r.error}` : r.actual;
    return {
      testIndex: i + 1,
      passed: !r.error && outputsMatch(r.actual, tc.expectedOutput),
      input: tc.isHidden && opts.mode === "submit" ? "Hidden test case" : tc.input,
      expected: tc.isHidden && opts.mode === "submit" ? "Hidden" : tc.expectedOutput,
      actual,
      logs: r.logs || undefined,
    };
  });
  const passedCount = testResults.filter((t) => t.passed).length;
  const firstError = run.results.find((r) => r.error)?.error;

  return {
    status:
      passedCount === cases.length ? "accepted" : firstError ? "runtime_error" : "wrong_answer",
    error: firstError,
    passedCount,
    totalCount: cases.length,
    testResults,
    runtimeMs: run.runtimeMs,
  };
}
