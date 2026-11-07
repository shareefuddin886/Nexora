import { dsaLearningOrder } from "@/lib/dsa-roadmap";
import { arraysPart1 } from "./arrays-1";
import { arraysPart2 } from "./arrays-2";
import type { DsaProblem } from "./types";

export type { Approach, DsaProblem } from "./types";

/** Sub-sections of each topic sheet, in the order they are studied. */
const GROUP_ORDER: Record<string, string[]> = {
  arrays: ["Fundamentals", "In-place & Two Pointers", "Counting & Hashing", "Prefix Sums & Kadane"],
};

const DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2 } as const;

const all: DsaProblem[] = [...arraysPart1, ...arraysPart2];

/** Every judged problem, ordered by topic group and then difficulty (stable within a group). */
export const dsaProblems: DsaProblem[] = [...all].sort((a, b) => {
  const t = dsaLearningOrder.indexOf(a.topicId) - dsaLearningOrder.indexOf(b.topicId);
  if (t !== 0) return t;
  const order = GROUP_ORDER[a.topicId] ?? [];
  const g = order.indexOf(a.group) - order.indexOf(b.group);
  return g !== 0 ? g : DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
});

export function getDsaProblem(id: string): DsaProblem | undefined {
  return dsaProblems.find((p) => p.id === id);
}

export function problemsForTopic(topicId: string): DsaProblem[] {
  return dsaProblems.filter((p) => p.topicId === topicId);
}

/** Problems of a topic grouped into its sub-sections, in study order. */
export function groupedProblems(topicId: string): { group: string; problems: DsaProblem[] }[] {
  const problems = problemsForTopic(topicId);
  const groups = [...new Set(problems.map((p) => p.group))];
  return groups.map((group) => ({ group, problems: problems.filter((p) => p.group === group) }));
}

export function leetcodeProblemUrl(p: DsaProblem): string | null {
  return p.leetcode ? `https://leetcode.com/problems/${p.id}/` : null;
}
