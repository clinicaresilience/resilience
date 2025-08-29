"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function CadastrarProfissionalDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [especialidade, setEspecialidade] = useState("")

  const resetForm = () => {
    setNome("")
    setEmail("")
    setEspecialidade("")
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validação mínima no client (mock)
    if (!nome.trim() || !email.trim() || !especialidade.trim()) {
      setError("Preencha todos os campos.")
      setLoading(false)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("E-mail inválido.")
      setLoading(false)
      return
    }

    // Simula operação de cadastro (mock)
    await new Promise((res) => setTimeout(res, 700))

    // Persistir no localStorage (mock)
    try {
      const novo = {
        id: `prof-${Date.now()}`,
        nome,
        email,
        especialidade,
        createdAt: new Date().toISOString(),
      }
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("mock_profissionais") : null
      const lista = raw ? JSON.parse(raw) as any[] : []
      lista.push(novo)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mock_profissionais", JSON.stringify(lista))
        // Notifica outros componentes para recarregar
        window.dispatchEvent(new CustomEvent("profissionais-updated"))
      }
    } catch {
      // Em caso de erro de armazenamento, mantém fluxo de mock
    }

    setSuccess("Profissional cadastrado com sucesso! (mock)")
    setLoading(false)

    // Fecha o modal após breve confirmação
    setTimeout(() => {
      setOpen(false)
      resetForm()
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button className="bg-azul-escuro text-white">
          Cadastrar profissional
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Cadastrar profissional</DialogTitle>
          <DialogDescription>
            Preencha os dados do profissional. Este cadastro é apenas para demonstração (mock).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profissional@exemplo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              placeholder="Ex.: Psicologia, Psiquiatria..."
              disabled={loading}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="text-white rounded px-4 py-2 bg-gradient-to-r from-azul-vivido via-roxo to-laranja bg-[length:200%_100%] bg-[position:0%_0%] transition-[background-position] duration-500 ease-in-out hover:bg-[position:100%_0%]"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
