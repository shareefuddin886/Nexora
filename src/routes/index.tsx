import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Rocket,
  ScanSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { HomeProgress } from "@/components/HomeProgress";
import { TONES, tint } from "@/lib/module-tones";

export const Route = createFileRoute("/")({
  component: Index,
});

const REVIEW_TONE = "#22d3ee";

type Feature = {
  icon: LucideIcon;
  tone: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  preview: ReactNode;
};

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    tone: TONES.dsa,
    title: "Learning Hub (DSA)",
    desc: "16 topics in a guided order — theory, concept quizzes, an in-browser code editor and curated practice problems.",
    href: "/learning-hub",
    cta: "Explore Learning Hub",
    preview: <CodePreview />,
  },
  {
    icon: BrainCircuit,
    tone: TONES.assess,
    title: "Skill Assessment",
    desc: "Adaptive MCQ, code and scenario questions across Java, React, SQL and more — with AI explanations.",
    href: "/skill-assessment",
    cta: "Test my skills",
    preview: <QuizPreview />,
  },
  {
    icon: MessagesSquare,
    tone: TONES.interview,
    title: "AI Mock Interview",
    desc: "Technical, HR or mixed. The interviewer adapts to your answers and gives a full report.",
    href: "/mock-interview",
    cta: "Start a mock interview",
    preview: <ChatPreview />,
  },
  {
    icon: FileText,
    tone: TONES.resume,
    title: "AI Resume Builder",
    desc: "ATS-friendly templates, AI-written bullet points with strong action verbs, and one-click PDF export.",
    href: "/resume-builder",
    cta: "Build my resume",
    preview: <ResumePreviewMini />,
  },
  {
    icon: ScanSearch,
    tone: REVIEW_TONE,
    title: "AI Resume Reviewer",
    desc: "Upload your resume, add a job description, and get an ATS score with concrete fixes.",
    href: "/resume-review",
    cta: "Review my resume",
    preview: <ReviewPreview />,
  },
];

const SKILLS_ROW_1 = [
  "Java",
  "Spring Boot",
  "React",
  "SQL",
  "Python",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "System Design",
  "Git",
  "C++",
];
const SKILLS_ROW_2 = [
  "Arrays",
  "Hashing",
  "Binary Search",
  "Recursion",
  "Linked Lists",
  "Stacks & Queues",
  "Trees & BST",
  "Heaps",
  "Graphs",
  "Greedy",
  "Dynamic Programming",
  "Tries",
];
const CHIP_TONES = [TONES.dsa, TONES.assess, TONES.interview, TONES.resume, REVIEW_TONE];

const STEPS = [
  {
    icon: BrainCircuit,
    tone: TONES.assess,
    title: "Find your level",
    text: "Take a short AI skill test and see your weak topics.",
  },
  {
    icon: BookOpen,
    tone: TONES.dsa,
    title: "Learn what's missing",
    text: "Follow the DSA roadmap — lessons, quizzes and code.",
  },
  {
    icon: MessagesSquare,
    tone: TONES.interview,
    title: "Practise for real",
    text: "Run mock interviews and get a detailed report.",
  },
  {
    icon: FileText,
    tone: TONES.resume,
    title: "Apply with confidence",
    text: "Build an ATS-ready resume and get it reviewed.",
  },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
      <AmbientLights />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pt-14 pb-14 md:px-8 md:pt-20 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <Ornament />

          <h1
            className="mt-6 animate-fade-up text-5xl font-bold tracking-tight text-gradient-gold md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            NEXORA
          </h1>
          <p className="mt-3 animate-fade-up text-xs tracking-[0.42em] text-foreground/85 [animation-delay:120ms] md:text-base">
            AI CAREER PLATFORM
          </p>

          <h2
            className="mt-9 max-w-3xl animate-fade-up text-2xl font-semibold tracking-tight [animation-delay:220ms] md:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Build your resume. Master your skills.{" "}
            <span className="text-gradient-gold">Land your dream job.</span>
          </h2>
          <p className="mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-muted-foreground [animation-delay:320ms] md:text-lg">
            Learn DSA step by step, test yourself with AI, practise interviews and polish your
            resume — every result saved to your own dashboard.
          </p>

          <div className="mt-9 flex w-full animate-fade-up flex-col gap-3 [animation-delay:420ms] sm:w-auto sm:flex-row sm:gap-4">
            <Link
              to="/learning-hub/dsa"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] sm:min-w-[210px]"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Rocket className="h-5 w-5" />
              Continue learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold text-foreground transition-all hover:scale-[1.03] sm:min-w-[210px]"
              style={{
                background: "oklch(0.22 0.09 265)",
                borderColor: "oklch(0.82 0.14 82 / 0.35)",
              }}
            >
              <LayoutDashboard className="h-5 w-5" style={{ color: "var(--gold)" }} />
              My dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Skills strip */}
      <SkillsMarquee />

      {/* The signed-in user's own progress */}
      <div className="pt-14">
        <HomeProgress />
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <SectionLabel>How it works</SectionLabel>
        <h2
          className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          From “where do I start?” to <span className="text-gradient-gold">offer-ready.</span>
        </h2>
        <ol className="relative mt-12 grid gap-6 md:grid-cols-4 md:gap-5">
          {/* Connecting line (desktop) */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px md:block"
            style={{
              background: `linear-gradient(90deg, ${TONES.assess}, ${TONES.dsa}, ${TONES.interview}, ${TONES.resume})`,
              opacity: 0.5,
            }}
          />
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative flex gap-4 md:flex-col md:items-center md:text-center"
            >
              <span
                className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-background"
                style={{
                  borderColor: tint(s.tone, 0.45),
                  color: s.tone,
                  boxShadow: `0 0 30px -8px ${tint(s.tone, 0.6)}`,
                }}
              >
                <s.icon className="h-6 w-6" />
                <span
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-background"
                  style={{ background: s.tone }}
                >
                  {i + 1}
                </span>
              </span>
              <span className="md:mt-5">
                <span className="block text-lg font-semibold">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 pb-28 md:px-8">
        <div className="max-w-2xl">
          <SectionLabel>Features</SectionLabel>
          <h2
            className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need to land the offer.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Five AI modules that work together — from your first resume draft to your final
            interview.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f, idx) => (
            <FeatureCard
              key={f.href}
              feature={f}
              className={`${idx < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${idx === 4 ? "md:col-span-2 lg:col-span-3" : ""}`}
            />
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-[2rem] glass p-10 text-center shadow-card md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60" />
          <div className="relative">
            <Sparkles className="mx-auto h-7 w-7" style={{ color: "var(--gold)" }} />
            <h3
              className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your first mock interview is{" "}
              <span className="text-gradient-gold">one click away.</span>
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Pick a role, choose the difficulty, and practise with an AI interviewer that adapts to
              you.
            </p>
            <Link
              to="/mock-interview"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-gold)" }}
            >
              Launch Mock Interview <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ------------------------------- sections -------------------------------- */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-xs uppercase tracking-[0.28em]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span style={{ color: "var(--gold)" }}>/</span>
      {children}
    </span>
  );
}

function SkillsMarquee() {
  const row = (items: string[], reverse: boolean) => (
    <div className="marquee-row relative flex overflow-hidden py-1.5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div
        className={`flex shrink-0 gap-3 pr-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {[...items, ...items].map((label, i) => {
          const tone = CHIP_TONES[i % CHIP_TONES.length];
          return (
            <span
              key={i}
              aria-hidden={i >= items.length}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-surface/50 px-4 py-2 text-sm text-foreground/85 backdrop-blur"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tone, boxShadow: `0 0 8px ${tone}` }}
              />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
  return (
    <section aria-label="Skills you can practise" className="space-y-2">
      {row(SKILLS_ROW_1, false)}
      {row(SKILLS_ROW_2, true)}
    </section>
  );
}

function FeatureCard({ feature: f, className }: { feature: Feature; className: string }) {
  return (
    <Link
      to={f.href}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${className}`}
    >
      {/* Accent line and hover glow in the module's colour */}
      <span
        className="absolute inset-x-0 top-0 h-0.5 opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${f.tone}, transparent)` }}
      />
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: f.tone }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: tint(f.tone, 0.14), color: f.tone }}
        >
          <f.icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <h3
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {f.title}
        </h3>
      </div>
      <p className="relative mt-4 leading-relaxed text-muted-foreground">{f.desc}</p>
      <div className="relative mt-5 flex-1">{f.preview}</div>
      <span
        className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: f.tone }}
      >
        {f.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function SiteFooter() {
  const groups: { title: string; links: { to: string; label: string }[] }[] = [
    {
      title: "Learn",
      links: [
        { to: "/learning-hub", label: "Learning Hub" },
        { to: "/learning-hub/dsa", label: "DSA Roadmap" },
        { to: "/skill-assessment", label: "Skill Assessment" },
      ],
    },
    {
      title: "Prepare",
      links: [
        { to: "/mock-interview", label: "Mock Interview" },
        { to: "/resume-builder", label: "Resume Builder" },
        { to: "/resume-review", label: "Resume Review" },
      ],
    },
    { title: "Account", links: [{ to: "/dashboard", label: "My Dashboard" }] },
  ];
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl font-black text-primary-foreground"
              style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
            >
              N
            </span>
            <span
              className="font-bold tracking-[0.16em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NEXORA
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The AI career platform built for ambitious students preparing for placements.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-sm font-semibold">{g.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nexora · AI career platform for students
      </div>
    </footer>
  );
}

/* ------------------------- feature card previews ------------------------- */
// Small illustrative UI fragments that show what each tool looks like.

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-4 text-xs">
      {children}
    </div>
  );
}

function CodePreview() {
  return (
    <PreviewFrame>
      <pre className="overflow-hidden whitespace-pre font-mono text-[12px] leading-6 text-muted-foreground">
        <span style={{ color: TONES.interview }}>function</span>{" "}
        <span style={{ color: TONES.dsa }}>missingNumber</span>(nums) {"{"}
        {"\n"}
        {"  "}
        <span style={{ color: TONES.interview }}>const</span> n = nums.length;
        {"\n"}
        {"  "}
        <span style={{ color: TONES.interview }}>return</span> n * (n +{" "}
        <span style={{ color: TONES.assess }}>1</span>) /{" "}
        <span style={{ color: TONES.assess }}>2</span> - sum(nums);
        {"\n"}
        {"}"}
      </pre>
      <div
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: tint(TONES.resume, 0.12), color: TONES.resume }}
      >
        <Check className="h-3 w-3" /> All test cases passed
      </div>
    </PreviewFrame>
  );
}

function QuizPreview() {
  const opts = ["HashMap", "Hashtable", "ConcurrentHashMap", "TreeMap"];
  return (
    <PreviewFrame>
      <p className="font-medium text-foreground/90">
        Which map is thread-safe without locking the whole table?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((o, i) => (
          <span
            key={o}
            className="flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-1.5"
            style={
              i === 2
                ? {
                    borderColor: TONES.assess,
                    background: tint(TONES.assess, 0.12),
                    color: TONES.assess,
                  }
                : { borderColor: "var(--border)" }
            }
          >
            <span className="font-mono text-[10px] opacity-70">{String.fromCharCode(65 + i)}</span>
            <span className="truncate">{o}</span>
          </span>
        ))}
      </div>
    </PreviewFrame>
  );
}

function ChatPreview() {
  return (
    <PreviewFrame>
      <div className="space-y-2">
        <p
          className="max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2"
          style={{ background: tint(TONES.interview, 0.14) }}
        >
          Explain the difference between a process and a thread.
        </p>
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-surface-2 px-3 py-2 text-right text-foreground/90">
          A process has its own memory; threads share it…
        </p>
        <p
          className="inline-flex items-center gap-1.5 text-[11px]"
          style={{ color: TONES.interview }}
        >
          <Sparkles className="h-3 w-3" /> AI feedback ready
        </p>
      </div>
    </PreviewFrame>
  );
}

function ResumePreviewMini() {
  return (
    <PreviewFrame>
      <div className="flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold"
          style={{ background: tint(TONES.resume, 0.15), color: TONES.resume }}
        >
          PS
        </span>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-1/2 rounded bg-foreground/30" />
          <div className="h-1.5 w-1/3 rounded bg-foreground/15" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 w-full rounded bg-foreground/10" />
        <div className="h-1.5 w-11/12 rounded bg-foreground/10" />
        <p className="pt-1 text-[11px]" style={{ color: TONES.resume }}>
          ✦ “Led a team of 4 to ship a React app used by 2,000 students”
        </p>
      </div>
    </PreviewFrame>
  );
}

function ReviewPreview() {
  const checks: [string, number][] = [
    ["Keywords match", 0.8],
    ["Impact & numbers", 0.55],
    ["Formatting", 0.92],
  ];
  return (
    <PreviewFrame>
      <div className="space-y-2.5">
        {checks.map(([label, v]) => (
          <div key={label}>
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${v * 100}%`, background: REVIEW_TONE }}
              />
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

/* ------------------------------ decoration ------------------------------- */

function Ornament() {
  return (
    <div className="flex animate-fade-in items-center gap-4 opacity-80">
      <span
        className="h-px w-16 md:w-24"
        style={{ background: "linear-gradient(to right, transparent, oklch(0.82 0.14 82 / 0.9))" }}
      />
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className="animate-twinkle"
        style={{ color: "var(--gold)" }}
        aria-hidden
      >
        <path
          d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
          fill="currentColor"
        />
      </svg>
      <span
        className="h-px w-16 md:w-24"
        style={{ background: "linear-gradient(to left, transparent, oklch(0.82 0.14 82 / 0.9))" }}
      />
    </div>
  );
}

function AmbientLights() {
  const streaks = [
    {
      cls: "-left-32 top-10 h-[520px] w-[2px] rotate-[22deg] opacity-70",
      r: "22deg",
      d: "0s",
      blur: true,
    },
    {
      cls: "-left-10 top-40 h-[420px] w-[1px] rotate-[24deg] opacity-40",
      r: "24deg",
      d: "1.4s",
      blur: false,
    },
    {
      cls: "-right-32 top-24 h-[480px] w-[2px] -rotate-[22deg] opacity-70",
      r: "-22deg",
      d: "0.8s",
      blur: true,
    },
    {
      cls: "-right-10 top-56 h-[380px] w-[1px] -rotate-[24deg] opacity-40",
      r: "-24deg",
      d: "2.2s",
      blur: false,
    },
  ];
  const stars = [
    { top: "6%", left: "12%", d: "0s" },
    { top: "12%", left: "8%", d: "1.2s" },
    { top: "20%", left: "15%", d: "2.4s" },
    { top: "8%", left: "88%", d: "0.6s" },
    { top: "16%", left: "92%", d: "1.8s" },
    { top: "24%", left: "85%", d: "0.3s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {streaks.map((s, i) => (
        <div
          key={i}
          className={`absolute animate-shimmer ${s.cls}`}
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.85 0.15 82 / 0.9), transparent)",
            filter: s.blur ? "blur(1px)" : undefined,
            animationDelay: s.d,
            ["--r" as never]: s.r,
          }}
        />
      ))}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 animate-twinkle rounded-full"
          style={{
            top: s.top,
            left: s.left,
            background: "oklch(0.9 0.15 82)",
            boxShadow: "0 0 8px oklch(0.85 0.15 82 / 0.9)",
            animationDelay: s.d,
          }}
        />
      ))}
    </div>
  );
}
