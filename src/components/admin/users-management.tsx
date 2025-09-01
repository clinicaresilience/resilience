"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AdminUser = {
  id: string
  nome: string
  email: string
  area?: string
  especialidade?: string
  senha: string
  tipo_usuario: "administrador" | "profissional" | "usuario"
  active: boolean
  mustChangePassword: boolean
  createdAt: string
}

const LS_KEY = "mock_users_admin"

function uid(prefix = "usr"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

function readUsers(): AdminUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AdminUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(list: AdminUser[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {}
}

function genPassword(): string {
  // simples e legível para demonstração
  const part = Math.random().toString(36).slice(-6)
  const num = Math.floor(100 + Math.random() * 900).toString()
  return `${part}${num}`
}

export function UsersManagement() {
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  // form
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [area, setArea] = useState("")
  const [especialidade, setEspecialidade] = useState("")
  const [senhaGerada, setSenhaGerada] = useState<string>(genPassword())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setItems(readUsers())
    setLoading(false)
  }, [])

  function refresh() {
    setItems(readUsers())
  }

  const totalAtivos = useMemo(() => items.filter(i => i.active).length, [items])

  function resetForm() {
    setNome("")
    setEmail("")
    setArea("")
    setEspecialidade("")
    setSenhaGerada(genPassword())
    setError(null)
    setSuccess(null)
  }

  function onGeneratePassword() {
    setSenhaGerada(genPassword())
  }

  function validateEmail(e: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(e)
  }

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!nome.trim() || !email.trim() || !senhaGerada.trim()) {
      setError("Preencha ao menos Nome, E-mail e gere uma senha.")
      return
    }
    if (!validateEmail(email)) {
      setError("E-mail inválido.")
      return
    }
    // Evitar duplicidade por e-mail
    const current = readUsers()
    if (current.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("Já existe um usuário com este e-mail.")
      return
    }

    const novo: AdminUser = {
      id: uid(),
      nome,
      email,
      area: area || undefined,
      especialidade: especialidade || undefined,
      senha: senhaGerada,
      tipo_usuario: "profissional", // criação de profissionais pelo admin
      active: true,
      mustChangePassword: true, // obriga troca de senha no primeiro acesso
      createdAt: new Date().toISOString(),
    }

    current.push(novo)
    writeUsers(current)
    setItems(current)
    setSuccess(`Usuário criado com sucesso! Senha temporária: ${senhaGerada}`)
    // notificar (se necessário)
    try { window.dispatchEvent(new CustomEvent("admin-users-updated")) } catch {}

    // manter senha visível após criação para copiar, mas limpar demais campos
    setNome("")
    setEmail("")
    setArea("")
    setEspecialidade("")
  }

  function onToggleActive(id: string) {
    const list = readUsers()
    const idx = list.findIndex(u => u.id === id)
    if (idx === -1) return
    list[idx].active = !list[idx].active
    writeUsers(list)
    setItems(list)
  }

  function onResetPassword(id: string) {
    const nova = genPassword()
    const list = readUsers()
    const idx = list.findIndex(u => u.id === id)
    if (idx === -1) return
    list[idx].senha = nova
    list[idx].mustChangePassword = true
    writeUsers(list)
    setItems(list)
    setSuccess(`Senha redefinida. Nova senha temporária: ${nova}`)
  }

  return (
    <div className="w-full space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Criar usuário (Profissional)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area">Área</Label>
              <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex.: Saúde Mental" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="esp">Especialização</Label>
              <Input id="esp" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} placeholder="Ex.: Psicologia Clínica" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Senha gerada automaticamente</Label>
              <div className="flex gap-2">
                <Input value={senhaGerada} readOnly />
                <Button type="button" onClick={onGeneratePassword}>Gerar outra</Button>
              </div>
              <p className="text-xs text-gray-500">A senha deve ser alterada no primeiro acesso.</p>
            </div>

            {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
            {success && <p className="md:col-span-2 text-sm text-green-600">{success}</p>}

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" className="text-white bg-azul-escuro">Criar usuário</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Limpar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Usuários gerenciados ({items.length}) — Ativos: {totalAtivos}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-gray-500">Carregando...</p>}
          {!loading && items.length === 0 && <p className="text-gray-500">Nenhum usuário criado ainda.</p>}
          {!loading && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">E-mail</th>
                    <th className="py-2 pr-3">Área/Especialidade</th>
                    <th className="py-2 pr-3">Acesso</th>
                    <th className="py-2 pr-3">Primeiro acesso</th>
                    <th className="py-2 pr-3">Criado em</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(u => (
                    <tr key={u.id}>
                      <td className="py-2 pr-3">{u.nome}</td>
                      <td className="py-2 pr-3">{u.email}</td>
                      <td className="py-2 pr-3">{[u.area, u.especialidade].filter(Boolean).join(" / ") || "-"}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                          {u.active ? "Ativo" : "Desativado"}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {u.mustChangePassword ? (
                          <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">Exigir troca</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">OK</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">{new Date(u.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-3 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onToggleActive(u.id)}>
                          {u.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onResetPassword(u.id)}>
                          Resetar senha
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Dica: após criar um usuário, informe a senha temporária ao profissional. Ele deverá alterá-la no primeiro login.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
