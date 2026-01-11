-- =====================================================
-- Tabla de Flashcards/Marcadores
-- Permite a los usuarios guardar preguntas para repasar
-- =====================================================

-- Crear tabla de bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_mode TEXT NOT NULL CHECK (question_mode IN ('demo', 'real')),
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT, -- Notas personales del usuario sobre la pregunta

  -- Evitar duplicados
  UNIQUE(user_id, question_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE public.bookmarks IS 'Preguntas guardadas por usuarios para repasar (flashcards)';
COMMENT ON COLUMN public.bookmarks.question_id IS 'ID de la pregunta (ej: demo-q1, real-q1)';
COMMENT ON COLUMN public.bookmarks.question_mode IS 'Modo de la pregunta (demo o real)';
COMMENT ON COLUMN public.bookmarks.notes IS 'Notas personales del usuario sobre la pregunta';
