-- ===================================================================
-- SETUP COMPLETO DO BANCO DE DADOS - GESTÃO DE WHATSAPP
-- Execute este script no SQL Editor do Supabase
-- ===================================================================

-- 1. TABELA: whatsapp_connections
-- Armazena conexões do WhatsApp de cada usuário
-- ===================================================================
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  phone_number TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  
  connected_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, phone_number)
);

CREATE INDEX idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_status ON whatsapp_connections(status);

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON whatsapp_connections FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own connections"
  ON whatsapp_connections FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own connections"
  ON whatsapp_connections FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own connections"
  ON whatsapp_connections FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. TABELA: conversations
-- Armazena conversas do WhatsApp
-- ===================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  
  contact_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  contact_avatar TEXT,
  
  is_archived BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(connection_id, contact_number)
);

CREATE INDEX idx_conversations_connection_id ON conversations(connection_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_unread_count ON conversations(unread_count);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM whatsapp_connections wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.id = conversations.connection_id
      AND u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. TABELA: messages
-- Armazena mensagens individuais
-- ===================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_from_me BOOLEAN DEFAULT false,
  
  status TEXT DEFAULT 'sent',
  
  media_url TEXT,
  media_type TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN whatsapp_connections wc ON c.connection_id = wc.id
      JOIN users u ON wc.user_id = u.id
      WHERE c.id = messages.conversation_id
      AND u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- 4. TABELA: ai_chats
-- Armazena conversas com a IA do Gemini
-- ===================================================================
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title TEXT DEFAULT 'Nova Conversa',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_ai_messages_chat_id ON ai_messages(chat_id);
CREATE INDEX idx_ai_messages_timestamp ON ai_messages(timestamp);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_chats"
  ON ai_chats FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own ai_chats"
  ON ai_chats FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can view own ai_messages"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_chats ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.id = ai_messages.chat_id
      AND u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Users can insert own ai_messages"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chats ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.id = ai_messages.chat_id
      AND u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- 5. TABELA: user_settings
-- Armazena configurações personalizadas de cada usuário
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  notifications_enabled BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT false,
  ai_tone TEXT DEFAULT 'friendly',
  ai_language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'dark',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. TABELA: activity_logs
-- Registra atividades importantes do usuário para auditoria
-- ===================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON activity_logs FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- 7. VIEW: user_dashboard_stats
-- View materializada para estatísticas do dashboard (performance otimizada)
-- ===================================================================
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  u.id as user_id,
  
  COUNT(DISTINCT wc.id) as total_connections,
  COUNT(DISTINCT CASE WHEN wc.status = 'connected' THEN wc.id END) as active_connections,
  
  COUNT(DISTINCT c.id) as total_conversations,
  COALESCE(SUM(c.unread_count), 0) as total_unread_messages,
  
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT CASE WHEN m.timestamp > NOW() - INTERVAL '24 hours' THEN m.id END) as messages_today,
  COUNT(DISTINCT CASE WHEN m.timestamp > NOW() - INTERVAL '7 days' THEN m.id END) as messages_this_week,
  
  COUNT(DISTINCT ac.id) as total_ai_chats,
  COUNT(DISTINCT am.id) as total_ai_messages

FROM users u
LEFT JOIN whatsapp_connections wc ON wc.user_id = u.id
LEFT JOIN conversations c ON c.connection_id = wc.id
LEFT JOIN messages m ON m.conversation_id = c.id
LEFT JOIN ai_chats ac ON ac.user_id = u.id
LEFT JOIN ai_messages am ON am.chat_id = ac.id
GROUP BY u.id;

-- ===================================================================
-- 8. TABELA: user_2fa
-- Armazena configurações de autenticação de dois fatores
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA settings"
  ON user_2fa FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own 2FA settings"
  ON user_2fa FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own 2FA settings"
  ON user_2fa FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own 2FA settings"
  ON user_2fa FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- ===================================================================
-- STORAGE BUCKET: whatsapp-media
-- Armazena arquivos de mídia do WhatsApp (imagens, áudios, documentos)
-- ===================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for whatsapp-media bucket
CREATE POLICY "Users can upload media" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'whatsapp-media');

CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

-- 9. TABELA: automations
-- Armazena regras de automação inteligente
-- ===================================================================
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'time', 'new_contact')),
  conditions JSONB DEFAULT '{}',
  
  actions JSONB NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_automations_is_active ON automations(is_active);
CREATE INDEX idx_automations_trigger_type ON automations(trigger_type);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations"
  ON automations FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own automations"
  ON automations FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own automations"
  ON automations FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own automations"
  ON automations FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- SETUP COMPLETO! ✅
-- ===================================================================
