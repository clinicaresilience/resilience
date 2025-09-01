"use client"

import { MOCK_USERS, findByEmail } from "./mocks/users"

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
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7d

function toSupabaseUser(u: { id: string, email: string, nome: string, tipo_usuario: string }): SupabaseLikeUser {
  return {
    id: u.id,
    email: u.email,
    app_metadata: { role: u.tipo_usuario },
    user_metadata: {
      nome: u.nome,
      tipo_usuario: u.tipo_usuario,
    },
  }
}

function readCookie(): SupabaseLikeUser | null {
  if (typeof document === "undefined") return null
  const cookies = document.cookie?.split(";").map(c => c.trim()) ?? []
  const entry = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`))
  if (!entry) return null
  try {
    const raw = decodeURIComponent(entry.split("=")[1])
    const parsed = JSON.parse(raw) as SupabaseLikeUser
    return parsed ?? null
  } catch {
    return null
  }
}

function writeCookie(user: SupabaseLikeUser | null) {
  if (typeof document === "undefined") return
  if (!user) {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
    try { localStorage.removeItem(COOKIE_NAME) } catch {}
    return
  }
  const value = encodeURIComponent(JSON.stringify(user))
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
  try { localStorage.setItem(COOKIE_NAME, JSON.stringify(user)) } catch {}
}

export function createMockClient() {
  return {
    auth: {
      signInWithPassword: async ({
        email,
        password,
      }: {
        email: string
        password: string
      }): Promise<AuthResult> => {
        const found = findByEmail(email)
        if (!found || found.senha !== password) {
          return { data: { user: null }, error: { message: "Credenciais inválidas" } }
        }
        const user = toSupabaseUser({
          id: found.id,
          email: found.email,
          nome: found.nome,
          tipo_usuario: found.tipo_usuario,
        })
        writeCookie(user)
        return { data: { user }, error: null }
      },

      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: any
      }): Promise<{ data?: any; error?: any }> => {
        // Simula criação de conta - em um sistema real, salvaria no banco
        // Por enquanto, apenas simula sucesso
        console.log("Mock signUp:", { email, password, options })
        
        // Simula um pequeno delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return { data: { user: null }, error: null }
      },

      getUser: async (): Promise<AuthResult> => {
        const user = readCookie()
        if (!user) return { data: { user: null }, error: null }
        return { data: { user }, error: null }
      },

      signOut: async (): Promise<{ error: null }> => {
        writeCookie(null)
        return { error: null }
      },
    },

    from: (table: string) => ({
      select: (_cols?: string) => ({
        eq: (col: string, value: string) => ({
          single: async (): Promise<{ data: any; error: any }> => {
            // Implementa somente o mínimo necessário para o projeto
            if (table === "usuarios" && col === "id") {
              const user = readCookie()
              if (!user || user.id !== value) {
                return { data: null, error: { message: "Not found" } }
              }
              // Retorna apenas os campos esperados nos usos atuais
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
