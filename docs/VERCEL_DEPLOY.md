# 🚀 Guia de Deploy na Vercel

Este guia fornece instruções passo a passo para fazer o deploy do ByStartup Portal do Cliente na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com) (gratuita)
- Código no GitHub, GitLab ou Bitbucket
- Projeto Supabase configurado
- Credenciais do Google Calendar (se aplicável)

---

## 🔧 Passo 1: Preparação do Código

### 1.1 Verificar Build Local

Antes de fazer o deploy, teste o build localmente:

```bash
npm run build
```

Se houver erros, corrija-os antes de continuar.

### 1.2 Commit e Push

Certifique-se de que todo o código está commitado e enviado para o repositório:

```bash
git add .
git commit -m "feat: prepare for Vercel deployment"
git push origin main
```

---

## 🌐 Passo 2: Criar Projeto na Vercel

### 2.1 Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em **"Add New..."** > **"Project"**
4. Selecione seu repositório `bystartupforclient`
5. Clique em **"Import"**

### 2.2 Configurações do Projeto

A Vercel detectará automaticamente que é um projeto Next.js. Verifique:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (raiz)
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

**Não clique em Deploy ainda!** Configure as variáveis de ambiente primeiro.

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Variáveis Obrigatórias

Na página de configuração do projeto, vá em **"Environment Variables"** e adicione:

#### Supabase (Obrigatório)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

#### Aplicação (Obrigatório)
```env
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

⚠️ **Importante:** Use a URL da Vercel aqui, não `localhost:3000`

#### Suporte (Obrigatório)
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5513999999999
NEXT_PUBLIC_SUPPORT_PHONE=08007841414
```

### 3.2 Variáveis Opcionais (Google Calendar)

Se você usa integração com Google Calendar:

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/api/auth/google/callback
```

⚠️ **Importante:** 
- Atualize `GOOGLE_REDIRECT_URI` com a URL da Vercel
- Configure esta mesma URL no [Google Cloud Console](https://console.cloud.google.com)

### 3.3 Configurar para Todos os Ambientes

Para cada variável, marque:
- ✅ **Production**
- ✅ **Preview** (opcional, para PRs)
- ✅ **Development** (opcional, para ambientes de dev na Vercel)

### 3.4 Variáveis Sensíveis

⚠️ **Nunca** commite estas variáveis no código:
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_SECRET`
- Tokens de acesso

---

## 🎯 Passo 4: Atualizar Configurações Externas

### 4.1 Supabase - Redirect URLs

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Authentication** > **URL Configuration**
3. Adicione a URL da Vercel em **Redirect URLs:**
   ```
   https://seu-projeto.vercel.app/**
   https://seu-projeto.vercel.app/api/auth/callback
   ```
4. Atualize **Site URL:**
   ```
   https://seu-projeto.vercel.app
   ```
5. Salve as alterações

### 4.2 Google Cloud Console (se aplicável)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **APIs & Services** > **Credentials**
3. Edite suas credenciais OAuth 2.0
4. Adicione a URL de callback da Vercel:
   ```
   https://seu-projeto.vercel.app/api/auth/google/callback
   ```
5. Salve

---

## 🚀 Passo 5: Deploy

### 5.1 Primeiro Deploy

Após configurar todas as variáveis:

1. Clique em **"Deploy"**
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Se houver erros, verifique os logs

### 5.2 Verificar Deploy

1. Acesse a URL fornecida pela Vercel: `https://seu-projeto.vercel.app`
2. Teste as funcionalidades principais:
   - Login
   - Dashboard
   - Reuniões
   - Contratos

---

## 🔄 Passo 6: Deploys Automáticos

### 6.1 Deploys por Push

Por padrão, a Vercel faz deploy automaticamente quando você:
- Faz push na branch `main` → Deploy em **Production**
- Faz push em outras branches → Deploy em **Preview**
- Abre Pull Requests → Deploy em **Preview**

### 6.2 Branch de Produção

Para definir outra branch como produção:

1. Vá em **Settings** > **Git**
2. Em **Production Branch**, selecione a branch desejada (ex: `main` ou `master`)

---

## 🌍 Passo 7: Domínio Personalizado (Opcional)

### 7.1 Adicionar Domínio

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio (ex: `portal.bystartup.com`)
3. Siga as instruções de DNS fornecidas
4. Aguarde a verificação (pode levar até 24h)

### 7.2 Atualizar Variáveis

Após configurar o domínio, atualize:

```env
NEXT_PUBLIC_APP_URL=https://portal.bystartup.com
GOOGLE_REDIRECT_URI=https://portal.bystartup.com/api/auth/google/callback
```

E também atualize no Supabase e Google Cloud Console.

---

## 🔍 Troubleshooting

### Erro: "Build Failed"

**Causas comuns:**
- Variáveis de ambiente faltando
- Erros de TypeScript
- Dependências não instaladas

**Solução:**
1. Verifique os logs de build na Vercel
2. Teste `npm run build` localmente
3. Verifique se todas as variáveis estão configuradas

### Erro: "Invalid JWT" após deploy

**Causa:** Redirect URLs não configuradas no Supabase

**Solução:**
1. Adicione a URL da Vercel nas Redirect URLs do Supabase
2. Verifique se `NEXT_PUBLIC_APP_URL` está correto

### Erro: "Google Calendar não autorizado"

**Causa:** Redirect URI não configurado no Google Cloud Console

**Solução:**
1. Adicione a URL de callback da Vercel no Google Cloud Console
2. Verifique se `GOOGLE_REDIRECT_URI` está correto nas variáveis de ambiente

### Build muito lento

**Soluções:**
- Use `npm ci` em vez de `npm install` (configurar em Settings > General)
- Habilite cache de build (Settings > General > Build & Development Settings)

---

## 📊 Monitoramento

### Logs em Produção

1. Vá em **Deployments**
2. Clique em um deployment específico
3. Aba **"Logs"** mostra todos os logs do servidor

### Analytics (Opcional)

A Vercel oferece analytics gratuitos:
- **Settings** > **Analytics**
- Ative para monitorar performance

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Build passa sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Supabase Redirect URLs atualizadas
- [ ] Google Cloud Console atualizado (se aplicável)
- [ ] Login funciona na produção
- [ ] Dashboard carrega corretamente
- [ ] Reuniões aparecem corretamente
- [ ] Contratos são exibidos
- [ ] Deploys automáticos funcionando

---

## 🎉 Pronto!

Seu projeto está agora em produção na Vercel! 🚀

Cada push na branch principal gerará um novo deploy automaticamente.

Para dúvidas ou problemas, consulte a [documentação oficial da Vercel](https://vercel.com/docs).

