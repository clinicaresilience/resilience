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
    mustChangePassword?: boolean
    active?: boolean
  }
}

type AuthResult =
  | { data: { user: SupabaseLikeUser | null }, error: null }
  | { data: { user: null }, error: { message: string } }

const COOKIE_NAME = "mock_session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7d

function toSupabaseUser(u: { id: string, email: string, nome: string, tipo_usuario: string, mustChangePassword?: boolean, active?: boolean }): SupabaseLikeUser {
  return {
    id: u.id,
    email: u.email,
    app_metadata: { role: u.tipo_usuario },
    user_metadata: {
      nome: u.nome,
      tipo_usuario: u.tipo_usuario,
      mustChangePassword: u.mustChangePassword ?? false,
      active: u.active ?? true,
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

// Admin-managed users (mock, persisted in localStorage)
type AdminUser = {
  id: string
  email: string
  senha: string
  tipo_usuario: string
  nome: string
  area?: string
  especialidade?: string
  active?: boolean
  mustChangePassword?: boolean
}

const ADMIN_USERS_LS_KEY = "mock_users_admin"

function readAdminUsers(): AdminUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ADMIN_USERS_LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AdminUser[]) : []
  } catch {
    return []
  }
}

function writeAdminUsers(users: AdminUser[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ADMIN_USERS_LS_KEY, JSON.stringify(users))
  } catch {}
}

function findAnyByEmailAll(email: string): { source: "static" | "admin"; user: any } | null {
  const lower = email.toLowerCase()
  const staticUser = findByEmail(email)
  if (staticUser) return { source: "static", user: staticUser }
  const adminUser = readAdminUsers().find((u) => u.email.toLowerCase() === lower)
  return adminUser ? { source: "admin", user: adminUser } : null
}

function updateAdminUserPassword(id: string, newPassword: string) {
  const list = readAdminUsers()
  const idx = list.findIndex((u) => u.id === id)
  if (idx >= 0) {
    list[idx].senha = newPassword
    list[idx].mustChangePassword = false
    writeAdminUsers(list)
  }
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
        const any = findAnyByEmailAll(email)
        if (!any) {
          return { data: { user: null }, error: { message: "Credenciais inválidas" } }
        }
        const src = any.source
        const u = any.user
        // Validate password and access
        if (!u?.senha || u.senha !== password) {
          return { data: { user: null }, error: { message: "Credenciais inválidas" } }
        }
        if (src === "admin" && u.active === false) {
          return { data: { user: null }, error: { message: "Acesso desativado pelo administrador" } }
        }
        // Map to cookie user
        const user = toSupabaseUser({
          id: u.id,
          email: u.email,
          nome: u.nome,
          tipo_usuario: u.tipo_usuario,
          mustChangePassword: src === "admin" ? (u.mustChangePassword ?? true) : false,
          active: src === "admin" ? (u.active ?? true) : true,
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

      // Minimal updateUser to support password change + clear mustChangePassword
      updateUser: async (payload: { password?: string }): Promise<{ data: any; error: any }> => {
        const current = readCookie()
        if (!current) {
          return { data: null, error: { message: "Não autenticado" } }
        }
        if (!payload?.password || typeof payload.password !== "string" || payload.password.length < 4) {
          return { data: null, error: { message: "Senha inválida" } }
        }
        // Try update admin-managed user by id
        const listRaw = typeof window !== "undefined" ? window.localStorage.getItem("mock_users_admin") : null
        if (listRaw) {
          try {
            const list = JSON.parse(listRaw) as any[]
            const idx = Array.isArray(list) ? list.findIndex((u) => u.id === current.id) : -1
            if (idx >= 0) {
              list[idx].senha = payload.password
              list[idx].mustChangePassword = false
              window.localStorage.setItem("mock_users_admin", JSON.stringify(list))
              // Update cookie flags
              const updated: SupabaseLikeUser = {
                ...current,
                user_metadata: {
                  ...current.user_metadata,
                  mustChangePassword: false,
                },
              }
              writeCookie(updated)
              return { data: { user: updated }, error: null }
            }
          } catch {
            // fallthrough
          }
        }
        // If not found in admin list, just succeed (static users)
        const updated: SupabaseLikeUser = {
          ...current,
          user_metadata: {
            ...current.user_metadata,
            mustChangePassword: false,
          },
        }
        writeCookie(updated)
        return { data: { user: updated }, error: null }
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
