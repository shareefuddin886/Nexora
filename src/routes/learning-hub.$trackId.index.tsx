import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Clock,
  Code2,
  Layers,
  Target,
  type LucideIcon,
} from "lucide-react";
import { ProgressBar, SectionLabel } from "@/components/dsa/DsaUi";
import { TRACK_ICONS } from "@/components/tracks/track-icons";
import { useTrackProgress } from "@/hooks/useTrackProgress";
import { getTrack, trackLessons, trackStats } from "@/lib/tracks";
import { tint } from "@/lib/module-tones";

export const Route = createFileRoute("/learning-hub/$trackId/")({
  head: ({ params }) => ({
    meta: [
      { title: `${getTrack(params.trackId)?.title ?? "Learning path"} — Nexora Learning Hub` },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { trackId } = Route.useParams();
  const track = getTrack(trackId);
  const { lessonProgress, trackSummary } = useTrackProgress();

  if (!track) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 pb-20 pt-32 text-center">
        <h1 className="text-2xl font-bold text-foreground">Path not found</h1>
        <p className="text-sm text-muted-foreground">This learning path doesn't exist.</p>
        <Link
          to="/learning-hub"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the Learning Hub
        </Link>
      </div>
    );
  }

  const Icon = TRACK_ICONS[track.icon];

  if (track.status === "soon") {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-12 md:px-8">
        <Link
          to="/learning-hub"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Learning Hub
        </Link>
        <div className="mt-8 rounded-3xl border border-border/60 bg-surface/40 p-8 md:p-10">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{ background: tint(track.tone, 0.15), color: track.tone }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Coming soon
            </span>
          </div>
          <h1
            className="mt-6 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {track.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{track.description}</p>
          <div className="mt-6">
            <SectionLabel>What you'll be able to do</SectionLabel>
            <ul className="mt-3 space-y-2">
              {track.outcomes.map((o) => (
                <li key={o} className="flex gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: track.tone }} />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const stats = trackStats(track);
  const summary = trackSummary(track.id);
  const refs = trackLessons(track);
  const next = summary.next;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-10 md:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/learning-hub" className="transition hover:text-foreground">
          Learning Hub
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{track.title}</span>
      </nav>

      {/* Hero */}
      <section
        className="relative mt-6 overflow-hidden rounded-3xl border bg-surface/40 backdrop-blur"
        style={{ borderColor: tint(track.tone, 0.35) }}
      >
        <div
          className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: track.tone }}
        />
        <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl"
                style={{ background: tint(track.tone, 0.16), color: track.tone }}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                {track.level}
              </span>
            </div>
            <h1
              className="mt-5 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {track.title}
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{track.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact icon={Layers} value={stats.modules} label="Modules" tone={track.tone} />
              <Fact icon={BookOpen} value={stats.lessons} label="Lessons" tone={track.tone} />
              <Fact
                icon={Code2}
                value={stats.exercises}
                label="Coding exercises"
                tone={track.tone}
              />
              <Fact
                icon={Clock}
                value={`${Math.round(stats.minutes / 60)}h`}
                label="Study time"
                tone={track.tone}
              />
            </div>

            {next && (
              <Link
                to="/learning-hub/$trackId/$lessonId"
                params={{ trackId: track.id, lessonId: next.lesson.id }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                style={{ background: "var(--gradient-gold)" }}
              >
                <BookOpen className="h-4 w-4" />
                {summary.started ? "Continue" : "Start the path"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-border/60 bg-background/50 p-5 md:p-6">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: track.tone }}
              >
                Your progress
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold tabular-nums">{summary.percent}%</span>
                <span className="pb-2 text-sm text-muted-foreground">
                  {summary.completed} of {summary.total} lessons
                </span>
              </div>
              <ProgressBar percent={summary.percent} className="mt-3" />
              {next ? (
                <p className="mt-3 truncate text-sm text-muted-foreground">
                  Up next: <span className="font-medium text-foreground">{next.lesson.title}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm font-medium text-emerald-400">
                  Path complete. Well done!
                </p>
              )}
            </div>
            <div>
              <SectionLabel>You will be able to</SectionLabel>
              <ul className="mt-3 space-y-2">
                {track.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-sm text-foreground/90">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: track.tone }} />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Before you start:</span>{" "}
              {track.prerequisites.join(" · ")}
            </p>
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="mt-12 space-y-6">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Syllabus
        </h2>
        {track.modules.map((module, mi) => {
          const lessons = refs.filter((r) => r.moduleIndex === mi);
          const done = lessons.filter(
            (r) => lessonProgress(track.id, r.lesson.id).completed,
          ).length;
          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-surface/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.14em]"
                    style={{ color: track.tone }}
                  >
                    Module {mi + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{module.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{module.summary}</p>
                </div>
                <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs tabular-nums text-muted-foreground">
                  {done}/{lessons.length} done
                </span>
              </div>
              <ul className="divide-y divide-border/50">
                {lessons.map(({ lesson, index }) => {
                  const p = lessonProgress(track.id, lesson.id);
                  const inProgress = !p.completed && (p.quizPassed || p.practiceDone);
                  return (
                    <li key={lesson.id}>
                      <Link
                        to="/learning-hub/$trackId/$lessonId"
                        params={{ trackId: track.id, lessonId: lesson.id }}
                        className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-surface/60"
                      >
                        {p.completed ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                        ) : inProgress ? (
                          <CircleDot className="h-5 w-5 shrink-0" style={{ color: track.tone }} />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                        )}
                        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {lesson.minutes} min
                            </span>
                            <span>Quiz</span>
                            {lesson.practice && (
                              <span className="inline-flex items-center gap-1">
                                <Code2 className="h-3 w-3" /> Coding exercise
                              </span>
                            )}
                            <span>Interview prep</span>
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Fact({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <Icon className="h-4 w-4" style={{ color: tone }} />
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
