-- Criar bucket para backups do banco de dados
INSERT INTO storage.buckets (id, name, public) 
VALUES ('database-backups', 'database-backups', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies para o bucket database-backups
-- Drop policies if they exist
DROP POLICY IF EXISTS "Admins can upload backups" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view backups" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete old backups" ON storage.objects;

-- Create new policies
CREATE POLICY "Admins can upload backups"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'database-backups' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can view backups"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'database-backups' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete old backups"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'database-backups' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);