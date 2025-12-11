# 🔐 Como Obter a Chave Secreta do Webhook Mercado Pago

## ⚠️ Informação Importante

A **chave secreta do webhook NÃO pode ser obtida via API ou MCP** por segurança do Mercado Pago. Ela só está disponível no painel de desenvolvedor.

---

## ✅ O Sistema Funciona Sem a Chave Secreta

**Boa notícia:** O webhook **funciona perfeitamente** sem a chave secreta configurada!

### O que acontece SEM a chave:
- ✅ Webhook recebe notificações normalmente
- ✅ Pagamentos são processados
- ✅ Agendamentos são criados automaticamente
- ⚠️ Validação de assinatura é PULADA (mostra warning nos logs)

### Código relevante:
```typescript
// src/app/api/mercadopago/webhook/route.ts
const webhookSecret = process.env.MP_WEBHOOK_SECRET;
if (webhookSecret && webhookSecret !== 'WEBHOOK_SECRET_KEY_HERE') {
  // Valida assinatura
} else {
  console.warn('⚠️ Webhook secret não configurada - pulando validação');
  // Continua processando normalmente
}
```

---

## 🔒 Quando a Chave é Necessária?

**Em Desenvolvimento/Testes:** OPCIONAL
- Pode trabalhar sem a chave
- Útil para desenvolvimento rápido

**Em Produção:** RECOMENDADO
- Adiciona camada extra de segurança
- Garante que webhooks vêm realmente do Mercado Pago
- Previne webhooks falsos/maliciosos

---

## 📝 Como Obter a Chave Secreta (Passo a Passo)

### Passo 1: Acessar o Painel
1. Abra o navegador
2. Vá para: **https://www.mercadopago.com.br/developers/panel/app**
3. Faça login com sua conta Mercado Pago

### Passo 2: Selecionar Aplicação
1. Na lista de aplicações, encontre: **ID 8634206359629663**
2. Clique nela para abrir

### Passo 3: Acessar Webhooks
1. No menu lateral esquerdo, procure por **"Webhooks"**
2. Clique em **"Configurar notificações"** ou **"Webhooks"**

### Passo 4: Revelar Chave
1. Role até a seção **"Chave secreta"** ou **"Secret key"**
2. Haverá um campo com asteriscos: `7c79c07***...***`
3. Clique no **ícone do olho** 👁️ ou botão **"Revelar"**
4. A chave completa será exibida

### Passo 5: Copiar e Configurar
1. Copie a chave completa (será algo longo, tipo 64 caracteres)
2. Abra o arquivo `.env` do projeto
3. Descomente a linha `MP_WEBHOOK_SECRET`
4. Cole a chave:

```env
MP_WEBHOOK_SECRET="7c79c07sua_chave_completa_aqui_64_caracteres"
```

5. Salve o arquivo
6. Reinicie o servidor de desenvolvimento

---

## 🚫 Problemas Comuns

### Problema 1: Link não funciona
**Erro:** URL retorna 404 ou página não encontrada

**Solução:**
- Tente o link genérico: https://www.mercadopago.com.br/developers/panel/app
- Navegue manualmente até sua aplicação
- Procure por "Suas aplicações" ou "Your applications"

### Problema 2: Não vejo a chave
**Erro:** Não encontro a seção de chave secreta

**Solução:**
- Certifique-se de estar na aba **"Webhooks"**
- Role a página até o final
- Procure por "Secret" ou "Chave secreta"
- Pode estar em uma seção chamada "Segurança" ou "Security"

### Problema 3: Chave mascarada
**Erro:** Só vejo `7c79c07***...***`

**Solução:**
- Procure um ícone de olho 👁️ ao lado
- Ou botão "Revelar" / "Show" / "Exibir"
- Clique para revelar a chave completa

---

## 🧪 Como Testar se a Chave Está Funcionando

### Teste 1: Verificar nos Logs
```bash
# Inicie o servidor
npm run dev

# Em outro terminal, simule um webhook
curl -X POST http://localhost:3000/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123" \
  -H "x-request-id: test-123" \
  -d '{"type":"payment","data":{"id":"123"}}'
```

**Com chave configurada:**
```
❌ Assinatura do webhook inválida
```

**Sem chave configurada:**
```
⚠️ Webhook secret não configurada - pulando validação de assinatura
```

### Teste 2: Webhook Real do MP
Após configurar a chave, faça um pagamento de teste. Nos logs você deve ver:
```
✅ Assinatura do webhook validada com sucesso
```

---

## 📋 Checklist Rápido

- [ ] Acessei https://www.mercadopago.com.br/developers/panel/app
- [ ] Fiz login com minha conta
- [ ] Encontrei a aplicação 8634206359629663
- [ ] Abri a seção Webhooks
- [ ] Revelei a chave secreta
- [ ] Copiei a chave completa
- [ ] Descomentei `MP_WEBHOOK_SECRET` no `.env`
- [ ] Colei a chave completa
- [ ] Salvei o arquivo
- [ ] Reiniciei o servidor

---

## 🎯 Decisão: Usar ou Não Usar?

### ✅ USE a chave secreta SE:
- Está indo para produção
- Quer máxima segurança
- Tem 5 minutos para configurar

### ⏭️ PULE a chave secreta SE:
- Está apenas testando localmente
- Quer começar rápido
- Vai configurar depois

**Em ambos os casos, o sistema funciona!**

---

## 📞 Suporte

Se ainda não conseguir obter a chave:

1. **Contate o suporte do Mercado Pago:**
   - https://www.mercadopago.com.br/developers/pt/support

2. **Envie um email:**
   - developers@mercadopago.com

3. **Faça um teste sem a chave:**
   - O sistema funciona normalmente
   - Apenas sem validação de assinatura

---

**💡 Dica Final:** Você pode começar SEM a chave e adicionar depois. O webhook já está configurado e funcionando!
