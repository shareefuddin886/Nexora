-- ============================================================================
-- Learning Hub tracks (Full Stack, System Design, SQL, ...): one row per user
-- per lesson. DSA keeps its own dsa_level_progress table.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.track_lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  quiz_score NUMERIC NOT NULL DEFAULT 0,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  practice_done BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_lesson_progress TO authenticated;
GRANT ALL ON public.track_lesson_progress TO service_role;
ALTER TABLE public.track_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own track progress" ON public.track_lesson_progress;
CREATE POLICY "own track progress" ON public.track_lesson_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS track_lesson_progress_updated_at ON public.track_lesson_progress;
CREATE TRIGGER track_lesson_progress_updated_at BEFORE UPDATE ON public.track_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
