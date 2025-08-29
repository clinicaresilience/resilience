// Tipos e mocks de prontuários médicos

export type ProntuarioMedico = {
  id: string
  pacienteId: string
  pacienteNome: string
  profissionalId: string
  profissionalNome: string
  dataConsulta: string
  tipoConsulta: string
  diagnostico?: string
  observacoes: string
  prescricoes?: string[]
  proximaConsulta?: string
  status: "ativo" | "arquivado" | "em_andamento"
  criadoEm: string
  atualizadoEm: string
}

export type HistoricoPaciente = {
  pacienteId: string
  pacienteNome: string
  totalConsultas: number
  ultimaConsulta: string
  proximaConsulta?: string
  profissionaisAtendentes: string[]
  statusAtual: "ativo" | "inativo" | "alta"
  observacoesGerais?: string
}

// Gera um id simples (mock)
function uid(prefix = "pront"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

// Gera data aleatória no passado
function dataPassadaAleatoria(diasAtras: number): string {
  const data = new Date()
  data.setDate(data.getDate() - Math.floor(Math.random() * diasAtras))
  return data.toISOString()
}

// Gera data futura aleatória
function dataFuturaAleatoria(diasFuturos: number): string {
  const data = new Date()
  data.setDate(data.getDate() + Math.floor(Math.random() * diasFuturos) + 1)
  return data.toISOString()
}

export function generateMockProntuarios(): ProntuarioMedico[] {
  return [
    {
      id: uid(),
      pacienteId: "pac_001",
      pacienteNome: "Maria Silva Santos",
      profissionalId: "prof_001",
      profissionalNome: "Dra. Ana Paula",
      dataConsulta: dataPassadaAleatoria(30),
      tipoConsulta: "Consulta Inicial - Avaliação Psicológica",
      diagnostico: "Transtorno de Ansiedade Generalizada (F41.1)",
      observacoes: `ANAMNESE:
Paciente do sexo feminino, 38 anos, casada, administradora, procurou atendimento devido a sintomas de ansiedade que se intensificaram nos últimos 6 meses.

QUEIXA PRINCIPAL:
"Estou muito ansiosa, não consigo parar de me preocupar com tudo"

HISTÓRIA DA DOENÇA ATUAL:
Relata que os sintomas iniciaram após mudança de emprego em janeiro/2024. Apresenta:
- Preocupações excessivas com trabalho e família
- Tensão muscular (principalmente pescoço e ombros)
- Dificuldade para adormecer (demora 1-2h)
- Irritabilidade
- Fadiga
- Dificuldade de concentração

HISTÓRIA PESSOAL:
- Sem histórico psiquiátrico anterior
- Nega uso de substâncias
- Pratica exercícios 2x/semana (caminhada)
- Alimentação regular

HISTÓRIA FAMILIAR:
- Mãe com histórico de depressão
- Pai hipertenso

EXAME MENTAL:
- Apresentação: adequada, bem cuidada
- Humor: ansioso
- Afeto: congruente
- Pensamento: curso acelerado, conteúdo com preocupações
- Sensopercepção: sem alterações
- Cognição: preservada
- Crítica: presente`,
      prescricoes: [
        "Técnicas de respiração diafragmática - praticar 3x ao dia, 10 minutos cada",
        "Exercícios de relaxamento muscular progressivo - antes de dormir",
        "Diário de pensamentos automáticos - registrar situações que geram ansiedade",
        "Higiene do sono - deitar sempre no mesmo horário (22h)",
        "Reduzir cafeína após 16h",
        "Atividade física regular - manter caminhadas e incluir yoga/pilates"
      ],
      proximaConsulta: dataFuturaAleatoria(14),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(30),
      atualizadoEm: dataPassadaAleatoria(5)
    },
    {
      id: uid(),
      pacienteId: "pac_001",
      pacienteNome: "Maria Silva Santos",
      profissionalId: "prof_001", 
      profissionalNome: "Dra. Ana Paula",
      dataConsulta: dataPassadaAleatoria(14),
      tipoConsulta: "Consulta de Retorno - 2ª Sessão",
      observacoes: `EVOLUÇÃO:
Paciente retorna após 2 semanas demonstrando melhora significativa nos sintomas de ansiedade.

RELATO DA PACIENTE:
- "Estou conseguindo dormir melhor"
- "As técnicas de respiração estão ajudando muito"
- "Ainda me preocupo, mas não é mais desesperador"

OBSERVAÇÕES CLÍNICAS:
- Maior facilidade para adormecer (redução para 30min)
- Diminuição da tensão muscular
- Humor mais estável
- Aderência excelente às técnicas prescritas
- Mantém diário de pensamentos automáticos

AVALIAÇÃO:
- Redução de 40% na intensidade dos sintomas ansiosos
- Melhora na qualidade do sono
- Maior consciência dos gatilhos de ansiedade

PLANO:
- Continuidade do tratamento
- Introdução de técnicas de mindfulness
- Manutenção das estratégias que estão funcionando`,
      prescricoes: [
        "Manter técnicas de respiração diafragmática",
        "Introduzir técnicas de mindfulness - app Headspace ou Calm",
        "Atividade física regular - caminhada 30min/dia, 5x/semana",
        "Continuar diário de pensamentos - focar em reestruturação cognitiva",
        "Técnica do 5-4-3-2-1 para momentos de ansiedade aguda"
      ],
      proximaConsulta: dataFuturaAleatoria(21),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(14),
      atualizadoEm: dataPassadaAleatoria(2)
    },
    {
      id: uid(),
      pacienteId: "pac_002",
      pacienteNome: "João Carlos Oliveira",
      profissionalId: "prof_002",
      profissionalNome: "Dr. Bruno Lima",
      dataConsulta: dataPassadaAleatoria(45),
      tipoConsulta: "Avaliação Psiquiátrica Inicial",
      diagnostico: "Episódio Depressivo Moderado (F32.1)",
      observacoes: `IDENTIFICAÇÃO:
João Carlos Oliveira, 45 anos, engenheiro civil, divorciado, 2 filhos

QUEIXA PRINCIPAL:
"Não tenho mais vontade de fazer nada, me sinto um fracasso"

HISTÓRIA DA DOENÇA ATUAL:
Quadro iniciado há aproximadamente 3 meses, coincidindo com processo de divórcio. Apresenta:
- Humor deprimido na maior parte do dia
- Anedonia (perda de prazer em atividades antes prazerosas)
- Fadiga e perda de energia
- Sentimentos de inutilidade e culpa excessiva
- Dificuldade de concentração no trabalho
- Alterações do sono (despertar precoce às 4h)
- Diminuição do apetite (perda de 5kg em 2 meses)
- Ideação suicida passiva (sem planos específicos)

ANTECEDENTES:
- Episódio depressivo aos 25 anos (tratado com fluoxetina por 1 ano)
- Nega uso de álcool ou drogas
- Hipertensão arterial controlada

HISTÓRIA FAMILIAR:
- Pai com depressão (suicídio aos 60 anos)
- Mãe com transtorno bipolar

EXAME MENTAL:
- Apresentação: descuidada, emagrecido
- Humor: deprimido
- Afeto: embotado
- Psicomotricidade: lentificada
- Pensamento: bradipsiquismo, conteúdo pessimista
- Crítica: preservada

ESCALAS:
- PHQ-9: 18 pontos (depressão moderada-grave)
- HAM-D: 22 pontos`,
      prescricoes: [
        "Sertralina 50mg - 1 comprimido pela manhã, em jejum",
        "Reavaliação em 15 dias para ajuste de dose",
        "Acompanhamento psicológico semanal (TCC)",
        "Atividades de rotina estruturada - cronograma diário",
        "Exercícios físicos leves - caminhada 20min/dia",
        "Evitar álcool completamente",
        "Suporte familiar - orientar filhos sobre o quadro",
        "Retorno de urgência se piora da ideação suicida"
      ],
      proximaConsulta: dataFuturaAleatoria(15),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(45),
      atualizadoEm: dataPassadaAleatoria(10)
    },
    {
      id: uid(),
      pacienteId: "pac_003",
      pacienteNome: "Ana Paula Costa",
      profissionalId: "prof_003",
      profissionalNome: "Dra. Camila Rocha",
      dataConsulta: dataPassadaAleatoria(7),
      tipoConsulta: "Terapia de Casal - Sessão Individual",
      observacoes: "Primeira sessão individual para compreender a perspectiva da paciente sobre os conflitos conjugais. Relatou dificuldades de comunicação e diferenças na educação dos filhos.",
      prescricoes: [
        "Exercícios de comunicação assertiva",
        "Leitura: 'Os 5 Linguagens do Amor'",
        "Reflexão sobre expectativas no relacionamento"
      ],
      proximaConsulta: dataFuturaAleatoria(7),
      status: "em_andamento",
      criadoEm: dataPassadaAleatoria(7),
      atualizadoEm: dataPassadaAleatoria(1)
    },
    {
      id: uid(),
      pacienteId: "pac_004",
      pacienteNome: "Carlos Eduardo Lima",
      profissionalId: "prof_004",
      profissionalNome: "Dr. Diego Santos",
      dataConsulta: dataPassadaAleatoria(60),
      tipoConsulta: "Avaliação Neuropsicológica",
      diagnostico: "Dificuldades de Aprendizagem - Dislexia",
      observacoes: "Avaliação completa realizada. Paciente apresenta dificuldades específicas na leitura e escrita. Recomendado acompanhamento psicopedagógico especializado.",
      prescricoes: [
        "Exercícios de consciência fonológica",
        "Técnicas de leitura multissensorial",
        "Acompanhamento escolar especializado"
      ],
      status: "arquivado",
      criadoEm: dataPassadaAleatoria(60),
      atualizadoEm: dataPassadaAleatoria(30)
    },
    {
      id: uid(),
      pacienteId: "pac_005",
      pacienteNome: "Fernanda Rodrigues",
      profissionalId: "prof_005",
      profissionalNome: "Dra. Elisa Martins",
      dataConsulta: dataPassadaAleatoria(21),
      tipoConsulta: "Sessão de Psicanálise",
      observacoes: "Paciente trouxe sonhos recorrentes para análise. Trabalhamos questões relacionadas à relação com a figura materna e padrões de relacionamento. Processo de autoconhecimento em desenvolvimento.",
      prescricoes: [
        "Registro de sonhos em diário",
        "Reflexão sobre padrões relacionais",
        "Leitura recomendada sobre vínculos afetivos"
      ],
      proximaConsulta: dataFuturaAleatoria(7),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(21),
      atualizadoEm: dataPassadaAleatoria(3)
    },
    {
      id: uid(),
      pacienteId: "pac_006",
      pacienteNome: "Roberto Santos Silva",
      profissionalId: "prof_006",
      profissionalNome: "Dr. Felipe Souza",
      dataConsulta: dataPassadaAleatoria(35),
      tipoConsulta: "Avaliação Neuropsicológica",
      diagnostico: "Comprometimento Cognitivo Leve",
      observacoes: "Avaliação neuropsicológica completa. Identificadas alterações leves na memória de trabalho e atenção. Recomendado acompanhamento e estimulação cognitiva.",
      prescricoes: [
        "Exercícios de estimulação cognitiva",
        "Atividades de memória e atenção",
        "Acompanhamento neurológico"
      ],
      proximaConsulta: dataFuturaAleatoria(60),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(35),
      atualizadoEm: dataPassadaAleatoria(7)
    },
    {
      id: uid(),
      pacienteId: "pac_007",
      pacienteNome: "Juliana Mendes",
      profissionalId: "prof_007",
      profissionalNome: "Dra. Gabriela Mota",
      dataConsulta: dataPassadaAleatoria(14),
      tipoConsulta: "Terapia Cognitivo-Comportamental",
      diagnostico: "Fobia Social (F40.1)",
      observacoes: "Paciente apresenta medo intenso de situações sociais. Trabalhamos técnicas de reestruturação cognitiva e exposição gradual. Boa adesão ao tratamento.",
      prescricoes: [
        "Exercícios de exposição gradual",
        "Técnicas de reestruturação cognitiva",
        "Registro de situações sociais"
      ],
      proximaConsulta: dataFuturaAleatoria(7),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(14),
      atualizadoEm: dataPassadaAleatoria(1)
    },
    {
      id: uid(),
      pacienteId: "pac_008",
      pacienteNome: "Pedro Henrique Alves",
      profissionalId: "prof_008",
      profissionalNome: "Dr. Henrique Prado",
      dataConsulta: dataPassadaAleatoria(28),
      tipoConsulta: "Psicologia do Esporte",
      observacoes: "Atleta apresentando ansiedade de performance. Trabalhamos técnicas de visualização e controle de ansiedade pré-competição. Melhora significativa no rendimento.",
      prescricoes: [
        "Técnicas de visualização",
        "Exercícios de controle respiratório",
        "Rotina pré-competição estruturada"
      ],
      proximaConsulta: dataFuturaAleatoria(14),
      status: "ativo",
      criadoEm: dataPassadaAleatoria(28),
      atualizadoEm: dataPassadaAleatoria(5)
    }
  ]
}

export function generateHistoricoPacientes(prontuarios: ProntuarioMedico[]): HistoricoPaciente[] {
  const historicoPorPaciente = new Map<string, HistoricoPaciente>()

  prontuarios.forEach(pront => {
    const pacienteId = pront.pacienteId
    
    if (!historicoPorPaciente.has(pacienteId)) {
      historicoPorPaciente.set(pacienteId, {
        pacienteId,
        pacienteNome: pront.pacienteNome,
        totalConsultas: 0,
        ultimaConsulta: pront.dataConsulta,
        profissionaisAtendentes: [],
        statusAtual: "ativo"
      })
    }

    const historico = historicoPorPaciente.get(pacienteId)!
    historico.totalConsultas += 1
    
    // Atualizar última consulta (mais recente)
    if (new Date(pront.dataConsulta) > new Date(historico.ultimaConsulta)) {
      historico.ultimaConsulta = pront.dataConsulta
    }

    // Adicionar profissional se não estiver na lista
    if (!historico.profissionaisAtendentes.includes(pront.profissionalNome)) {
      historico.profissionaisAtendentes.push(pront.profissionalNome)
    }

    // Atualizar próxima consulta
    if (pront.proximaConsulta) {
      if (!historico.proximaConsulta || new Date(pront.proximaConsulta) < new Date(historico.proximaConsulta)) {
        historico.proximaConsulta = pront.proximaConsulta
      }
    }

    // Determinar status baseado no status dos prontuários
    if (pront.status === "ativo" || pront.status === "em_andamento") {
      historico.statusAtual = "ativo"
    }
  })

  return Array.from(historicoPorPaciente.values()).sort((a, b) => 
    new Date(b.ultimaConsulta).getTime() - new Date(a.ultimaConsulta).getTime()
  )
}

// Função para buscar prontuários por termo
export function buscarProntuarios(prontuarios: ProntuarioMedico[], termo: string): ProntuarioMedico[] {
  if (!termo.trim()) return prontuarios

  const termoLower = termo.toLowerCase()
  return prontuarios.filter(pront => 
    pront.pacienteNome.toLowerCase().includes(termoLower) ||
    pront.profissionalNome.toLowerCase().includes(termoLower) ||
    pront.tipoConsulta.toLowerCase().includes(termoLower) ||
    pront.diagnostico?.toLowerCase().includes(termoLower) ||
    pront.observacoes.toLowerCase().includes(termoLower)
  )
}

// Função para filtrar prontuários por status
export function filtrarProntuariosPorStatus(prontuarios: ProntuarioMedico[], status?: string): ProntuarioMedico[] {
  if (!status || status === "todos") return prontuarios
  return prontuarios.filter(pront => pront.status === status)
}
