# 🚀 Guia de Deploy na Vercel - Barber Manager Pro

## ✅ Status Atual

- ✅ Código enviado para GitHub
- ✅ Prisma configurado para Vercel
- ✅ Scripts de build otimizados
- ✅ Configurações de runtime adicionadas
- 🔄 Pronto para deploy

**Repositório**: https://github.com/augustosanchesmanager-ux/barber-manager-pro

---

## 📋 Pré-requisitos

### 1. Criar Banco de Dados Turso

```bash
# Instalar Turso CLI (se ainda não tem)
# Windows (via PowerShell)
iwr -useb https://get.turso.tech/install.ps1 | iex

# Criar banco de dados
turso db create barber-manager-prod

# Obter informações do banco
turso db show barber-manager-prod
```

**Salve estes valores**:
- `URL` (ex: libsql://barber-manager-prod-xxxx.turso.io)
- `Authentication Token`

### 2. Gerar AUTH_SECRET

```bash
# PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Ou use: https://generate-secret.vercel.app/32

---

## 🎯 Deploy via Interface Web (RECOMENDADO)

### Passo 1: Acessar Vercel

1. Acesse: **https://vercel.com/**
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**

### Passo 2: Importar Repositório

1. Encontre `barber-manager-pro` na lista
2. Clique em **"Import"**

### Passo 3: Configurar Projeto

**Framework Preset**: Next.js (detectado automaticamente)

**Build Command**: 
```bash
prisma generate && next build
```

**Output Directory**: `.next`

**Install Command**: 
```bash
npm install
```

### Passo 4: Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

| Nome | Valor | Ambientes |
|------|-------|-----------|
| `DATABASE_URL` | `libsql://seu-database.turso.io` | Production, Preview, Development |
| `DATABASE_AUTH_TOKEN` | `seu-token-turso` | Production, Preview, Development |
| `AUTH_SECRET` | `sua-chave-gerada` | Production, Preview, Development |
| `AUTH_TRUST_HOST` | `true` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` | Production |

⚠️ **Importante**: 
- Para `NEXTAUTH_URL` em Production, use a URL que a Vercel irá gerar
- Você pode atualizar depois no Settings > Environment Variables

### Passo 5: Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (3-5 minutos)
3. 🎉 Seu app estará online!

---

## 🖥️ Deploy via CLI (Alternativa)

### Passo 1: Login

```bash
vercel login
```

### Passo 2: Deploy

```bash
# Deploy de preview (teste)
vercel

# Deploy de produção
vercel --prod
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Adicionar variável
vercel env add DATABASE_URL

# Listar variáveis
vercel env ls
```

---

## 🔧 Pós-Deploy

### 1. Executar Migrations do Prisma

Após o primeiro deploy, você precisa aplicar as migrations:

```bash
# Opção 1: Via Turso CLI
turso db shell barber-manager-prod < prisma/migrations/xxx_init/migration.sql

# Opção 2: Via Prisma (localmente com DATABASE_URL apontando para produção)
npx prisma db push
```

### 2. Criar Usuário Admin

```bash
# Execute localmente ou via terminal da Vercel
DATABASE_URL="sua-url-producao" tsx scripts/create-super-admin.ts
```

### 3. Verificar Deploy

Acesse sua URL da Vercel:
- `https://seu-app.vercel.app/login`
- Tente fazer login com o admin criado

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"

**Solução**: Verificar se `postinstall` está no package.json:
```json
"postinstall": "prisma generate"
```

### Erro: "Cannot connect to database"

**Solução**: 
1. Verificar se `DATABASE_URL` e `DATABASE_AUTH_TOKEN` estão corretos
2. Testar conexão localmente:
```bash
$env:DATABASE_URL="sua-url"; $env:DATABASE_AUTH_TOKEN="seu-token"; npx prisma db push
```

### Erro: "Invalid credentials" no login

**Solução**: 
1. Verificar se `AUTH_SECRET` foi configurado
2. Verificar se usuário admin foi criado no banco de produção
3. Limpar cookies do navegador

### Build falha com erro de NextAuth

**Status**: Problema conhecido (Next.js 16 + NextAuth v5 beta)

**Workaround aplicado**:
- ✅ `runtime = 'nodejs'` adicionado
- ✅ `dynamic = 'force-dynamic'` adicionado
- ✅ `output: 'standalone'` configurado

Se mesmo assim falhar:
1. Tente fazer deploy via interface web (mais estável)
2. Ou considere usar Next.js 15 temporariamente

---

## 📊 Monitoramento

Após deploy, monitore:

1. **Logs**: https://vercel.com/seu-projeto/deployments
2. **Analytics**: Vercel Analytics (habilitado automaticamente)
3. **Erros**: Vercel Speed Insights

---

## 🔄 Redeploy Automático

Cada push para `main` no GitHub dispara um novo deploy automaticamente!

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

A Vercel irá:
1. ✅ Detectar o push
2. ✅ Executar build
3. ✅ Deploy automático
4. ✅ Notificar no GitHub (commit status)

---

## 🎉 Parabéns!

Seu Barber Manager Pro está no ar!

**Próximos passos**:
- [ ] Configurar domínio customizado
- [ ] Habilitar Vercel Analytics
- [ ] Configurar alertas de erro
- [ ] Adicionar testes E2E
- [ ] Configurar CI/CD completo

---

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Turso**: https://docs.turso.tech
- **Documentação NextAuth**: https://authjs.dev

**Dúvidas? Problemas?**
Abra uma issue no repositório: https://github.com/augustosanchesmanager-ux/barber-manager-pro/issues
