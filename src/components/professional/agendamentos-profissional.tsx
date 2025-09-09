"use client";

import React, { useMemo, useState, useEffect } from "react";
import { StatusAgendamento, type UiAgendamento } from "@/types/agendamento";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";

type Props = {
  profissionalId: string;
  initialAgendamentos?: UiAgendamento[];
};

type StatusFiltro = "todos" | StatusAgendamento;

const statusOptions: { label: string; value: StatusFiltro }[] = [
  { label: "Todos", value: "todos" },
  { label: "Confirmados", value: "confirmado" },
  { label: "Pendentes", value: "pendente" },
  { label: "Cancelados", value: "cancelado" },
  { label: "Concluídos", value: "concluido" },
];

// Interface para representar um agendamento com dados do paciente
interface AgendamentoPaciente {
  id: string;
  usuarioId: string;
  profissionalId: string;
  profissionalNome: string;
  especialidade?: string;
  dataISO: string;
  local: string;
  status: StatusAgendamento;
  notas?: string;
  modalidade?: string;
  pacienteNome: string;
  pacienteEmail?: string;
  pacienteTelefone?: string;
}

// Interface para slots disponíveis
interface SlotDisponivel {
  data: string;
  horario: string;
  disponivel: boolean;
}

function formatarDataHora(iso: string) {
  // Verificar se a string ISO é válida
  if (!iso || iso.trim() === '') {
    return 'Data não informada';
  }
  
  const d = new Date(iso);
  
  // Verificar se a data é válida
  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }
  
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo"
  });
}

export default function AgendamentosProfissional({
  profissionalId,
  initialAgendamentos,
}: Props) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [reagendamentoModal, setReagendamentoModal] = useState<{
    isOpen: boolean;
    agendamento: AgendamentoPaciente | null;
  }>({
    isOpen: false,
    agendamento: null,
  });
  const [cancelamentoModal, setCancelamentoModal] = useState<{
    isOpen: boolean;
    agendamentoId: string | null;
  }>({
    isOpen: false,
    agendamentoId: null,
  });
  const [justificativaCancelamento, setJustificativaCancelamento] = useState("");
  const [loadingCancelamento, setLoadingCancelamento] = useState(false);
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<SlotDisponivel[]>([]);
  const [dataEscolhida, setDataEscolhida] = useState("");
  const [horarioEscolhido, setHorarioEscolhido] = useState("");

  const agora = Date.now();

  // Carregar agendamentos do profissional
  useEffect(() => {
    async function fetchAgendamentos() {
      setLoading(true);
      try {
        const response = await fetch('/api/agendamentos');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Mapear corretamente os campos de data e paciente
            const agendamentosFormatados = result.data.map((ag: Record<string, any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              // Extrair nome do paciente corretamente
              let pacienteNome = 'Paciente não identificado';
              if (ag.pacienteNome) {
                pacienteNome = ag.pacienteNome;
              } else if (ag.paciente && ag.paciente.nome) {
                pacienteNome = ag.paciente.nome;
              } else if (ag.usuario && ag.usuario.nome) {
                pacienteNome = ag.usuario.nome;
              }
              
              // Extrair data corretamente
              let dataISO = '';
              if (ag.dataISO) {
                dataISO = ag.dataISO;
              } else if (ag.data_consulta) {
                dataISO = ag.data_consulta;
              } else if (ag.data_hora_inicio) {
                dataISO = ag.data_hora_inicio;
              }
              
              const agendamentoFormatado = {
                id: ag.id,
                usuarioId: ag.usuarioId || ag.paciente_id,
                profissionalId: ag.profissionalId || ag.profissional_id,
                profissionalNome: ag.profissionalNome || ag.profissional?.nome || 'Profissional',
                especialidade: ag.especialidade || ag.profissional?.especialidade || '',
                dataISO: dataISO,
                local: ag.local || 'Clínica Resilience',
                status: ag.status,
                notas: ag.notas,
                modalidade: ag.modalidade,
                pacienteNome: pacienteNome,
                pacienteEmail: ag.pacienteEmail || ag.paciente?.email || ag.usuario?.email || '',
                pacienteTelefone: ag.pacienteTelefone || ag.paciente?.telefone || ag.usuario?.telefone || ''
              };
              
              return agendamentoFormatado;
            });
            setAgendamentos(agendamentosFormatados);
          }
        } else {
          console.error("Erro ao carregar agendamentos:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAgendamentos();
  }, [profissionalId]);

  const listagem = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    const byTerm = (a: AgendamentoPaciente) =>
      a.pacienteNome.toLowerCase().includes(buscaLower) ||
      (a.especialidade ?? "").toLowerCase().includes(buscaLower) ||
      a.local.toLowerCase().includes(buscaLower);

    const byStatus =
      statusFiltro === "todos"
        ? () => true
        : (a: AgendamentoPaciente) => a.status === statusFiltro;

    const sorted = [...agendamentos].sort(
      (a, b) => +new Date(a.dataISO) - +new Date(b.dataISO)
    );

    return sorted.filter((a) => byTerm(a) && byStatus(a));
  }, [agendamentos, busca, statusFiltro]);

  function podeCancelar(a: AgendamentoPaciente) {
    const agendamentoDate = new Date(a.dataISO);
    const ehPassado = agendamentoDate.getTime() < agora;
    return a.status !== "cancelado" && a.status !== "concluido" && !ehPassado;
  }

  function podeReagendar(a: AgendamentoPaciente) {
    const agendamentoDate = new Date(a.dataISO);
    const ehPassado = agendamentoDate.getTime() < agora;
    return a.status !== "cancelado" && a.status !== "concluido" && !ehPassado;
  }

  function abrirModalCancelamento(id: string) {
    setCancelamentoModal({ isOpen: true, agendamentoId: id });
    setJustificativaCancelamento("");
  }

  function fecharModalCancelamento() {
    setCancelamentoModal({ isOpen: false, agendamentoId: null });
    setJustificativaCancelamento("");
    setLoadingCancelamento(false);
  }

  async function abrirModalReagendamento(agendamento: AgendamentoPaciente) {
    setReagendamentoModal({ isOpen: true, agendamento });
    setDataEscolhida("");
    setHorarioEscolhido("");
    
    // Carregar slots disponíveis do profissional
    try {
      const response = await fetch(`/api/agenda-slots/${profissionalId}`);
      if (response.ok) {
        const slots = await response.json();
        setSlotsDisponiveis(slots as SlotDisponivel[]);
      }
    } catch (error) {
      console.error("Erro ao carregar slots:", error);
    }
  }

  function fecharModalReagendamento() {
    setReagendamentoModal({ isOpen: false, agendamento: null });
    setDataEscolhida("");
    setHorarioEscolhido("");
    setSlotsDisponiveis([]);
  }

  async function confirmarCancelamento() {
    if (!cancelamentoModal.agendamentoId || !justificativaCancelamento.trim()) {
      return;
    }

    setLoadingCancelamento(true);

    try {
      const res = await fetch(
        `/api/agendamentos/${cancelamentoModal.agendamentoId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            justificativa: justificativaCancelamento,
          }),
        }
      );
      
      if (!res.ok) {
        console.error("Falha ao cancelar:", await res.text().catch(() => ""));
        return;
      }

      // Atualização local
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === cancelamentoModal.agendamentoId
            ? {
                ...a,
                status: "cancelado" as StatusAgendamento,
                notas: a.notas
                  ? `${a.notas} | Cancelado pelo profissional. Motivo: ${justificativaCancelamento}`
                  : `Cancelado pelo profissional. Motivo: ${justificativaCancelamento}`,
              }
            : a
        )
      );

      fecharModalCancelamento();
    } catch (e) {
      console.error("Erro ao cancelar:", e);
      setLoadingCancelamento(false);
    }
  }

  async function confirmarReagendamento() {
    if (!reagendamentoModal.agendamento || !dataEscolhida || !horarioEscolhido) {
      return;
    }

    try {
      const novaDataHora = new Date(`${dataEscolhida}T${horarioEscolhido}`);
      
      const res = await fetch(
        `/api/agendamentos/${reagendamentoModal.agendamento.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data_consulta: novaDataHora.toISOString(),
            notas: `Reagendado pelo profissional para ${formatarDataHora(novaDataHora.toISOString())}`,
          }),
        }
      );
      
      if (!res.ok) {
        console.error("Falha ao reagendar:", await res.text().catch(() => ""));
        return;
      }

      // Atualizar local
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === reagendamentoModal.agendamento!.id
            ? {
                ...a,
                dataISO: novaDataHora.toISOString(),
                notas: `Reagendado pelo profissional para ${formatarDataHora(novaDataHora.toISOString())}`,
              }
            : a
        )
      );

      fecharModalReagendamento();
    } catch (e) {
      console.error("Erro ao reagendar:", e);
    }
  }

  // Gerar opções de horários disponíveis para a data escolhida
  const horariosDisponiveis = useMemo(() => {
    if (!dataEscolhida || !slotsDisponiveis.length) return [];
    
    return slotsDisponiveis
      .filter((slot: SlotDisponivel) => slot.data === dataEscolhida && slot.disponivel)
      .map((slot: SlotDisponivel) => ({
        valor: slot.horario,
        label: slot.horario
      }));
  }, [dataEscolhida, slotsDisponiveis]);

  if (loading) return <p>Carregando agendamentos...</p>;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Meus Agendamentos</CardTitle>
            <CardDescription>
              Acompanhe seus agendamentos, visualize detalhes dos pacientes, cancele ou
              reagende conforme necessário.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="grid gap-1">
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Paciente, especialidade ou local"
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
                Não há agendamentos que correspondam aos filtros.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {listagem.map((a) => {
          const data = new Date(a.dataISO);
          const ehPassado = data.getTime() < agora;
          return (
            <Card key={a.id} className="border-muted">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {a.pacienteNome}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {a.especialidade
                      ? `${a.especialidade} • ${a.local}`
                      : a.local}
                  </CardDescription>
                  {a.pacienteEmail && (
                    <CardDescription className="text-xs">
                      {a.pacienteEmail}
                    </CardDescription>
                  )}
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
                  <span className="font-medium">
                    {formatarDataHora(a.dataISO)}
                  </span>
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
                        Informações completas do paciente e atendimento.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Paciente:{" "}
                        </span>
                        <span className="font-medium">
                          {a.pacienteNome}
                        </span>
                      </div>
                      {a.pacienteEmail && (
                        <div>
                          <span className="text-muted-foreground">
                            Email:{" "}
                          </span>
                          <span>{a.pacienteEmail}</span>
                        </div>
                      )}
                      {a.especialidade ? (
                        <div>
                          <span className="text-muted-foreground">
                            Especialidade:{" "}
                          </span>
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
                  </DialogContent>
                </Dialog>

                <Button
                  variant="secondary"
                  onClick={() => abrirModalReagendamento(a)}
                  disabled={!podeReagendar(a)}
                  title={
                    !podeReagendar(a)
                      ? "Não é possível reagendar (expirado, concluído ou já cancelado)"
                      : "Reagendar este agendamento"
                  }
                >
                  Reagendar
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
          );
        })}
      </div>

      {/* Modal de Reagendamento */}
      <Dialog
        open={reagendamentoModal.isOpen}
        onOpenChange={fecharModalReagendamento}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para o paciente{" "}
              <strong>{reagendamentoModal.agendamento?.pacienteNome}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nova-data">Nova Data</Label>
              <Input
                id="nova-data"
                type="date"
                value={dataEscolhida}
                onChange={(e) => setDataEscolhida(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {dataEscolhida && horariosDisponiveis.length > 0 && (
              <div>
                <Label htmlFor="novo-horario">Novo Horário</Label>
                <Select value={horarioEscolhido} onValueChange={setHorarioEscolhido}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponiveis.map((horario) => (
                      <SelectItem key={horario.valor} value={horario.valor}>
                        {horario.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dataEscolhida && horariosDisponiveis.length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                Não há horários disponíveis para esta data.
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={fecharModalReagendamento}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarReagendamento}
              disabled={!dataEscolhida || !horarioEscolhido}
            >
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog
        open={cancelamentoModal.isOpen}
        onOpenChange={fecharModalCancelamento}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Para cancelar este agendamento, é necessário informar o motivo do
              cancelamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa">Motivo do cancelamento *</Label>
              <Textarea
                id="justificativa"
                placeholder="Ex: Emergência, reagendamento solicitado pelo paciente, etc."
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

          <DialogFooter className="flex gap-2">
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
              disabled={
                !justificativaCancelamento.trim() || loadingCancelamento
              }
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
