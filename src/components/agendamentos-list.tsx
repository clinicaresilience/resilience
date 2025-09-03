"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { StatusAgendamento, type UiAgendamento } from "@/types/agendamento"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  userId?: string
  initialAgendamentos?: UiAgendamento[]
}

type StatusFiltro = "todos" | StatusAgendamento

const statusOptions: { label: string; value: StatusFiltro }[] = [
  { label: "Todos", value: "todos" },
  { label: "Confirmados", value: "confirmado" },
  { label: "Pendentes", value: "pendente" },
  { label: "Cancelados", value: "cancelado" },
  { label: "Concluídos", value: "concluido" },
]

function formatarDataHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}


export default function AgendamentosList({ userId, initialAgendamentos }: Props) {
  const seed = useMemo<UiAgendamento[]>(() => {
    if (initialAgendamentos && initialAgendamentos.length) return initialAgendamentos
    return generateMockAgendamentos(userId).map((m) => ({
      id: m.id,
      usuarioId: m.usuarioId ?? (userId ?? "mock"),
      profissionalId: "mock",
      profissionalNome: m.profissionalNome,
      especialidade: m.especialidade,
      dataISO: m.dataISO,
      local: m.local,
      status: m.status,
      notas: m.notas,
    }))
  }, [initialAgendamentos, userId])
  const [agendamentos, setAgendamentos] = useState<UiAgendamento[]>(seed)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos")
  const [cancelamentoModal, setCancelamentoModal] = useState<{ isOpen: boolean; agendamentoId: string | null }>({
    isOpen: false,
    agendamentoId: null
  })
  const [justificativaCancelamento, setJustificativaCancelamento] = useState("")
  const [loadingCancelamento, setLoadingCancelamento] = useState(false)

  const agora = Date.now()

  const listagem = useMemo(() => {
    const buscaLower = busca.toLowerCase()
    const byTerm = (a: UiAgendamento) =>
      a.profissionalNome.toLowerCase().includes(buscaLower) ||
      (a.especialidade ?? "").toLowerCase().includes(buscaLower) ||
      a.local.toLowerCase().includes(buscaLower)

    const byStatus =
      statusFiltro === "todos"
        ? () => true
        : (a: UiAgendamento) => a.status === statusFiltro

    const sorted = [...agendamentos].sort(
      (a, b) => +new Date(a.dataISO) - +new Date(b.dataISO)
    )

    return sorted.filter((a) => byTerm(a) && byStatus(a))
  }, [agendamentos, busca, statusFiltro])

  function podeCancelar(a: UiAgendamento) {
    const ehPassado = +new Date(a.dataISO) < agora
    return a.status !== "cancelado" && a.status !== "concluido" && !ehPassado
  }

  function abrirModalCancelamento(id: string) {
    setCancelamentoModal({ isOpen: true, agendamentoId: id })
    setJustificativaCancelamento("")
  }

  function fecharModalCancelamento() {
    setCancelamentoModal({ isOpen: false, agendamentoId: null })
    setJustificativaCancelamento("")
    setLoadingCancelamento(false)
  }

  async function confirmarCancelamento() {
    if (!cancelamentoModal.agendamentoId || !justificativaCancelamento.trim()) {
      return
    }

    setLoadingCancelamento(true)

    try {
      // Tenta cancelar via API quando a lista veio do backend
      if (initialAgendamentos && initialAgendamentos.length) {
        const res = await fetch(`/api/agendamentos/${cancelamentoModal.agendamentoId}`, { 
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ justificativa: justificativaCancelamento })
        })
        if (!res.ok) {
          console.error("Falha ao cancelar (API):", await res.text().catch(() => ""))
        }
      }

      // Atualização otimista/local
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === cancelamentoModal.agendamentoId
            ? {
                ...a,
                status: "cancelado",
                notas: a.notas
                  ? `${a.notas} | Cancelado pelo paciente. Motivo: ${justificativaCancelamento}`
                  : `Cancelado pelo paciente. Motivo: ${justificativaCancelamento}`,
              }
            : a
        )
      )

      fecharModalCancelamento()
    } catch (e) {
      console.error("Erro de rede ao cancelar (API):", e)
      setLoadingCancelamento(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Meus agendamentos</CardTitle>
            <CardDescription>
              Acompanhe seus agendamentos, visualize detalhes, cancele ou
              reagende conforme necessário.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="grid gap-1">
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Profissional, especialidade ou local"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="min-w-[240px]"
              />
            </div>

            <div className="grid gap-1">
              <Label>Status</Label>
              <Select
                value={statusFiltro}
                onValueChange={(v) => setStatusFiltro(v as StatusFiltro)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {listagem.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nenhum agendamento</CardTitle>
              <CardDescription>
                Tente mudar os filtros ou{" "}
                <Link
                  href="/portal-publico/profissionais"
                  className="underline text-primary"
                >
                  agende uma consulta
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {listagem.map((a) => {
          const data = new Date(a.dataISO)
          const ehPassado = +data < agora
          return (
            <Card key={a.id} className="border-muted">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {a.profissionalNome}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {a.especialidade ? `${a.especialidade} • ${a.local}` : a.local}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {ehPassado && (
                    <span className="text-xs text-muted-foreground">
                      Realizado/expirado
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="grid gap-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Data/Hora: </span>
                  <span className="font-medium">{formatarDataHora(a.dataISO)}</span>
                </div>
                {a.notas ? (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notas: </span>
                    <span>{a.notas}</span>
                  </div>
                ) : null}
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Detalhes</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detalhes do agendamento</DialogTitle>
                      <DialogDescription>
                        Informações completas do atendimento selecionado.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Profissional: </span>
                        <span className="font-medium">{a.profissionalNome}</span>
                      </div>
                      {a.especialidade ? (
                        <div>
                          <span className="text-muted-foreground">Especialidade: </span>
                          <span>{a.especialidade}</span>
                        </div>
                      ) : null}
                      <div>
                        <span className="text-muted-foreground">Local: </span>
                        <span>{a.local}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quando: </span>
                        <span>{formatarDataHora(a.dataISO)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status: </span>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.notas ? (
                        <div>
                          <span className="text-muted-foreground">Notas: </span>
                          <span>{a.notas}</span>
                        </div>
                      ) : null}
                    </div>

                    <DialogFooterUI className="pt-2">
                      <Button asChild variant="secondary">
                        <Link href="/portal-publico/profissionais">
                          Reagendar
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => abrirModalCancelamento(a.id)}
                        disabled={!podeCancelar(a)}
                        title={
                          !podeCancelar(a)
                            ? "Não é possível cancelar (expirado, concluído ou já cancelado)"
                            : "Cancelar este agendamento"
                        }
                      >
                        Cancelar
                      </Button>
                    </DialogFooterUI>
                  </DialogContent>
                </Dialog>

                <Button asChild variant="secondary">
                  <Link href="/portal-publico/profissionais">Reagendar</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => abrirModalCancelamento(a.id)}
                  disabled={!podeCancelar(a)}
                  title={
                    !podeCancelar(a)
                      ? "Não é possível cancelar (expirado, concluído ou já cancelado)"
                      : "Cancelar este agendamento"
                  }
                >
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Modal de Justificativa de Cancelamento */}
      <Dialog open={cancelamentoModal.isOpen} onOpenChange={fecharModalCancelamento}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Para cancelar este agendamento, é necessário informar o motivo do cancelamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa">Motivo do cancelamento *</Label>
              <Textarea
                id="justificativa"
                placeholder="Ex: Conflito de horário, problema de saúde, etc."
                value={justificativaCancelamento}
                onChange={(e) => setJustificativaCancelamento(e.target.value)}
                className="min-h-[100px] mt-2"
                disabled={loadingCancelamento}
              />
              {justificativaCancelamento.trim().length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  A justificativa é obrigatória para cancelar o agendamento.
                </p>
              )}
            </div>
          </div>

          <DialogFooterUI className="flex gap-2">
            <Button
              variant="outline"
              onClick={fecharModalCancelamento}
              disabled={loadingCancelamento}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarCancelamento}
              disabled={!justificativaCancelamento.trim() || loadingCancelamento}
            >
              {loadingCancelamento ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelando...
                </div>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>
    </div>
  )
}
