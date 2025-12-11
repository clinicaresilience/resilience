"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfissionalStats = {
  nome: string;
  total: number; // total de agendamentos (fonte: tabela agendamentos)
  confirmadas: number; // fonte: agendamentos.status === 'confirmado'
  pendentes: number; // fonte: consultas.status_consulta === 'pendente'
  canceladas: number; // fonte: consultas.status_consulta === 'cancelado'
  concluidas: number; // fonte: consultas.status_consulta === 'concluido'
  proximas: number; // agendamentos futuros (fonte: agendamentos)
};

type ProfissionalCadastro = {
  id: string;
  nome: string;
  email?: string;
  especialidade?: string;
  createdAt?: string;
};

type AgendamentoNorm = {
  id: string;
  profissional_id?: string;
  profissional_nome?: string;
  data_consulta?: string;
  status_agendamento?: string; // ex: 'confirmado'
};

type ConsultaNorm = {
  id: string;
  profissional_id?: string;
  profissional_nome?: string;
  data_consulta?: string;
  status_consulta?: string; // ex: 'concluido', 'pendente', 'cancelado'
};

export function AdminDashboard() {
  const [profissionais, setProfissionais] = useState<ProfissionalCadastro[]>(
    []
  );
  const [agendamentosNorm, setAgendamentosNorm] = useState<AgendamentoNorm[]>(
    []
  );
  const [consultasNorm, setConsultasNorm] = useState<ConsultaNorm[]>([]);

  useEffect(() => {
    async function fetchDados() {
      // helper para extrair array de respostas diferentes (/api pode devolver { success: true, data: [...] } ou [] diretamente)
      const getArray = (resJson: unknown) => {
        if (!resJson) return [];
        if (Array.isArray(resJson)) return resJson;
        if (typeof resJson === 'object' && resJson !== null) {
          const obj = resJson as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data;
          if (Array.isArray(obj.resultado)) return obj.resultado;
        }
        return [];
      };

      try {
        // 1) Buscar agendamentos (fonte de "confirmadas" e "total")
        const resAg = await fetch("/api/agendamentos");
        const jsonAg = await resAg.json().catch(() => null);
        const agArray = getArray(jsonAg);

        const agNormalized: AgendamentoNorm[] = agArray.map((a: Record<string, unknown>) => {
          const profissional = a.profissional as Record<string, unknown> | undefined;
          return {
            id: typeof a.id === 'string' ? a.id : String(a.id || ''),
            profissional_id: (
              (typeof a.profissionalId === 'string' ? a.profissionalId : null) ||
              (typeof a.profissional_id === 'string' ? a.profissional_id : null) ||
              (typeof profissional?.id === 'string' ? profissional.id : null) ||
              (typeof profissional?.profissional_id === 'string' ? profissional.profissional_id : null)
            ) || undefined,
            profissional_nome: (
              (typeof a.profissionalNome === 'string' ? a.profissionalNome : null) ||
              (typeof profissional?.nome === 'string' ? profissional.nome : null) ||
              (typeof a.profissional_nome === 'string' ? a.profissional_nome : null) ||
              (typeof profissional?.name === 'string' ? profissional.name : null) ||
              (typeof a.profissional === "string" ? a.profissional : null)
            ) || "Sem Profissional",
            data_consulta: (
              (typeof a.dataISO === 'string' ? a.dataISO : null) ||
              (typeof a.data_consulta === 'string' ? a.data_consulta : null) ||
              (typeof a.data === 'string' ? a.data : null)
            ) || undefined,
            status_agendamento: String(a.status || a.status_agendamento || "").toLowerCase(),
          };
        });
        setAgendamentosNorm(agNormalized);

        // 2) Buscar consultas (fonte de "concluidas", "pendentes", "canceladas", etc)
        const resCons = await fetch("/api/agendamentos/prontuarios");
        const jsonCons = await resCons.json().catch(() => null);
        const consArray = getArray(jsonCons?.consultas || jsonCons);

        const consNormalized: ConsultaNorm[] = consArray.map((c: Record<string, unknown>) => {
          const profissional = c.profissional as Record<string, unknown> | undefined;
          return {
            id: typeof c.id === 'string' ? c.id : String(c.id || ''),
            profissional_id: (
              (typeof profissional?.id === 'string' ? profissional.id : null) ||
              (typeof c.profissional_id === 'string' ? c.profissional_id : null)
            ) || undefined,
            profissional_nome: (
              (typeof profissional?.nome === 'string' ? profissional.nome : null) ||
              (typeof c.profissional_nome === 'string' ? c.profissional_nome : null)
            ) || "Sem Profissional",
            data_consulta: (
              (typeof c.data_consulta === 'string' ? c.data_consulta : null) ||
              (typeof c.dataISO === 'string' ? c.dataISO : null) ||
              (typeof c.data === 'string' ? c.data : null)
            ) || undefined,
            status_consulta: String(c.status || c.status_consulta || "").toLowerCase(),
          };
        });
        setConsultasNorm(consNormalized);

        // 3) Profissionais (para garantir exibição mesmo sem agendamentos)
        const resProf = await fetch("/api/profissionais");
        const jsonProf = await resProf.json().catch(() => null);
        const profArray = getArray(jsonProf);

        const profNorm: ProfissionalCadastro[] = profArray.map((p: Record<string, unknown>) => {
          const informacoesAdicionais = p.informacoes_adicionais as Record<string, unknown> | undefined;
          return {
            id: typeof p.id === 'string' ? p.id : String(p.id || ''),
            nome: (
              (typeof p.nome === 'string' ? p.nome : null) ||
              (typeof p.display_name === 'string' ? p.display_name : null)
            ) || "Sem Nome",
            email: typeof p.email === 'string' ? p.email : undefined,
            especialidade: (
              (typeof informacoesAdicionais?.especialidade === 'string' ? informacoesAdicionais.especialidade : null) ||
              (typeof p.especialidade === 'string' ? p.especialidade : null)
            ) || "",
            createdAt: (
              (typeof p.created_at === 'string' ? p.created_at : null) ||
              (typeof p.createdAt === 'string' ? p.createdAt : null)
            ) || undefined,
          };
        });
        setProfissionais(profNorm);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      }
    }

    fetchDados();
  }, []);

  // Agrupar: confirmadas => do agendamentos; concluidas => das consultas
  const statsCompletas: ProfissionalStats[] = useMemo(() => {
    const now = Date.now();

    // Indexar por profissional (usar id quando possível, senão nome)
    const byId: Record<string, ProfissionalStats & { keyId: string }> = {};

    // Inicializar com lista de profissionais cadastrados (garante que aparecem mesmo sem dados)
    for (const p of profissionais) {
      const key = p.id ?? p.nome;
      byId[key] = {
        keyId: key,
        nome: p.nome,
        total: 0,
        confirmadas: 0,
        pendentes: 0,
        canceladas: 0,
        concluidas: 0,
        proximas: 0,
      } as ProfissionalStats & { keyId: string };
    }

    // Agendamentos -> total & confirmadas & canceladas & proximas
    for (const a of agendamentosNorm) {
      // determine key: try profissional_id then profissional_nome
      const pid =
        a.profissional_id ?? a.profissional_nome ?? "Sem Profissional";
      const key = pid;

      if (!byId[key]) {
        byId[key] = {
          keyId: key,
          nome: a.profissional_nome || String(pid),
          total: 0,
          confirmadas: 0,
          pendentes: 0,
          canceladas: 0,
          concluidas: 0,
          proximas: 0,
        } as ProfissionalStats & { keyId: string };
      }

      const s = byId[key];
      s.total += 1;

      const st = (a.status_agendamento || "").toLowerCase();
      if (st === "confirmado") s.confirmadas += 1;
      if (st === "cancelado" || st === "cancelada") s.canceladas += 1;
      if (st === "pendente") s.pendentes += 1;

      // próximas: conta agendamentos futuros (considerando confirmado/pendente como "próxima")
      const dt = a.data_consulta ? Date.parse(a.data_consulta) : NaN;
      if (!isNaN(dt) && dt > now) {
        if (st === "confirmado" || st === "pendente") s.proximas += 1;
      }
    }

    // Consultas -> concluidas, pendentes, canceladas (não mexe em confirmadas/totais que vêm de agendamentos)
    for (const c of consultasNorm) {
      const pid =
        c.profissional_id ?? c.profissional_nome ?? "Sem Profissional";
      const key = pid;

      if (!byId[key]) {
        byId[key] = {
          keyId: key,
          nome: c.profissional_nome || String(pid),
          total: 0,
          confirmadas: 0,
          pendentes: 0,
          canceladas: 0,
          concluidas: 0,
          proximas: 0,
        } as ProfissionalStats & { keyId: string };
      }

      const s = byId[key];
      const st = (c.status_consulta || "").toLowerCase();
      if (st === "concluido" || st === "concluida" || st === "concluída")
        s.concluidas += 1;
      if (st === "pendente") s.pendentes += 1;
      if (st === "cancelado" || st === "cancelada") s.canceladas += 1;

      // total: opcional — se quiser que 'total' inclua também consultas sem agendamento,
      // você pode somar aqui. Mas como você pediu "total de agendamentos", mantive total vindo de agendamentos.
    }

    // Converter para array e ordenar (por total desc, depois nome)
    const arr = Object.values(byId).map(
      ({ keyId, ...rest }) => rest as ProfissionalStats
    );
    arr.sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
    return arr;
  }, [agendamentosNorm, consultasNorm, profissionais]);

  // Totais gerais
  const totais = useMemo(() => {
    return statsCompletas.reduce(
      (acc, s) => {
        acc.profissionais += 1;
        acc.total += s.total;
        acc.confirmadas += s.confirmadas;
        acc.pendentes += s.pendentes;
        acc.canceladas += s.canceladas;
        acc.concluidas += s.concluidas;
        acc.proximas += s.proximas;
        return acc;
      },
      {
        profissionais: 0,
        total: 0,
        confirmadas: 0,
        pendentes: 0,
        canceladas: 0,
        concluidas: 0,
        proximas: 0,
      }
    );
  }, [statsCompletas]);

  // JSX: igual ao que você já tinha (apenas usando statsCompletas / totais)
  return (
    <div className="w-full">
      {/* Métricas Principais */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-azul-escuro mb-3 md:mb-4">
          Métricas Principais
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm text-blue-100">
                Profissionais Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <p className="text-2xl md:text-3xl font-bold">{totais.profissionais}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm text-purple-100">
                Total de Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <p className="text-2xl md:text-3xl font-bold">{totais.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm text-green-100">
                Agendamentos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <p className="text-2xl md:text-3xl font-bold">{totais.confirmadas}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm text-red-100">
                Agendamentos Cancelados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <p className="text-2xl md:text-3xl font-bold">{totais.canceladas}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estatísticas por Profissional */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-azul-escuro mb-3 md:mb-4">
          Desempenho por Profissional
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {statsCompletas.map((p, index) => {
            const taxaComparecimento =
              p.total > 0 ? Math.round((p.concluidas / p.total) * 100) : 0;
            const taxaCancelamento =
              p.total > 0 ? Math.round((p.canceladas / p.total) * 100) : 0;

            return (
              <Card
                key={`prof-${index}-${p.nome.replace(/\s+/g, '-').toLowerCase()}`}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                  <CardTitle className="text-base md:text-lg text-azul-escuro">
                    {p.nome}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs md:text-sm text-gray-600">
                    <span>
                      Comparecimento:{" "}
                      <strong className="text-green-600">
                        {taxaComparecimento}%
                      </strong>
                    </span>
                    <span>
                      Cancelamento:{" "}
                      <strong className="text-red-600">
                        {taxaCancelamento}%
                      </strong>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 md:p-6 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm h-full">
                    <div className="rounded-md bg-gray-50 p-2 md:p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-500 text-xs md:text-sm">Agendamento total</p>
                      <p className="text-lg md:text-xl font-semibold text-azul-escuro">
                        {p.total}
                      </p>
                    </div>
                    <div className="rounded-md bg-green-50 p-2 md:p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600 text-xs md:text-sm">Agendamento confirmado</p>
                      <p className="text-lg md:text-xl font-semibold text-green-700">
                        {p.confirmadas}
                      </p>
                    </div>
                    <div className="rounded-md bg-red-50 p-2 md:p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600 text-xs md:text-sm">Agendamento cancelado</p>
                      <p className="text-lg md:text-xl font-semibold text-red-700">
                        {p.canceladas}
                      </p>
                    </div>
                    <div className="rounded-md bg-indigo-50 p-2 md:p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600 text-xs md:text-sm">Consulta concluída</p>
                      <p className="text-lg md:text-xl font-semibold text-indigo-700">
                        {p.concluidas}
                      </p>
                    </div>
                    <div className="rounded-md bg-blue-50 p-2 md:p-3 h-full col-span-2 flex flex-col justify-between">
                      <p className="text-gray-600 text-xs md:text-sm">Próximas consultas</p>
                      <p className="text-lg md:text-xl font-semibold text-blue-700">
                        {p.proximas}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
