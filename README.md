# 🚀 Plataforma de Gestão WhatsApp com IA

## 📋 Sobre o Projeto

Plataforma completa de automação e gestão de WhatsApp integrada com Inteligência Artificial (Gemini), desenvolvida com tecnologias modernas e design cyberpunk.

**URL do Projeto**: https://lovable.dev/projects/3d8ded87-7f35-4cfe-9e4f-6196dc9a5d9d

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação Completa
- Registro com verificação por email
- Login com JWT seguro
- Recuperação de senha via email
- Proteção de rotas privadas
- Fingerprint de dispositivo

### 🤖 Chat com IA (Gemini)
- Conversas ilimitadas com Gemini AI
- Histórico de conversas persistente
- Interface moderna e responsiva
- Suporte a múltiplos chats simultâneos

### 📱 Integração WhatsApp
- Conexão via QR Code
- Gerenciamento de múltiplas conexões
- Lista de conversas em tempo real
- Envio e recebimento de mensagens
- Status de conexão em tempo real
- Webhooks para mensagens recebidas

### 🎯 Automações Inteligentes
- Resposta automática com IA
- Classificação de mensagens (Suporte, Vendas, Spam, etc)
- Análise de sentimento
- Logs de atividades
- Configurações personalizáveis

### 📊 Dashboard Analítico
- Estatísticas em tempo real
- Gráficos interativos
- Métricas de desempenho
- Notificações de eventos importantes
- Cards clicáveis para navegação rápida

### ⚙️ Configurações
- Perfil do usuário
- Preferências de notificações
- Configurações de automação IA
- Tom de voz personalizado (Formal, Casual, Amigável)
- Suporte a múltiplos idiomas

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component Library
- **React Query** - Data Fetching
- **React Router** - Navigation
- **Lucide React** - Icons
- **date-fns** - Date Formatting
- **Recharts** - Charts

### Backend (Supabase)
- **PostgreSQL** - Database
- **Edge Functions** - Serverless
- **Row Level Security** - Security
- **Realtime** - WebSocket Updates
- **Authentication** - Auth System

### IA & APIs
- **Google Gemini** - AI Chat
- **Evolution API** - WhatsApp Integration
- **Resend** - Email Service

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn
│   │   ├── ChatMessage.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessagesList.tsx
│   │   ├── StatsCard.tsx
│   │   └── ...
│   ├── pages/              # Páginas da aplicação
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ChatIA.tsx
│   │   ├── WhatsApp.tsx
│   │   ├── Settings.tsx
│   │   └── ...
│   ├── hooks/              # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useAIChat.ts
│   │   ├── useWhatsApp.ts
│   │   ├── useSettings.ts
│   │   ├── useRealtime.ts
│   │   └── ...
│   ├── lib/                # Utilitários
│   ├── integrations/       # Integrações externas
│   └── providers/          # Context Providers
│
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── auth-*          # Autenticação
│   │   ├── gemini-chat/    # Chat IA
│   │   ├── whatsapp-*/     # WhatsApp
│   │   ├── ai-auto-reply/  # Auto resposta
│   │   ├── message-classifier/ # Classificador
│   │   ├── log-activity/   # Logs
│   │   └── ...
│   └── setup-database.sql  # Setup do banco
```

---

## 🚀 Como Executar Localmente

### 1. Clone o repositório
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o projeto
As URLs do Supabase estão centralizadas em `src/lib/supabaseEdge.ts` e `src/config/appConfig.ts`.

**Para fazer remix em outra conta:**
1. Atualize `src/lib/supabaseEdge.ts` com o novo `SUPABASE_PROJECT_ID` e `ANON_KEY`
2. No Supabase, configure os secrets necessários (ver seção abaixo)
3. Execute o SQL do `supabase/setup-database.sql`

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 🔧 Setup do Banco de Dados

### 1. Criar projeto no Supabase
Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Executar script SQL
No SQL Editor do Supabase, execute o arquivo `supabase/setup-database.sql` completo.

Isso criará:
- ✅ Tabelas: `users`, `whatsapp_connections`, `conversations`, `messages`, `ai_chats`, `ai_messages`, `user_settings`, `activity_logs`
- ✅ Índices otimizados
- ✅ Row Level Security (RLS)
- ✅ Policies de acesso
- ✅ Triggers automáticos
- ✅ Views para dashboard

### 3. Configurar Secrets no Supabase
Acesse: https://supabase.com/dashboard/project/{project_id}/settings/functions

Adicione os seguintes secrets:

#### Obrigatórios:
- `GEMINI_API_KEY` - API Key do Google Gemini
- `RESEND_API_KEY` - API Key do Resend (emails)
- `JWT_SECRET` - Secret para JWT tokens

#### Para WhatsApp:
- `EVOLUTION_API_URL` - URL da Evolution API
- `EVOLUTION_API_KEY` - API Key da Evolution

---

## 🔄 Como Fazer Remix do Projeto

Para clonar/remixar este projeto em outra conta Lovable:

### 1. Remix no Lovable
- Clique no botão "Remix" no projeto
- Aguarde a cópia completa do código

### 2. Criar novo projeto no Supabase
- Acesse [supabase.com](https://supabase.com) e crie um novo projeto
- Anote o `project_id` e `anon_key`

### 3. Atualizar configurações no código
Edite os arquivos:

**`src/lib/supabaseEdge.ts`:**
```typescript
export const SUPABASE_PROJECT_ID = 'SEU_NOVO_PROJECT_ID';
// ... atualizar ANON_KEY também
```

**`src/integrations/supabase/client.ts`:**
Verifique se o `createClient` está usando as URLs corretas.

### 4. Executar SQL no Supabase
No SQL Editor do Supabase, execute o arquivo completo:
- `supabase/setup-database.sql`

### 5. Configurar Secrets
Acesse: `https://supabase.com/dashboard/project/{project_id}/settings/functions`

Adicione os secrets listados na seção "Configurar Secrets" acima.

### 6. Deploy das Edge Functions
As Edge Functions são deployadas automaticamente pelo Lovable quando você commita.

### 7. Testar
- Teste o registro em `/register`
- Teste o login em `/login`
- Teste WhatsApp em `/whatsapp`

---

## 📚 Edge Functions

### Autenticação
- `auth-register` - Registro de usuários
- `auth-login` - Login com JWT
- `auth-verify-email` - Verificação de email
- `auth-forgot-password` - Recuperação de senha
- `auth-reset-password` - Reset de senha

### IA & Automação
- `gemini-chat` - Chat com Gemini AI
- `ai-auto-reply` - Resposta automática IA
- `message-classifier` - Classificação de mensagens

### WhatsApp
- `whatsapp-connect` - Conexão via QR Code
- `whatsapp-send-message` - Envio de mensagens
- `whatsapp-webhook` - Recebimento de mensagens

### Utilidades
- `dashboard-stats` - Estatísticas do dashboard
- `send-email` - Envio de emails
- `log-activity` - Registro de atividades

---

## 🎨 Design System

### Cores Principais
- **Primary**: Ciano tecnológico (`#0EA5E9`)
- **Secondary**: Roxo futurista (`#8B5CF6`)
- **Success**: Verde neon (`#10B981`)
- **Accent**: Rosa vibrante (`#EC4899`)

### Tema
- Dark mode por padrão
- Efeitos neon e glow
- Gradientes cyberpunk
- Animações suaves

---

## 🔒 Segurança

### Implementações de Segurança:
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ JWT para autenticação
- ✅ Fingerprint de dispositivo
- ✅ Validação de email obrigatória
- ✅ CORS configurado
- ✅ Rate limiting nos endpoints
- ✅ Senhas hasheadas (bcrypt)
- ✅ Tokens com expiração

---

## 🚢 Deploy

### Deploy Automático via Lovable
1. Acesse o projeto no Lovable
2. Clique em **Share → Publish**
3. Aguarde o deploy (automático)

### Deploy Manual
```bash
npm run build
# Deploy para seu provedor preferido (Vercel, Netlify, etc)
```

### Edge Functions
As Edge Functions são deployadas automaticamente quando você commita no repositório.

---

## 🔑 Domínio Customizado

Para conectar um domínio próprio:
1. Acesse **Project > Settings > Domains**
2. Clique em **Connect Domain**
3. Siga as instruções de DNS

[Documentação completa](https://docs.lovable.dev/features/custom-domain)

---

## 📊 Monitoramento

### Logs de Edge Functions
Acesse o painel do Supabase para ver logs em tempo real de todas as funções.

### Analytics
Dashboard com métricas integradas:
- Total de conexões WhatsApp
- Mensagens enviadas/recebidas
- Conversas ativas
- Uso da IA
- Atividades recentes

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 📞 Suporte

- **Documentação**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **Gemini AI**: https://ai.google.dev

---

## 🎯 Roadmap

### Em Produção ✅
- [x] Autenticação completa
- [x] Chat com IA
- [x] Integração WhatsApp
- [x] Dashboard analítico
- [x] Automações básicas
- [x] Real-time updates
- [x] Sistema de configurações

### Próximas Features 🚀
- [ ] Agendamento de mensagens
- [ ] Templates de mensagens
- [ ] Integração com CRM
- [ ] Relatórios avançados
- [ ] API pública
- [ ] Mobile app (React Native)
- [ ] Multi-idioma completo
- [ ] Temas customizáveis

---

## 👨‍💻 Desenvolvido com ❤️ usando Lovable

**Projeto 100% funcional e pronto para produção!**

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Produção
