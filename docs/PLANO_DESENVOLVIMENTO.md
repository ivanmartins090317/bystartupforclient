# 📋 Plano de Desenvolvimento - Aplicativo ByStartup Clientes

## 🎯 Meta: Entregar MVP em 2-3 dias

**Versão:** 1.0  
**Data:** 28/10/2025  
**Responsável:** Equipe ByStartup

---

## 📐 **FASE 1: Arquitetura e Fundação (Dia 1 - 4-6h)**

### 1.1 Estrutura de Pastas

```
app/
├── (auth)/
│   ├── login/
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   ├── contratos/
│   ├── reunioes/
│   ├── insights/
│   └── layout.tsx
├── (admin)/
│   └── admin/
└── api/
    └── auth/

components/
├── ui/ (shadcn)
├── auth/
├── dashboard/
├── contratos/
├── reunioes/
└── shared/

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── stores/
└── utils/

types/
└── database.types.ts

docs/
├── README.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── SETUP.md
└── seed-data.json
```

### 1.2 Configurações Essenciais

- [ ] Variáveis de ambiente (.env.local)
- [ ] Configuração Supabase Client/Server
- [ ] Middleware de autenticação
- [ ] Theme provider com paleta de cores ByStartup
- [ ] Tipagens TypeScript

### 1.3 Schema do Banco de Dados (Supabase)

**Tabelas:**

#### 1. **profiles** (estende auth.users)

```sql
- id (uuid, PK, FK para auth.users)
- email (text)
- full_name (text)
- avatar_url (text, nullable)
- company_id (uuid, FK para companies)
- role (enum: client | admin)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. **companies**

```sql
- id (uuid, PK)
- name (text)
- logo_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. **contracts**

```sql
- id (uuid, PK)
- company_id (uuid, FK para companies)
- contract_number (text, unique)
- title (text)
- description (text, nullable)
- signed_date (date)
- status (enum: active | inactive)
- contract_file_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. **services**

```sql
- id (uuid, PK)
- contract_id (uuid, FK para contracts)
- name (text)
- description (text, nullable)
- type (enum: assessoria | desenvolvimento | landing_page | software)
- created_at (timestamp)
```

#### 5. **meetings**

```sql
- id (uuid, PK)
- contract_id (uuid, FK para contracts)
- title (text)
- department (enum: comercial | tecnologia | marketing)
- meeting_date (timestamp)
- status (enum: scheduled | completed | cancelled)
- google_calendar_event_id (text, nullable)
- summary (text, nullable)
- summary_file_url (text, nullable)
- created_by (uuid, FK para profiles)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. **insights**

```sql
- id (uuid, PK)
- contract_id (uuid, FK para contracts, nullable)
- title (text)
- description (text, nullable)
- type (enum: podcast | video)
- media_url (text)
- thumbnail_url (text, nullable)
- duration (integer, em segundos)
- published_at (timestamp)
- created_at (timestamp)
```

#### 7. **support_requests**

```sql
- id (uuid, PK)
- company_id (uuid, FK para companies)
- user_id (uuid, FK para profiles)
- subject (text)
- message (text)
- status (enum: open | in_progress | closed)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🔐 **FASE 2: Autenticação (Dia 1 - 2-3h)**

### 2.1 Sistema de Login

- [ ] Página de login com email/senha
- [ ] Validação de formulários
- [ ] Integração com Supabase Auth
- [ ] Redirecionamento pós-login
- [ ] Tratamento de erros

### 2.2 Middleware e Proteção de Rotas

- [ ] Middleware Next.js para validar sessão
- [ ] Proteção de rotas /dashboard e /admin
- [ ] Refresh automático de tokens

### 2.3 Gerenciamento de Sessão

- [ ] Zustand store para dados do usuário
- [ ] Logout
- [ ] Persistência de sessão

---

## 📊 **FASE 3: Dashboard Cliente (Dia 2 - 6-8h)**

### 3.1 Layout Base

- [ ] Header com logo ByStartup + logo do cliente
- [ ] Sidebar de navegação
- [ ] Menu de usuário (avatar + dropdown)
- [ ] Seletor de contratos (se múltiplos)
- [ ] Responsividade mobile

### 3.2 Dashboard Principal (/)

- [ ] Boas-vindas personalizadas
- [ ] Card: Próxima reunião
  - Data/hora
  - Departamento
  - Link para detalhes
- [ ] Card: Últimas reuniões (lista)
  - Data
  - Departamento
  - Botões: Visualizar resumo | Download
- [ ] Card: Serviços contratados
  - Lista de serviços do contrato ativo
  - Badges por tipo
- [ ] Card: Acesso rápido aos contratos

### 3.3 Página de Contratos (/contratos)

- [ ] Lista de todos os contratos
- [ ] Filtros: status (ativo/inativo)
- [ ] Card por contrato com:
  - Número do contrato
  - Data de assinatura
  - Status
  - Serviços incluídos
  - Botão: Visualizar | Download PDF
- [ ] Troca de contrato ativo

### 3.4 Página de Reuniões (/reunioes)

- [ ] Calendário de reuniões
- [ ] Lista de reuniões (passadas e futuras)
- [ ] Filtros: departamento, período
- [ ] Detalhes da reunião em modal/página
- [ ] Download de resumos

### 3.5 Página de Insights (/insights)

- [ ] Tabs: Podcasts | Vídeos
- [ ] Grid de cards de insights
- [ ] Player de áudio embutido (podcasts)
- [ ] Player de vídeo embutido
- [ ] Filtros por data
- [ ] Thumbnail e descrição

### 3.6 Botão Flutuante de Atendimento

- [ ] Botão fixo no canto inferior direito
- [ ] Menu expansível com:
  - WhatsApp (link direto)
  - Telefone (0800)
  - Abrir solicitação (modal)
- [ ] Modal de solicitação:
  - Campo: Assunto
  - Campo: Mensagem
  - Botão: Enviar

---

## 🔧 **FASE 4: Integrações (Dia 2-3 - 3-4h)**

### 4.1 Google Calendar API

- [ ] Configuração OAuth 2.0
- [ ] Listagem de eventos
- [ ] Criação de reuniões
- [ ] Atualização/cancelamento
- [ ] Sincronização bidirecional

### 4.2 Upload de Arquivos (Supabase Storage)

- [ ] Upload de resumos de reuniões (PDF)
- [ ] Upload de contratos (PDF)
- [ ] Upload de podcasts (MP3)
- [ ] Upload de vídeos (MP4)
- [ ] Upload de logos de empresas
- [ ] Geração de URLs públicas

---

## 👨‍💼 **FASE 5: Painel Admin (Dia 3 - 4-5h)**

### 5.1 Estrutura Base

- [ ] Rota /admin protegida (role-based)
- [ ] Layout administrativo
- [ ] Navegação lateral

### 5.2 Funcionalidades Iniciais (MVP)

- [ ] Listagem de clientes
- [ ] Listagem de contratos
- [ ] Rota preparada para:
  - Cadastro de reuniões
  - Upload de insights
  - Gestão de solicitações
- ⚠️ Implementação completa: Fase 2 do projeto

---

## 📝 **FASE 6: Documentação e Dados (Dia 3 - 2-3h)**

### 6.1 Documentação Técnica (pasta docs/)

- [ ] README.md principal
  - Visão geral do projeto
  - Como executar
  - Estrutura de pastas
  - Tecnologias utilizadas
- [ ] ARCHITECTURE.md
  - Decisões arquiteturais
  - Fluxos principais
  - Padrões de código
- [ ] DATABASE_SCHEMA.md
  - Schema completo
  - Relacionamentos
  - Políticas RLS (Row Level Security)
- [ ] SETUP.md
  - Configuração do Supabase
  - Variáveis de ambiente
  - Google Calendar API setup
- [ ] API_DOCUMENTATION.md
  - Endpoints
  - Payloads
  - Exemplos

### 6.2 Dados de Demonstração

- [ ] seed-data.json com:
  - 2 empresas
  - 3 contratos
  - 10 reuniões
  - 5 insights (podcasts/vídeos)
  - 3 usuários
- [ ] Script de seed para Supabase
- [ ] Logos de exemplo

---

## 🎨 **FASE 7: UI/UX e Refinamento (Dia 3 - 3-4h)**

### 7.1 Design System

- [ ] Aplicar paleta de cores ByStartup:
  - Primary: #e6e730 (amarelo)
  - Secondary: #34372e (verde escuro)
  - Accent: #ff5858 (vermelho/rosa)
  - Background: #f7f7f7 (cinza claro)
- [ ] Fonte Inter em todo o projeto
- [ ] Logo ByStartup no header
- [ ] Componentes consistentes

### 7.2 Responsividade

- [ ] Mobile-first design
- [ ] Breakpoints Tailwind
- [ ] Menu hambúrguer mobile
- [ ] Cards e grids responsivos

### 7.3 Estados e Feedback

- [ ] Loading states (skeletons)
- [ ] Empty states
- [ ] Toast notifications (sonner)
- [ ] Error boundaries
- [ ] Confirmações de ações

---

## ✅ **FASE 8: Testes e Deploy (Dia 3 - 2-3h)**

### 8.1 Testes Manuais

- [ ] Fluxo completo de autenticação
- [ ] Navegação entre páginas
- [ ] CRUD de dados
- [ ] Responsividade
- [ ] Tratamento de erros

### 8.2 Deploy Vercel

- [ ] Configurar variáveis de ambiente
- [ ] Deploy de preview
- [ ] Deploy de produção
- [ ] Validar funcionamento

### 8.3 Entrega

- [ ] Repository no GitHub
- [ ] README completo
- [ ] Acesso configurado (senhas@bystartup.com.br)
- [ ] URL do deploy

---

## 📦 **Entregáveis Finais**

1. ✅ Código-fonte completo no GitHub
2. ✅ Aplicação deployada na Vercel (PWA)
3. ✅ Documentação técnica completa (pasta /docs)
4. ✅ Dados de demonstração (seed)
5. ✅ Instruções de setup e execução
6. ✅ Schema do banco Supabase
7. ✅ Variáveis de ambiente template (.env.example)

---

## 🚀 **Stack Tecnológica Confirmada**

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + Shadcn UI + Radix UI
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** Zustand
- **Integração:** Google Calendar API
- **Deploy:** Vercel
- **Versionamento:** Git + GitHub

---

## 📊 **Paleta de Cores ByStartup**

```css
--primary: #e6e730; /* Amarelo */
--secondary: #34372e; /* Verde escuro */
--accent: #ff5858; /* Vermelho/Rosa */
--background: #f7f7f7; /* Cinza claro */
```

---

## 📞 **Contatos de Suporte**

- **WhatsApp:** Grupo exclusivo do cliente
- **Telefone:** 0800 784 1414

---

## 📝 **Histórico de Atualizações**

| Data       | Versão | Descrição                                   |
| ---------- | ------ | ------------------------------------------- |
| 28/10/2025 | 1.0    | Criação do plano de desenvolvimento inicial |

---

**Documento Confidencial - ByStartup © 2025**
