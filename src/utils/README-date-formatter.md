# DateFormatter - Utilitário Universal de Formatação de Datas

Este utilitário padroniza a formatação de datas e horários em todo o frontend, usando a biblioteca **Luxon** para evitar problemas comuns de timezone e formatação inconsistente.

## 🎯 Objetivo

Evitar erros como "Invalid Date" e garantir formatação consistente entre todos os componentes, especialmente para designações presenciais que podem ter formatos de data variados.

## 📦 Instalação

As dependências já estão instaladas:
```bash
npm install luxon @types/luxon
```

## 🚀 Uso Básico

### Importação

```typescript
// Importar classe completa
import { DateFormatter } from '@/utils/date-formatter'

// Ou importar funções específicas
import { formatTime, formatDate, formatDateTime, formatDateLong } from '@/utils/date-formatter'
```

### Funções Disponíveis

#### 1. `formatTime(dateString)` - Horário (HH:mm)
```typescript
formatTime('2025-09-16T14:30:00') // → '14:30'
formatTime('2025-09-16') // → '08:00' (fallback)
```

#### 2. `formatDate(dateString)` - Data (dd/MM/yyyy)
```typescript
formatDate('2025-09-16T14:30:00') // → '16/09/2025'
formatDate('2025-09-16') // → '16/09/2025'
```

#### 3. `formatDateTime(dateString)` - Data e Hora (dd/MM/yyyy às HH:mm)
```typescript
formatDateTime('2025-09-16T14:30:00') // → '16/09/2025 às 14:30'
```

#### 4. `formatDateLong(dateString)` - Data por Extenso
```typescript
formatDateLong('2025-09-16') // → 'segunda-feira, 16 de setembro de 2025'
```

#### 5. `formatDateTimeLong(dateString)` - Data e Hora por Extenso
```typescript
formatDateTimeLong('2025-09-16T14:30:00') // → 'segunda-feira, 16 de setembro de 2025 às 14:30'
```

#### 6. `formatDateTimeObject(dateString)` - Objeto Separado
```typescript
formatDateTimeObject('2025-09-16T14:30:00') 
// → { date: '16/09/2025', time: '14:30' }
```

#### 7. `getDateOnly(dateString)` - Apenas Data ISO (YYYY-MM-DD)
```typescript
getDateOnly('2025-09-16T14:30:00') // → '2025-09-16'
getDateOnly('2025-09-16') // → '2025-09-16'
```

#### 8. `isSameDay(date1, date2)` - Comparar Dias
```typescript
isSameDay('2025-09-16T08:00:00', '2025-09-16T18:00:00') // → true
isSameDay('2025-09-16', '2025-09-17') // → false
```

## 🛠️ Exemplos de Uso nos Componentes

### Substituindo formatações antigas

#### ❌ Antes (propenso a erros)
```typescript
const formatTime = (dateString: string) => {
  const date = new Date(dateString) // Pode dar "Invalid Date"
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
```

#### ✅ Depois (seguro e padronizado)
```typescript
import { formatTime } from '@/utils/date-formatter'

// Usar diretamente
<span>{formatTime(agendamento.dataISO)}</span>
```

### Filtragem de datas

#### ❌ Antes
```typescript
const agDate = ag.dataISO.includes('T') ? ag.dataISO.split('T')[0] : ag.dataISO
```

#### ✅ Depois
```typescript
import { getDateOnly } from '@/utils/date-formatter'

const agDate = getDateOnly(ag.dataISO)
```

## 🌟 Características

- **Timezone Seguro**: Usa 'America/Sao_Paulo' por padrão
- **Fallbacks Robustos**: Nunca retorna "Invalid Date"
- **Múltiplos Formatos**: Aceita ISO, YYYY-MM-DD, etc.
- **Parse Inteligente**: Detecta automaticamente o formato da string
- **Locale Português**: Formatações em português brasileiro

## 🔧 Configuração

O timezone está configurado para o Brasil:
```typescript
const TIMEZONE = 'America/Sao_Paulo'
```

## 📝 Migração de Componentes

### Para migrar um componente existente:

1. **Importar as funções necessárias**:
```typescript
import { formatTime, formatDate, getDateOnly } from '@/utils/date-formatter'
```

2. **Substituir funções locais**:
```typescript
// Remover funções locais como formatTime, formatDate
// Usar as do utilitário diretamente
```

3. **Atualizar chamadas**:
```typescript
// Antes
{new Date(dateString).toLocaleDateString('pt-BR')}

// Depois  
{formatDate(dateString)}
```

## ⚠️ Notas Importantes

- **Sempre usa timezone do Brasil** ('America/Sao_Paulo')
- **Fallback para 08:00** quando hora não especificada
- **Debug automático** no console para strings inválidas
- **Compatível com designações presenciais** que podem vir em formatos diferentes

## 🚨 Casos de Uso Específicos

### Designações Presenciais
O utilitário foi especialmente projetado para lidar com designações presenciais que podem chegar como:
- `"2025-09-16T00:00:00+00"` (data completa)  
- `"2025-09-16"` (apenas data)
- `"2025-09-16T12:00"` (data com hora específica)

### Agendamentos Regulares
Funciona perfeitamente com agendamentos que já têm formato ISO padrão.

---

**📌 Lembre-se**: Use sempre este utilitário para formatação de datas no frontend para evitar inconsistências e erros de "Invalid Date"!
