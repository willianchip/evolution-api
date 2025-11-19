-- ================================================================
-- CORREÇÕES DE SEGURANÇA CRÍTICAS
-- ================================================================

-- 1. Corrigir search_path nas funções existentes (SECURITY ISSUE)
-- ================================================================

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.users (id, email, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_from_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment(row_id uuid, table_name text, field_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  EXECUTE format('UPDATE public.%I SET %I = %I + 1 WHERE id = %L',
                 table_name, field_name, field_name, row_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_next_run(scheduled_msg_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  msg RECORD;
  next_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO msg FROM public.scheduled_messages WHERE id = scheduled_msg_id;
  
  IF msg.recurrence_type = 'none' THEN
    RETURN NULL;
  ELSIF msg.recurrence_type = 'daily' THEN
    RETURN msg.last_sent_at + INTERVAL '1 day';
  ELSIF msg.recurrence_type = 'weekly' THEN
    RETURN msg.last_sent_at + INTERVAL '7 days';
  ELSIF msg.recurrence_type = 'monthly' THEN
    RETURN msg.last_sent_at + INTERVAL '1 month';
  END IF;
  
  RETURN NULL;
END;
$function$;

-- 2. Garantir permissões corretas no schema public
-- ================================================================

-- Garantir que authenticated users podem acessar schema public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Garantir que authenticated users podem acessar sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;