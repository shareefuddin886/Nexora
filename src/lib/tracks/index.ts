import { fullstackTrack } from "./fullstack";
import type { Lesson, Track, TrackModule } from "./types";

export type { Lesson, Track, TrackModule } from "./types";

const soon = (t: Omit<Track, "status" | "modules">): Track => ({
  ...t,
  status: "soon",
  modules: [],
});

/** Every Learning Hub path after DSA, in the order they are shown. */
export const tracks: Track[] = [
  fullstackTrack,
  soon({
    id: "system-design",
    title: "System Design",
    shortTitle: "System Design",
    tagline: "Design systems that scale, and explain your choices in interviews.",
    description:
      "Scalability, load balancing, caching, databases at scale, queues and classic design problems, taught the way design interviews are run.",
    icon: "cpu",
    tone: "#f472b6",
    level: "Intermediate → Advanced",
    outcomes: [
      "Estimate load and storage with back-of-the-envelope maths",
      "Choose between caching, replication, sharding and queues",
      "Walk through a design interview with a clear structure",
    ],
    prerequisites: ["Full Stack Web Development or equivalent experience"],
  }),
  soon({
    id: "sql",
    title: "Database Engineering & SQL",
    shortTitle: "SQL",
    tagline: "Write correct, fast SQL and design schemas that last.",
    description:
      "Queries from SELECT to window functions, joins, indexing, transactions and schema design, with a real SQL engine in the browser.",
    icon: "database",
    tone: "#2dd4bf",
    level: "Beginner → Intermediate",
    outcomes: [
      "Write joins, aggregations and window functions",
      "Design normalised schemas and choose indexes",
      "Reason about transactions and isolation",
    ],
    prerequisites: ["None"],
  }),
  soon({
    id: "ai-ml",
    title: "AI & Machine Learning",
    shortTitle: "AI & ML",
    tagline: "From ML foundations to building with large language models.",
    description:
      "Core machine learning ideas, model evaluation, neural networks, embeddings and practical LLM application patterns such as RAG.",
    icon: "bot",
    tone: "#c084fc",
    level: "Intermediate",
    outcomes: [
      "Explain how models learn and how to evaluate them",
      "Use embeddings and retrieval in an application",
      "Build reliable features on top of LLM APIs",
    ],
    prerequisites: ["Python basics", "School-level statistics"],
  }),
  soon({
    id: "cloud-devops",
    title: "Cloud & DevOps",
    shortTitle: "Cloud & DevOps",
    tagline: "Containers, pipelines and cloud services, the way teams ship today.",
    description:
      "Linux and networking basics, Docker, CI/CD, Kubernetes concepts, core AWS services and observability.",
    icon: "cloud",
    tone: "#fb923c",
    level: "Intermediate",
    outcomes: [
      "Containerise and deploy an application",
      "Build a CI/CD pipeline",
      "Choose the right cloud building blocks",
    ],
    prerequisites: ["Comfort with the command line"],
  }),
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export interface LessonRef {
  lesson: Lesson;
  module: TrackModule;
  moduleIndex: number;
  /** Position across the whole track, starting at 0. */
  index: number;
}

export function trackLessons(track: Track): LessonRef[] {
  const refs: LessonRef[] = [];
  track.modules.forEach((module, moduleIndex) => {
    for (const lesson of module.lessons)
      refs.push({ lesson, module, moduleIndex, index: refs.length });
  });
  return refs;
}

export function trackStats(track: Track) {
  const lessons = trackLessons(track).map((r) => r.lesson);
  return {
    modules: track.modules.length,
    lessons: lessons.length,
    exercises: lessons.filter((l) => l.practice).length,
    minutes: lessons.reduce((sum, l) => sum + l.minutes, 0),
  };
}
