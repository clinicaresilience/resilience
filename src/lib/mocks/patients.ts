// Tipos e mocks de pacientes

export type Paciente = {
  id: string
  nome: string
  email: string
  telefone: string
  dataNascimento: string
  cpf: string
  endereco: string
  convenio?: string
  observacoes?: string
  criadoEm: string
}

// Gera um id simples (mock)
function uid(prefix = "pac"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

// Gera data aleatória no passado
function dataPassadaAleatoria(diasAtras: number): string {
  const data = new Date()
  data.setDate(data.getDate() - Math.floor(Math.random() * diasAtras))
  return data.toISOString()
}

export function generateMockPacientes(): Paciente[] {
  return [
    {
      id: "pac_001",
      nome: "Maria Silva Santos",
      email: "maria.silva@email.com",
      telefone: "(11) 99999-1111",
      dataNascimento: "1985-03-15",
      cpf: "123.456.789-01",
      endereco: "Rua das Flores, 123 - São Paulo, SP",
      convenio: "Unimed",
      observacoes: "Paciente com histórico de ansiedade",
      criadoEm: dataPassadaAleatoria(180)
    },
    {
      id: "pac_002", 
      nome: "João Carlos Oliveira",
      email: "joao.carlos@email.com",
      telefone: "(11) 99999-2222",
      dataNascimento: "1978-07-22",
      cpf: "234.567.890-12",
      endereco: "Av. Paulista, 456 - São Paulo, SP",
      convenio: "Bradesco Saúde",
      criadoEm: dataPassadaAleatoria(150)
    },
    {
      id: "pac_003",
      nome: "Ana Paula Costa",
      email: "ana.paula@email.com", 
      telefone: "(11) 99999-3333",
      dataNascimento: "1992-11-08",
      cpf: "345.678.901-23",
      endereco: "Rua Augusta, 789 - São Paulo, SP",
      observacoes: "Primeira consulta - encaminhamento médico",
      criadoEm: dataPassadaAleatoria(120)
    },
    {
      id: "pac_004",
      nome: "Carlos Eduardo Lima",
      email: "carlos.eduardo@email.com",
      telefone: "(11) 99999-4444", 
      dataNascimento: "1965-12-30",
      cpf: "456.789.012-34",
      endereco: "Rua da Consolação, 321 - São Paulo, SP",
      convenio: "SulAmérica",
      observacoes: "Paciente em acompanhamento há 2 anos",
      criadoEm: dataPassadaAleatoria(200)
    },
    {
      id: "pac_005",
      nome: "Fernanda Rodrigues",
      email: "fernanda.rodrigues@email.com",
      telefone: "(11) 99999-5555",
      dataNascimento: "1988-05-14",
      cpf: "567.890.123-45", 
      endereco: "Rua Oscar Freire, 654 - São Paulo, SP",
      criadoEm: dataPassadaAleatoria(90)
    },
    {
      id: "pac_006",
      nome: "Roberto Santos Silva",
      email: "roberto.santos@email.com",
      telefone: "(11) 99999-6666",
      dataNascimento: "1975-09-03",
      cpf: "678.901.234-56",
      endereco: "Av. Faria Lima, 987 - São Paulo, SP",
      convenio: "Amil",
      observacoes: "Terapia de casal com esposa",
      criadoEm: dataPassadaAleatoria(160)
    },
    {
      id: "pac_007",
      nome: "Juliana Mendes",
      email: "juliana.mendes@email.com",
      telefone: "(11) 99999-7777",
      dataNascimento: "1995-01-20",
      cpf: "789.012.345-67",
      endereco: "Rua Haddock Lobo, 147 - São Paulo, SP",
      criadoEm: dataPassadaAleatoria(60)
    },
    {
      id: "pac_008",
      nome: "Pedro Henrique Alves",
      email: "pedro.henrique@email.com",
      telefone: "(11) 99999-8888",
      dataNascimento: "1982-04-12",
      cpf: "890.123.456-78",
      endereco: "Rua Bela Cintra, 258 - São Paulo, SP",
      convenio: "Porto Seguro",
      observacoes: "Acompanhamento psiquiátrico mensal",
      criadoEm: dataPassadaAleatoria(140)
    }
  ]
}

// Função para obter pacientes únicos que tiveram consultas concluídas
export function getPacientesAtendidos(agendamentos: any[]): string[] {
  const pacientesAtendidos = new Set<string>()
  
  agendamentos.forEach(ag => {
    if (ag.status === "concluido" && ag.usuarioId) {
      pacientesAtendidos.add(ag.usuarioId)
    }
  })
  
  return Array.from(pacientesAtendidos)
}

// Função para obter pacientes atendidos hoje
export function getPacientesAtendidosHoje(agendamentos: any[]): string[] {
  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000)
  
  const pacientesHoje = new Set<string>()
  
  agendamentos.forEach(ag => {
    const dataAgendamento = new Date(ag.dataISO)
    if (
      ag.status === "concluido" && 
      ag.usuarioId &&
      dataAgendamento >= inicioHoje && 
      dataAgendamento < fimHoje
    ) {
      pacientesHoje.add(ag.usuarioId)
    }
  })
  
  return Array.from(pacientesHoje)
}
