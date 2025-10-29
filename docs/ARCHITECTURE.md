# 🏗️ Arquitetura do Sistema - ByStartup Portal do Cliente

## Visão Geral

Este documento descreve a arquitetura, decisões técnicas e padrões de código do projeto ByStartup Portal do Cliente.

---

## 📐 Arquitetura de Alto Nível

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 16 (App Router)                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │   Auth   │  │Dashboard │  │  Admin   │            │ │
│  │  │  Routes  │  │  Routes  │  │  Routes  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │           React Components (RSC + Client)         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Shadcn UI + Radix UI + Tailwind CSS             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │     │
│  │   Database   │  │   (JWT)      │  │  (Arquivos)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          Row Level Security (RLS)                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decisões Arquiteturais

### 1. **Next.js App Router**

**Decisão:** Utilizamos o App Router do Next.js 16 ao invés do Pages Router.

**Motivos:**

- Server Components por padrão (melhor performance)
- Layouts aninhados e reutilizáveis
- Loading e error states automáticos
- Streaming e Suspense nativos
- Melhor SEO e performance

**Trade-offs:**

- Curva de aprendizado para desenvolvedores acostumados com Pages Router
- Algumas bibliotecas ainda não têm suporte completo

### 2. **Supabase como Backend**

**Decisão:** Usamos Supabase ao invés de criar um backend custom.

**Motivos:**

- Redução significativa de tempo de desenvolvimento
- Authentication pronto e seguro
- Banco de dados PostgreSQL robusto
- RLS para segurança granular
- Storage integrado para arquivos
- Real-time opcional para futuras features
- Escalabilidade automática

**Trade-offs:**

- Dependência de serviço terceiro
- Custo pode aumentar com escala (mas previsível)

### 3. **Row Level Security (RLS)**

**Decisão:** Implementamos RLS em todas as tabelas do Supabase.

**Motivos:**

- Segurança a nível de banco de dados
- Isolamento automático de dados entre clientes
- Proteção contra vulnerabilidades de aplicação
- Auditoria e compliance facilitados

### 4. **TypeScript Strict**

**Decisão:** TypeScript em modo strict em toda a aplicação.

**Motivos:**

- Detecção de erros em tempo de desenvolvimento
- Melhor autocomplete e IntelliSense
- Documentação viva do código
- Refactoring mais seguro

### 5. **Padrão de Composição de Componentes**

**Decisão:** Componentes funcionais com composição ao invés de herança.

**Motivos:**

- Reutilização facilitada
- Código mais declarativo
- Melhor testabilidade
- Alinhado com best practices React

---

## 🗂️ Estrutura de Pastas

### Princípios de Organização

1. **Feature-based**: Agrupamos por domínio/feature, não por tipo técnico
2. **Colocation**: Código relacionado fica próximo
3. **Separação de responsabilidades**: UI, lógica de negócio e dados separados

### Convenções de Nomenclatura

```
kebab-case          → pastas e arquivos
PascalCase          → Componentes React e Types/Interfaces
camelCase           → funções, variáveis
SCREAMING_SNAKE     → constantes
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

```
1. Usuário acessa /login
2. Insere email/senha
3. Supabase Auth valida credenciais
4. JWT token é retornado e armazenado em cookie httpOnly
5. Middleware valida token em toda navegação
6. Perfil do usuário é carregado do banco
7. Dashboard é renderizado com dados do usuário
```

### Proteção de Rotas

#### Middleware (middleware.ts)

```typescript
// Valida sessão em TODAS as rotas (exceto públicas)
// Redireciona para /login se não autenticado
// Refresh automático de token
```

#### Layout Server Components

```typescript
// Verifica autenticação no servidor
// Busca dados do usuário
// Redireciona se não autorizado
```

#### Role-based Access

```typescript
// Verificação de role (client | admin) no layout
// Admin tem acesso a rotas /admin
// Client tem acesso apenas a rotas /dashboard
```

---

## 🎨 Sistema de Design

### Tailwind CSS 4

**Configuração personalizada:**

- Cores da marca ByStartup em variáveis CSS
- Classes utilitárias customizadas
- Responsive breakpoints padrão
- Dark mode preparado (desabilitado no MVP)

### Shadcn UI

**Estratégia:**

- Componentes copiados para o projeto (não npm package)
- Customizados com cores ByStartup
- Acessibilidade garantida via Radix UI
- Totalmente type-safe

### Design Tokens

```css
--primary: #e6e730; /* Botões principais, destaques */
--secondary: #34372e; /* Header, textos importantes */
--accent: #ff5858; /* Alertas, CTAs secundários */
--background: #f7f7f7; /* Fundo das páginas */
```

---

## 🔄 Gerenciamento de Estado

### Estratégia Multi-layer

1. **URL State** (nuqs - futuro)

   - Filtros, paginação, tabs
   - Shareable state via URL

2. **Server State** (Supabase)

   - Dados do banco
   - Fetching em Server Components
   - Cache automático do Next.js

3. **Client State** (Zustand)
   - Dados do usuário logado
   - Estado da UI (modals, menus)
   - Persisted state quando necessário

### Exemplo: User Store

```typescript
// lib/stores/user-store.ts
// Estado persistido do usuário
// Sincronizado após login
// Limpo no logout
```

---

## 📊 Fetching de Dados

### Padrão Adotado

**Server Components (preferencial):**

```typescript
// Fetching direto no Server Component
const {data} = await supabase.from("table").select();
// Renderização com dados no servidor
// Zero JavaScript no cliente para fetching
```

**Client Components (quando necessário):**

```typescript
// Use apenas para:
// - Interações do usuário (forms, buttons)
// - Real-time subscriptions
// - Browser APIs
```

### Quando usar cada abordagem

| Cenário                | Abordagem        |
| ---------------------- | ---------------- |
| Listar dados estáticos | Server Component |
| Formulários            | Client Component |
| Dashboard inicial      | Server Component |
| Filtros dinâmicos      | Client Component |
| Real-time updates      | Client Component |

---

## 🔒 Segurança

### Camadas de Segurança

1. **Authentication (Supabase Auth)**

   - JWT tokens em httpOnly cookies
   - Refresh automático de tokens
   - Logout em todos os dispositivos suportado

2. **Authorization (RLS)**

   - Políticas no banco de dados
   - Usuário só vê dados de sua empresa
   - Admin vê tudo

3. **Middleware**

   - Validação de sessão em toda navegação
   - Redirect automático se não autenticado
   - Proteção de rotas sensíveis

4. **Validação de Dados**
   - TypeScript para validação de tipos
   - Zod/Yup para validação de forms (futuro)
   - Sanitização de inputs

### Checklist de Segurança

- [x] Autenticação obrigatória para todas as rotas protegidas
- [x] RLS habilitado em todas as tabelas
- [x] Tokens JWT em cookies httpOnly
- [x] CORS configurado corretamente
- [x] Variáveis sensíveis em .env (não commitadas)
- [x] Policies RLS testadas
- [ ] Rate limiting (futuro)
- [ ] 2FA (futuro)

---

## 📦 Padrões de Código

### Componentes React

```typescript
// ✅ BOM
export function MyComponent({title}: MyComponentProps) {
  // 1. Hooks no topo
  const [state, setState] = useState();

  // 2. Funções auxiliares
  function handleClick() {}

  // 3. Effects
  useEffect(() => {}, []);

  // 4. Early returns
  if (!data) return <Loading />;

  // 5. Render principal
  return <div>{title}</div>;
}

// Props sempre tipadas com interface
interface MyComponentProps {
  title: string;
}
```

### Queries Supabase

```typescript
// ✅ BOM - Específico, type-safe
const {data, error} = await supabase
  .from("meetings")
  .select("id, title, meeting_date, department")
  .eq("contract_id", contractId)
  .order("meeting_date", {ascending: false})
  .limit(10);

// ❌ RUIM - Select tudo
const {data} = await supabase.from("meetings").select("*");
```

### Error Handling

```typescript
// ✅ BOM
try {
  const {data, error} = await supabase.from("table").select();

  if (error) {
    toast.error("Erro ao buscar dados");
    console.error(error);
    return;
  }

  // Processar data
} catch (error) {
  toast.error("Erro inesperado");
  console.error(error);
}

// ❌ RUIM - Ignorar erros
const {data} = await supabase.from("table").select();
```

---

## 🧪 Testing (Futuro)

### Estratégia Planejada

1. **Unit Tests** (Jest + Testing Library)

   - Componentes UI isolados
   - Funções utilitárias
   - Stores Zustand

2. **Integration Tests** (Playwright)

   - Fluxos críticos
   - Login/Logout
   - CRUD operations

3. **E2E Tests** (Playwright)
   - Jornadas completas do usuário
   - CI/CD integration

---

## 🚀 Performance

### Otimizações Implementadas

1. **Server Components por padrão**

   - Menos JavaScript no cliente
   - Renderização no servidor

2. **Imagens otimizadas** (Next.js Image)

   - Lazy loading automático
   - WebP automático
   - Responsive images

3. **Código splitting automático**

   - Route-based code splitting
   - Dynamic imports quando necessário

4. **Tailwind CSS purge**
   - CSS mínimo em produção
   - Apenas classes usadas

### Métricas de Performance

| Métrica                        | Target | Atual |
| ------------------------------ | ------ | ----- |
| FCP (First Contentful Paint)   | < 1.5s | TBD   |
| LCP (Largest Contentful Paint) | < 2.5s | TBD   |
| TTI (Time to Interactive)      | < 3.5s | TBD   |
| CLS (Cumulative Layout Shift)  | < 0.1  | TBD   |

---

## 🔮 Roadmap Técnico

### Fase 2 (Próximas Features)

- [ ] Google Calendar Integration completa
- [ ] Real-time notifications (Supabase Realtime)
- [ ] Notificações push (PWA)
- [ ] Upload de arquivos direto pelo cliente
- [ ] Chat em tempo real (suporte)
- [ ] Dark mode
- [ ] Internacionalização (i18n)

### Fase 3 (Melhorias)

- [ ] Testes automatizados
- [ ] Storybook para componentes
- [ ] Analytics e tracking
- [ ] Performance monitoring (Sentry)
- [ ] A/B testing
- [ ] SEO avançado

---

## 📝 Convenções de Commit

Seguimos **Conventional Commits**:

```
feat: adiciona nova funcionalidade
fix: corrige um bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudar funcionalidade
perf: melhoria de performance
test: adiciona ou corrige testes
chore: manutenção geral
```

---

## 🤝 Code Review Checklist

- [ ] Código segue os padrões definidos neste documento
- [ ] TypeScript sem erros
- [ ] Componentes devidamente tipados
- [ ] Sem console.logs desnecessários
- [ ] Error handling implementado
- [ ] Responsividade testada
- [ ] Acessibilidade considerada
- [ ] Performance verificada

---

**Documento Confidencial - ByStartup © 2025**
