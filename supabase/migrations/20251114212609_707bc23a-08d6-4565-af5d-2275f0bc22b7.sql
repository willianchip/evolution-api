-- Create table for 2FA backup codes
CREATE TABLE IF NOT EXISTS public.user_2fa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_2fa_backup_codes_user_id ON public.user_2fa_backup_codes(user_id);

-- Enable RLS
ALTER TABLE public.user_2fa_backup_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backup codes
CREATE POLICY "Users can view their own backup codes"
  ON public.user_2fa_backup_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup codes"
  ON public.user_2fa_backup_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup codes"
  ON public.user_2fa_backup_codes
  FOR UPDATE
  USING (auth.uid() = user_id);