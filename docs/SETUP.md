# ⚙️ Guia de Configuração - ByStartup Portal do Cliente

Este guia detalha passo a passo como configurar o ambiente de desenvolvimento e produção do projeto.

---

## 📋 Índice

1. [Configuração do Supabase](#1-configuração-do-supabase)
2. [Configuração do Projeto](#2-configuração-do-projeto)
3. [Inserção de Dados de Demonstração](#3-inserção-de-dados-de-demonstração)
4. [Configuração do Google Calendar (Opcional)](#4-configuração-do-google-calendar-opcional)
5. [Deploy na Vercel](#5-deploy-na-vercel)
6. [Troubleshooting](#troubleshooting)

---

## 1. Configuração do Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha:
   - **Name**: `bystartup-clients` (ou nome de sua escolha)
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha mais próximo dos usuários
   - **Pricing Plan**: Free (para desenvolvimento)
6. Clique em "Create new project"
7. Aguarde 1-2 minutos para provisionar

### 1.2 Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA exponha no frontend**

### 1.3 Executar Script SQL do Schema

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o seguinte script SQL:

```sql
-- ====================================
-- SCHEMA DO BANCO - BYSTARTUP CLIENTES
-- ====================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- TABELAS
-- ====================================

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  signed_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  contract_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('assessoria', 'desenvolvimento', 'landing_page', 'software')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('comercial', 'tecnologia', 'marketing')),
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  google_calendar_event_id TEXT,
  summary TEXT,
  summary_file_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('podcast', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Requests
CREATE TABLE support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ÍNDICES
-- ====================================

CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_company_status ON contracts(company_id, status);
CREATE INDEX idx_services_contract_id ON services(contract_id);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_meetings_contract_id ON meetings(contract_id);
CREATE INDEX idx_meetings_meeting_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_contract_date ON meetings(contract_id, meeting_date);
CREATE INDEX idx_insights_contract_id ON insights(contract_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_published_at ON insights(published_at DESC);
CREATE INDEX idx_support_requests_company_id ON support_requests(company_id);
CREATE INDEX idx_support_requests_status ON support_requests(status);

-- ====================================
-- TRIGGERS
-- ====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers de updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON support_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar profile ao criar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_company_id UUID;
BEGIN
  -- Buscar uma empresa default ou criar uma temporária
  SELECT id INTO default_company_id FROM companies LIMIT 1;

  IF default_company_id IS NULL THEN
    INSERT INTO companies (name) VALUES ('Empresa Temporária') RETURNING id INTO default_company_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    default_company_id,
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para COMPANIES
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para CONTRACTS
CREATE POLICY "Users can view own company contracts"
  ON contracts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all contracts"
  ON contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para SERVICES
CREATE POLICY "Users can view services of own contracts"
  ON services FOR SELECT
  USING (
    contract_id IN (
      SELECT c.id FROM contracts c
      INNER JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para MEETINGS
CREATE POLICY "Users can view meetings of own contracts"
  ON meetings FOR SELECT
  USING (
    contract_id IN (
      SELECT c.id FROM contracts c
      INNER JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all meetings"
  ON meetings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para INSIGHTS
CREATE POLICY "Users can view accessible insights"
  ON insights FOR SELECT
  USING (
    contract_id IS NULL OR
    contract_id IN (
      SELECT c.id FROM contracts c
      INNER JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all insights"
  ON insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para SUPPORT_REQUESTS
CREATE POLICY "Users can create support requests"
  ON support_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own company requests"
  ON support_requests FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON support_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================
-- STORAGE BUCKETS
-- ====================================

-- Criar buckets via dashboard do Supabase:
-- 1. Storage > Create bucket > "company-logos" (public)
-- 2. Storage > Create bucket > "avatars" (public)
-- 3. Storage > Create bucket > "contracts" (private)
-- 4. Storage > Create bucket > "meeting-summaries" (private)
-- 5. Storage > Create bucket > "podcasts" (public)
-- 6. Storage > Create bucket > "videos" (public)
-- 7. Storage > Create bucket > "thumbnails" (public)
```

4. Clique em "Run" para executar o script
5. Verifique se todas as tabelas foram criadas em **Table Editor**

### 1.4 Configurar Storage (Opcional)

Se for usar upload de arquivos:

1. Vá em **Storage** no dashboard
2. Crie os buckets necessários:
   - `company-logos` (público)
   - `avatars` (público)
   - `contracts` (privado)
   - `meeting-summaries` (privado)
   - `podcasts` (público)
   - `videos` (público)
   - `thumbnails` (público)

---

## 2. Configuração do Projeto

### 2.1 Clonar e Instalar

```bash
git clone https://github.com/sua-org/bystartupforclient.git
cd bystartupforclient
npm install
```

### 2.2 Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp & Support
NEXT_PUBLIC_WHATSAPP_NUMBER=5513999999999
NEXT_PUBLIC_SUPPORT_PHONE=08007841414
```

⚠️ **Importante:** Nunca commite o arquivo `.env.local` no Git!

### 2.3 Executar o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 3. Inserção de Dados de Demonstração

### 3.1 Criar Usuários no Supabase Auth

1. Vá em **Authentication** > **Users** no dashboard do Supabase
2. Clique em "Add user" > "Create new user"

**Usuário Cliente:**

- Email: `cliente@techcorp.com`
- Password: `senha123`
- Auto Confirm User: ✅ (marque)

**Usuário Admin:**

- Email: `admin@bystartup.com`
- Password: `admin123`
- Auto Confirm User: ✅ (marque)

### 3.2 Inserir Dados de Demonstração

Após criar os usuários, execute o seguinte SQL no **SQL Editor**:

```sql
-- Ver arquivo: docs/seed-data-insert.sql
```

Ou use o arquivo JSON em `docs/seed-data.json` e insira via código.

### 3.3 Atualizar Profiles com IDs Corretos

Após criar os usuários no Auth, você precisará obter os UUIDs reais:

1. Vá em **Authentication** > **Users**
2. Copie o UUID de cada usuário
3. Execute SQL para associar aos profiles:

```sql
UPDATE profiles
SET id = 'uuid-do-usuario-auth'
WHERE email = 'cliente@techcorp.com';
```

---

## 4. Configuração do Google Calendar (Opcional)

### 4.1 Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Habilite a Google Calendar API
4. Vá em "Credentials"
5. Crie OAuth 2.0 Client ID
6. Adicione redirect URI: `http://localhost:3000/api/auth/google/callback`

### 4.2 Adicionar Credenciais

Adicione ao `.env.local`:

```bash
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## 5. Deploy na Vercel

### 5.1 Push para GitHub

```bash
git add .
git commit -m "feat: initial commit"
git push origin main
```

### 5.2 Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Selecione seu repositório
4. Configure as variáveis de ambiente (copie do `.env.local`)
5. Clique em "Deploy"

### 5.3 Configurar Variáveis de Ambiente

Adicione TODAS as variáveis do `.env.local` na Vercel:

- Settings > Environment Variables
- Adicione uma por uma
- ⚠️ Lembre de atualizar `NEXT_PUBLIC_APP_URL` para a URL da Vercel

### 5.4 Atualizar Supabase

No Supabase, adicione a URL da Vercel em:

- Settings > API > Site URL
- Settings > Authentication > Redirect URLs

---

## Troubleshooting

### Erro: "Invalid JWT"

**Causa:** Token expirado ou inválido

**Solução:**

1. Limpe os cookies do navegador
2. Faça logout e login novamente
3. Verifique se as chaves do Supabase estão corretas no `.env.local`

### Erro: "Row Level Security Policy Violation"

**Causa:** RLS bloqueando acesso aos dados

**Solução:**

1. Verifique se executou todas as políticas RLS do script SQL
2. Confirme que o usuário está autenticado
3. Verifique o role do usuário (client ou admin)

### Erro: "Cannot read properties of null"

**Causa:** Dados não encontrados no banco

**Solução:**

1. Verifique se inseriu os dados de demonstração
2. Confira se os UUIDs dos usuários estão corretos
3. Valide as foreign keys

### Build falha na Vercel

**Causa:** Variáveis de ambiente faltando

**Solução:**

1. Verifique se TODAS as variáveis foram adicionadas
2. Rode `npm run build` localmente para testar
3. Verifique os logs de build na Vercel

---

## 📞 Suporte

Problemas na configuração?

- Abra uma issue no GitHub
- Entre em contato: senhas@bystartup.com.br

---

**Documento Confidencial - ByStartup © 2025**
