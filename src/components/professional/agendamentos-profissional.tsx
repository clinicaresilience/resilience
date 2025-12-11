"use client";

import React, { useMemo, useState, useEffect } from "react";
import { StatusAgendamento, type UiAgendamento } from "@/types/agendamento";
import { StatusBadge } from "@/components/ui/status-badge";
import { TimezoneUtils } from "@/utils/timezone";
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
import { Calendar, Building2, Monitor } from "lucide-react";

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
  isPresential?: boolean; // Novo campo para identificar designações presenciais
  empresa?: {
    nome: string;
    codigo: string;
    endereco_logradouro?: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    endereco_cep?: string;
  };
}

// Interface para slots disponíveis
interface SlotDisponivel {
  data: string;
  horario: string;
  disponivel: boolean;
}

// Função para formatar endereço completo
function formatarEndereco(empresa?: AgendamentoPaciente['empresa']): string {
  if (!empresa) return '';
  
  const partes = [];
  
  if (empresa.endereco_logradouro) {
    let endereco = empresa.endereco_logradouro;
    if (empresa.endereco_numero) {
      endereco += `, ${empresa.endereco_numero}`;
    }
    if (empresa.endereco_complemento) {
      endereco += `, ${empresa.endereco_complemento}`;
    }
    partes.push(endereco);
  }
  
  if (empresa.endereco_bairro) {
    partes.push(empresa.endereco_bairro);
  }
  
  if (empresa.endereco_cidade && empresa.endereco_estado) {
    partes.push(`${empresa.endereco_cidade} - ${empresa.endereco_estado}`);
  }
  
  if (empresa.endereco_cep) {
    partes.push(`CEP: ${empresa.endereco_cep}`);
  }
  
  return partes.join(', ');
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

  // Carregar agendamentos e designações presenciais do profissional
  useEffect(() => {
    async function fetchAgendamentos() {
      setLoading(true);
      try {
        // Buscar agendamentos online
        const responseAgendamentos = await fetch('/api/agendamentos');
        let agendamentosOnline: AgendamentoPaciente[] = [];
        
        if (responseAgendamentos.ok) {
          const result = await responseAgendamentos.json();
          if (result.success && result.data) {
            // Mapear corretamente os campos de data e paciente
            agendamentosOnline = result.data.map((ag: Record<string, unknown>) => {
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
              
              return {
                id: ag.id,
                usuarioId: ag.usuarioId || ag.paciente_id,
                profissionalId: ag.profissionalId || ag.profissional_id,
                profissionalNome: ag.profissionalNome || ag.profissional?.nome || 'Profissional',
                especialidade: ag.especialidade || ag.profissional?.especialidade || '',
                dataISO: dataISO,
                local: ag.local || 'Clínica Resilience',
                status: ag.status,
                notas: ag.notas,
                modalidade: ag.modalidade || 'online',
                pacienteNome: pacienteNome,
                pacienteEmail: ag.pacienteEmail || ag.paciente?.email || ag.usuario?.email || '',
                pacienteTelefone: ag.pacienteTelefone || ag.paciente?.telefone || ag.usuario?.telefone || '',
                isPresential: false
              };
            });
          }
        } else {
          console.error("Erro ao carregar agendamentos:", responseAgendamentos.statusText);
        }

        // Buscar designações presenciais
        const responsePresencial = await fetch(`/api/profissional-presencial?profissional_id=${profissionalId}`);
        let designacoesPresenciais: AgendamentoPaciente[] = [];
        
        if (responsePresencial.ok) {
          const result = await responsePresencial.json();
          if (result.data) {
            // Mapear designações presenciais para o formato de agendamento
            designacoesPresenciais = result.data.map((designacao: Record<string, unknown>) => { 
              // Criar string de data/hora para designação presencial de forma mais robusta
              const dataPresencial = designacao.data_presencial as string;
              const horaInicio = designacao.hora_inicio as string;
              
              let dataISO: string;
              if (horaInicio) {
                // Se tem hora_inicio, extrair apenas a parte de hora (sem timezone)
                const dateOnly = dataPresencial.split('T')[0]; // YYYY-MM-DD
                const timeOnly = horaInicio.includes('T') ? horaInicio.split('T')[1] : horaInicio; // HH:mm:ss
                dataISO = `${dateOnly}T${timeOnly}`;
              } else {
                // Se não tem hora_inicio, usar 08:00:00 como padrão
                const dateOnly = dataPresencial.split('T')[0]; // YYYY-MM-DD
                dataISO = `${dateOnly}T08:00:00`;
              }
              
              return {
                id: `presencial-${designacao.id}`,
                usuarioId: '',
                profissionalId: designacao.profissional_id,
                profissionalNome: designacao.usuarios?.nome || 'Profissional',
                especialidade: designacao.usuarios?.informacoes_adicionais || '',
                dataISO: dataISO,
                local: designacao.empresas?.nome || 'Atendimento Presencial',
                status: 'confirmado' as StatusAgendamento,
                notas: `Designação presencial na empresa ${designacao.empresas?.nome || 'N/A'}`,
                modalidade: 'presencial',
                pacienteNome: 'Atendimento Presencial',
                pacienteEmail: '',
                pacienteTelefone: '',
                isPresential: true,
                empresa: {
                  nome: designacao.empresas?.nome || 'N/A',
                  codigo: designacao.empresas?.codigo || 'N/A',
                  endereco_logradouro: designacao.empresas?.endereco_logradouro,
                  endereco_numero: designacao.empresas?.endereco_numero,
                  endereco_complemento: designacao.empresas?.endereco_complemento,
                  endereco_bairro: designacao.empresas?.endereco_bairro,
                  endereco_cidade: designacao.empresas?.endereco_cidade,
                  endereco_estado: designacao.empresas?.endereco_estado,
                  endereco_cep: designacao.empresas?.endereco_cep
                }
              };
            });
          }
        } else {
          console.error("Erro ao carregar designações presenciais:", responsePresencial.statusText);
        }

        // Combinar e ordenar todos os agendamentos
        const todosAgendamentos = [...agendamentosOnline, ...designacoesPresenciais];
        setAgendamentos(todosAgendamentos);
        
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

    // Usar Luxon para ordenação de datas
    const sorted = [...agendamentos].sort((a, b) => {
      const dateA = TimezoneUtils.dbTimestampToUTC(a.dataISO);
      const dateB = TimezoneUtils.dbTimestampToUTC(b.dataISO);
      return dateA.localeCompare(dateB);
    });

    return sorted.filter((a) => byTerm(a) && byStatus(a));
  }, [agendamentos, busca, statusFiltro]);

  function podeCancelar(a: AgendamentoPaciente) {
    // Usar Luxon para verificar se está no passado
    const ehPassado = TimezoneUtils.isPast(TimezoneUtils.dbTimestampToUTC(a.dataISO));
    return a.status !== "cancelado" && a.status !== "concluido" && !ehPassado;
  }

  function podeReagendar(a: AgendamentoPaciente) {
    // Usar Luxon para verificar se está no passado
    const ehPassado = TimezoneUtils.isPast(TimezoneUtils.dbTimestampToUTC(a.dataISO));
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
            status: "cancelado",
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
      const novaDataHoraUTC = TimezoneUtils.createDateTime(dataEscolhida, horarioEscolhido);
      
      const res = await fetch(
        `/api/agendamentos/${reagendamentoModal.agendamento.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data_consulta: novaDataHoraUTC,
            notas: `Reagendado pelo profissional para ${TimezoneUtils.formatForDisplay(novaDataHoraUTC, undefined, 'full')}`,
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
                dataISO: novaDataHoraUTC,
                notas: `Reagendado pelo profissional para ${TimezoneUtils.formatForDisplay(novaDataHoraUTC, undefined, 'full')}`,
              }
            : a
        )
      );

      fecharModalReagendamento();
    } catch (e) {
      console.error("Erro ao reagendar:", e);
    }
  }

  // Calcular métricas de atendimentos presenciais vs online
  const metricas = useMemo(() => {
    const presenciais = agendamentos.filter(a => a.isPresential && a.status === 'confirmado').length;
    const onlineConcluidos = agendamentos.filter(a => !a.isPresential && a.status === 'concluido').length;
    const totalOnline = agendamentos.filter(a => !a.isPresential).length;
    const totalPresencial = agendamentos.filter(a => a.isPresential).length;
    
    return {
      presenciais,
      onlineConcluidos,
      totalOnline,
      totalPresencial,
      total: presenciais + onlineConcluidos
    };
  }, [agendamentos]);

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

      {/* Métricas de Atendimentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Presenciais</p>
              <p className="text-2xl font-bold">{metricas.presenciais}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online Concluídos</p>
              <p className="text-2xl font-bold">{metricas.onlineConcluidos}</p>
            </div>
            <Monitor className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Realizados</p>
              <p className="text-2xl font-bold">{metricas.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
      </div>

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
          const ehPassado = TimezoneUtils.isPast(TimezoneUtils.dbTimestampToUTC(a.dataISO));
          return (
            <Card key={a.id} className={`border-muted ${a.isPresential ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">
                      {a.pacienteNome}
                    </CardTitle>
                    {a.isPresential ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        <Building2 className="h-3 w-3" />
                        Presencial
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <Monitor className="h-3 w-3" />
                        Online
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {a.especialidade
                      ? `${a.especialidade} • ${a.local}`
                      : a.local}
                  </CardDescription>
                  {a.pacienteEmail && (
                    <CardDescription className="text-xs">
                      📧 {a.pacienteEmail}
                    </CardDescription>
                  )}
                  {a.pacienteTelefone && (
                    <CardDescription className="text-xs">
                      📞 {a.pacienteTelefone}
                    </CardDescription>
                  )}
                  {a.empresa && (
                    <div className="space-y-1">
                      <CardDescription className="text-xs text-blue-600">
                        Empresa: {a.empresa.nome} ({a.empresa.codigo})
                      </CardDescription>
                      {formatarEndereco(a.empresa) && (
                        <CardDescription className="text-xs text-gray-600">
                          📍 {formatarEndereco(a.empresa)}
                        </CardDescription>
                      )}
                    </div>
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
                    {TimezoneUtils.formatForDisplay(TimezoneUtils.dbTimestampToUTC(a.dataISO), undefined, 'full')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Modalidade: </span>
                  <span className={`font-medium ${a.isPresential ? 'text-blue-600' : 'text-green-600'}`}>
                    {a.isPresential ? 'Atendimento Presencial' : 'Consulta Online'}
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
                      <DialogTitle>Detalhes do {a.isPresential ? 'atendimento presencial' : 'agendamento'}</DialogTitle>
                      <DialogDescription>
                        Informações completas do {a.isPresential ? 'atendimento presencial' : 'paciente e atendimento'}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {a.isPresential ? 'Tipo:' : 'Paciente:'}{" "}
                        </span>
                        <span className="font-medium">
                          {a.pacienteNome}
                        </span>
                      </div>
                      {a.pacienteEmail && !a.isPresential && (
                        <div>
                          <span className="text-muted-foreground">
                            Email:{" "}
                          </span>
                          <span>{a.pacienteEmail}</span>
                        </div>
                      )}
                      {a.pacienteTelefone && !a.isPresential && (
                        <div>
                          <span className="text-muted-foreground">
                            Telefone:{" "}
                          </span>
                          <span>{a.pacienteTelefone}</span>
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
                        <span>{TimezoneUtils.formatForDisplay(TimezoneUtils.dbTimestampToUTC(a.dataISO), undefined, 'full')}</span>
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
                      {a.isPresential && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Atenção:</strong> Esta é uma designação presencial criada pelo administrador. 
                            Para modificações, entre em contato com a administração.
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Botões de ação apenas para agendamentos online (não presenciais) */}
                {!a.isPresential && (
                  <>
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
                  </>
                )}
                
                {/* Para designações presenciais, mostrar apenas informação */}
                {a.isPresential && (
                  <div className="text-xs text-blue-600 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Designação presencial - Entre em contato com a administração para alterações
                  </div>
                )}
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
                min={TimezoneUtils.extractDate(TimezoneUtils.now())}
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
