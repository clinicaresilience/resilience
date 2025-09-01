import { cookies } from "next/headers"
import type { DbAgendamento } from "@/types/agendamento"

type SupabaseLikeUser = {
  id: string
  email: string
  app_metadata?: {
    role?: string
  }
  user_metadata?: {
    nome?: string
    tipo_usuario?: string
    mustChangePassword?: boolean
    active?: boolean
  }
}

type AuthResult =
  | { data: { user: SupabaseLikeUser | null }, error: null }
  | { data: { user: null }, error: { message: string } }

const COOKIE_NAME = "mock_session"

const MEM = {
  agendamentos: [] as DbAgendamento[],
}

function uid(prefix = "ag"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

async function readCookie(): Promise<SupabaseLikeUser | null> {
  // Server-side read from cookie store
  const store = await cookies()
  const entry = store.get(COOKIE_NAME)
  if (!entry?.value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(entry.value)) as SupabaseLikeUser
    return parsed ?? null
  } catch {
    return null
  }
}

export function createMockServerClient() {
  return {
    auth: {
      getUser: async (): Promise<AuthResult> => {
        const user = await readCookie()
        if (!user) return { data: { user: null }, error: null }
        return { data: { user }, error: null }
      },
    },

    from: (table: string) => ({
      // Minimal emulation to satisfy typed calls in routes
      select: (_cols?: string) => {
        // usuarios: only supports eq(...).single()
        if (table === "usuarios") {
          return {
            eq: (col: string, value: string) => ({
              single: async (): Promise<{ data: any; error: any }> => {
                if (col !== "id") {
                  return { data: null, error: { message: "Filtro não suportado" } }
                }
                const user = await readCookie()
                if (!user || user.id !== value) {
                  return { data: null, error: { message: "Not found" } }
                }
                return {
                  data: {
                    tipo_usuario: user.user_metadata?.tipo_usuario ?? user.app_metadata?.role ?? "usuario",
                    nome: user.user_metadata?.nome ?? "Usuário",
                  },
                  error: null,
                }
              },
            }),
          } as any
        }

        // agendamentos: supports eq(...): Promise<{ data, error }>
        if (table === "agendamentos") {
          return {
            eq: async (col: string, value: string) => {
              if (col === "paciente_id") {
                const data = MEM.agendamentos.filter(a => a.paciente_id === value)
                return { data, error: null }
              }
              return { data: [] as DbAgendamento[], error: null }
            },
          } as any
        }

        // default unsupported
        return {
          eq: async () => ({ data: null, error: { message: "Tabela não suportada no mock" } }),
        } as any
      },

      // insert([row]).select("*").single()
      insert: (rows: any[]) => ({
        select: (_cols?: string) => ({
          single: async (): Promise<{ data: any; error: any }> => {
            if (table === "agendamentos") {
              const row = rows?.[0] ?? {}
              const inserted: DbAgendamento = {
                id: uid(),
                paciente_id: row.paciente_id,
                profissional_id: row.profissional_id,
                data: row.data,
                hora: row.hora,
                status: row.status ?? null,
                notas: row.notas ?? null,
              }
              MEM.agendamentos.push(inserted)
              return { data: inserted, error: null }
            }
            return { data: null, error: { message: "Tabela não suportada no mock" } }
          },
        }),
      }),
    }),
  }
}
