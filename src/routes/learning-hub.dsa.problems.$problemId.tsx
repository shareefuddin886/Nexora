import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { ProblemWorkspace } from "@/components/workspace/ProblemWorkspace";
import { bankProblem } from "@/components/workspace/problem-adapters";
import { useSolvedProblems } from "@/hooks/useSolvedProblems";
import { dsaTopics } from "@/lib/dsa-curriculum";
import { getDsaProblem, problemsForTopic } from "@/lib/dsa-problems";

export const Route = createFileRoute("/learning-hub/dsa/problems/$problemId")({
  head: ({ params }) => {
    const p = getDsaProblem(params.problemId);
    return { meta: [{ title: p ? `${p.title} — DSA Practice — Nexora` : "Problem — Nexora" }] };
  },
  component: ProblemPage,
});

function ProblemPage() {
  const { problemId } = Route.useParams();
  const { isSolved, toggle } = useSolvedProblems();
  const problem = getDsaProblem(problemId);

  if (!problem) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 pb-20 pt-32 text-center">
        <h1 className="text-2xl font-bold text-foreground">Problem not found</h1>
        <p className="text-sm text-muted-foreground">This problem doesn't exist.</p>
        <Link
          to="/learning-hub/dsa"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to DSA
        </Link>
      </div>
    );
  }

  const topic = dsaTopics.find((t) => t.id === problem.topicId);
  const siblings = problemsForTopic(problem.topicId);
  const idx = siblings.findIndex((p) => p.id === problem.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const solvedInTopic = siblings.filter((p) => isSolved(p.id)).length;

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-10 pt-5 md:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/learning-hub" className="transition hover:text-foreground">
            Learning Hub
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/learning-hub/dsa" className="transition hover:text-foreground">
            DSA
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{topic?.title ?? problem.topicId}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{problem.group}</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            {topic?.title}: {solvedInTopic}/{siblings.length} solved
          </span>
          {prev ? (
            <Link
              to="/learning-hub/dsa/problems/$problemId"
              params={{ problemId: prev.id }}
              title={`Previous: ${prev.title}`}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : null}
          {next ? (
            <Link
              to="/learning-hub/dsa/problems/$problemId"
              params={{ problemId: next.id }}
              title={`Next: ${next.title}`}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <ProblemWorkspace
        key={problem.id}
        problem={bankProblem(problem)}
        solved={isSolved(problem.id)}
        onAccepted={() => {
          if (!isSolved(problem.id)) {
            toggle(problem.id);
            toast.success(`${problem.title} marked as solved.`);
          }
        }}
      />
    </div>
  );
}
