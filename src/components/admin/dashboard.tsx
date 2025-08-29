"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMockAgendamentos, type Agendamento } from "@/lib/mocks/agendamentos"

type ProfissionalStats = {
  nome: string
  total: number
  confirmadas: number
  pendentes: number
  canceladas: number
  concluidas: number
  proximas: number
}

type ProfissionalCadastro = {
  id: string
  nome: string
  email: string
  especialidade: string
  createdAt?: string
}

function agruparPorProfissional(agendamentos: Agendamento[]): Record<string, ProfissionalStats> {
  const now = Date.now()
  return agendamentos.reduce<Record<string, ProfissionalStats>>((acc, ag) => {
    const nome = ag.profissionalNome
    if (!acc[nome]) {
      acc[nome] = {
        nome,
        total: 0,
        confirmadas: 0,
        pendentes: 0,
        canceladas: 0,
        concluidas: 0,
        proximas: 0,
      }
    }
    const s = acc[nome]
    s.total += 1
    if (ag.status === "confirmado") s.confirmadas += 1
    if (ag.status === "pendente") s.pendentes += 1
    if (ag.status === "cancelado") s.canceladas += 1
    if (ag.status === "concluido") s.concluidas += 1
    if (new Date(ag.dataISO).getTime() > now && (ag.status === "confirmado" || ag.status === "pendente")) {
      s.proximas += 1
    }
    return acc
  }, {})
}

function carregarProfissionaisCadastro(): ProfissionalCadastro[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem("mock_profissionais")
    if (!raw) return []
    const parsed = JSON.parse(raw) as ProfissionalCadastro[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function AdminDashboard() {
  const [cadastros, setCadastros] = useState<ProfissionalCadastro[]>([])

  // Agendamentos mock (fonte base para estatísticas)
  const agendamentos = useMemo(() => generateMockAgendamentos(), [])
  const agrupado = useMemo(() => agruparPorProfissional(agendamentos), [agendamentos])

  // Mescla profissionais cadastrados (localStorage) para garantir exibição mesmo sem agendamentos
  const statsCompletas: ProfissionalStats[] = useMemo(() => {
    const base = { ...agrupado }
    for (const p of cadastros) {
      if (!base[p.nome]) {
        base[p.nome] = {
          nome: p.nome,
          total: 0,
          confirmadas: 0,
          pendentes: 0,
          canceladas: 0,
          concluidas: 0,
          proximas: 0,
        }
      }
    }
    return Object.values(base).sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
  }, [agrupado, cadastros])

  // Totais gerais
  const totais = useMemo(() => {
    return statsCompletas.reduce(
      (acc, s) => {
        acc.profissionais += 1
        acc.total += s.total
        acc.confirmadas += s.confirmadas
        acc.pendentes += s.pendentes
        acc.canceladas += s.canceladas
        acc.concluidas += s.concluidas
        acc.proximas += s.proximas
        return acc
      },
      { profissionais: 0, total: 0, confirmadas: 0, pendentes: 0, canceladas: 0, concluidas: 0, proximas: 0 }
    )
  }, [statsCompletas])

  useEffect(() => {
    setCadastros(carregarProfissionaisCadastro())
    const handler = () => setCadastros(carregarProfissionaisCadastro())
    window.addEventListener("profissionais-updated", handler as EventListener)
    return () => window.removeEventListener("profissionais-updated", handler as EventListener)
  }, [])

  return (
    <div className="w-full">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-azul-escuro">{totais.profissionais}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total de consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-azul-escuro">{totais.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totais.confirmadas}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{totais.pendentes}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{totais.canceladas}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">{totais.concluidas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Por profissional */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {statsCompletas.map((p) => (
          <Card key={p.nome} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{p.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-gray-500">Total</p>
                  <p className="text-xl font-semibold text-azul-escuro">{p.total}</p>
                </div>
                <div className="rounded-md bg-green-50 p-3">
                  <p className="text-gray-600">Confirmadas</p>
                  <p className="text-xl font-semibold text-green-700">{p.confirmadas}</p>
                </div>
                <div className="rounded-md bg-amber-50 p-3">
                  <p className="text-gray-600">Pendentes</p>
                  <p className="text-xl font-semibold text-amber-700">{p.pendentes}</p>
                </div>
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-gray-600">Canceladas</p>
                  <p className="text-xl font-semibold text-red-700">{p.canceladas}</p>
                </div>
                <div className="rounded-md bg-indigo-50 p-3">
                  <p className="text-gray-600">Concluídas</p>
                  <p className="text-xl font-semibold text-indigo-700">{p.concluidas}</p>
                </div>
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-gray-600">Próximas</p>
                  <p className="text-xl font-semibold text-blue-700">{p.proximas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
