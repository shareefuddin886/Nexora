import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getTrack, trackLessons } from "@/lib/tracks";

// Progress for every Learning Hub track except DSA.
// Guests keep it in this browser. Signed-in users keep it in the
// track_lesson_progress table; guest progress is uploaded on sign-in and then
// cleared. If the table is missing (migration not run yet), signed-in users
// fall back to browser storage under a key scoped to their account.

export interface LessonProgress {
  quizScore: number; // percent
  quizPassed: boolean;
  practiceDone: boolean;
  completed: boolean;
  completedAt?: string;
}

/** trackId -> lessonId -> progress */
export type AllTrackProgress = Record<string, Record<string, LessonProgress>>;

const GUEST_KEY = "nexora_track_progress_v1";
const userKey = (id: string) => `${GUEST_KEY}:${id}`;

const EMPTY: LessonProgress = {
  quizScore: 0,
  quizPassed: false,
  practiceDone: false,
  completed: false,
};

function readLocal(key: string): AllTrackProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AllTrackProgress) : {};
  } catch {
    return {};
  }
}

function writeLocal(key: string, value: AllTrackProgress) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: progress still lives in memory for this session.
  }
}

const toRow = (userId: string, trackId: string, lessonId: string, p: LessonProgress) => ({
  user_id: userId,
  track_id: trackId,
  lesson_id: lessonId,
  quiz_score: p.quizScore,
  quiz_passed: p.quizPassed,
  practice_done: p.practiceDone,
  completed: p.completed,
  completed_at: p.completedAt ?? null,
});

async function loadRemote(user: User): Promise<AllTrackProgress> {
  const { data, error } = await supabase
    .from("track_lesson_progress")
    .select("*")
    .eq("user_id", user.id);
  if (error) throw error;

  const all: AllTrackProgress = {};
  for (const r of data ?? []) {
    (all[r.track_id] ??= {})[r.lesson_id] = {
      quizScore: Number(r.quiz_score),
      quizPassed: r.quiz_passed,
      practiceDone: r.practice_done,
      completed: r.completed,
      completedAt: r.completed_at ?? undefined,
    };
  }

  // Upload guest progress for lessons the account doesn't have yet.
  const guest = readLocal(GUEST_KEY);
  const rows = Object.entries(guest).flatMap(([trackId, lessons]) =>
    Object.entries(lessons)
      .filter(([lessonId]) => !all[trackId]?.[lessonId])
      .map(([lessonId, p]) => ({ trackId, lessonId, p })),
  );
  if (rows.length > 0) {
    const { error: upErr } = await supabase.from("track_lesson_progress").upsert(
      rows.map((r) => toRow(user.id, r.trackId, r.lessonId, r.p)),
      {
        onConflict: "user_id,track_id,lesson_id",
      },
    );
    if (upErr) throw upErr;
    for (const r of rows) (all[r.trackId] ??= {})[r.lessonId] = r.p;
  }
  if (Object.keys(guest).length > 0) localStorage.removeItem(GUEST_KEY);
  return all;
}

export function useTrackProgress() {
  const [progress, setProgress] = useState<AllTrackProgress>(() => readLocal(GUEST_KEY));
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  // Where saves go: "remote" (Supabase) or a localStorage key.
  const storeRef = useRef<{ kind: "remote" } | { kind: "local"; key: string }>({
    kind: "local",
    key: GUEST_KEY,
  });
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    let mounted = true;
    // Which user this effect run has loaded (undefined = nothing yet). Kept per
    // run, not in a ref, so a remount (React Strict Mode) always loads afresh.
    let loadedFor: string | null | undefined;

    async function sync(next: User | null) {
      const id = next?.id ?? null;
      if (loadedFor === id) return;
      loadedFor = id;
      try {
        if (!next) {
          if (!mounted) return;
          userRef.current = null;
          storeRef.current = { kind: "local", key: GUEST_KEY };
          setProgress(readLocal(GUEST_KEY));
          return;
        }
        let store: { kind: "remote" } | { kind: "local"; key: string };
        let loaded: AllTrackProgress;
        try {
          loaded = await loadRemote(next);
          store = { kind: "remote" };
        } catch (err) {
          console.warn("Track progress table unavailable; using browser storage", err);
          store = { kind: "local", key: userKey(next.id) };
          loaded = readLocal(store.key);
        }
        if (!mounted) return;
        userRef.current = next;
        storeRef.current = store;
        setProgress(loaded);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      if (!next && loadedFor) {
        // Signed out: drop the account's progress from memory.
        loadedFor = null;
        userRef.current = null;
        storeRef.current = { kind: "local", key: GUEST_KEY };
        setProgress(readLocal(GUEST_KEY));
        return;
      }
      // Defer: supabase calls inside this callback can deadlock the client.
      setTimeout(() => void sync(next), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const update = useCallback(
    (trackId: string, lessonId: string, patch: (existing: LessonProgress) => LessonProgress) => {
      const current = progressRef.current;
      const updated = patch(current[trackId]?.[lessonId] ?? EMPTY);
      const nextAll: AllTrackProgress = {
        ...current,
        [trackId]: { ...current[trackId], [lessonId]: updated },
      };
      progressRef.current = nextAll;
      setProgress(nextAll);

      const store = storeRef.current;
      const user = userRef.current;
      if (store.kind === "local") {
        writeLocal(store.key, nextAll);
      } else if (user) {
        void supabase
          .from("track_lesson_progress")
          .upsert(toRow(user.id, trackId, lessonId, updated), {
            onConflict: "user_id,track_id,lesson_id",
          })
          .then(({ error }) => error && console.warn("Could not save lesson progress", error));
      }
      return updated;
    },
    [],
  );

  const needsPractice = (trackId: string, lessonId: string) => {
    const track = getTrack(trackId);
    return Boolean(
      track && trackLessons(track).find((r) => r.lesson.id === lessonId)?.lesson.practice,
    );
  };

  const markQuiz = useCallback(
    (trackId: string, lessonId: string, percent: number, passed: boolean) =>
      update(trackId, lessonId, (e) => {
        const quizPassed = e.quizPassed || passed;
        const done = quizPassed && (!needsPractice(trackId, lessonId) || e.practiceDone);
        return {
          ...e,
          quizScore: Math.max(e.quizScore, percent),
          quizPassed,
          completed: done,
          completedAt: done ? (e.completedAt ?? new Date().toISOString()) : e.completedAt,
        };
      }),
    [update],
  );

  const markPractice = useCallback(
    (trackId: string, lessonId: string) =>
      update(trackId, lessonId, (e) => {
        const done = e.quizPassed;
        return {
          ...e,
          practiceDone: true,
          completed: done,
          completedAt: done ? (e.completedAt ?? new Date().toISOString()) : e.completedAt,
        };
      }),
    [update],
  );

  const lessonProgress = useCallback(
    (trackId: string, lessonId: string): LessonProgress => progress[trackId]?.[lessonId] ?? EMPTY,
    [progress],
  );

  const trackSummary = useCallback(
    (trackId: string) => {
      const track = getTrack(trackId);
      const refs = track ? trackLessons(track) : [];
      const done = refs.filter((r) => progress[trackId]?.[r.lesson.id]?.completed).length;
      const next = refs.find((r) => !progress[trackId]?.[r.lesson.id]?.completed) ?? null;
      return {
        completed: done,
        total: refs.length,
        percent: refs.length ? Math.round((done / refs.length) * 100) : 0,
        started: refs.some((r) => {
          const p = progress[trackId]?.[r.lesson.id];
          return p && (p.quizPassed || p.practiceDone);
        }),
        next,
      };
    },
    [progress],
  );

  return { loading, progress, lessonProgress, trackSummary, markQuiz, markPractice };
}
