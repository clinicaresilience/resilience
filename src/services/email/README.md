# Sistema de Notificações por Email - Clínica Resilience

## Visão Geral

Este sistema implementa notificações automáticas por email para agendamentos na Clínica Resilience. O sistema envia emails para pacientes e profissionais quando agendamentos são criados, cancelados ou reagendados.

## Arquitetura

### Componentes Principais

1. **EmailService** (`src/services/email/email.service.ts`)
   - Classe principal que gerencia o envio de emails
   - Contém métodos para diferentes tipos de notificação
   - Gera templates HTML personalizados
   - Registra logs de envio para auditoria

2. **Templates HTML**
   - Templates responsivos para pacientes e profissionais
   - Diferentes layouts para cada tipo de notificação
   - Suporte a modalidades presencial e online

3. **Integração com APIs**
   - Integrado com as APIs de agendamentos existentes
   - Não afeta o funcionamento principal do sistema
   - Falhas de email não impedem operações de agendamento

## Funcionalidades Implementadas

### Tipos de Notificação

1. **Criação de Agendamento**
   - Email para paciente confirmando o agendamento
   - Email para profissional informando novo agendamento
   - Informações sobre modalidade (presencial/online)

2. **Cancelamento de Agendamento**
   - Email para paciente informando cancelamento
   - Email para profissional sobre liberação de horário
   - Inclui justificativa do cancelamento

3. **Reagendamento**
   - Email para paciente com nova data/horário
   - Email para profissional sobre alteração
   - Informações atualizadas do agendamento

### Destinatários

- **Pacientes**: Recebem confirmações, cancelamentos e reagendamentos
- **Profissionais**: Recebem notificações sobre mudanças em sua agenda

## Integração com Sistema Existente

### APIs Modificadas

1. **POST /api/agendamentos** - Criação de agendamentos
   - Envia notificação após criação bem-sucedida
   - Busca dados completos do agendamento para email

2. **PATCH /api/agendamentos** - Cancelamento via rota principal
   - Envia notificação de cancelamento
   - Inclui justificativa no email

3. **PATCH /api/agendamentos/[id]** - Atualizações individuais
   - Suporta cancelamento com notificação
   - Suporta reagendamento com notificação

### Fluxo de Execução

```
Operação de Agendamento → Processamento no Banco → EmailService → Envio/Log
```

## Configuração

### Variáveis de Ambiente

Para produção, configure as seguintes variáveis:

```env
EMAIL_SERVICE_URL=https://api.resend.com/emails
RESEND_API_KEY=your_api_key_here
```

### Configuração do Serviço

No arquivo `email.service.ts`, a configuração é definida em:

```typescript
private static config: EmailConfig = {
  from: 'noreply@clinicaresilience.com.br',
  replyTo: 'contato@clinicaresilience.com.br',
  serviceUrl: process.env.EMAIL_SERVICE_URL || 'https://api.resend.com/emails'
};
```

## Templates de Email

### Estrutura dos Templates

- **Responsivos**: Adaptam-se a diferentes dispositivos
- **Branded**: Seguem identidade visual da Clínica Resilience
- **Informativos**: Contêm todas as informações necessárias

### Personalização por Tipo

1. **Pacientes**
   - Linguagem amigável e explicativa
   - Informações sobre local e preparação
   - Instruções específicas por modalidade

2. **Profissionais**
   - Dados técnicos do agendamento
   - Informações do paciente
   - Status da agenda atualizado

## Auditoria e Logs

### Registro de Envios

O sistema registra todos os envios na tabela `email_notifications`:

```sql
CREATE TABLE email_notifications (
  id SERIAL PRIMARY KEY,
  agendamento_id UUID REFERENCES agendamentos(id),
  destinatario_email VARCHAR(255),
  tipo_destinatario VARCHAR(20) CHECK (tipo_destinatario IN ('paciente', 'profissional')),
  assunto TEXT,
  status VARCHAR(20) CHECK (status IN ('enviado', 'erro')),
  erro TEXT,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);
```

### Monitoramento

- Logs detalhados no console do servidor
- Registro de erros sem interromper operações
- Métricas de sucesso/falha disponíveis

## Tratamento de Erros

### Princípios

1. **Não-Blocking**: Falhas de email não afetam agendamentos
2. **Logging**: Todos os erros são registrados
3. **Graceful Degradation**: Sistema continua funcionando sem emails

### Cenários de Erro

- Serviço de email indisponível
- Dados de agendamento incompletos
- Emails inválidos
- Falhas na geração de templates

## Manutenção e Monitoramento

### Verificações Recomendadas

1. **Diárias**
   - Verificar logs de erro
   - Monitorar taxa de entrega

2. **Semanais**
   - Revisar templates enviados
   - Validar dados de auditoria

3. **Mensais**
   - Análise de performance
   - Otimização de templates

### Troubleshooting

#### Emails não estão sendo enviados

1. Verificar configuração das variáveis de ambiente
2. Conferir logs do console para erros
3. Validar conectividade com serviço de email
4. Verificar tabela `email_notifications` para status

#### Templates não renderizam corretamente

1. Verificar dados retornados por `buscarDadosAgendamento`
2. Validar formatação de datas/horários
3. Testar com diferentes tipos de agendamento

## Desenvolvimento Futuro

### Melhorias Planejadas

1. **Interface de Configuração**
   - Painel admin para editar templates
   - Configuração de preferências de email

2. **Relatórios**
   - Dashboard de estatísticas de email
   - Relatórios de entrega e engajamento

3. **Funcionalidades Avançadas**
   - Emails de lembrete automático
   - Confirmação de recebimento
   - Personalização por usuário

### Extensibilidade

O sistema foi projetado para ser facilmente extensível:

- Novos tipos de notificação
- Templates personalizados
- Múltiplos provedores de email
- Integração com outras funcionalidades

## Suporte

Para questões técnicas ou problemas:

1. Verificar logs no console do servidor
2. Consultar tabela `email_notifications`
3. Revisar documentação da API
4. Contatar equipe de desenvolvimento

---

**Versão**: 1.0  
**Última Atualização**: Dezembro 2024  
**Responsável**: Equipe de Desenvolvimento Clínica Resilience
