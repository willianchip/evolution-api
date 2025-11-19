-- ===================================================================
-- FUNÇÃO AUXILIAR: update_updated_at_column
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 1. TABELA: whatsapp_connections
-- ===================================================================
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
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

CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_status ON whatsapp_connections(status);

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON whatsapp_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON whatsapp_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON whatsapp_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON whatsapp_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 2. TABELA: conversations
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

CREATE INDEX IF NOT EXISTS idx_conversations_connection_id ON conversations(connection_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread_count ON conversations(unread_count);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM whatsapp_connections wc
      WHERE wc.id = conversations.connection_id
      AND wc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM whatsapp_connections wc
      WHERE wc.id = connection_id
      AND wc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM whatsapp_connections wc
      WHERE wc.id = conversations.connection_id
      AND wc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM whatsapp_connections wc
      WHERE wc.id = conversations.connection_id
      AND wc.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 3. TABELA: messages
-- ===================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_from_me BOOLEAN DEFAULT false,
  
  status TEXT DEFAULT 'sent',
  
  media_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN whatsapp_connections wc ON c.connection_id = wc.id
      WHERE c.id = messages.conversation_id
      AND wc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN whatsapp_connections wc ON c.connection_id = wc.id
      WHERE c.id = conversation_id
      AND wc.user_id = auth.uid()
    )
  );

-- ===================================================================
-- 4. TABELA: ai_chats e ai_messages
-- ===================================================================
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
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

CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_chat_id ON ai_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_timestamp ON ai_messages(timestamp);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_chats"
  ON ai_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_chats"
  ON ai_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_chats"
  ON ai_chats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_chats"
  ON ai_chats FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ai_messages"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_chats ac
      WHERE ac.id = ai_messages.chat_id
      AND ac.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai_messages"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chats ac
      WHERE ac.id = chat_id
      AND ac.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_ai_chats_updated_at
  BEFORE UPDATE ON ai_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 5. TABELA: user_settings
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  notifications_enabled BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT false,
  ai_tone TEXT DEFAULT 'friendly',
  ai_language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'dark',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 6. TABELA: activity_logs
-- ===================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- 7. VIEW: user_dashboard_stats
-- ===================================================================
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  wc.user_id,
  
  COUNT(DISTINCT wc.id) as total_connections,
  COUNT(DISTINCT CASE WHEN wc.status = 'connected' THEN wc.id END) as active_connections,
  
  COUNT(DISTINCT c.id) as total_conversations,
  COALESCE(SUM(c.unread_count), 0) as total_unread_messages,
  
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT CASE WHEN m.timestamp > NOW() - INTERVAL '24 hours' THEN m.id END) as messages_today,
  COUNT(DISTINCT CASE WHEN m.timestamp > NOW() - INTERVAL '7 days' THEN m.id END) as messages_this_week,
  
  COUNT(DISTINCT ac.id) as total_ai_chats,
  COUNT(DISTINCT am.id) as total_ai_messages

FROM whatsapp_connections wc
LEFT JOIN conversations c ON c.connection_id = wc.id
LEFT JOIN messages m ON m.conversation_id = c.id
LEFT JOIN ai_chats ac ON ac.user_id = wc.user_id
LEFT JOIN ai_messages am ON am.chat_id = ac.id
GROUP BY wc.user_id;