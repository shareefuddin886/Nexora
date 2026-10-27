import {
  Award,
  BookOpen,
  BrainCircuit,
  Code2,
  FileText,
  Flame,
  MessagesSquare,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { TONES, tint } from "@/lib/module-tones";

export type AchievementStats = {
  lessonsDone: number;
  bestQuiz: number;
  problemsSolved: number;
  assessments: number;
  bestAssessment: number;
  interviews: number;
  bestAts: number;
  streak: number;
};

type Badge = {
  icon: LucideIcon;
  tone: string;
  title: string;
  hint: string;
  current: number;
  goal: number;
};

// Badges are derived from the user's real activity — nothing extra is stored.
function badges(s: AchievementStats): Badge[] {
  return [
    {
      icon: BookOpen,
      tone: TONES.dsa,
      title: "First lesson",
      hint: "Complete a DSA lesson",
      current: s.lessonsDone,
      goal: 1,
    },
    {
      icon: Star,
      tone: TONES.dsa,
      title: "Quiz ace",
      hint: "Score 100% on a DSA quiz",
      current: s.bestQuiz,
      goal: 100,
    },
    {
      icon: Code2,
      tone: TONES.dsa,
      title: "Problem solver",
      hint: "Solve 10 practice problems",
      current: s.problemsSolved,
      goal: 10,
    },
    {
      icon: Trophy,
      tone: TONES.dsa,
      title: "Half century",
      hint: "Solve 50 practice problems",
      current: s.problemsSolved,
      goal: 50,
    },
    {
      icon: BrainCircuit,
      tone: TONES.assess,
      title: "Tested",
      hint: "Take your first skill assessment",
      current: s.assessments,
      goal: 1,
    },
    {
      icon: Target,
      tone: TONES.assess,
      title: "High scorer",
      hint: "Score 80%+ in an assessment",
      current: s.bestAssessment,
      goal: 80,
    },
    {
      icon: MessagesSquare,
      tone: TONES.interview,
      title: "Interview ready",
      hint: "Finish a mock interview",
      current: s.interviews,
      goal: 1,
    },
    {
      icon: FileText,
      tone: TONES.resume,
      title: "Resume pro",
      hint: "Reach an ATS score of 80",
      current: s.bestAts,
      goal: 80,
    },
    {
      icon: Flame,
      tone: "#fb923c",
      title: "On fire",
      hint: "Practise 3 days in a row",
      current: s.streak,
      goal: 3,
    },
    {
      icon: Award,
      tone: "#fb923c",
      title: "Week warrior",
      hint: "Practise 7 days in a row",
      current: s.streak,
      goal: 7,
    },
  ];
}

export function Achievements({ stats }: { stats: AchievementStats }) {
  const list = badges(stats);
  const unlocked = list.filter((b) => b.current >= b.goal).length;

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-surface/40 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: tint("#fb923c", 0.14), color: "#fb923c" }}
          >
            <Trophy className="h-4 w-4" />
          </span>
          Achievements
        </h2>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{unlocked}</span> / {list.length} unlocked
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(unlocked / list.length) * 100}%`,
            background: "var(--gradient-gold)",
          }}
        />
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((b) => {
          const done = b.current >= b.goal;
          // Counts show progress ("4/10"); score badges show the best so far.
          const progressText =
            b.goal <= 10 ? `${Math.min(b.current, b.goal)}/${b.goal}` : `${b.current}/${b.goal}`;
          return (
            <li
              key={b.title}
              title={b.hint}
              className={`relative rounded-2xl border p-3.5 transition ${done ? "" : "opacity-60"}`}
              style={
                done
                  ? {
                      borderColor: tint(b.tone, 0.45),
                      background: tint(b.tone, 0.08),
                      boxShadow: `0 0 24px -12px ${b.tone}`,
                    }
                  : { borderColor: "var(--border)" }
              }
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={
                  done
                    ? { background: tint(b.tone, 0.18), color: b.tone }
                    : { background: "var(--surface-2)", color: "var(--muted-foreground)" }
                }
              >
                <b.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">{b.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.hint}</p>
              <p
                className="mt-2 text-[11px] font-semibold tabular-nums"
                style={{ color: done ? b.tone : undefined }}
              >
                {done ? "Unlocked" : progressText}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
