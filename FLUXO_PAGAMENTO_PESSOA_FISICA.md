# Fluxo de Pagamento para Pessoa Física - Implementação Completa

## ✅ Implementação Concluída

### 1. **Banco de Dados**

**Novas tabelas criadas:**
- `pacotes_sessoes` - Pacotes disponíveis com descontos progressivos
- `compras_pacotes` - Registro de compras dos pacientes (com campos para primeiro horário)
- `pagamentos_mercadopago` - Dados de pagamento via Mercado Pago

**Modificações em tabelas existentes:**
- `agendamentos`:
  - `tipo_paciente` ('fisica' | 'juridica')
  - `compra_pacote_id` (UUID, foreign key)
  - `codigo_empresa` (VARCHAR, nullable)

**Campos adicionados em `compras_pacotes`:**
- `primeiro_horario_data` - Data/hora do primeiro agendamento
- `primeiro_horario_slot_id` - ID do slot selecionado
- `modalidade` - Modalidade do agendamento
- `agendamentos_criados` - Flag para evitar duplicação

---

## 🔄 Fluxo Completo (Pessoa Física)

### **Passo 1: Seleção de Tipo**
Usuario clica em profissional → Modal pergunta: "Empresa ou Particular?"

### **Passo 2: Seleção de Pacote**
- Usuário seleciona "Particular"
- Exibe pacotes disponíveis (1, 4, 8, 12, 16 sessões)
- Pacotes mostram desconto progressivo (0%, 10%, 20%, 30%, 40%)

### **Passo 3: Seleção do Primeiro Horário** ⚠️ **IMPORTANTE**
**ANTES de ir para checkout**, o usuário deve:
1. Selecionar data e hora do primeiro agendamento no calendário
2. Esta informação será salva na compra

**Implementação sugerida no frontend:**
```tsx
// Após selecionar pacote:
1. Mostrar calendário em modal
2. Usuário seleciona primeiro horário
3. Salvar: selectedFirstSlot (data + slot_id)
4. Só depois ir para checkout
```

### **Passo 4: Checkout Mercado Pago**
```typescript
// Dados enviados para /api/mercadopago/create-preference:
{
  pacote_id: string,
  profissional_id: string,
  primeiro_horario_data: string, // ISO 8601
  primeiro_horario_slot_id: string,
  modalidade: 'presencial' | 'online'
}
```

### **Passo 5: Pagamento**
- Usuário redireciona para Mercado Pago
- Realiza pagamento
- MP envia webhook para `/api/mercadopago/webhook`

### **Passo 6: Webhook (Automático)**
Quando pagamento aprovado:
1. Atualiza `compras_pacotes.status = 'ativo'`
2. **Chama `PacotesService.criarAgendamentosRecorrentes()`**
3. Cria todos os agendamentos automaticamente:
   - Sessão 1: data do `primeiro_horario_data`
   - Sessão 2: +7 dias
   - Sessão 3: +14 dias
   - ... até completar todas as sessões do pacote

### **Passo 7: Confirmação**
- Usuário recebe email (opcional)
- Pode visualizar agendamentos em "Meus Agendamentos"

---

## 📁 Arquivos Modificados/Criados

### **Backend:**
✅ `src/services/database/pacotes.service.ts`
- Método: `criarAgendamentosRecorrentes(compraId)` - Cria todos os agendamentos

✅ `src/services/mercadopago/mp.service.ts`
- Método: `ativarCompraPacote()` modificado para chamar criação de agendamentos

✅ `src/app/api/mercadopago/create-preference/route.ts`
- Aceita: `primeiro_horario_data`, `primeiro_horario_slot_id`, `modalidade`

✅ Migrations Supabase:
- `migrations-pacotes-pf.sql` (tabelas)
- `add_primeiro_horario_to_compras.sql` (campos novos)
- `insert_pacotes_sessoes_iniciais.sql` (dados)

### **Frontend:**
✅ `src/components/patient-type-modal.tsx`
✅ `src/components/package-selector.tsx`
✅ `src/components/mercadopago-checkout.tsx`
✅ `src/app/portal-publico/profissionais/[id]/client.tsx`
✅ `src/components/booking/booking-confirmation.tsx`

---

## ⚠️ PRÓXIMO PASSO CRÍTICO

### **MODIFICAR FLUXO NO FRONTEND**

Atualmente o fluxo está:
```
Selecionar Pacote → Ir para Checkout → Pagar
```

**Deve ser:**
```
Selecionar Pacote → Selecionar Primeiro Horário → Ir para Checkout → Pagar
```

### **Implementação Sugerida:**

**No arquivo: `src/app/portal-publico/profissionais/[id]/client.tsx`**

```tsx
// 1. Adicionar estado para primeiro horário
const [selectedFirstSlot, setSelectedFirstSlot] = useState<{
  data: string;
  slot_id: string;
} | null>(null);
const [showFirstSlotSelector, setShowFirstSlotSelector] = useState(false);

// 2. Modificar handlePackageSelect
const handlePackageSelect = (pacote: any) => {
  setSelectedPackage(pacote);
  setShowPackageSelector(false);
  // NOVO: Mostrar seletor de primeiro horário
  setShowFirstSlotSelector(true);
};

// 3. Adicionar handler para seleção de horário
const handleFirstSlotSelect = (slot: AgendaSlot) => {
  setSelectedFirstSlot({
    data: slot.data_hora_inicio || slot.data,
    slot_id: slot.id
  });
  setShowFirstSlotSelector(false);
  // Agora sim vai para checkout
  setShowCheckout(true);
};

// 4. Adicionar modal para seleção do primeiro horário
<Dialog open={showFirstSlotSelector} onOpenChange={setShowFirstSlotSelector}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Escolha o horário da primeira sessão</DialogTitle>
      <DialogDescription>
        As demais sessões serão agendadas automaticamente toda semana no mesmo horário
      </DialogDescription>
    </DialogHeader>
    <CalendarBooking
      profissionalId={profissional.id}
      profissionalNome={profissional.nome}
      onBookingSelect={handleFirstSlotSelect}
    />
  </DialogContent>
</Dialog>
```

**No arquivo: `src/components/mercadopago-checkout.tsx`**

```tsx
// Adicionar props
interface MercadoPagoCheckoutProps {
  pacote: PacoteSessao;
  profissionalId: string;
  primeiroHorario: {
    data: string;
    slot_id: string;
  };
  modalidade?: 'presencial' | 'online';
  onSuccess: (compraPacoteId: string) => void;
  onCancel: () => void;
}

// No handleCheckout, incluir dados do primeiro horário:
body: JSON.stringify({
  pacote_id: pacote.id,
  profissional_id: profissionalId,
  primeiro_horario_data: primeiroHorario.data,
  primeiro_horario_slot_id: primeiroHorario.slot_id,
  modalidade: modalidade || 'online',
}),
```

---

## 🧪 Como Testar

1. **Criar pacote de teste:**
   - Login no sistema
   - Selecionar profissional
   - Escolher "Particular"
   - Selecionar pacote de 4 sessões

2. **Selecionar primeiro horário:**
   - Escolher data/hora no calendário
   - Confirmar seleção

3. **Fazer checkout:**
   - Será redirecionado para Mercado Pago
   - Usar cartão de teste: `5031 4332 1540 6351`
   - CVV: qualquer
   - Validade: qualquer data futura

4. **Verificar webhook:**
   - Checar logs do servidor após pagamento
   - Verificar se `criarAgendamentosRecorrentes` foi chamado
   - Conferir tabela `agendamentos` para ver se foram criados 4 registros

5. **Verificar agendamentos:**
   - Ir para "Meus Agendamentos"
   - Deve mostrar 4 agendamentos:
     - Semana 1 (data selecionada)
     - Semana 2 (+7 dias)
     - Semana 3 (+14 dias)
     - Semana 4 (+21 dias)

---

## 📊 Resumo da Implementação

| Componente | Status | Observação |
|------------|--------|------------|
| Migrations DB | ✅ Completo | Tabelas criadas e populadas |
| API create-preference | ✅ Completo | Aceita primeiro_horario |
| Webhook MP | ✅ Completo | Cria agendamentos automáticos |
| Service Pacotes | ✅ Completo | Método criarAgendamentosRecorrentes |
| Frontend - Modal Tipo | ✅ Completo | PatientTypeModal |
| Frontend - Pacotes | ✅ Completo | PackageSelector |
| Frontend - Checkout | ✅ Completo | MercadoPagoCheckout |
| **Frontend - Primeiro Horário** | ⚠️ **PENDENTE** | Adicionar seleção antes do checkout |
| Testes E2E | ⏳ Pendente | Aguardando conclusão do frontend |

---

## 🚀 Próximas Ações

1. ⚠️ **URGENTE**: Implementar seleção de primeiro horário no frontend
2. Testar fluxo completo em ambiente de desenvolvimento
3. Validar webhook com pagamentos de teste do Mercado Pago
4. Adicionar tratamento de erros e notificações ao usuário
5. Implementar cancelamento de pacote (opcional)

---

## 📝 Notas Importantes

- ⚠️ O usuário DEVE selecionar o primeiro horário ANTES do pagamento
- Os agendamentos são criados AUTOMATICAMENTE pelo webhook
- Se um horário não estiver disponível, ele é pulado (log de erro)
- Pacotes têm validade de 180 dias
- Webhook processa pagamento de forma assíncrona
- Não decrementar `sessoes_utilizadas` manualmente - o webhook já faz isso
