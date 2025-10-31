# 🚀 ByStartup - Portal do Cliente

Portal exclusivo para clientes ByStartup acompanharem seus projetos, reuniões, contratos e acessarem insights personalizados.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Documentação Técnica](#documentação-técnica)

---

## 🎯 Visão Geral

O **ByStartup Portal do Cliente** é uma aplicação web progressiva (PWA) que oferece aos clientes da ByStartup um canal centralizado e moderno para:

- Visualizar e acompanhar reuniões agendadas
- Acessar resumos de reuniões anteriores
- Gerenciar múltiplos contratos
- Consumir conteúdo exclusivo (podcasts e vídeos)
- Solicitar suporte diretamente pelo portal

---

## ✨ Funcionalidades

### Para Clientes

- **Dashboard Personalizado**

  - Boas-vindas customizadas com logo da empresa
  - Visualização da próxima reunião
  - Acesso rápido às últimas reuniões
  - Overview dos contratos ativos
  - Listagem de serviços contratados

- **Gestão de Contratos**

  - Visualização de todos os contratos
  - Filtros por status (ativo/inativo)
  - Download de documentos
  - Detalhamento de serviços incluídos

- **Reuniões**

  - Calendário de reuniões futuras e passadas
  - Filtros por departamento e período
  - Visualização de resumos
  - Download de atas de reunião
  - **Integração com Google Calendar** (Fase 5 ✅)
    - Salvar reuniões automaticamente no Google Calendar
    - Reagendar reuniões (sincroniza com Google Calendar)
    - Excluir reuniões (remove do Google Calendar)
    - Refresh automático de tokens OAuth

- **Insights Exclusivos**

  - Biblioteca de podcasts
  - Galeria de vídeos
  - Player integrado de mídia
  - Filtros por tipo de conteúdo

- **Suporte Rápido**
  - Botão flutuante de atendimento
  - Acesso direto ao WhatsApp
  - Ligação telefônica direta
  - Abertura de solicitações de suporte

### Para Administradores

- **Painel Administrativo** (base estruturada)
  - Estatísticas gerais
  - Preparado para gestão completa em próximas fases

---

## 🛠️ Tecnologias

### Frontend

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **Shadcn UI** - Componentes UI acessíveis
- **Radix UI** - Primitivas de UI
- **Zustand** - Gerenciamento de estado

### Backend & Database

- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Storage

### Ferramentas

- **date-fns** - Manipulação de datas
- **lucide-react** - Ícones
- **sonner** - Notificações toast
- **ESLint** - Linting

---

## 📦 Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- Conta no **Supabase** (gratuita)
- Conta no **Vercel** (para deploy, gratuita)

---

## 🚀 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/sua-org/bystartupforclient.git
cd bystartupforclient
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais (veja seção [Configuração](#configuração)).

---

## ⚙️ Configuração

### 1. Configuração do Supabase

Veja o guia completo em [`docs/SETUP.md`](docs/SETUP.md).

**Resumo:**

- Crie um projeto no Supabase
- Execute o script SQL do schema ([`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md))
- Configure as políticas RLS
- Insira dados de demonstração ([`docs/seed-data.json`](docs/seed-data.json))

### 2. Variáveis de Ambiente

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp & Support
NEXT_PUBLIC_WHATSAPP_NUMBER=5513999999999
NEXT_PUBLIC_SUPPORT_PHONE=08007841414
```

---

## 💻 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## 📁 Estrutura do Projeto

```
bystartupforclient/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Rotas protegidas do cliente
│   │   ├── dashboard/
│   │   ├── contratos/
│   │   ├── reunioes/
│   │   ├── insights/
│   │   └── layout.tsx
│   ├── (admin)/             # Rotas administrativas
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Componentes Shadcn UI
│   ├── auth/                # Componentes de autenticação
│   ├── dashboard/           # Componentes do dashboard
│   ├── contratos/           # Componentes de contratos
│   ├── reunioes/            # Componentes de reuniões
│   ├── insights/            # Componentes de insights
│   └── shared/              # Componentes compartilhados
├── lib/
│   ├── supabase/            # Configuração Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── google-calendar/     # Integração Google Calendar (Fase 5)
│   │   ├── auth.ts
│   │   ├── tokens.ts
│   │   ├── client.ts
│   │   ├── helpers.ts
│   │   └── availability.ts
│   ├── stores/              # Stores Zustand
│   └── utils.ts
├── types/
│   └── database.types.ts    # Tipos TypeScript do banco
├── docs/
│   ├── PLANO_DESENVOLVIMENTO.md
│   ├── DATABASE_SCHEMA.md
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── FASE5_IMPLEMENTACAO.md
│   ├── migrations/
│   │   └── 005_google_calendar_tokens.sql
│   └── seed-data.json
├── public/
│   ├── manifest.json        # PWA manifest
│   └── [assets]
├── middleware.ts            # Middleware de autenticação
├── .env.local              # Variáveis de ambiente (não commitado)
├── .env.example            # Template de variáveis
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🌐 Deploy

### Vercel (Recomendado)

Veja o guia completo e detalhado em **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)**

**Resumo rápido:**

1. **Faça push do código para o GitHub**

2. **Importe o projeto na Vercel**

   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Import Project"
   - Selecione o repositório

3. **Configure as variáveis de ambiente**

   - Adicione todas as variáveis do `.env.local`
   - ⚠️ **Importante:** Atualize `NEXT_PUBLIC_APP_URL` para a URL da Vercel
   - ⚠️ **Importante:** Atualize `GOOGLE_REDIRECT_URI` se usar Google Calendar

4. **Atualize configurações externas**
   - Supabase: Adicione a URL da Vercel em Redirect URLs
   - Google Cloud Console: Adicione a URL de callback (se aplicável)

5. **Deploy**
   - A Vercel fará o build e deploy automaticamente
   - Cada push na branch main gera um novo deploy

📖 **Para instruções detalhadas, consulte [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)**

### PWA

O aplicativo já está configurado como PWA:

- Arquivo `manifest.json` configurado
- Service Worker automático via Next.js
- Ícones e tema colors definidos

---

## 📚 Documentação Técnica

- **[Plano de Desenvolvimento](docs/PLANO_DESENVOLVIMENTO.md)** - Roadmap e checklist
- **[Arquitetura](docs/ARCHITECTURE.md)** - Decisões arquiteturais e padrões
- **[Schema do Banco](docs/DATABASE_SCHEMA.md)** - Estrutura completa do banco de dados
- **[Setup e Configuração](docs/SETUP.md)** - Guia passo a passo de configuração
- **[Fase 5 - Google Calendar](docs/FASE5_IMPLEMENTACAO.md)** - Integração completa com Google Calendar (tokens no banco, refresh automático)

---

## 👥 Usuários de Demonstração

Após inserir os dados de seed, você pode acessar com:

**Cliente:**

- Email: `cliente@techcorp.com`
- Senha: `senha123`

**Admin:**

- Email: `admin@bystartup.com`
- Senha: `admin123`

---

## 🎨 Paleta de Cores

```css
--primary: #e6e730; /* Amarelo ByStartup */
--secondary: #34372e; /* Verde escuro ByStartup */
--accent: #ff5858; /* Vermelho/Rosa */
--background: #f7f7f7; /* Cinza claro */
```

---

## 📞 Suporte

Para dúvidas ou problemas:

- **Email:** senhas@bystartup.com.br
- **Telefone:** 0800 784 1414
- **WhatsApp:** Configurável nas variáveis de ambiente

---

## 📄 Licença

© 2025 ByStartup. Todos os direitos reservados.

**Documento Confidencial**

---

## 🤝 Contribuindo

Este é um projeto privado da ByStartup. Para contribuições internas, siga o processo de PR padrão.

---

**Desenvolvido com ❤️ pela equipe ByStartup**
