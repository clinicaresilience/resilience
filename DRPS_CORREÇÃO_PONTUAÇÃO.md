# Correção do Sistema de Pontuação DRPS

## Problema Identificado

O sistema DRPS calculava o risco de forma linear (0-4) para todas as 90 questões, mas existem dois tipos de questões:

1. **Questões NEGATIVAS (34)**: Nota alta = problema grave
   - Exemplo: "Você já presenciou comentários ofensivos?" → 4 (sempre) = RISCO ALTO

2. **Questões POSITIVAS (56)**: Nota alta = situação boa
   - Exemplo: "Existe um canal seguro para denunciar?" → 4 (sempre) = RISCO BAIXO

### Impacto do Bug

Antes da correção:
- Respostas positivas (nota 4) eram incorretamente tratadas como risco alto
- Empresas com bom ambiente de trabalho apareciam com risco elevado
- Relatórios não refletiam a realidade da empresa

Após a correção:
- Questões positivas têm score invertido para cálculo de risco
- Relatórios refletem corretamente o ambiente organizacional

## Solução Implementada

### 1. Mapeamento de Questões Positivas (`src/types/drps.ts`)

Criada constante `POSITIVE_QUESTIONS` contendo as 56 questões que necessitam inversão:

**Distribuição por tópico:**
- Assédio: 4 questões positivas (2, 3, 7, 8)
- Carga de Trabalho: 7 questões positivas (3, 4, 5, 6, 7, 9, 10)
- Reconhecimento: 9 questões positivas (1, 2, 3, 4, 5, 6, 7, 9, 10)
- Clima Organizacional: **TODAS** 10 questões positivas
- Autonomia: 8 questões positivas (1, 2, 3, 4, 5, 7, 8, 9)
- Pressão e Metas: 6 questões positivas (1, 4, 5, 6, 8, 9)
- Insegurança: 3 questões positivas (3, 5, 9)
- Conflitos: 7 questões positivas (1, 2, 4, 7, 8, 9, 10)
- Vida Pessoal: 8 questões positivas (1, 2, 4, 5, 6, 7, 8, 10)

### 2. Função de Conversão

```typescript
export function convertToRiskScore(questionId: string, userScore: DrpsScore): DrpsScore {
  if (POSITIVE_QUESTIONS.has(questionId)) {
    // Inverter para questões positivas
    return (4 - userScore) as DrpsScore;
  }
  // Manter como está para questões negativas
  return userScore;
}
```

**Exemplos de conversão:**

Questão POSITIVA:
- Resposta 4 (sempre) → Score de risco 0 (baixo risco)
- Resposta 3 (frequentemente) → Score de risco 1
- Resposta 2 (ocasionalmente) → Score de risco 2
- Resposta 1 (raramente) → Score de risco 3
- Resposta 0 (nunca) → Score de risco 4 (alto risco)

Questão NEGATIVA:
- Resposta 4 (sempre) → Score de risco 4 (alto risco)
- Resposta 0 (nunca) → Score de risco 0 (baixo risco)

### 3. Atualização do Cálculo de Risco

**Arquivo:** `src/app/api/drps/relatorio-consolidado/route.ts`

Todas as agregações agora aplicam a conversão:

```typescript
const userScore = respostas[question.id];
const riskScore = convertToRiskScore(question.id, userScore as DrpsScore);
```

### 4. Visualização no Painel Administrativo

**Arquivo:** `src/app/painel-administrativo/drps/page.tsx`

Modal de respostas individuais agora mostra:
- Resposta original do usuário (0-4 com label)
- Score de risco calculado
- Cor do badge baseada no risco real

## Arquivos Modificados

1. ✅ `src/types/drps.ts`
   - Adicionado `POSITIVE_QUESTIONS`
   - Adicionado `convertToRiskScore()`

2. ✅ `src/app/api/drps/relatorio-consolidado/route.ts`
   - Import de `convertToRiskScore`
   - Aplicação da conversão na agregação de respostas
   - Correção de tipos TypeScript

3. ✅ `src/app/painel-administrativo/drps/page.tsx`
   - Import de `convertToRiskScore` e `DrpsScore`
   - Atualização do cálculo de média por tópico
   - Exibição de score de risco nas respostas individuais

## Validação

Para validar a correção, compare:

**Antes:**
- Questão clima_1: "O ambiente é amigável?"
- Resposta: 4 (sempre) → Calculado como RISCO ALTO ❌

**Depois:**
- Questão clima_1: "O ambiente é amigável?"
- Resposta: 4 (sempre) → Calculado como RISCO BAIXO ✅

## Impacto em Dados Existentes

Os dados brutos no banco (`drps_submissions`) **não foram alterados**.

Apenas os **cálculos de relatório** foram corrigidos. Ao visualizar relatórios existentes, os cálculos agora refletirão o risco real baseado nas respostas já coletadas.

## Testes Recomendados

1. Submeter novo formulário DRPS com respostas variadas
2. Verificar relatório consolidado mostra scores corretos
3. Validar que questões positivas com nota 4 aparecem como risco baixo
4. Validar que questões negativas com nota 4 aparecem como risco alto
5. Exportar PDF e verificar matriz de risco

## Data da Correção

08/10/2025

## Desenvolvedor

Claude Code (Anthropic)
