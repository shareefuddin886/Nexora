// A judged DSA problem with a Striver-style editorial: each approach (brute
// force, better, optimal) has intuition, steps, a dry run, code in four
// languages and its complexity. Inline text supports `code` and **bold**.
import type { TestCase } from "@/lib/dsa-curriculum";

export type { TestCase };

export type ApproachName = "Brute Force" | "Better" | "Optimal";

export interface Approach {
  name: ApproachName;
  /** One line: the idea in a nutshell. */
  summary: string;
  intuition: string[];
  steps: string[];
  dryRun?: { title: string; columns: string[]; rows: string[][]; result: string };
  code: { javascript: string; python: string; java: string; cpp: string };
  time: string;
  space: string;
  /** Why the complexity is what it is. */
  complexityNote: string;
}

export interface DsaProblem {
  /** LeetCode slug where one exists; also the progress key. */
  id: string;
  leetcode?: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicId: string;
  /** Sub-section within the topic, e.g. "Two Pointers". */
  group: string;
  pattern: string;
  statement: string[];
  /** How this version is judged, when it differs from LeetCode. */
  judgeNote?: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  functionName: string;
  /** TypeScript-style signature used to generate starter code in every language. */
  signature: { params: { name: string; type: string }[]; returnType: string };
  testCases: TestCase[];
  hints: string[];
  /** "Now your turn": predict the output before coding. */
  check: { prompt: string; options: string[]; correctIndex: number; explanation: string };
  approaches: Approach[];
  doubts: { q: string; a: string }[];
  followUps: string[];
}
