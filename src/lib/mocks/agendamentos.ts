// Tipos e mocks de agendamentos

export type StatusAgendamento =
  | "confirmado"
  | "pendente"
  | "cancelado"
  | "concluido"

export type Agendamento = {
  id: string
  usuarioId?: string
  profissionalNome: string
  especialidade: string
  dataISO: string // ISO 8601
  local: string
  status: StatusAgendamento
  notas?: string
}

// util: formata data adicionando dias/horas relativas
function add({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  d.setMinutes(d.getMinutes() + minutes)
  d.setSeconds(0, 0)
  return d
}

// util: gera um id simples (mock)
function uid(prefix = "ag"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function generateMockAgendamentos(userId?: string): Agendamento[] {
  const base: Agendamento[] = [
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dra. Ana Paula",
      especialidade: "Psicologia Clínica",
      dataISO: add({ days: 1, hours: 10 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 2",
      status: "confirmado",
      notas: "Trazer exames anteriores, se houver.",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dr. Bruno Lima",
      especialidade: "Psiquiatria",
      dataISO: add({ days: 3, hours: 14 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 5",
      status: "pendente",
      notas: "Aguardando confirmação da secretária.",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dra. Camila Rocha",
      especialidade: "Terapia de Casal",
      dataISO: add({ days: -5, hours: 9 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 1",
      status: "concluido",
      notas: "Retorno em 2 semanas recomendado.",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dr. Diego Santos",
      especialidade: "Psicopedagogia",
      dataISO: add({ days: -2, hours: 16 - new Date().getHours() }).toISOString(),
      local: "Online (Google Meet)",
      status: "cancelado",
      notas: "Cancelado a pedido do paciente.",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dra. Elisa Martins",
      especialidade: "Psicanálise",
      dataISO: add({ days: 7, hours: 11 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 3",
      status: "confirmado",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dr. Felipe Souza",
      especialidade: "Neuropsicologia",
      dataISO: add({ days: 14, hours: 15 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 4",
      status: "pendente",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dra. Gabriela Mota",
      especialidade: "Terapia Cognitivo-Comportamental",
      dataISO: add({ days: -10, hours: 10 - new Date().getHours() }).toISOString(),
      local: "Clínica Resilience - Sala 2",
      status: "concluido",
      notas: "Paciente respondeu bem ao protocolo inicial.",
    },
    {
      id: uid(),
      usuarioId: userId,
      profissionalNome: "Dr. Henrique Prado",
      especialidade: "Psicologia do Esporte",
      dataISO: add({ days: 2, hours: 18 - new Date().getHours() }).toISOString(),
      local: "Online (Google Meet)",
      status: "confirmado",
    },
  ]

  // ordenar por data (próximos primeiro)
  return base.sort((a, b) => +new Date(a.dataISO) - +new Date(b.dataISO))
}
