// Turns DSA challenges and Learning Hub exercises into LeetCode-style workspace problems.
import { Paragraphs, RichText } from "@/components/tracks/TrackUi";
import { ProblemEditorial, ProblemExtras } from "@/components/workspace/DsaEditorial";
import { leetcodeProblemUrl, type DsaProblem } from "@/lib/dsa-problems";
import type { WorkspaceProblem } from "@/components/workspace/ProblemWorkspace";
import type { RunnableLanguage } from "@/lib/code-runner";
import type { CodingChallenge, DsaLevel } from "@/lib/dsa-curriculum";
import { leetcodeStarter, paramNamesFrom, parseTsSignature } from "@/lib/problem-format";
import type { PracticeExercise } from "@/lib/tracks/types";

const RUNNABLE: RunnableLanguage[] = ["javascript", "typescript", "python"];

export function dsaProblem(challenge: CodingChallenge, level: DsaLevel): WorkspaceProblem {
  const ref = challenge.starterCode;
  const sig = parseTsSignature(ref.typescript, challenge.functionName);
  const paramNames =
    sig?.params.map((p) => p.name) ??
    paramNamesFrom([ref.javascript, ref.python], challenge.functionName);
  const starters: Partial<Record<RunnableLanguage, string>> = {};
  for (const lang of RUNNABLE) {
    starters[lang] = sig
      ? leetcodeStarter(lang, sig)
      : lang === "python"
        ? `def ${challenge.functionName}(${paramNames.join(", ")}):\n    \n`
        : `function ${challenge.functionName}(${paramNames.join(", ")}) {\n    \n}\n`;
  }
  const complexity = level.theory.sections.find((s) => s.complexity)?.complexity;
  return {
    id: `dsa/${challenge.id}`,
    title: challenge.title,
    difficulty: challenge.difficulty,
    statement: <Paragraphs text={challenge.description} />,
    examples: challenge.examples,
    constraints: challenge.constraints,
    hints: level.theory.sections.flatMap((s) => s.keyTakeaways ?? []).slice(0, 3),
    links: challenge.externalLinks?.map((l) => ({
      label: `${l.platform}: ${l.title}`,
      url: l.url,
    })),
    functionName: challenge.functionName,
    paramNames,
    languages: RUNNABLE,
    starters,
    referenceJs: ref.javascript,
    solutions: [
      { label: "JavaScript", code: ref.javascript },
      { label: "TypeScript", code: ref.typescript },
      { label: "Python", code: ref.python },
      { label: "Java", code: ref.java },
      { label: "C++", code: ref.cpp },
    ].filter((s) => s.code),
    editorial: (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Approach</h3>
        <p>
          <RichText text={level.theory.summary} />
        </p>
        {complexity && (
          <div className="grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2">
            <div className="bg-surface px-4 py-2.5">
              <span className="text-muted-foreground">Time </span>
              <span className="font-mono text-foreground">{complexity.time}</span>
            </div>
            <div className="bg-surface px-4 py-2.5">
              <span className="text-muted-foreground">Space </span>
              <span className="font-mono text-foreground">{complexity.space}</span>
            </div>
          </div>
        )}
      </div>
    ),
    testCases: challenge.testCases,
  };
}

const LABEL: Record<RunnableLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
};

export function exerciseProblem(id: string, ex: PracticeExercise): WorkspaceProblem {
  // Examples are written as calls, e.g. parseQuery("..."); show just the arguments.
  const stripCall = (input: string) =>
    input.startsWith(`${ex.functionName}(`) && input.endsWith(")")
      ? input.slice(ex.functionName.length + 1, -1)
      : input;
  return {
    id,
    title: ex.title,
    difficulty: ex.difficulty,
    statement: <Paragraphs text={ex.prompt} />,
    examples: ex.examples.map((e) => ({ ...e, input: stripCall(e.input) })),
    hints: ex.hints,
    functionName: ex.functionName,
    paramNames: paramNamesFrom(
      [ex.solution.typescript, ex.solution.javascript, ex.solution.python],
      ex.functionName,
    ),
    languages: ex.languages,
    starters: ex.starter,
    referenceJs: ex.solution.javascript ?? "",
    solutions: ex.languages
      .filter((l) => ex.solution[l])
      .map((l) => ({ label: LABEL[l], code: ex.solution[l]! })),
    // Exercises mark later tests hidden; everything before them is a visible sample.
    testCases: ex.testCases,
  };
}

/** A judged problem from the DSA problem bank, with its full Striver-style editorial. */
export function bankProblem(p: DsaProblem): WorkspaceProblem {
  const sig = { name: p.functionName, ...p.signature };
  const url = leetcodeProblemUrl(p);
  return {
    id: `dsa/${p.id}`,
    title: p.title,
    difficulty: p.difficulty,
    statement: <Paragraphs text={p.statement} />,
    examples: p.examples,
    constraints: p.constraints,
    hints: p.hints,
    tags: [p.pattern],
    extras: <ProblemExtras problem={p} />,
    links: url ? [{ label: `LeetCode ${p.leetcode}: ${p.title}`, url }] : undefined,
    functionName: p.functionName,
    paramNames: p.signature.params.map((x) => x.name),
    languages: RUNNABLE,
    starters: Object.fromEntries(RUNNABLE.map((lang) => [lang, leetcodeStarter(lang, sig)])),
    referenceJs:
      p.approaches.find((a) => a.name === "Optimal")?.code.javascript ??
      p.approaches[0].code.javascript,
    solutions: [],
    editorial: <ProblemEditorial problem={p} />,
    testCases: p.testCases,
  };
}
