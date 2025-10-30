# 🚀 Fase 5 - Implementação: Tokens no Banco de Dados

## 📋 Resumo

A Fase 5 implementa o armazenamento automático dos tokens OAuth do Google Calendar no banco de dados, eliminando a necessidade de variáveis de ambiente temporárias e implementando refresh automático de tokens.

---

## ✅ O que foi implementado

### 1. **Nova Tabela: `google_calendar_tokens`**

- Armazena tokens OAuth do admin
- Suporta refresh automático
- Implementa RLS (Row Level Security)
- Localização: `docs/migrations/005_google_calendar_tokens.sql`

### 2. **Funções Helper**

Criadas em `lib/google-calendar/tokens.ts`:

- `getGoogleCalendarTokensFromDB()` - Busca tokens do banco
- `saveGoogleCalendarTokens()` - Salva tokens no banco
- `updateGoogleCalendarTokens()` - Atualiza tokens existentes
- `refreshGoogleCalendarToken()` - Renova tokens expirados automaticamente

### 3. **Callback OAuth Atualizado**

- Agora salva tokens automaticamente no banco após autorização
- Valida que apenas admins podem conectar Google Calendar
- Localização: `app/api/auth/google/callback/route.ts`

### 4. **Busca Inteligente de Tokens**

Função `getGoogleCalendarTokens()` em `lib/actions/meetings.ts`:

- **Prioridade 1:** Banco de dados (produção)
- **Prioridade 2:** Variáveis de ambiente (fallback para desenvolvimento)
- **Refresh automático:** Renova tokens expirados antes de usar

---

## 🔧 Como Aplicar a Migração

### Passo 1: Executar SQL no Supabase

1. Acesse o dashboard do Supabase
2. Vá em **SQL Editor** > **New query**
3. Cole o conteúdo de `docs/migrations/005_google_calendar_tokens.sql`
4. Clique em **Run**

### Passo 2: Conectar Google Calendar (Primeira Vez)

1. Certifique-se de estar logado como **admin**
2. Acesse: `http://localhost:3000/api/calendar/authorize`
3. Copie a `authUrl` do JSON retornado
4. Abra a URL no navegador
5. Autorize o acesso ao Google Calendar
6. Os tokens serão salvos automaticamente no banco!

### Passo 3: Verificar

Os tokens agora são obtidos automaticamente do banco de dados. Você pode:
- Remover as variáveis `GOOGLE_TEST_*` do `.env.local` (opcional)
- Os tokens serão renovados automaticamente quando expirarem

---

## 🔄 Refresh Automático

O sistema renova tokens automaticamente:
- **Quando?** Quando o token está próximo de expirar (5 minutos antes)
- **Como?** Usa o `refresh_token` para obter novo `access_token`
- **Resultado:** Atualiza no banco e retorna o novo token

---

## 🔒 Segurança

- **RLS (Row Level Security):** Apenas admins podem ver/editar seus próprios tokens
- **Validação de Role:** Callback verifica se o usuário é admin antes de salvar
- **Tokens Seguros:** Armazenados no banco com políticas RLS ativas

---

## 📊 Estrutura da Tabela

```sql
google_calendar_tokens
├── id (UUID, PK)
├── admin_id (UUID, FK → profiles.id, UNIQUE)
├── access_token (TEXT)      -- Token de acesso (expira em ~1h)
├── refresh_token (TEXT)     -- Token para renovação (não expira)
├── expiry_date (BIGINT)     -- Timestamp quando access_token expira
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## 🧪 Migração de Desenvolvimento

Se você já estava usando variáveis de ambiente (`GOOGLE_TEST_*`):

### Opção A: Migração Automática (Recomendado)

1. **Execute a migração SQL** (Passo 1 acima)
2. **Migre os tokens automaticamente:**
   - Certifique-se de estar logado como **admin**
   - Acesse: `http://localhost:3000/api/calendar/migrate-tokens`
   - Os tokens serão copiados do `.env.local` para o banco automaticamente
3. **Verifique o resultado:**
   - Você verá uma mensagem de sucesso com os detalhes
   - O sistema agora busca tokens do banco
4. **(Opcional) Remova `GOOGLE_TEST_*` do `.env.local`** quando quiser

### Opção B: Nova Autorização

1. Execute a migração SQL
2. Revogue autorização antiga em: https://myaccount.google.com/permissions
3. Conecte via OAuth (Passo 2 acima)
4. Os tokens serão salvos no banco automaticamente

---

## ⚠️ Troubleshooting

### Erro: "Tokens não encontrados no banco de dados"

**Causa:** Nenhum admin conectou o Google Calendar ainda

**Solução:**
1. Certifique-se de estar logado como admin
2. Siga o Passo 2 acima para conectar

### Erro: "Token expirado e sem refresh_token"

**Causa:** Token expirou e não há refresh_token disponível

**Solução:**
1. Reconecte o Google Calendar (nova autorização)
2. Certifique-se de usar `access_type: "offline"` no OAuth (já configurado)

### Erro de Permissão no Supabase

**Causa:** RLS bloqueando acesso

**Solução:**
1. Verifique se executou a migração SQL completa
2. Confirme que você está logado como admin
3. Verifique as políticas RLS em `google_calendar_tokens`

---

## 📝 Próximos Passos (Opcional)

1. **Remover código temporário:**
   - Remover fallback de variáveis de ambiente (se desejar)
   - Limpar logs de debug

2. **Melhorias futuras:**
   - Dashboard admin para desconectar/reconectar Google Calendar
   - Notificações quando token está prestes a expirar
   - Suporte para múltiplos admins (se necessário)

---

## 🔌 Rotas de API Disponíveis

### `/api/calendar/authorize`
- **Método:** GET
- **Descrição:** Retorna URL de autorização OAuth
- **Uso:** Obter link para autorizar Google Calendar

### `/api/calendar/check-tokens`
- **Método:** GET
- **Descrição:** Verifica se há tokens salvos no banco
- **Retorna:** Status dos tokens (expirado, válido, etc.)

### `/api/calendar/migrate-tokens`
- **Método:** GET
- **Descrição:** Migra tokens do `.env.local` para o banco de dados
- **Requisitos:** Deve estar logado como admin
- **Uso:** Útil para migração da Fase 4 para Fase 5

### `/api/auth/google/callback`
- **Método:** GET
- **Descrição:** Callback OAuth que salva tokens automaticamente no banco
- **Uso:** Chamado automaticamente pelo Google após autorização

---

## ✅ Checklist de Implementação

- [x] Tabela `google_calendar_tokens` criada
- [x] RLS configurado
- [x] Funções helper implementadas
- [x] Refresh automático funcionando
- [x] Callback OAuth atualizado
- [x] Busca inteligente de tokens (banco → env fallback)
- [x] Rota de migração de tokens criada
- [x] Rota de verificação de tokens criada
- [x] Documentação criada e atualizada

---

**Fase 5 Completa! 🎉**

Os tokens agora são gerenciados automaticamente pelo sistema.
