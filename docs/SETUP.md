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
3. Habilite a **Google Calendar API**:
   - Vá em **APIs & Services** > **Library**
   - Procure por "Google Calendar API"
   - Clique em **Enable**
4. Configure OAuth 2.0:
   - Vá em **APIs & Services** > **Credentials**
   - Clique em **Create Credentials** > **OAuth client ID**
   - Se for a primeira vez, configure a **OAuth consent screen**:
     - Tipo: **External** (para desenvolvimento)
     - Preencha informações básicas (app name, email)
     - Scopes: Adicione `https://www.googleapis.com/auth/calendar` e `https://www.googleapis.com/auth/calendar.events`
     - Test users: Adicione seu email do Google
   - Crie o OAuth Client ID:
     - Application type: **Web application**
     - Name: `ByStartup Calendar Client`
     - Authorized redirect URIs:
       - `http://localhost:3000/api/auth/google/callback` (desenvolvimento)
       - `https://seu-dominio.vercel.app/api/auth/google/callback` (produção)
5. Copie o **Client ID** e **Client Secret**

### 4.2 Adicionar Credenciais ao Projeto

Adicione ao `.env.local`:

```bash
# Google Calendar OAuth Credentials
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 4.3 Obter Tokens de Acesso para Testes

Para testar a integração, você precisa obter os tokens de acesso do Google Calendar. Existem duas formas:

#### Opção A: Via Fluxo OAuth (Recomendado)

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Obtenha a URL de autorização:**
   - Faça uma requisição GET para: `http://localhost:3000/api/calendar/authorize`
   - Ou acesse via browser/Postman:
     ```bash
     curl http://localhost:3000/api/calendar/authorize
     ```
   - Você receberá uma resposta JSON com `authUrl`

3. **Autorize o acesso:**
   - Abra a `authUrl` no navegador
   - Faça login com sua conta Google
   - Aceite as permissões solicitadas
   - Você será redirecionado para `/api/auth/google/callback`

4. **Obter os tokens:**
   - Após o redirecionamento, verifique o **console do servidor**
   - Os tokens serão logados no formato:
     ```json
     {
       "access_token": "ya29.a0...",
       "refresh_token": "1//0g...",
       "expiry_date": 1735689600000
     }
     ```

5. **Adicionar tokens ao `.env.local`:**
   ```bash
   # Tokens temporários para testes (remover quando Fase 5 for implementada)
   GOOGLE_TEST_ACCESS_TOKEN=ya29.a0AfH6SMB...
   GOOGLE_TEST_REFRESH_TOKEN=1//0gvQVzQ...  # (opcional, mas recomendado)
   GOOGLE_TEST_EXPIRY_DATE=1735689600000      # (opcional, timestamp em ms)
   ```

6. **Reinicie o servidor** para carregar as novas variáveis:
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

#### Opção B: Via Google OAuth Playground

1. Acesse [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Clique em ⚙️ (Settings) no canto superior direito
3. Marque **"Use your own OAuth credentials"**
4. Cole seu `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
5. No painel esquerdo, encontre **"Calendar API v3"**
6. Marque os scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
7. Clique em **"Authorize APIs"**
8. Faça login e autorize
9. Clique em **"Exchange authorization code for tokens"**
10. Copie os tokens retornados
11. Adicione ao `.env.local` conforme descrito acima

### 4.4 Testar a Integração

Após configurar os tokens, você pode testar as três funções principais:

#### 4.4.1 Salvar Reunião no Google Calendar

```typescript
import { saveMeetingToGoogleCalendar } from "@/lib/actions/meetings";

const result = await saveMeetingToGoogleCalendar(meetingId);

if (result.success) {
  console.log("Reunião salva! Event ID:", result.data?.google_calendar_event_id);
} else {
  console.error("Erro:", result.error);
}
```

#### 4.4.2 Reagendar Reunião

```typescript
import { rescheduleMeeting } from "@/lib/actions/meetings";

// newDate deve ser uma string ISO (ex: "2025-01-15T14:00:00Z")
const result = await rescheduleMeeting(meetingId, newDateISOString);

if (result.success) {
  console.log("Reunião reagendada!");
} else {
  console.error("Erro:", result.error);
}
```

#### 4.4.3 Excluir Reunião

```typescript
import { deleteMeeting } from "@/lib/actions/meetings";

const result = await deleteMeeting(meetingId);

if (result.success) {
  console.log("Reunião excluída!");
} else {
  console.error("Erro:", result.error);
}
```

### 4.5 Verificar Eventos Criados

1. Acesse [Google Calendar](https://calendar.google.com)
2. Verifique se os eventos aparecem no seu calendário principal
3. Confirme que as datas, títulos e descrições estão corretas

### 4.6 Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] Google Calendar API habilitada
- [ ] OAuth 2.0 Client ID criado
- [ ] Variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` configuradas
- [ ] Tokens obtidos via OAuth flow
- [ ] Variáveis `GOOGLE_TEST_ACCESS_TOKEN` configuradas (e opcionalmente `GOOGLE_TEST_REFRESH_TOKEN`)
- [ ] Servidor reiniciado após adicionar variáveis
- [ ] Testes básicos executados com sucesso

### 4.7 Migração para Fase 5 (Tokens no Banco de Dados) ✅

A **Fase 5** foi implementada! Os tokens agora são armazenados automaticamente no banco de dados, eliminando a necessidade de variáveis de ambiente.

#### 4.7.1 Executar Migração do Banco

1. **Acesse o Supabase:**
   - Vá em **SQL Editor** > **New query**
   - Cole o conteúdo de `docs/migrations/005_google_calendar_tokens.sql`
   - Clique em **Run**

2. **Migrar Tokens Existentes (se você já tinha tokens no `.env.local`):**
   - Certifique-se de estar logado como **admin**
   - Acesse: `http://localhost:3000/api/calendar/migrate-tokens`
   - Os tokens serão migrados automaticamente do `.env.local` para o banco

3. **OU Conectar Novamente (se preferir):**
   - Acesse: `http://localhost:3000/api/calendar/authorize`
   - Copie a `authUrl` e autorize novamente
   - Tokens serão salvos automaticamente no banco

#### 4.7.2 Verificar Status dos Tokens

Acesse: `http://localhost:3000/api/calendar/check-tokens`

Você verá:
- Se há tokens no banco
- Data de expiração
- Se possui refresh_token

#### 4.7.3 Benefícios da Fase 5

- ✅ **Refresh automático:** Tokens são renovados automaticamente antes de expirar
- ✅ **Segurança:** Tokens protegidos por RLS (Row Level Security)
- ✅ **Persistência:** Não precisa configurar variáveis de ambiente
- ✅ **Gestão centralizada:** Tokens gerenciados pelo sistema

### 4.8 Importante ⚠️

- **Tokens expiram**: Access tokens normalmente expiram após 1 hora, mas são renovados automaticamente usando `refresh_token`
- **Fase 5 Implementada**: Os tokens agora são salvos no banco de dados automaticamente (veja seção 4.7)
- **Fallback**: Se não houver tokens no banco, o sistema ainda tenta usar variáveis `GOOGLE_TEST_*` como fallback
- **Segurança**: **NUNCA** commite tokens no repositório Git!
- **Produção**: Em produção, atualize o `GOOGLE_REDIRECT_URI` para a URL do seu domínio.

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

### Erro: "Google Calendar não está configurado"

**Causa:** Tokens não configurados ou função retornando `null`

**Solução:**

1. Verifique se `GOOGLE_TEST_ACCESS_TOKEN` está definido no `.env.local`
2. Verifique se o servidor foi reiniciado após adicionar a variável
3. Confirme que o token não expirou (access tokens expiram em ~1 hora)
4. Obtenha novos tokens seguindo o passo **4.3**

### Erro: "Invalid Credentials" ou "Token expired"

**Causa:** Token de acesso expirado ou inválido

**Solução:**

1. **Renove o token manualmente:**
   - Siga novamente o passo **4.3** para obter novos tokens
   - Atualize `GOOGLE_TEST_ACCESS_TOKEN` no `.env.local`
   - Reinicie o servidor

2. **Use refresh token (quando implementado):**
   - O `GOOGLE_TEST_REFRESH_TOKEN` permite renovação automática
   - Adicione-o ao `.env.local` se disponível

### Erro: "Redirect URI mismatch"

**Causa:** URI de redirecionamento não corresponde ao configurado no Google Cloud

**Solução:**

1. Verifique o `GOOGLE_REDIRECT_URI` no `.env.local`
2. Confirme que a mesma URI está cadastrada no Google Cloud Console:
   - **APIs & Services** > **Credentials** > Seu OAuth Client
   - Adicione a URI em **Authorized redirect URIs**
3. Aguarde alguns minutos para propagação
4. Tente novamente

### Erro: "Insufficient permissions" ou "Scope not granted"

**Causa:** Scopes necessários não foram solicitados ou negados

**Solução:**

1. Verifique se durante a autorização você aceitou todas as permissões
2. Se negou, será necessário reautorizar:
   - Acesse novamente a URL de autorização
   - **Revogue** o acesso anterior se solicitado
   - Aceite todas as permissões solicitadas
3. Confirme que os scopes corretos estão no código de autorização

---

## 📞 Suporte

Problemas na configuração?

- Abra uma issue no GitHub
- Entre em contato: senhas@bystartup.com.br

---

**Documento Confidencial - ByStartup © 2025**
