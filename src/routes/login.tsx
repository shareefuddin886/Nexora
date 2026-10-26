import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, BrainCircuit, FileText, MessagesSquare, type LucideIcon } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { TONES, tint } from "@/lib/module-tones";

type LoginSearch = { redirect?: string; mode?: "signin" | "signup" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    // Only same-site paths, never a full URL (prevents open redirects).
    redirect:
      typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//")
        ? s.redirect
        : undefined,
    mode: s.mode === "signup" ? "signup" : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Nexora" }] }),
  component: LoginPage,
});

const FEATURES: { icon: LucideIcon; tone: string; title: string; text: string }[] = [
  {
    icon: BookOpen,
    tone: TONES.dsa,
    title: "DSA Learning Hub",
    text: "16 topics, quizzes and a built-in code editor",
  },
  {
    icon: BrainCircuit,
    tone: TONES.assess,
    title: "AI Skill Assessments",
    text: "Find your level in Java, React, SQL and more",
  },
  {
    icon: MessagesSquare,
    tone: TONES.interview,
    title: "AI Mock Interviews",
    text: "Technical & HR practice with a full report",
  },
  {
    icon: FileText,
    tone: TONES.resume,
    title: "Resume Builder & Review",
    text: "ATS-ready resume and instant feedback",
  },
];

function LoginPage() {
  const { mode } = Route.useSearch();

  // After sign-in the AuthGate in __root sends the user on to `redirect`.
  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />

      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 p-12 lg:flex lg:flex-col xl:p-16">
        <div
          className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, oklch(0.82 0.14 82 / 0.35), transparent 65%)",
          }}
        />
        <Logo />
        <div className="relative mt-auto mb-auto max-w-lg pt-16">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            Get placement-ready, <span className="text-gradient-gold">one skill at a time.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground">
            Learn, test yourself and practise interviews — every result saved to your own dashboard.
          </p>
          <ul className="mt-10 space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/40 p-4 backdrop-blur"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: tint(f.tone, 0.14), color: f.tone }}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{f.title}</span>
                  <span className="block text-sm text-muted-foreground">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nexora · AI career platform for students
        </p>
      </aside>

      {/* Form */}
      <section className="flex flex-col px-5 py-8 sm:px-8 lg:justify-center lg:px-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto mt-10 w-full max-w-[420px] lg:mt-0">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 shadow-card backdrop-blur-xl sm:p-8">
            <AuthForm defaultMode={mode ?? "signin"} />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to use Nexora responsibly. Your data is private to your account.
          </p>
        </div>
      </section>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative flex items-center gap-3">
      <span
        className="grid h-11 w-11 place-items-center rounded-xl text-xl font-black text-primary-foreground shadow-glow"
        style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
      >
        N
      </span>
      <span className="leading-tight">
        <span
          className="block text-sm font-bold tracking-[0.18em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NEXORA
        </span>
        <span className="block text-[10px] font-semibold tracking-[0.2em] text-primary">
          AI CAREER PLATFORM
        </span>
      </span>
    </div>
  );
}
