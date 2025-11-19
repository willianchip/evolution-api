-- Remover colunas antigas desnecessárias da tabela users
ALTER TABLE public.users 
DROP COLUMN IF EXISTS password_hash,
DROP COLUMN IF EXISTS verification_token,
DROP COLUMN IF EXISTS reset_token,
DROP COLUMN IF EXISTS reset_token_expires,
DROP COLUMN IF EXISTS reset_token_expires_at,
DROP COLUMN IF EXISTS device_fingerprint,
DROP COLUMN IF EXISTS geolocation;

-- Criar trigger para sincronizar auth.users com public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_user_from_auth();

-- Criar trigger para sincronizar atualizações
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_user_from_auth();

-- Sincronizar usuários existentes do auth.users para public.users
INSERT INTO public.users (id, email, email_verified)
SELECT 
  id, 
  email, 
  (email_confirmed_at IS NOT NULL) as email_verified
FROM auth.users
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified;