# KKJ Intelligence

Chat com IA desenvolvido com Node.js, Express, OpenAI e Supabase, com autenticação por e-mail/senha e login com Google.

## Visão geral

O **KKJ Intelligence** é um projeto de chat interativo com foco em experiência de usuário, histórico de conversas e autenticação segura.  
O sistema permite conversar com a IA, criar múltiplos chats, copiar respostas, usar tema claro/escuro e acessar a aplicação tanto com conta própria quanto com login social.

## Funcionalidades

- Chat com IA usando a API da OpenAI
- Login com e-mail e senha
- Login com Google
- Limite de uso para visitantes sem conta
- Histórico de conversas por usuário
- Múltiplos chats com criação e exclusão
- Rate limit para login e chat
- Tema claro e escuro
- Interface responsiva para mobile
- Validação anti-bot com Cloudflare Turnstile

## Tecnologias utilizadas

### Backend

- Node.js
- Express
- JWT
- bcrypt
- Passport.js
- Passport Google OAuth 2.0
- express-session
- Helmet
- CORS

### Banco de dados

- Supabase

### IA

- OpenAI API

### Frontend

- HTML
- CSS
- JavaScript puro
- Lucide Icons

## Estrutura do projeto

```bash
controllers/
config/
database/
middlewares/
public/
routes/
server.js
```

## Como rodar localmente

### 1. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/KKJ-Intelligence.git
cd KKJ-Intelligence
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Depois preencha as variáveis com seus dados reais.

## Variáveis de ambiente

As principais variáveis usadas no projeto são:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=
SESSION_SECRET=

OPENAI_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

TURNSTILE_SECRET_KEY=

ALLOWED_ORIGINS=http://localhost:3000
```

## Iniciar o projeto

```bash
npm run dev
```

Depois acesse:

```bash
http://localhost:3000
```

## Segurança implementada

- Senhas com hash usando `bcrypt`
- Rotas protegidas com `JWT`
- Login Google com callback autenticado
- Rate limit para rotas sensíveis
- `helmet` para headers de segurança
- `cors` configurável por origem
- Sessão protegida por `SESSION_SECRET`
- Cloudflare Turnstile no cadastro

## Observações importantes

- O projeto usa **Supabase pelo backend**, então a `SUPABASE_ANON_KEY` não é necessária no fluxo atual.
- Para produção, ajuste:
  - `ALLOWED_ORIGINS`
  - `GOOGLE_CALLBACK_URL`
  - variáveis do Google OAuth
  - domínio autorizado no Turnstile

## Possíveis melhorias futuras

- Deploy com domínio próprio
- Melhor tratamento de erros no frontend
- Memória de conversas mais avançada
- Paginação do histórico
- Painel administrativo
- Upload de imagem e áudio no chat

## Autor

Desenvolvido por **Kaio Henrique**.

- Portfólio: [https://kaiohenrique.dev](https://kaiohenrique.dev)
- Contato: `kaiohenriquemalaquias@gmail.com`
