import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { ProgressBar } from "@/components/dsa/DsaUi";
import { ProblemWorkspace } from "@/components/workspace/ProblemWorkspace";
import { dsaProblem } from "@/components/workspace/problem-adapters";
import { useDsaProgress } from "@/hooks/useDsaProgress";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import { dsaTopics, type CodingChallenge, type DsaLevel } from "@/lib/dsa-curriculum";
import { groupedProblems, leetcodeProblemUrl, problemsForTopic } from "@/lib/dsa-problems";

type Difficulty = "All" | "Easy" | "Medium" | "Hard";

const DIFFICULTY_TEXT = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

/** One row in the sheet: a bank problem (own page) or a lesson challenge (opens inline). */
interface Row {
  key: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern?: string;
  solved: boolean;
  leetcode?: string | null;
  bankId?: string;
  lesson?: { topicId: string; level: DsaLevel; challenge: CodingChallenge };
}

const slugFromUrl = (url?: string) => url?.match(/leetcode\.com\/problems\/([^/]+)/)?.[1];

/**
 * DSA problem sheet in the style of Striver's A2Z sheet: one step per topic with
 * progress, problems grouped into sub-sections, and every problem judged in-app.
 */
export function InteractiveDsaStudio() {
  const { progress, markCodingCompleted } = useDsaProgress();
  const { isSolved } = useSolvedProblems();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("All");
  const [open, setOpen] = useState<Record<string, boolean>>({ arrays: true });
  const [lessonOpen, setLessonOpen] = useState<Row["lesson"] | null>(null);

  const steps = useMemo(() => {
    return [...dsaTopics]
      .sort((a, b) => a.order - b.order)
      .map((topic) => {
        const bankIds = new Set(problemsForTopic(topic.id).map((p) => p.id));
        const groups: { group: string; rows: Row[] }[] = groupedProblems(topic.id).map(
          ({ group, problems }) => ({
            group,
            rows: problems.map((p) => ({
              key: p.id,
              title: p.title,
              difficulty: p.difficulty,
              pattern: p.pattern,
              solved: isSolved(p.id),
              leetcode: leetcodeProblemUrl(p),
              bankId: p.id,
            })),
          }),
        );
        const lessonRows: Row[] = topic.levels
          .filter((l) => l.codingChallenge)
          .filter(
            (l) => !bankIds.has(slugFromUrl(l.codingChallenge!.externalLinks?.[0]?.url) ?? ""),
          )
          .map((l) => ({
            key: l.codingChallenge!.id,
            title: l.codingChallenge!.title,
            difficulty: l.codingChallenge!.difficulty,
            pattern: `Lesson: ${l.title}`,
            solved: Boolean(progress.completedLevels[`${topic.id}_${l.id}`]?.codingCompleted),
            leetcode: l.codingChallenge!.externalLinks?.[0]?.url ?? null,
            lesson: { topicId: topic.id, level: l, challenge: l.codingChallenge! },
          }));
        if (lessonRows.length) groups.push({ group: "Lesson challenges", rows: lessonRows });
        const rows = groups.flatMap((g) => g.rows);
        return {
          topic,
          groups,
          total: rows.length,
          solved: rows.filter((r) => r.solved).length,
          rows,
        };
      });
  }, [isSolved, progress.completedLevels]);

  const workspaceProblem = useMemo(
    () => (lessonOpen ? dsaProblem(lessonOpen.challenge, lessonOpen.level) : null),
    [lessonOpen],
  );

  if (lessonOpen && workspaceProblem) {
    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setLessonOpen(null)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the sheet
          </button>
          <Link
            to="/learning-hub/dsa/$topicId/$levelId"
            params={{ topicId: lessonOpen.topicId, levelId: lessonOpen.level.id }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" /> Study the lesson: {lessonOpen.level.title}
          </Link>
        </div>
        <ProblemWorkspace
          problem={workspaceProblem}
          solved={Boolean(
            progress.completedLevels[`${lessonOpen.topicId}_${lessonOpen.level.id}`]
              ?.codingCompleted,
          )}
          onAccepted={(code) => {
            markCodingCompleted(lessonOpen.topicId, lessonOpen.level.id, code);
            toast.success("Marked as solved in your DSA progress.");
          }}
        />
      </div>
    );
  }

  const allRows = steps.flatMap((s) => s.rows);
  const byDiff = (d: Row["difficulty"]) => {
    const rows = allRows.filter((r) => r.difficulty === d);
    return { solved: rows.filter((r) => r.solved).length, total: rows.length };
  };
  const totalSolved = allRows.filter((r) => r.solved).length;
  const q = query.trim().toLowerCase();
  const matches = (r: Row) =>
    (difficulty === "All" || r.difficulty === difficulty) &&
    (!q || r.title.toLowerCase().includes(q) || (r.pattern ?? "").toLowerCase().includes(q));
  const filtering = q !== "" || difficulty !== "All";

  return (
    <div className="space-y-6">
      {/* Header + overall progress */}
      <div className="grid gap-4 rounded-2xl border border-border/60 bg-surface/40 p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
        <div>
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DSA Problem Sheet
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Step-by-step problems, each judged in the LeetCode-style editor with a full editorial:
            brute force, better and optimal approaches, dry runs, and code in JavaScript, Python,
            Java and C++.
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{totalSolved}</span>
            <span className="pb-1 text-sm text-muted-foreground">/ {allRows.length} solved</span>
          </div>
          <ProgressBar
            percent={allRows.length ? (totalSolved / allRows.length) * 100 : 0}
            className="mt-2 max-w-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 self-center">
          {(["Easy", "Medium", "Hard"] as const).map((d) => {
            const s = byDiff(d);
            return (
              <div
                key={d}
                className="rounded-xl border border-border/50 bg-background/40 p-3 text-center"
              >
                <p className={`text-xs font-semibold ${DIFFICULTY_TEXT[d]}`}>{d}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {s.solved}
                  <span className="text-sm font-normal text-muted-foreground">/{s.total}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems or patterns"
            aria-label="Search problems"
            className="w-64 rounded-lg border border-border/70 bg-surface/60 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/60"
          />
        </div>
        <div className="flex rounded-lg border border-border/70 bg-surface/60 p-0.5">
          {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition ${
                difficulty === d
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(({ topic, groups, total, solved }, i) => {
          const visibleGroups = groups
            .map((g) => ({ ...g, rows: g.rows.filter(matches) }))
            .filter((g) => g.rows.length > 0);
          if (filtering && visibleGroups.length === 0) return null;
          const isOpen = filtering || open[topic.id];
          return (
            <section
              key={topic.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-surface/30"
            >
              <button
                onClick={() => setOpen((o) => ({ ...o, [topic.id]: !o[topic.id] }))}
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:bg-surface/50"
                aria-expanded={isOpen}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Step {i + 1}
                  </span>
                  <span className="block truncate font-semibold text-foreground">
                    {topic.title}
                  </span>
                </span>
                <span className="hidden w-40 sm:block">
                  <ProgressBar percent={total ? (solved / total) * 100 : 0} />
                </span>
                <span className="w-14 text-right text-sm tabular-nums text-muted-foreground">
                  {solved}/{total}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border/60">
                  {visibleGroups.map((g) => (
                    <div key={g.group}>
                      <p className="bg-surface/50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {g.group}
                      </p>
                      <ul className="divide-y divide-border/40">
                        {g.rows.map((r) => (
                          <li
                            key={r.key}
                            className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-surface/50"
                          >
                            {r.solved ? (
                              <CheckCircle2
                                className="h-4 w-4 shrink-0 text-emerald-400"
                                aria-label="Solved"
                              />
                            ) : (
                              <Circle
                                className="h-4 w-4 shrink-0 text-muted-foreground/40"
                                aria-label="Not solved"
                              />
                            )}
                            {r.bankId ? (
                              <Link
                                to="/learning-hub/dsa/problems/$problemId"
                                params={{ problemId: r.bankId }}
                                className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-primary"
                              >
                                {r.title}
                              </Link>
                            ) : (
                              <button
                                onClick={() => setLessonOpen(r.lesson!)}
                                className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium text-foreground hover:text-primary"
                              >
                                {r.title}
                              </button>
                            )}
                            <span className="hidden w-64 truncate text-xs text-muted-foreground lg:block">
                              {r.pattern}
                            </span>
                            <span
                              className={`w-16 text-xs font-semibold ${DIFFICULTY_TEXT[r.difficulty]}`}
                            >
                              {r.difficulty}
                            </span>
                            {r.leetcode ? (
                              <a
                                href={r.leetcode}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${r.title} on LeetCode`}
                                title="Open on LeetCode"
                                className="text-muted-foreground transition hover:text-primary"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="w-3.5" />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
