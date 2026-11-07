import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Code2,
  MessagesSquare,
} from "lucide-react";
import { toast } from "sonner";
import { LevelQuiz } from "@/components/LevelQuiz";
import { SectionLabel } from "@/components/dsa/DsaUi";
import { ProblemWorkspace } from "@/components/workspace/ProblemWorkspace";
import { exerciseProblem } from "@/components/workspace/problem-adapters";
import { InterviewPrep, LessonArticle } from "@/components/tracks/TrackUi";
import { useTrackProgress } from "@/hooks/useTrackProgress";
import { getTrack, trackLessons } from "@/lib/tracks";

export const Route = createFileRoute("/learning-hub/$trackId/$lessonId")({
  head: ({ params }) => {
    const track = getTrack(params.trackId);
    const lesson =
      track && trackLessons(track).find((r) => r.lesson.id === params.lessonId)?.lesson;
    return {
      meta: [
        { title: lesson ? `${lesson.title} — ${track.shortTitle} — Nexora` : "Lesson — Nexora" },
      ],
    };
  },
  component: LessonPage,
});

type Tab = "learn" | "quiz" | "practice" | "interview";

function LessonPage() {
  const { trackId, lessonId } = Route.useParams();
  // Keyed so tabs, quiz and editor state reset when moving between lessons.
  return <LessonView key={`${trackId}/${lessonId}`} trackId={trackId} lessonId={lessonId} />;
}

function LessonView({ trackId, lessonId }: { trackId: string; lessonId: string }) {
  const { lessonProgress, markQuiz, markPractice } = useTrackProgress();
  const [tab, setTab] = useState<Tab>("learn");

  const track = getTrack(trackId);
  const refs = track && track.status === "available" ? trackLessons(track) : [];
  const ref = refs.find((r) => r.lesson.id === lessonId);

  if (!track || !ref) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 pb-20 pt-32 text-center">
        <h1 className="text-2xl font-bold text-foreground">Lesson not found</h1>
        <p className="text-sm text-muted-foreground">
          This lesson doesn't exist or isn't available yet.
        </p>
        <Link
          to="/learning-hub"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the Learning Hub
        </Link>
      </div>
    );
  }

  const { lesson, module, moduleIndex, index } = ref;
  const prev = index > 0 ? refs[index - 1] : null;
  const next = index < refs.length - 1 ? refs[index + 1] : null;
  const p = lessonProgress(trackId, lessonId);
  const moduleLessons = refs.filter((r) => r.moduleIndex === moduleIndex);

  const onQuizPass = (score: number) => {
    const percent = Math.round((score / lesson.quiz.questions.length) * 100);
    const updated = markQuiz(trackId, lessonId, percent, true);
    toast.success(
      updated.completed
        ? "Quiz passed. Lesson complete!"
        : lesson.practice
          ? "Quiz passed. Finish the coding exercise to complete the lesson."
          : "Quiz passed.",
    );
  };

  const onPracticeSolved = () => {
    const updated = markPractice(trackId, lessonId);
    if (updated.completed) toast.success("Lesson complete!");
    else toast.info("Exercise solved. Pass the quiz to complete the lesson.");
  };

  const tabs: { id: Tab; label: string; icon: typeof BookOpen; done?: boolean }[] = [
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Award, done: p.quizPassed },
    ...(lesson.practice
      ? [{ id: "practice" as const, label: "Practice", icon: Code2, done: p.practiceDone }]
      : []),
    { id: "interview", label: "Interview prep", icon: MessagesSquare },
  ];

  const requirements = [
    {
      label: `Pass the quiz (${lesson.quiz.passThreshold}/${lesson.quiz.questions.length})`,
      done: p.quizPassed,
      tab: "quiz" as Tab,
    },
    ...(lesson.practice
      ? [{ label: "Solve the coding exercise", done: p.practiceDone, tab: "practice" as Tab }]
      : []),
  ];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-10 md:px-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/learning-hub" className="transition hover:text-foreground">
          Learning Hub
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          to="/learning-hub/$trackId"
          params={{ trackId }}
          className="transition hover:text-foreground"
        >
          {track.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{module.title}</span>
      </nav>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.14em]" style={{ color: track.tone }}>
            Module {moduleIndex + 1} · {module.title}
          </span>
          <span>
            Lesson {index + 1} of {refs.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {lesson.minutes} min
          </span>
          {p.completed && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {lesson.title}
        </h1>
      </header>

      <div className="mt-8 border-b border-border/70">
        <div className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
          {tabs.map(({ id, label, icon: Icon, done }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition ${
                tab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {tab === "practice" && lesson.practice ? (
        <div className="mt-8">
          <ProblemWorkspace
            problem={exerciseProblem(`${trackId}/${lessonId}`, lesson.practice)}
            solved={p.practiceDone}
            onAccepted={onPracticeSolved}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_290px]">
          <main className="min-w-0">
            {tab === "learn" && (
              <LessonArticle
                lesson={lesson}
                footer={
                  <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">Check your understanding</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.quiz.questions.length} questions · pass with{" "}
                        {lesson.quiz.passThreshold} correct
                      </p>
                    </div>
                    <button
                      onClick={() => setTab("quiz")}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                      style={{ background: "var(--gradient-gold)" }}
                    >
                      Take the quiz <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                }
              />
            )}

            {tab === "quiz" && (
              <div className="space-y-6">
                <LevelQuiz
                  questions={lesson.quiz.questions}
                  passThreshold={lesson.quiz.passThreshold}
                  onPass={onQuizPass}
                  isAlreadyPassed={p.quizPassed}
                />
                {p.quizPassed && (
                  <button
                    onClick={() => setTab(lesson.practice ? "practice" : "interview")}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary"
                  >
                    {lesson.practice
                      ? "Continue to the coding exercise"
                      : "Continue to interview prep"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {tab === "interview" && <InterviewPrep items={lesson.interview} />}
          </main>

          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <SectionLabel>To complete this lesson</SectionLabel>
              <ul className="mt-3 space-y-2">
                {requirements.map((r) => (
                  <li key={r.label}>
                    <button
                      onClick={() => setTab(r.tab)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm transition hover:bg-surface"
                    >
                      {r.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={
                          r.done ? "text-muted-foreground line-through" : "text-foreground"
                        }
                      >
                        {r.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionLabel>In this module</SectionLabel>
              <div className="mt-3 space-y-1">
                {moduleLessons.map((r) => {
                  const done = lessonProgress(trackId, r.lesson.id).completed;
                  const active = r.lesson.id === lessonId;
                  return (
                    <Link
                      key={r.lesson.id}
                      to="/learning-hub/$trackId/$lessonId"
                      params={{ trackId, lessonId: r.lesson.id }}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                      )}
                      <span className="truncate">{r.lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="mt-12 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/learning-hub/$trackId/$lessonId"
            params={{ trackId, lessonId: prev.lesson.id }}
            className="group flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3 transition hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium text-foreground">
                {prev.lesson.title}
              </span>
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Link
            to="/learning-hub/$trackId/$lessonId"
            params={{ trackId, lessonId: next.lesson.id }}
            className="group flex items-center justify-end gap-3 rounded-xl border border-border/70 px-4 py-3 text-right transition hover:border-primary/50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">
                Next{next.moduleIndex !== moduleIndex ? ` · ${next.module.title}` : ""}
              </span>
              <span className="block truncate text-sm font-medium text-foreground">
                {next.lesson.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            to="/learning-hub/$trackId"
            params={{ trackId }}
            className="group flex items-center justify-end gap-3 rounded-xl border border-border/70 px-4 py-3 text-right transition hover:border-primary/50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Finished the path?</span>
              <span className="block truncate text-sm font-medium text-foreground">
                Back to the syllabus
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
          </Link>
        )}
      </div>
    </div>
  );
}
