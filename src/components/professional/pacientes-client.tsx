"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Calendar, FileText, Clock, Activity } from "lucide-react";

interface PacientesOverviewProps {
  profissionalId: string;
}

type PacienteInfo = {
  id: string;
  nome: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string;
  proximaConsulta?: string;
  statusAtual: "ativo" | "inativo" | "alta";
};

export function PacientesOverview({ profissionalId }: PacientesOverviewProps) {
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<PacienteInfo | null>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        const { data: agData } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("profissional_id", profissionalId);

        const pacienteIds = Array.from(
          new Set(agData?.map((a) => a.paciente_id).filter(Boolean))
        );

        let prData: any[] = [];
        let pacData: any[] = [];

        if (pacienteIds.length > 0) {
          const { data: pr } = await supabase
            .from("prontuarios")
            .select("*")
            .in("paciente_id", pacienteIds);
          prData = pr || [];

          const { data: pac } = await supabase
            .from("usuarios")
            .select("id,nome,email,status")
            .in("id", pacienteIds);
          pacData = pac || [];
        }

        setAgendamentos(agData || []);
        setProntuarios(prData);
        setPacientes(pacData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    fetchData();
  }, [profissionalId]);

  // Pacientes processados
  const pacientesInfo = useMemo(() => {
    const map = new Map<string, PacienteInfo>();

    agendamentos.forEach((consulta) => {
      const pacienteId = consulta.paciente_id;
      const paciente = pacientes.find((p) => p.id === pacienteId);

      if (!map.has(pacienteId)) {
        map.set(pacienteId, {
          id: pacienteId,
          nome: paciente?.nome || "Paciente",
          email: paciente?.email || "",
          totalConsultas: 0,
          ultimaConsulta: consulta.data_consulta,
          statusAtual: paciente?.status || "ativo",
        });
      }

      const info = map.get(pacienteId)!;
      info.totalConsultas += 1;

      const dataConsulta = new Date(consulta.data_consulta);
      const ultima = new Date(info.ultimaConsulta);
      if (dataConsulta > ultima) info.ultimaConsulta = consulta.data_consulta;

      const agora = new Date();
      if (
        dataConsulta > agora &&
        ["confirmado", "pendente"].includes(consulta.status)
      ) {
        if (
          !info.proximaConsulta ||
          dataConsulta < new Date(info.proximaConsulta)
        ) {
          info.proximaConsulta = consulta.data_consulta;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.ultimaConsulta).getTime() -
        new Date(a.ultimaConsulta).getTime()
    );
  }, [agendamentos, pacientes]);

  // Filtro de busca
  const pacientesFiltrados = useMemo(() => {
    if (!busca.trim()) return pacientesInfo;
    const termo = busca.toLowerCase();
    return pacientesInfo.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo)
    );
  }, [busca, pacientesInfo]);

  // Formatar datas
  const formatarData = (data: string) =>
    data ? new Date(data).toLocaleDateString("pt-BR") : "-";

  const obterHistoricoPaciente = (pacienteId: string) => ({
    consultas: agendamentos.filter((a) => a.paciente_id === pacienteId),
    prontuarios: prontuarios.filter((p) => p.usuario_id === pacienteId),
  });

  // Estatísticas
  const estatisticas = useMemo(
    () => ({
      totalPacientes: pacientesInfo.length,
      pacientesAtivos: pacientesInfo.filter((p) => p.statusAtual === "ativo")
        .length,
      totalConsultas: pacientesInfo.reduce(
        (acc, p) => acc + p.totalConsultas,
        0
      ),
      proximasConsultas: pacientesInfo.filter((p) => p.proximaConsulta).length,
    }),
    [pacientesInfo]
  );

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={User}
          label="Total de Pacientes"
          value={estatisticas.totalPacientes}
        />
        <StatCard
          icon={Activity}
          label="Pacientes Ativos"
          value={estatisticas.pacientesAtivos}
        />
        <StatCard
          icon={Calendar}
          label="Total de Consultas"
          value={estatisticas.totalConsultas}
        />
        <StatCard
          icon={Clock}
          label="Próximas Consultas"
          value={estatisticas.proximasConsultas}
        />
      </div>

      {/* Filtro */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="busca">Nome ou email</Label>
              <Input
                id="busca"
                placeholder="Digite para buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setBusca("")}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacientesFiltrados.length ? (
          pacientesFiltrados.map((paciente) => (
            <PacienteCard
              key={paciente.id}
              paciente={paciente}
              formatarData={formatarData}
              onVerHistorico={() => setPacienteSelecionado(paciente)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-600">
                {busca
                  ? "Não há pacientes que correspondam à busca."
                  : "Você ainda não tem pacientes cadastrados."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de histórico único */}
      <Dialog
        open={!!pacienteSelecionado}
        onOpenChange={() => setPacienteSelecionado(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico do Paciente</DialogTitle>
            <DialogDescription>
              {pacienteSelecionado?.nome} - Histórico completo de consultas e
              prontuários
            </DialogDescription>
          </DialogHeader>
          {pacienteSelecionado && (
            <div className="space-y-6">
              <HistoricoConsultas
                consultas={
                  obterHistoricoPaciente(pacienteSelecionado.id).consultas
                }
                formatarData={formatarData}
              />
              <HistoricoProntuarios
                prontuarios={
                  obterHistoricoPaciente(pacienteSelecionado.id).prontuarios
                }
                formatarData={formatarData}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================
// Componentes auxiliares
// ========================

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center space-x-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PacienteCard({
  paciente,
  formatarData,
  onVerHistorico,
}: {
  paciente: PacienteInfo;
  formatarData: (data: string) => string;
  onVerHistorico: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-3 flex items-center justify-between">
        <CardTitle className="text-lg">{paciente.nome}</CardTitle>
        <StatusBadge status={paciente.statusAtual as any} />
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full space-y-3">
        <div className="space-y-3">
          <div className="text-sm text-gray-600">Email: {paciente.email}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Consultas</p>
              <p className="font-semibold">{paciente.totalConsultas}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Última</p>
              <p className="font-semibold">
                {formatarData(paciente.ultimaConsulta)}
              </p>
            </div>
          </div>

          {paciente.proximaConsulta && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <p className="text-blue-600 font-medium">Próxima consulta:</p>
              <p className="text-blue-800">
                {formatarData(paciente.proximaConsulta)}
              </p>
            </div>
          )}
        </div>

        <Button
          className="w-full mt-auto"
          variant="outline"
          onClick={onVerHistorico}
        >
          <FileText className="h-4 w-4 mr-2" /> Ver Histórico
        </Button>
      </CardContent>
    </Card>
  );
}

function HistoricoConsultas({
  consultas,
  formatarData,
}: {
  consultas: any[];
  formatarData: (data: string) => string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Histórico de Consultas</h3>
      <div className="space-y-2">
        {consultas.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-3 bg-white border rounded-lg"
          >
            <div>
              <p className="font-medium">{c.especialidade}</p>
              <p className="text-sm text-gray-600">
                {formatarData(c.data_consulta)}
              </p>
              {c.notas && (
                <p className="text-sm text-gray-500 mt-1">{c.notas}</p>
              )}
            </div>
            <StatusBadge status={c.status as any} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoricoProntuarios({
  prontuarios,
  formatarData,
}: {
  prontuarios: any[];
  formatarData: (data: string) => string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Prontuários</h3>
      <div className="space-y-2">
        {prontuarios.map((p) => (
          <div key={p.id} className="p-3 bg-white border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{p.tipoConsulta}</p>
              <span className="text-sm text-gray-500">
                {formatarData(p.dataConsulta)}
              </span>
            </div>
            {p.diagnostico && (
              <p className="text-sm text-blue-600 mb-2">
                <strong>Diagnóstico:</strong> {p.diagnostico}
              </p>
            )}
            <p className="text-sm text-gray-600">{p.observacoes}</p>
            {p.prescricoes?.length > 0 && (
              <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                {p.prescricoes.map((pr, i) => (
                  <li key={i}>{pr}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
