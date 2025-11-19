-- ===================================================================
-- FASE 2: SISTEMA DE E-MAILS - Tabela de Logs
-- ===================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'verification', 'reset', 'notification', '2fa')),
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'delivered')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- ===================================================================
-- FASE 3: CRON - Tabelas de Logs de Execução
-- ===================================================================

CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_started_at TIMESTAMPTZ DEFAULT NOW(),
  execution_finished_at TIMESTAMPTZ,
  messages_processed INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  messages_failed INT DEFAULT 0,
  errors TEXT[],
  duration_ms INT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE INDEX idx_cron_execution_logs_started ON cron_execution_logs(execution_started_at DESC);
CREATE INDEX idx_cron_execution_logs_status ON cron_execution_logs(status);

-- Message history for tracking individual message sends
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_message_history_scheduled_id ON message_history(scheduled_message_id);
CREATE INDEX idx_message_history_sent_at ON message_history(sent_at DESC);

ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message history"
  ON message_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scheduled_messages sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.id = message_history.scheduled_message_id
      AND u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- ===================================================================
-- FASE 5: MONITORAMENTO - Tabela de Logs do Sistema
-- ===================================================================

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('auth', 'email', 'whatsapp', 'cron', 'payment', 'ai', 'system')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_category ON system_logs(category);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all system logs"
  ON system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can view own system logs"
  ON system_logs FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));