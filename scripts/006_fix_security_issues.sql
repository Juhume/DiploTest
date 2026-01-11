-- ============================================
-- Script: 006_fix_security_issues.sql
-- Descripción: Corrige múltiples problemas de seguridad y rendimiento
--              detectados por el linter de Supabase
-- Fecha: 2025-12-31
-- ============================================

-- ============================================
-- PROBLEMA 1: Functions con search_path mutable
-- ============================================
-- Las funciones handle_updated_at y handle_new_user no tienen
-- search_path definido, lo que puede ser un riesgo de seguridad.

-- Corregir handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Corregir handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- ============================================
-- PROBLEMA 2: RLS Policies con auth.uid() sin subquery
-- ============================================
-- Las políticas RLS que usan auth.uid() directamente se re-evalúan
-- para cada fila, causando problemas de rendimiento.
-- Solución: Envolver en (SELECT auth.uid())

-- ----------------------------------------
-- Tabla: attempts
-- ----------------------------------------

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.attempts;

-- Recrear con subquery optimizada
CREATE POLICY "Users can view their own attempts"
ON public.attempts
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own attempts"
ON public.attempts
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- ----------------------------------------
-- Tabla: profiles
-- ----------------------------------------

-- Eliminar TODAS las políticas existentes (incluyendo todas las variantes de nombres)
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver perfiles públicos" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recrear con subquery optimizada
-- IMPORTANTE: Solo UNA política por acción para evitar problemas de rendimiento

-- SELECT: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- ============================================
-- Comentarios explicativos
-- ============================================

COMMENT ON FUNCTION public.handle_updated_at() IS 
'Trigger function para actualizar updated_at automáticamente. 
Usa SET search_path = public para seguridad.';

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function para crear perfil automáticamente al registrar usuario.
Usa SET search_path = public para seguridad.';

-- ============================================
-- Verificación
-- ============================================
-- Ejecutar después del script para verificar:

-- 1. Verificar search_path en funciones:
-- SELECT proname, prosecdef, proconfig 
-- FROM pg_proc 
-- WHERE proname IN ('handle_updated_at', 'handle_new_user');

-- 2. Verificar políticas RLS:
-- SELECT schemaname, tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('attempts', 'profiles');
