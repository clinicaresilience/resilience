import { cookies } from "next/headers"

type SupabaseLikeUser = {
  id: string
  email: string
  app_metadata?: {
    role?: string
  }
  user_metadata?: {
    nome?: string
    tipo_usuario?: string
  }
}

type AuthResult =
  | { data: { user: SupabaseLikeUser | null }, error: null }
  | { data: { user: null }, error: { message: string } }

const COOKIE_NAME = "mock_session"

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
      select: (_cols?: string) => ({
        eq: (col: string, value: string) => ({
          single: async (): Promise<{ data: any; error: any }> => {
            if (table === "usuarios" && col === "id") {
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
            }
            return { data: null, error: { message: "Tabela não suportada no mock" } }
          },
        }),
      }),
    }),
  }
}
