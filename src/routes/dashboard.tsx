import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  Loader2,
  MessagesSquare,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { dsaTopics, getAllLevels } from "@/lib/dsa-curriculum";
import { TONES, tint } from "@/lib/module-tones";
import { AuthModal } from "@/components/AuthModal";
import { Achievements } from "@/components/Achievements";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Nexora" }] }),
  component: DashboardPage,
});

type DashboardData = {
  assessments: Tables<"skill_assessments">[];
  assessmentResults: Pick<Tables<"assessment_results">, "weak_topics">[];
  interviews: Tables<"mock_interviews">[];
  interviewReports: Pick<Tables<"interview_reports">, "strengths" | "weaknesses">[];
  dsaLevels: Tables<"dsa_level_progress">[];
  dsaAttempts: Tables<"dsa_quiz_attempts">[];
  solved: Tables<"dsa_solved_problems">[];
  reviews: Pick<Tables<"resume_reviews">, "id" | "file_name" | "overall_score" | "created_at">[];
  resumes: Pick<Tables<"resumes">, "id" | "updated_at">[];
};

async function loadDashboard(userId: string): Promise<DashboardData> {
  const own = <T,>(q: { data: T[] | null; error: unknown }) => {
    if (q.error) console.warn("Dashboard query failed", q.error);
    return q.data ?? [];
  };
  const [a, ar, i, ir, dl, da, s, rv, rs] = await Promise.all([
    supabase.from("skill_assessments").select("*").eq("user_id", userId).order("completed_at"),
    supabase.from("assessment_results").select("weak_topics").eq("user_id", userId),
    supabase.from("mock_interviews").select("*").eq("user_id", userId).order("completed_at"),
    supabase.from("interview_reports").select("strengths, weaknesses").eq("user_id", userId),
    supabase.from("dsa_level_progress").select("*").eq("user_id", userId),
    supabase.from("dsa_quiz_attempts").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("dsa_solved_problems").select("*").eq("user_id", userId),
    supabase
      .from("resume_reviews")
      .select("id, file_name, overall_score, created_at")
      .eq("user_id", userId)
      .order("created_at"),
    supabase.from("resumes").select("id, updated_at").eq("user_id", userId),
  ]);
  return {
    assessments: own(a),
    assessmentResults: own(ar),
    interviews: own(i),
    interviewReports: own(ir),
    dsaLevels: own(dl),
    dsaAttempts: own(da),
    solved: own(s),
    reviews: own(rv),
    resumes: own(rs),
  };
}

// "hr" -> "HR", "technical" -> "Technical"; other text keeps its own casing.
const label = (s: string) =>
  s.toLowerCase() === "hr" ? "HR" : s.charAt(0).toUpperCase() + s.slice(1);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const avg = (xs: number[]) =>
  xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null;

// Most frequent labels across JSON arrays of strings or {topic|title|name} objects.
function tally(lists: unknown[], limit = 6): [string, number][] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const obj = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
      const label =
        typeof item === "string" ? item : String(obj?.topic ?? obj?.title ?? obj?.name ?? "");
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, limit);
}

// Consecutive days (ending today or yesterday) with any activity.
function streak(dates: string[]) {
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(cursor.toDateString())) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuthUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    void loadDashboard(user.id).then(setData);
  }, [user]);

  const view = useMemo(() => {
    if (!data) return null;
    const allLevels = getAllLevels();
    const doneKeys = new Set(
      data.dsaLevels.filter((l) => l.completed).map((l) => `${l.topic_id}_${l.level_id}`),
    );
    const activityDates = [
      ...data.assessments.map((x) => x.completed_at),
      ...data.interviews.map((x) => x.completed_at),
      ...data.dsaAttempts.map((x) => x.created_at),
      ...data.solved.map((x) => x.solved_at),
      ...data.reviews.map((x) => x.created_at),
    ].sort();

    const byTech = new Map<string, number[]>();
    for (const a of data.assessments) {
      byTech.set(a.technology, [...(byTech.get(a.technology) ?? []), Number(a.score ?? 0)]);
    }

    const recent = [
      ...data.assessments.map((x) => ({
        at: x.completed_at,
        icon: BrainCircuit,
        tone: TONES.assess,
        text: `${x.technology} assessment · ${x.difficulty}`,
        score: x.score,
      })),
      ...data.interviews.map((x) => ({
        at: x.completed_at,
        icon: MessagesSquare,
        tone: TONES.interview,
        text: `${label(x.interview_type)} mock interview · ${x.difficulty}`,
        score: x.score,
      })),
      ...data.dsaAttempts.map((x) => ({
        at: x.created_at,
        icon: BookOpen,
        tone: TONES.dsa,
        text: `${dsaTopics.find((t) => t.id === x.topic_id)?.title ?? x.topic_id} quiz ${x.passed ? "passed" : "attempted"}`,
        score: x.score,
      })),
      ...data.reviews.map((x) => ({
        at: x.created_at,
        icon: ScanSearch,
        tone: TONES.resume,
        text: `Resume review · ${x.file_name ?? "resume"}`,
        score: x.overall_score,
      })),
    ]
      .sort((x, y) => y.at.localeCompare(x.at))
      .slice(0, 6);

    const assessScores = data.assessments.map((a) => Number(a.score ?? 0));
    const interviewScores = data.interviews.map((a) => Number(a.score ?? 0));
    const atsScores = data.reviews.map((r) => Number(r.overall_score ?? 0));

    return {
      levelsDone: doneKeys.size,
      totalLevels: allLevels.length,
      nextLevel: allLevels.find((l) => !doneKeys.has(`${l.topicId}_${l.level.id}`)),
      streak: streak(activityDates),
      lastActive: activityDates.at(-1) ?? null,
      quizAccuracy: avg(data.dsaAttempts.map((x) => Number(x.score))),
      topics: dsaTopics.map((t) => ({
        id: t.id,
        title: t.title,
        done: t.levels.filter((lvl) => doneKeys.has(`${t.id}_${lvl.id}`)).length,
        total: t.levels.length,
      })),
      assessTrend: data.assessments.map((a) => ({
        date: fmtDate(a.completed_at),
        score: Number(a.score ?? 0),
        label: a.technology,
      })),
      assessAvg: avg(assessScores),
      techRows: [...byTech.entries()].map(([tech, scores]) => ({
        tech,
        attempts: scores.length,
        best: Math.max(...scores),
        latest: scores[scores.length - 1],
      })),
      weakTopics: tally(data.assessmentResults.map((r) => r.weak_topics)),
      interviewTrend: data.interviews.map((x) => ({
        date: fmtDate(x.completed_at),
        score: Number(x.score ?? 0),
        label: label(x.interview_type),
      })),
      interviewAvg: avg(interviewScores),
      strengths: tally(
        data.interviewReports.map((r) => r.strengths),
        4,
      ),
      weaknesses: tally(
        data.interviewReports.map((r) => r.weaknesses),
        4,
      ),
      reviewTrend: data.reviews.map((x) => ({
        date: fmtDate(x.created_at),
        score: Number(x.overall_score ?? 0),
        label: x.file_name ?? "Resume",
      })),
      bestAts: atsScores.length ? Math.max(...atsScores) : null,
      recent,
    };
  }, [data]);

  if (authLoading) return <CenteredSpinner />;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Your progress dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to see your scores, progress and activity across every Nexora feature.
        </p>
        <button
          onClick={() => setAuthOpen(true)}
          className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          Sign In
        </button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  if (!data || !view) return <CenteredSpinner />;

  const name = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      {/* Header */}
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {view.streak > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: tint(TONES.dsa, 0.12), color: TONES.dsa }}
              >
                <Flame className="h-3.5 w-3.5" /> {view.streak}-day streak
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {view.lastActive ? `Last active ${fmtDate(view.lastActive)}` : "No activity yet"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/skill-assessment"
            className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-medium hover:border-primary/50"
          >
            <BrainCircuit className="h-4 w-4" /> Take an assessment
          </Link>
          {view.nextLevel && (
            <Link
              to="/learning-hub/dsa/$topicId/$levelId"
              params={{ topicId: view.nextLevel.topicId, levelId: view.nextLevel.level.id }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              Continue learning <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {/* Summary tiles */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          tone={TONES.dsa}
          icon={BookOpen}
          label="DSA levels"
          value={`${view.levelsDone}`}
          unit={`/ ${view.totalLevels}`}
          percent={(view.levelsDone / view.totalLevels) * 100}
          sub={`${data.solved.length} problems solved`}
        />
        <StatTile
          tone={TONES.assess}
          icon={BrainCircuit}
          label="Assessments"
          value={`${data.assessments.length}`}
          unit={data.assessments.length === 1 ? "test" : "tests"}
          percent={view.assessAvg ?? 0}
          sub={view.assessAvg !== null ? `Average ${view.assessAvg}%` : "No tests yet"}
        />
        <StatTile
          tone={TONES.interview}
          icon={MessagesSquare}
          label="Mock interviews"
          value={`${data.interviews.length}`}
          unit={data.interviews.length === 1 ? "session" : "sessions"}
          percent={view.interviewAvg ?? 0}
          sub={view.interviewAvg !== null ? `Average ${view.interviewAvg}%` : "No sessions yet"}
        />
        <StatTile
          tone={TONES.resume}
          icon={FileText}
          label="Resume"
          value={view.bestAts !== null ? `${view.bestAts}` : "—"}
          unit={view.bestAts !== null ? "best ATS" : ""}
          percent={view.bestAts ?? 0}
          sub={`${data.resumes.length ? "Resume built" : "Not built yet"} · ${data.reviews.length} ${data.reviews.length === 1 ? "review" : "reviews"}`}
        />
      </section>

      {/* Continue learning */}
      {view.nextLevel && (
        <Link
          to="/learning-hub/dsa/$topicId/$levelId"
          params={{ topicId: view.nextLevel.topicId, levelId: view.nextLevel.level.id }}
          className="group mt-4 flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/50 p-4 transition hover:border-primary/50 md:p-5"
          style={{
            backgroundImage: `linear-gradient(90deg, ${tint(TONES.dsa, 0.1)}, transparent 60%)`,
          }}
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: tint(TONES.dsa, 0.15), color: TONES.dsa }}
          >
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Up next in your DSA roadmap</p>
            <p className="truncate font-medium">
              {view.nextLevel.topic.title} · {view.nextLevel.level.title}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-sm font-semibold text-primary sm:inline-flex">
            Start lesson <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      <Achievements
        stats={{
          lessonsDone: view.levelsDone,
          bestQuiz: Math.max(0, ...data.dsaAttempts.map((x) => Number(x.score))),
          problemsSolved: data.solved.length,
          assessments: data.assessments.length,
          bestAssessment: Math.max(0, ...data.assessments.map((x) => Number(x.score ?? 0))),
          interviews: data.interviews.length,
          bestAts: view.bestAts ?? 0,
          streak: view.streak,
        }}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Skill assessments */}
        <Panel tone={TONES.assess} icon={BrainCircuit} title="Skill assessments">
          {data.assessments.length === 0 ? (
            <EmptyState
              tone={TONES.assess}
              icon={BrainCircuit}
              text="Find out where you stand with a 10-minute AI skill test."
              cta="Take your first test"
              to="/skill-assessment"
            />
          ) : (
            <>
              <ScoreTrend points={view.assessTrend} tone={TONES.assess} />
              <table className="mt-5 w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Technology</th>
                    <th className="pb-2 text-right font-medium">Tests</th>
                    <th className="pb-2 text-right font-medium">Best</th>
                    <th className="pb-2 text-right font-medium">Latest</th>
                  </tr>
                </thead>
                <tbody>
                  {view.techRows.map((r) => (
                    <tr key={r.tech} className="border-t border-border/50">
                      <td className="py-2.5">{r.tech}</td>
                      <td className="py-2.5 text-right tabular-nums">{r.attempts}</td>
                      <td className="py-2.5 text-right tabular-nums">{r.best}%</td>
                      <td
                        className="py-2.5 text-right font-semibold tabular-nums"
                        style={{ color: TONES.assess }}
                      >
                        {r.latest}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {view.weakTopics.length > 0 && (
                <ChipList title="Topics to work on" items={view.weakTopics} tone="#f87171" />
              )}
            </>
          )}
        </Panel>

        {/* Mock interviews */}
        <Panel tone={TONES.interview} icon={MessagesSquare} title="Mock interviews">
          {data.interviews.length === 0 ? (
            <EmptyState
              tone={TONES.interview}
              icon={MessagesSquare}
              text="Practise a technical or HR interview and get a full feedback report."
              cta="Start your first interview"
              to="/mock-interview"
            />
          ) : (
            <>
              <ScoreTrend points={view.interviewTrend} tone={TONES.interview} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ChipList title="Strengths" items={view.strengths} tone="#34d399" />
                <ChipList title="To improve" items={view.weaknesses} tone="#f87171" />
              </div>
            </>
          )}
        </Panel>

        {/* DSA */}
        <Panel tone={TONES.dsa} icon={BookOpen} title="DSA learning hub" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Levels done" value={`${view.levelsDone}/${view.totalLevels}`} />
            <MiniStat
              label="Avg. quiz score"
              value={view.quizAccuracy !== null ? `${view.quizAccuracy}%` : "—"}
            />
            <MiniStat label="Problems solved" value={`${data.solved.length}`} />
          </div>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {view.topics.map((t, idx) => (
              <li key={t.id}>
                <Link
                  to="/learning-hub/dsa"
                  className="group flex items-center gap-3 rounded-lg py-1"
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate group-hover:text-foreground text-foreground/90">
                        {t.title}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {t.done === t.total ? (
                          <CheckCircle2 className="h-4 w-4" style={{ color: "#34d399" }} />
                        ) : (
                          `${t.done}/${t.total}`
                        )}
                      </span>
                    </span>
                    <ProgressBar
                      percent={(t.done / t.total) * 100}
                      tone={TONES.dsa}
                      className="mt-1.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Resume */}
        <Panel tone={TONES.resume} icon={FileText} title="Resume">
          {data.reviews.length === 0 ? (
            <EmptyState
              tone={TONES.resume}
              icon={ScanSearch}
              text={
                data.resumes.length
                  ? "Your resume is built. Get an ATS score and concrete fixes."
                  : "Build an ATS-friendly resume, then get it reviewed."
              }
              cta={data.resumes.length ? "Review your resume" : "Build your resume"}
              to={data.resumes.length ? "/resume-review" : "/resume-builder"}
            />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Resume built" value={data.resumes.length ? "Yes" : "No"} />
                <MiniStat label="Reviews" value={`${data.reviews.length}`} />
                <MiniStat label="Best ATS" value={`${view.bestAts}`} />
              </div>
              <ScoreTrend points={view.reviewTrend} tone={TONES.resume} className="mt-5" />
            </>
          )}
        </Panel>

        {/* Recent activity */}
        <Panel tone="#9aa4b6" icon={Clock3} title="Recent activity">
          {view.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your tests, interviews, quizzes and reviews will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {view.recent.map((r, idx) => (
                <li key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{ background: tint(r.tone, 0.12), color: r.tone }}
                  >
                    <r.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{r.text}</span>
                  {r.score !== null && (
                    <span className="font-semibold tabular-nums" style={{ color: r.tone }}>
                      {Number(r.score)}%
                    </span>
                  )}
                  <span className="w-14 text-right text-xs text-muted-foreground">
                    {fmtDate(r.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </main>
  );
}

function CenteredSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function ProgressBar({
  percent,
  tone,
  className = "",
}: {
  percent: number;
  tone: string;
  className?: string;
}) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-white/[0.06] ${className}`}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: tone }}
      />
    </div>
  );
}

function StatTile({
  tone,
  icon: Icon,
  label,
  value,
  unit,
  percent,
  sub,
}: {
  tone: string;
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  percent: number;
  sub: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-4 md:p-5"
      style={{
        backgroundImage: `radial-gradient(240px 110px at 0% 0%, ${tint(tone, 0.09)}, transparent 70%)`,
      }}
    >
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: tone }} />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ background: tint(tone, 0.12), color: tone }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums md:text-3xl">{value}</span>
        <span className="text-xs text-muted-foreground md:text-sm">{unit}</span>
      </div>
      <ProgressBar percent={percent} tone={tone} className="mt-3" />
      <p className="mt-2 truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Panel({
  tone,
  icon: Icon,
  title,
  className = "",
  children,
}: {
  tone: string;
  icon: LucideIcon;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-border/60 bg-surface/40 p-5 md:p-6 ${className}`}
    >
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: tint(tone, 0.12), color: tone }}
        >
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="mt-5 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function EmptyState({
  tone,
  icon: Icon,
  text,
  cta,
  to,
}: {
  tone: string;
  icon: LucideIcon;
  text: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-6 py-10 text-center">
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ background: tint(tone, 0.12), color: tone }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 max-w-xs text-sm text-muted-foreground">{text}</p>
      <a
        href={to}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
        style={{ background: tint(tone, 0.15), color: tone }}
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function ChipList({
  title,
  items,
  tone,
}: {
  title: string;
  items: [string, number][];
  tone: string;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map(([label, count]) => (
          <span
            key={label}
            className="rounded-full px-2.5 py-1 text-xs"
            style={{ background: tint(tone, 0.1), color: tone }}
          >
            {label}
            {count > 1 && <span className="ml-1 opacity-70">×{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

type TrendPoint = { date: string; score: number; label: string };

// One result shows as a highlighted score; two or more as a line chart.
function ScoreTrend({
  points,
  tone,
  className = "",
}: {
  points: TrendPoint[];
  tone: string;
  className?: string;
}) {
  if (points.length === 0) return null;
  const last = points[points.length - 1];

  if (points.length === 1) {
    return (
      <div
        className={`flex items-center gap-4 rounded-xl border border-border/50 bg-background/40 p-4 ${className}`}
      >
        <span className="text-4xl font-bold tabular-nums" style={{ color: tone }}>
          {last.score}%
        </span>
        <span className="text-sm text-muted-foreground">
          <span className="block font-medium text-foreground">{last.label}</span>
          {last.date} · do another one to see your trend
        </span>
      </div>
    );
  }

  return (
    <div className={`h-48 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                  <div className="text-muted-foreground">
                    {(payload[0].payload as TrendPoint).label} ·{" "}
                    {(payload[0].payload as TrendPoint).date}
                  </div>
                  <div className="mt-0.5 font-semibold tabular-nums" style={{ color: tone }}>
                    {payload[0].value}%
                  </div>
                </div>
              ) : null
            }
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={tone}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: tone, strokeWidth: 0 }}
            activeDot={{ r: 5.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
