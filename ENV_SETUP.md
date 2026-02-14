# Barber Manager Pro - Variáveis de Ambiente

## Configuração do Banco de Dados (Turso)

```bash
# Criar banco de dados
turso db create barber-manager-prod

# Obter URL e token
turso db show barber-manager-prod
```

Adicione na Vercel:
- `DATABASE_URL` = URL do Turso (começa com libsql://)
- `DATABASE_AUTH_TOKEN` = Token de autenticação do Turso

## Configuração de Autenticação

```bash
# Gerar AUTH_SECRET
openssl rand -base64 32
```

Adicione na Vercel:
- `AUTH_SECRET` = Chave gerada acima
- `AUTH_TRUST_HOST` = true
- `NEXTAUTH_URL` = URL do seu deploy (ex: https://seu-app.vercel.app)

## Como adicionar na Vercel

1. Acesse seu projeto na Vercel
2. Vá em Settings > Environment Variables
3. Adicione cada variável
4. Marque as opções: Production, Preview, Development
5. Salve e faça redeploy

## Variáveis Necessárias (resumo)

```
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-turso-auth-token
AUTH_SECRET=generated-secret-key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
```
