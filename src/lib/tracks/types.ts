// Shared shape for every Learning Hub track except DSA (which predates it).
// A track is plain data: modules -> lessons -> sections, a quiz, interview
// prep and an optional hands-on exercise. The UI renders any track the same way.
import type { RunnableLanguage } from "@/lib/code-runner";
import type { QuizQuestion, TestCase } from "@/lib/dsa-curriculum";

export type { QuizQuestion, TestCase };

export type TrackIcon = "globe" | "cpu" | "database" | "bot" | "cloud";

/** Inline text supports `code` and **bold**. */
export interface LessonSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  code?: { language: string; code: string; caption?: string };
  callout?: { kind: "tip" | "warning" | "interview"; text: string };
}

export interface PracticeExercise {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Paragraphs describing the task. */
  prompt: string[];
  functionName: string;
  languages: RunnableLanguage[];
  starter: Partial<Record<RunnableLanguage, string>>;
  solution: Partial<Record<RunnableLanguage, string>>;
  examples: { input: string; output: string; explanation?: string }[];
  /** The first two are shown as samples on "Run"; the rest are hidden. */
  testCases: TestCase[];
  hints: string[];
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  objectives: string[];
  sections: LessonSection[];
  keyTakeaways: string[];
  interview: { q: string; a: string }[];
  quiz: { passThreshold: number; questions: QuizQuestion[] };
  practice?: PracticeExercise;
}

export interface TrackModule {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Track {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  icon: TrackIcon;
  tone: string;
  level: string;
  status: "available" | "soon";
  outcomes: string[];
  prerequisites: string[];
  modules: TrackModule[];
}

/** Helpers for writing test cases: arguments and expected output as the runner sees them. */
export const args = (...values: unknown[]) => values.map((v) => JSON.stringify(v)).join(", ");
export const out = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value));
