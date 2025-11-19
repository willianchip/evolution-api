# 🧪 Guia de Teste da Evolution API

## 📋 Pré-requisitos

Antes de testar, você precisa ter:

- ✅ Conta ativa na Evolution API
- ✅ URL da sua instância Evolution API
- ✅ API Key válida gerada na Evolution API
- ✅ Acesso ao Dashboard do Supabase (para configurar secrets)

---

## 🔧 Passo 1: Configurar Secrets no Supabase

### 1.1 Acessar o Dashboard
1. Acesse: [Supabase Functions Settings](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions)
2. Faça login com suas credenciais

### 1.2 Verificar/Adicionar Secrets

Você precisa configurar **2 secrets**:

#### Secret 1: `EVOLUTION_API_URL`
- **Nome**: `EVOLUTION_API_URL`
- **Valor**: URL completa da sua Evolution API
- **Exemplo**: `https://api.evolution.com.br` ou `https://sua-instancia.evolution.app.br`
- ⚠️ **Importante**: Não incluir barra final `/`

#### Secret 2: `EVOLUTION_API_KEY`
- **Nome**: `EVOLUTION_API_KEY`
- **Valor**: Sua API Key gerada na Evolution API
- **Exemplo**: `B6D711FCDE4D4FD5936544120E713976`
- 🔒 **Segurança**: Mantenha essa chave em segredo

### 1.3 Salvar
Após adicionar os secrets, clique em **Save** e aguarde alguns segundos para que sejam aplicados.

---

## ✅ Passo 2: Testar via Interface (Recomendado)

### Opção A: Teste Rápido (Página WhatsApp)

1. **Acessar página WhatsApp**
   - URL: `/whatsapp`
   - Ou clique em "WhatsApp" no menu superior

2. **Localizar seção de teste**
   - Na aba "Conexões"
   - Procure o card **"Testar Evolution API"**

3. **Executar teste**
   - Clique no botão **"Testar Conexão"**
   - Aguarde alguns segundos

4. **Interpretar resultado**
   - ✅ **Sucesso**: "Evolution API está funcionando corretamente!"
     - Você pode criar instâncias normalmente
   - ❌ **Erro**: Veja a mensagem específica e siga para a seção de troubleshooting

### Opção B: Teste Detalhado (Admin Integrations)

1. **Acessar página de integrações**
   - URL: `/admin/integrations`
   - Ou navegue: Dashboard → Admin → Integrações

2. **Localizar Evolution API**
   - Encontre o card **"Evolution API (WhatsApp)"**

3. **Ver status**
   - 🟢 **Online**: Tudo funcionando
   - 🟡 **Configurado**: Secrets OK, mas API não alcançável
   - 🔴 **Offline/Não configurado**: Problema de configuração

4. **Testar agora**
   - Clique em **"Testar Agora"**
   - Veja informações detalhadas:
     - URL configurada (mascarada por segurança)
     - Tempo de resposta (em ms)
     - Número de instâncias ativas
     - Status code da API

5. **Atualizar status**
   - Clique em **"Atualizar Tudo"** no topo da página
   - A página também atualiza automaticamente a cada 60 segundos

---

## 🔨 Passo 3: Teste Manual via cURL (Avançado)

Se preferir testar diretamente via terminal/linha de comando:

```bash
curl -X GET "https://SUA-API.evolution.com.br/instance/fetchInstances" \
  -H "apikey: SUA_API_KEY"
```

### Substituir valores:
- `SUA-API.evolution.com.br` → Sua URL da Evolution API
- `SUA_API_KEY` → Sua API Key

### Resultado esperado:

**✅ Sucesso (Status 200):**
```json
[
  {
    "instance": {
      "instanceName": "minha-instancia",
      "status": "open"
    }
  }
]
```

**❌ Erro 401 (Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```
→ API Key está incorreta

**❌ Erro 404 (Not Found):**
```
Cannot GET /instance/fetchInstances
```
→ URL está incorreta ou incompleta

---

## 🚨 Possíveis Erros e Soluções

### ❌ Erro: "Evolution API não configurada"

**Mensagem completa:**
> ❌ Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY nos secrets do Supabase.

**Causa:** 
- Secrets não foram configurados no Supabase
- Secrets foram configurados mas ainda não foram aplicados

**Solução:**
1. Acesse [Supabase Functions Settings](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions)
2. Configure os secrets conforme o Passo 1
3. Aguarde 10-30 segundos após salvar
4. Tente novamente

---

### ⏱️ Erro: "Timeout ao conectar"

**Mensagem completa:**
> ⏱️ Timeout ao conectar com Evolution API. Verifique se a URL está correta e se o servidor está online.

**Causa:**
- URL incorreta ou inacessível
- Servidor Evolution API está offline
- Firewall bloqueando a conexão

**Solução:**
1. **Verificar URL:**
   - Deve ser completa: `https://api.evolution.com.br`
   - Sem barra final: ❌ `https://api.evolution.com.br/`
   - Com protocolo: ✅ `https://` (não `http://`)

2. **Testar URL no navegador:**
   - Abra `https://SUA-URL/instance/fetchInstances`
   - Deve pedir autenticação ou retornar erro 401 (isso é bom!)
   - Se não carregar nada = URL incorreta

3. **Verificar status do servidor:**
   - Acesse o painel da Evolution API
   - Confirme que o servidor está online

---

### 🔐 Erro: "Erro de autenticação (401)"

**Mensagem completa:**
> 🔐 Erro de autenticação (401). A API Key está incorreta ou expirada.

**Causa:**
- API Key incorreta
- API Key expirou
- API Key foi revogada

**Solução:**
1. **Gerar nova API Key:**
   - Acesse o painel da Evolution API
   - Vá em Configurações → API Keys
   - Gere uma nova chave

2. **Atualizar secret no Supabase:**
   - Acesse [Supabase Functions Settings](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions)
   - Edite o secret `EVOLUTION_API_KEY`
   - Cole a nova chave
   - Salve e aguarde 10-30 segundos

3. **Testar novamente**

---

### 🔍 Erro: "Endpoint não encontrado (404)"

**Mensagem completa:**
> 🔍 Endpoint não encontrado (404). Verifique se a URL está completa.

**Causa:**
- URL incompleta (faltando domínio)
- URL com caminho incorreto
- Versão da API desatualizada

**Solução:**
1. **Verificar formato da URL:**
   - ✅ Correto: `https://api.evolution.com.br`
   - ❌ Errado: `https://api.evolution.com.br/instance`
   - ❌ Errado: `/instance/fetchInstances`

2. **Usar apenas a URL base:**
   - A aplicação adiciona o caminho automaticamente
   - Não inclua caminhos específicos na URL base

---

### 💥 Erro: "API retornou erro 500"

**Mensagem completa:**
> ❌ API retornou erro 500: Internal Server Error

**Causa:**
- Problema interno no servidor Evolution API
- Instância sobrecarregada
- Bug na API

**Solução:**
1. **Aguardar alguns minutos:**
   - Erros 500 são temporários na maioria das vezes

2. **Verificar status da Evolution API:**
   - Entre em contato com o suporte da Evolution
   - Verifique se há manutenção programada

3. **Testar novamente mais tarde**

---

## 📊 Interpretando o Tempo de Resposta

O teste mostra o tempo de resposta da API em milissegundos (ms):

- ⚡ **0-100ms**: Excelente! API muito rápida
- ✅ **100-500ms**: Bom, tempo normal
- ⚠️ **500-1000ms**: Aceitável, mas pode melhorar
- 🐌 **1000ms+**: Lento, pode causar timeouts

**Nota:** Tempos acima de 10.000ms (10 segundos) resultam em timeout.

---

## 🎯 Checklist Final

Antes de criar uma instância WhatsApp, confirme:

- [ ] Secrets configurados no Supabase
- [ ] Teste via interface retornou sucesso
- [ ] Tempo de resposta abaixo de 5 segundos
- [ ] Status "Online" na página de integrações
- [ ] Sem erros 401 ou 404

Se todos os itens estiverem ✅, você está pronto para criar instâncias!

---

## 🆘 Precisa de Ajuda?

Se ainda estiver com problemas após seguir este guia:

1. **Verifique os logs:**
   - Acesse [Edge Function Logs](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/functions/test-evolution-api/logs)
   - Procure por erros específicos

2. **Teste o Health Check geral:**
   - Acesse `/admin/monitoring`
   - Veja o status completo do sistema

3. **Entre em contato:**
   - Suporte da Evolution API para problemas com a API
   - Suporte do Supabase para problemas com secrets

---

## 📚 Links Úteis

- [Supabase Functions Settings](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/settings/functions) - Configurar secrets
- [Test Evolution API Logs](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/functions/test-evolution-api/logs) - Ver logs da função
- [Health Check Logs](https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn/functions/health-check/logs) - Status geral do sistema
- [Admin Integrations](/admin/integrations) - Status de todas integrações
- [WhatsApp Page](/whatsapp) - Criar instâncias
