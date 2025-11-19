-- ============================================
-- ANALYTICS AVANÇADO
-- ============================================

-- Tabela para métricas de performance da IA
CREATE TABLE IF NOT EXISTS public.ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  
  response_time_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  model_used TEXT NOT NULL,
  
  sentiment_score DECIMAL(3,2),
  sentiment_label TEXT,
  
  confidence_score DECIMAL(3,2),
  user_satisfaction INTEGER,
  
  prompt_length INTEGER,
  response_length INTEGER,
  category TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai metrics" ON public.ai_performance_metrics;
CREATE POLICY "Users can view own ai metrics"
  ON public.ai_performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai metrics" ON public.ai_performance_metrics;
CREATE POLICY "Users can insert own ai metrics"
  ON public.ai_performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_metrics_user ON public.ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_created ON public.ai_performance_metrics(created_at);

-- ============================================
-- BACKUP AUTOMÁTICO
-- ============================================

CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  tables_backed_up TEXT[] DEFAULT '{}',
  total_rows INTEGER DEFAULT 0,
  backup_size_bytes BIGINT DEFAULT 0,
  s3_bucket TEXT,
  s3_key TEXT,
  s3_url TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all backup logs" ON public.backup_logs;
CREATE POLICY "Admins can view all backup logs"
  ON public.backup_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON public.backup_logs(created_at);

-- ============================================
-- MULTI-PLATAFORMA
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform_type, platform_user_id)
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own platform connections" ON public.platform_connections;
CREATE POLICY "Users can view own platform connections"
  ON public.platform_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own platform connections" ON public.platform_connections;
CREATE POLICY "Users can insert own platform connections"
  ON public.platform_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own platform connections" ON public.platform_connections;
CREATE POLICY "Users can update own platform connections"
  ON public.platform_connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own platform connections" ON public.platform_connections;
CREATE POLICY "Users can delete own platform connections"
  ON public.platform_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_platform_connections_user ON public.platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_type ON public.platform_connections(platform_type);

CREATE TABLE IF NOT EXISTS public.platform_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  platform_message_id TEXT NOT NULL,
  platform_type TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT,
  is_from_me BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_type, platform_message_id)
);

ALTER TABLE public.platform_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own platform messages" ON public.platform_messages;
CREATE POLICY "Users can view own platform messages"
  ON public.platform_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.platform_connections pc
    WHERE pc.id = platform_messages.connection_id
    AND pc.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_platform_messages_connection ON public.platform_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_platform_messages_timestamp ON public.platform_messages(timestamp);

-- ============================================
-- SCANLINE CONTROL
-- ============================================

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS scanline_enabled BOOLEAN DEFAULT false;

-- ============================================
-- REALTIME PARA platform_messages
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_messages;