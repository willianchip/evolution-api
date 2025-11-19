-- Ajustar policy para prevenir inserções diretas em users
DROP POLICY IF EXISTS "no_direct_inserts" ON public.users;

CREATE POLICY "no_direct_inserts"
ON public.users
FOR INSERT
WITH CHECK (false);

COMMENT ON TABLE public.users IS 'Tabela sincronizada automaticamente com auth.users via triggers. Não insira diretamente aqui.';
