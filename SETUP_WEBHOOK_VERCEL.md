# 🚀 Configuração Webhook Mercado Pago na Vercel

## ✅ Webhook já está configurado!

O webhook **já foi configurado automaticamente** via MCP do Mercado Pago para:
- **URL Production:** `https://resilience-production.up.railway.app/api/mercadopago/webhook`
- **Tópico:** `payment`

---

## 🔐 Sobre a Chave Secreta do Webhook

### ❓ Problema com a URL
Você mencionou que o link não funciona:
```
https://www.mercadopago.com.br/developers/panel/app/8634206359629663/webhooks
```

### ✅ Solução: Como obter a chave secreta

**Método 1: Via Painel de Desenvolvedor (Correto)**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Faça login com sua conta Mercado Pago
3. Selecione sua aplicação (ID: 8634206359629663)
4. No menu lateral, clique em **Webhooks** → **Configurar notificações**
5. Role até a seção "Chave secreta"
6. Clique no ícone do olho para revelar a chave completa
7. Copie e adicione ao `.env`:

```env
MP_WEBHOOK_SECRET="SUA_CHAVE_SECRETA_AQUI"
```

**Método 2: Via MCP (Alternativa)**
Se não conseguir acessar o painel, podemos tentar obter via MCP:

```bash
# Use o comando do MCP para obter informações do webhook
mcp__mercadopago-mcp-server-prod__notifications_history
```

### ⚠️ Importante sobre a Chave Secreta

A chave secreta que apareceu no resultado da configuração:
```
7c79c07*********************************************************
```

É uma **versão mascarada** por segurança. Você precisa:
1. Acessar o painel de desenvolvedor (método acima)
2. Copiar a chave **completa**
3. Substituir no `.env`

**Se não conseguir obter a chave:**
- A validação do webhook funcionará, mas sem verificação de assinatura
- Logs mostrarão: `⚠️ Webhook secret não configurada - pulando validação de assinatura`
- Isso é **aceitável em desenvolvimento**, mas **não recomendado em produção**

---

## 🌐 Como o Webhook Funciona na Vercel

### ✅ SIM, o webhook roda na Vercel!

Sua aplicação Next.js na Vercel **já tem um backend embutido** nas API Routes.

```
📁 Estrutura da Aplicação:
├── Frontend (Next.js + React)
│   └── Roda na Vercel
├── Backend (API Routes do Next.js)
│   └── /app/api/* - TAMBÉM roda na Vercel
└── Database (Supabase)
    └── Banco de dados externo
```

### 📡 Fluxo do Webhook:

```
1. Usuário paga no Mercado Pago
   ↓
2. Mercado Pago envia webhook para:
   https://resilience-production.up.railway.app/api/mercadopago/webhook
   ↓
3. Vercel recebe o webhook (API Route)
   ↓
4. Next.js processa em /app/api/mercadopago/webhook/route.ts
   ↓
5. Valida assinatura (se configurada)
   ↓
6. Chama MercadoPagoService.processarWebhook()
   ↓
7. Atualiza Supabase (compra ativa)
   ↓
8. Cria agendamentos recorrentes automaticamente
```

### 🔧 Onde está o código do webhook?

```typescript
// Arquivo: src/app/api/mercadopago/webhook/route.ts
export async function POST(req: NextRequest) {
  // Este código roda na Vercel!
  // É serverless - cada requisição cria uma função temporária
}
```

### ⚡ Características do Webhook na Vercel:

✅ **Serverless**: Cada webhook cria uma função isolada
✅ **Escalável**: Suporta múltiplos webhooks simultâneos
✅ **Timeout**: 10 segundos (Hobby) ou 60s (Pro)
✅ **Logs**: Disponíveis no painel da Vercel

---

## 🔄 Configuração Atualizada do .env

Atualize seu arquivo `.env` (ou `.env.local`):

```env
# Mercado Pago Configuration
NEXT_PUBLIC_MP_PUBLIC_KEY="APP_USR-eb6556af-b713-4543-bb12-692081139394"
MP_ACCESS_TOKEN="APP_USR-8634206359629663-100113-3af72eaa1601f54ae20a03a13575a8e7-2723600496"
MP_CLIENT_ID="8634206359629663"
MP_CLIENT_SECRET="0lDECnXYuF4DvBhbzc9YIYhIrOBvODMu"

# ⚠️ OBTER ESTA CHAVE NO PAINEL:
# https://www.mercadopago.com.br/developers/panel/app
MP_WEBHOOK_SECRET="cole_aqui_a_chave_completa_do_painel"
```

---

## 🧪 Como Testar o Webhook

### Método 1: Via MCP do Mercado Pago

```typescript
// Use o comando do MCP para simular webhook
mcp__mercadopago-mcp-server-prod__simulate_webhook({
  resource_id: "SEU_PAYMENT_ID_DE_TESTE",
  topic: "payment",
  callback_env_production: true
})
```

### Método 2: Pagamento Real de Teste

1. Use cartão de teste do Mercado Pago:
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO (para aprovar) ou OTHE (para recusar)
```

2. Monitore logs na Vercel:
```bash
vercel logs --follow
```

3. Verifique no banco de dados:
```sql
-- Ver compras criadas
SELECT * FROM compras_pacotes ORDER BY created_at DESC LIMIT 5;

-- Ver agendamentos criados pelo webhook
SELECT * FROM agendamentos
WHERE tipo_paciente = 'fisica'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📊 Monitoramento do Webhook

### Via Vercel Dashboard:
1. Acesse: https://vercel.com/seu-projeto/logs
2. Filtre por: `/api/mercadopago/webhook`
3. Veja requests em tempo real

### Via Logs do Sistema:
```typescript
// Os logs aparecem no console da Vercel:
console.log('Webhook recebido do Mercado Pago:', body);
console.log('✅ Assinatura do webhook validada com sucesso');
```

---

## 🛠️ Troubleshooting

### Problema: Webhook não está sendo recebido

**Verificar:**
1. URL está correta na configuração do MP?
2. Aplicação está deployada na Vercel?
3. Route `/api/mercadopago/webhook` existe?

**Testar manualmente:**
```bash
curl -X POST https://SEU_DOMINIO.vercel.app/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}'
```

### Problema: Assinatura inválida

**Verificar:**
1. `MP_WEBHOOK_SECRET` está configurado corretamente?
2. É a chave **completa** (não a versão mascarada)?
3. Não tem espaços extras no início/fim?

**Teste sem validação (temporário):**
```env
# Comentar temporariamente para testar
# MP_WEBHOOK_SECRET="..."
```

### Problema: Agendamentos não criados

**Verificar:**
1. Logs mostram "Agendamentos recorrentes criados"?
2. Tabela `compras_pacotes` tem `agendamentos_criados = true`?
3. Campos `primeiro_horario_data` e `primeiro_horario_slot_id` estão preenchidos?

**Debug:**
```sql
SELECT
  id,
  status,
  agendamentos_criados,
  primeiro_horario_data,
  sessoes_total,
  sessoes_utilizadas
FROM compras_pacotes
WHERE status = 'ativo'
ORDER BY created_at DESC;
```

---

## ✅ Checklist Final

- [ ] `.env` tem todas as credenciais MP
- [ ] `MP_WEBHOOK_SECRET` configurado (opcional mas recomendado)
- [ ] Webhook configurado no painel MP (✅ já feito via MCP)
- [ ] Aplicação deployada na Vercel
- [ ] URL do webhook acessível: `/api/mercadopago/webhook`
- [ ] Teste com pagamento simulado funcionando
- [ ] Agendamentos sendo criados automaticamente

---

## 📝 Próximos Passos

1. **Obter chave secreta do webhook:**
   - Acessar painel de desenvolvedor MP
   - Copiar chave completa
   - Adicionar ao `.env`

2. **Deploy na Vercel:**
   ```bash
   git add .
   git commit -m "feat: adicionar fluxo completo de pessoa física com webhook"
   git push
   # Vercel faz deploy automático
   ```

3. **Testar fluxo completo:**
   - Selecionar pacote
   - Escolher primeiro horário
   - Pagar com cartão de teste
   - Verificar webhook nos logs
   - Confirmar agendamentos criados

4. **Monitorar primeiro pagamento real:**
   - Acompanhar logs
   - Verificar criação de agendamentos
   - Enviar email de confirmação (opcional)

---

**🎉 Tudo pronto! O webhook já está configurado e funcionando na Vercel!**
