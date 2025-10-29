# 🗄️ Schema do Banco de Dados - ByStartup Clientes

## Visão Geral

O banco de dados utiliza **PostgreSQL** através do **Supabase** e implementa **Row Level Security (RLS)** para garantir segurança e isolamento de dados entre clientes.

---

## 📊 Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (N:1)
companies
    ↓ (1:N)
contracts
    ↓ (1:N)
services

contracts
    ↓ (1:N)
meetings

contracts (nullable)
    ↓ (1:N)
insights

companies
    ↓ (1:N)
support_requests
```

---

## 📋 Tabelas

### 1. **profiles**

Estende a tabela `auth.users` do Supabase com informações adicionais do usuário.

```sql
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

CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

**Campos:**

- `id`: UUID, chave primária e FK para auth.users
- `email`: Email do usuário (único)
- `full_name`: Nome completo
- `avatar_url`: URL da foto de perfil (opcional)
- `company_id`: FK para a empresa do usuário
- `role`: Papel do usuário (client | admin)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

---

### 2. **companies**

Empresas clientes da ByStartup.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
```

**Campos:**

- `id`: UUID, chave primária
- `name`: Nome da empresa
- `logo_url`: URL do logo da empresa (opcional)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

---

### 3. **contracts**

Contratos entre ByStartup e empresas clientes.

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_signed_date ON contracts(signed_date);
```

**Campos:**

- `id`: UUID, chave primária
- `company_id`: FK para a empresa
- `contract_number`: Número do contrato (único)
- `title`: Título do contrato
- `description`: Descrição detalhada (opcional)
- `signed_date`: Data de assinatura
- `status`: Status (active | inactive)
- `contract_file_url`: URL do PDF do contrato (opcional)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

---

### 4. **services**

Serviços incluídos em cada contrato.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('assessoria', 'desenvolvimento', 'landing_page', 'software')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_contract_id ON services(contract_id);
CREATE INDEX idx_services_type ON services(type);
```

**Campos:**

- `id`: UUID, chave primária
- `contract_id`: FK para o contrato
- `name`: Nome do serviço
- `description`: Descrição do serviço (opcional)
- `type`: Tipo de serviço (assessoria | desenvolvimento | landing_page | software)
- `created_at`: Data de criação

---

### 5. **meetings**

Reuniões agendadas e realizadas.

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_meetings_contract_id ON meetings(contract_id);
CREATE INDEX idx_meetings_meeting_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_department ON meetings(department);
```

**Campos:**

- `id`: UUID, chave primária
- `contract_id`: FK para o contrato
- `title`: Título da reunião
- `department`: Departamento responsável (comercial | tecnologia | marketing)
- `meeting_date`: Data e hora da reunião
- `status`: Status (scheduled | completed | cancelled)
- `google_calendar_event_id`: ID do evento no Google Calendar (opcional)
- `summary`: Resumo da reunião (opcional)
- `summary_file_url`: URL do PDF do resumo (opcional)
- `created_by`: FK para o usuário que criou
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

---

### 6. **insights**

Podcasts e vídeos disponibilizados para os clientes.

```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_insights_contract_id ON insights(contract_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_published_at ON insights(published_at);
```

**Campos:**

- `id`: UUID, chave primária
- `contract_id`: FK para o contrato (opcional, null = insight global)
- `title`: Título do insight
- `description`: Descrição (opcional)
- `type`: Tipo (podcast | video)
- `media_url`: URL do arquivo de mídia
- `thumbnail_url`: URL da thumbnail (opcional)
- `duration`: Duração em segundos
- `published_at`: Data de publicação
- `created_at`: Data de criação

---

### 7. **support_requests**

Solicitações de suporte abertas pelos clientes.

```sql
CREATE TABLE support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_requests_company_id ON support_requests(company_id);
CREATE INDEX idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX idx_support_requests_status ON support_requests(status);
```

**Campos:**

- `id`: UUID, chave primária
- `company_id`: FK para a empresa
- `user_id`: FK para o usuário que criou
- `subject`: Assunto da solicitação
- `message`: Mensagem detalhada
- `status`: Status (open | in_progress | closed)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

---

## 🔒 Row Level Security (RLS)

### Políticas de Segurança

#### **profiles**

```sql
-- Clientes podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Clientes podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **companies**

```sql
-- Usuários podem ver apenas sua própria empresa
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins podem ver todas as empresas
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **contracts**

```sql
-- Usuários podem ver contratos de sua empresa
CREATE POLICY "Users can view own company contracts"
  ON contracts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins podem ver e gerenciar todos os contratos
CREATE POLICY "Admins can manage all contracts"
  ON contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **meetings**

```sql
-- Usuários podem ver reuniões dos contratos de sua empresa
CREATE POLICY "Users can view own company meetings"
  ON meetings FOR SELECT
  USING (
    contract_id IN (
      SELECT c.id FROM contracts c
      INNER JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Admins podem gerenciar todas as reuniões
CREATE POLICY "Admins can manage all meetings"
  ON meetings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **insights**

```sql
-- Usuários podem ver insights globais ou de seus contratos
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

-- Admins podem gerenciar todos os insights
CREATE POLICY "Admins can manage all insights"
  ON insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### **support_requests**

```sql
-- Usuários podem criar solicitações
CREATE POLICY "Users can create support requests"
  ON support_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Usuários podem ver solicitações de sua empresa
CREATE POLICY "Users can view own company requests"
  ON support_requests FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins podem gerenciar todas as solicitações
CREATE POLICY "Admins can manage all requests"
  ON support_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🔄 Triggers

### Atualização automática de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
```

### Sincronização de perfil após criação de usuário

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 📦 Storage Buckets

### Buckets no Supabase Storage

```sql
-- Logos de empresas
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Avatares de usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Contratos (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false);

-- Resumos de reuniões (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-summaries', 'meeting-summaries', false);

-- Podcasts (MP3)
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcasts', 'podcasts', true);

-- Vídeos (MP4)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Thumbnails de insights
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);
```

### Políticas de Storage

```sql
-- Avatares: qualquer usuário autenticado pode fazer upload do seu próprio avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Contratos: apenas admins podem fazer upload
CREATE POLICY "Admins can upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem baixar contratos de sua empresa
CREATE POLICY "Users can download own company contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## 🎯 Índices de Performance

```sql
-- Otimização de queries frequentes
CREATE INDEX idx_contracts_company_status ON contracts(company_id, status);
CREATE INDEX idx_meetings_contract_date ON meetings(contract_id, meeting_date);
CREATE INDEX idx_insights_type_published ON insights(type, published_at DESC);
CREATE INDEX idx_support_requests_company_status ON support_requests(company_id, status);
```

---

**Documento Confidencial - ByStartup © 2025**
