-- ============================================
-- Script: 005_fix_attempt_stats_security.sql
-- Descripción: Corrige la vulnerabilidad de SECURITY DEFINER
--              en la vista attempt_stats
-- Fecha: 2025-12-31
-- ============================================

-- El problema:
-- La vista attempt_stats está definida con SECURITY DEFINER,
-- lo que significa que se ejecuta con los permisos del creador
-- en lugar de respetar las políticas RLS del usuario que consulta.

-- La solución:
-- Recrear la vista con SECURITY INVOKER (security_invoker = true)
-- para que respete las políticas RLS del usuario que la consulta.

-- Paso 1: Eliminar la vista existente
DROP VIEW IF EXISTS public.attempt_stats;

-- Paso 2: Recrear la vista con SECURITY INVOKER
-- Esta vista calcula estadísticas agregadas de los intentos del usuario
CREATE VIEW public.attempt_stats 
WITH (security_invoker = true) AS
SELECT 
    user_id,
    question_mode,
    COUNT(*) AS total_attempts,
    AVG(percentage)::NUMERIC(5,2) AS avg_percentage,
    MAX(percentage) AS best_percentage,
    MIN(percentage) AS worst_percentage,
    SUM(correct_count) AS total_correct,
    SUM(wrong_count) AS total_wrong,
    SUM(blank_count) AS total_blank,
    SUM(total_questions) AS total_questions_answered,
    AVG(duration_seconds)::INTEGER AS avg_duration_seconds,
    MAX(created_at) AS last_attempt_at
FROM 
    public.attempts
GROUP BY 
    user_id, question_mode;

-- Paso 3: Asegurar permisos correctos
-- Solo usuarios autenticados pueden consultar la vista
GRANT SELECT ON public.attempt_stats TO authenticated;

-- Revocar acceso anónimo por seguridad
REVOKE ALL ON public.attempt_stats FROM anon;

-- Comentario explicativo
COMMENT ON VIEW public.attempt_stats IS 
'Vista de estadísticas de intentos por usuario y modo. 
Usa SECURITY INVOKER para respetar las políticas RLS del usuario que consulta.';

-- ============================================
-- Verificación (ejecutar después del script)
-- ============================================
-- Para verificar que la vista tiene security_invoker = true:
--
-- SELECT 
--     schemaname,
--     viewname,
--     pg_catalog.pg_get_viewdef(c.oid, true) as definition
-- FROM pg_catalog.pg_views v
-- JOIN pg_catalog.pg_class c ON c.relname = v.viewname
-- WHERE viewname = 'attempt_stats';
--
-- O verificar en el catálogo:
-- SELECT relname, reloptions 
-- FROM pg_class 
-- WHERE relname = 'attempt_stats';
