-- ====================================
-- MIGRATION: Google Calendar Tokens (Fase 5)
-- ====================================
-- Descrição: Tabela para armazenar tokens OAuth do Google Calendar do admin
-- Data: 2025-10-29

-- Tabela para armazenar tokens do Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT, -- Timestamp em milissegundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que apenas um registro por admin (para facilitar busca)
  CONSTRAINT unique_admin_tokens UNIQUE (admin_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_admin_id ON google_calendar_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_expiry ON google_calendar_tokens(expiry_date);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver seus próprios tokens
CREATE POLICY "Admins can view own tokens"
  ON google_calendar_tokens FOR SELECT
  USING (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem inserir seus próprios tokens
CREATE POLICY "Admins can insert own tokens"
  ON google_calendar_tokens FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem atualizar seus próprios tokens
CREATE POLICY "Admins can update own tokens"
  ON google_calendar_tokens FOR UPDATE
  USING (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem deletar seus próprios tokens
CREATE POLICY "Admins can delete own tokens"
  ON google_calendar_tokens FOR DELETE
  USING (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE google_calendar_tokens IS 'Armazena tokens OAuth do Google Calendar para integração';
COMMENT ON COLUMN google_calendar_tokens.admin_id IS 'ID do perfil admin (deve ter role = admin)';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'Token de acesso OAuth (expira em ~1 hora)';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'Token para renovar access_token (não expira)';
COMMENT ON COLUMN google_calendar_tokens.expiry_date IS 'Timestamp em milissegundos quando o access_token expira';
