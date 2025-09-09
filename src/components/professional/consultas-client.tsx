"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { AgendamentosService } from "@/services/database/agendamentos.service";

interface Consulta {
  id: string;
  usuario_id: string;
  usuario?: { nome: string; email: string };
  status: string;
  local: string;
  observacoes: string | null;
  dataISO: string;
}

interface ProfessionalConsultasClientProps {
  profissionalNome: string;
  profissionalId: string;
}

export function ProfessionalConsultasClient({
  profissionalNome,
  profissionalId,
}: ProfessionalConsultasClientProps) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroData, setFiltroData] = useState("");
  const [busca, setBusca] = useState("");
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<Consulta | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [consultaAbertaId, setConsultaAbertaId] = useState<string | null>(null);



  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await fetch(`/api/agendamentos?profissional_id=${profissionalId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao buscar agendamentos');
        }

        // Mapear agendamentos para formato de consultas
        const consultasMapeadas = (result.data || []).map((agendamento: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: agendamento.id,
          usuario_id: agendamento.usuarioId || agendamento.paciente_id,
          usuario: {
            nome: agendamento.pacienteNome || 'Paciente não informado',
            email: agendamento.pacienteEmail || ''
          },
          status: agendamento.status,
          local: agendamento.local || 'Clínica Resilience',
          observacoes: agendamento.notas,
          dataISO: agendamento.dataISO || agendamento.data_consulta,
        }));

        setConsultas(consultasMapeadas);
      } catch (err) {
        console.error("Erro ao buscar consultas:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profissionalId, refreshTrigger]);

  const consultasFiltradas = useMemo(() => {
    let resultado = consultas;

    if (filtroStatus !== "todos")
      resultado = resultado.filter((c) => c.status === filtroStatus);
    if (filtroData)
      resultado = resultado.filter((c) => c.dataISO.startsWith(filtroData));
    if (busca)
      resultado = resultado.filter(
        (c) =>
          (c.usuario?.nome?.toLowerCase().includes(busca.toLowerCase()) ?? false) ||
          c.usuario_id.toLowerCase().includes(busca.toLowerCase()) ||
          (c.observacoes?.toLowerCase().includes(busca.toLowerCase()) ?? false)
      );

    return resultado.sort(
      (a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime()
    );
  }, [consultas, filtroStatus, filtroData, busca]);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return {
      data: data.toLocaleDateString("pt-BR"),
      hora: data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      diaSemana: data.toLocaleDateString("pt-BR", { weekday: "long" }),
    };
  };

  const handleAcaoConsulta = async (
    consulta: Consulta,
    acao: "concluir" | "cancelar"
  ) => {
    let statusNovo = consulta.status;
    let requestBody: any = { status: statusNovo }; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (acao === "concluir") {
      statusNovo = "concluido";
      requestBody = { status: statusNovo };
    }
    if (acao === "cancelar") {
      statusNovo = "cancelado";
      requestBody = {
        status: statusNovo,
        justificativa: "Cancelado pelo profissional"
      };
    }

    try {
      const res = await fetch(`/api/agendamentos/${consulta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao atualizar status");

      setConsultas((prev) =>
        prev.map((c) => (c.id === consulta.id ? { ...c, status: statusNovo } : c))
      );

      // Trigger refresh to get updated data from API
      setRefreshTrigger(prev => prev + 1);

      console.log("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const estatisticas = useMemo(() => {
    const hoje = new Date();
    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);

    return {
      total: consultas.length,
      hoje: consultas.filter((c) => {
        const d = new Date(c.dataISO);
        return d >= inicioHoje && d < fimHoje;
      }).length,
      pendentes: consultas.filter((c) => c.status === "pendente").length,
      confirmadas: consultas.filter((c) => c.status === "confirmado").length,
      concluidas: consultas.filter((c) => c.status === "concluido").length,
      canceladas: consultas.filter((c) => c.status === "cancelado").length,
    };
  }, [consultas]);

  const handleSalvarObservacoes = async () => {
    if (!consultaSelecionada) return;

    try {
      const res = await fetch(`/api/agendamentos/${consultaSelecionada.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notas: observacoes,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao salvar observações");

      setConsultas((prev) =>
        prev.map((c) =>
          c.id === consultaSelecionada.id ? { ...c, observacoes } : c
        )
      );

      console.log("Observações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar observações:", error);
    }
  };

  if (loading) return <p>Carregando consultas...</p>;

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          { icone: Calendar, titulo: "Total", valor: estatisticas.total },
          { icone: Clock, titulo: "Hoje", valor: estatisticas.hoje },
          {
            icone: AlertCircle,
            titulo: "Pendentes",
            valor: estatisticas.pendentes,
          },
          {
            icone: CheckCircle,
            titulo: "Confirmadas",
            valor: estatisticas.confirmadas,
          },
          {
            icone: CheckCircle,
            titulo: "Concluídas",
            valor: estatisticas.concluidas,
          },
          {
            icone: XCircle,
            titulo: "Canceladas",
            valor: estatisticas.canceladas,
          },
        ].map(({ icone: Icon, titulo, valor }) => (
          <Card key={titulo}>
            <CardContent className="p-4 flex items-center space-x-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{titulo}</p>
                <p className="text-2xl font-bold">{valor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Buscar por paciente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setBusca("");
                  setFiltroStatus("todos");
                  setFiltroData("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {consultasFiltradas.map((consulta) => {
          const { data, hora, diaSemana } = formatarData(consulta.dataISO);
          return (
            <Card
              key={consulta.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold text-lg">
                      Paciente:{" "}
                      {consulta.usuario?.nome ||
                        consulta.usuario_id ||
                        "Não informado"}
                    </h3>
                    <StatusBadge status={consulta.status as "pendente" | "confirmado" | "concluido" | "cancelado"} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {data} ({diaSemana})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{hora}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{consulta.local}</span>
                    </div>
                  </div>

                  {consulta.observacoes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Observações:</strong> {consulta.observacoes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 md:ml-4">
                  {/* Botões: Concluir ou Cancelar */}
                  {consulta.status !== "concluido" &&
                    consulta.status !== "cancelado" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAcaoConsulta(consulta, "concluir")
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleAcaoConsulta(consulta, "cancelar")
                          }
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancelar
                        </Button>
                      </>
                    )}

                  {/* Botão para abrir detalhes */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setConsultaSelecionada(consulta);
                      setObservacoes(consulta.observacoes || "");
                      setConsultaAbertaId(consulta.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {consultasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-600">
                Não há consultas que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Observações - fora do map */}
      {consultaSelecionada && (
        <Dialog
          open={consultaAbertaId !== null}
          onOpenChange={(open) => !open && setConsultaAbertaId(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Consulta</DialogTitle>
              <DialogDescription>
                Informações completas e observações da consulta
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Paciente</Label>
                  <p className="font-medium">
                    {consultaSelecionada.usuario?.nome ||
                      consultaSelecionada.usuario_id ||
                      "Não informado"}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <StatusBadge status={consultaSelecionada.status as "pendente" | "confirmado" | "concluido" | "cancelado"} />
                </div>
                <div>
                  <Label>Data e Hora</Label>
                  <p className="font-medium">
                    {formatarData(consultaSelecionada.dataISO).data} às{" "}
                    {formatarData(consultaSelecionada.dataISO).hora}
                  </p>
                </div>
                <div>
                  <Label>Local</Label>
                  <p className="font-medium">{consultaSelecionada.local}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre a consulta..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setConsultaAbertaId(null)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    await handleSalvarObservacoes();
                    setConsultaAbertaId(null);
                  }}
                >
                  Salvar Observações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
