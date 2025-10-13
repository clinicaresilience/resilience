// Tipos compartilhados entre Frontend e Backend para Agendamentos

export type StatusAgendamento =
  | "confirmado"
  | "pendente"
  | "cancelado"
  | "concluido"

// Forma consumida pela UI
export type UiAgendamento = {
  id: string
  usuarioId: string
  profissionalId: string
  profissionalNome: string
  especialidade?: string
  dataISO: string // Data e hora combinadas em ISO
  local: string
  status: StatusAgendamento
  notas?: string
  numero_reagendamentos?: number
  historico_reagendamentos?: Array<{
    data_anterior: string
    data_nova: string
    reagendado_em: string
    motivo?: string
  }>
  tipo_paciente?: 'fisica' | 'juridica'
  codigo_empresa?: string
  empresa?: {
    nome: string
    codigo: string
    endereco_logradouro?: string
    endereco_numero?: string
    endereco_complemento?: string
    endereco_bairro?: string
    endereco_cidade?: string
    endereco_estado?: string
    endereco_cep?: string
  }
}

// Forma básica do registro no banco (tabela: agendamentos)
export type DbAgendamento = {
  id: string
  paciente_id: string
  profissional_id: string
  data: string // "YYYY-MM-DD"
  hora: string // "HH:mm"
  status?: StatusAgendamento | null
  notas?: string | null
}

// Utilitário para compor ISO a partir de data e hora (assumindo timezone local do servidor)
export function composeISODateTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const [hour, minute] = timeStr.split(":").map(Number)
  const d = new Date(year, (month ?? 1) - 1, day, hour ?? 0, minute ?? 0, 0, 0)
  return d.toISOString()
}

// Deriva o status quando não existe coluna/valor no banco
export function deriveStatus(dateISO: string): StatusAgendamento {
  const when = new Date(dateISO).getTime()
  const now = Date.now()
  return when < now ? "concluido" : "confirmado"
}

// Mapeia um registro do banco para a forma de UI
export function mapDbToUi(row: DbAgendamento): UiAgendamento {
  const dataISO = composeISODateTime(row.data, row.hora)
  return {
    id: row.id,
    usuarioId: row.paciente_id,
    profissionalId: row.profissional_id,
    // Fallbacks até termos join com tabela de profissionais
    profissionalNome: `Profissional ${row.profissional_id}`,
    especialidade: undefined,
    dataISO,
    local: "Clínica Resilience",
    status: row.status ?? deriveStatus(dataISO),
    notas: row.notas ?? undefined,
  }
}
