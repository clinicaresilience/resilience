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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getArray = (resJson: any) => {
        if (!resJson) return [];
        if (Array.isArray(resJson)) return resJson;
        if (Array.isArray(resJson?.data)) return resJson.data;
        if (Array.isArray(resJson?.resultado)) return resJson.resultado;
        return [];
      };

      try {
        // 1) Buscar agendamentos (fonte de "confirmadas" e "total")
        const resAg = await fetch("/api/agendamentos");
        const jsonAg = await resAg.json().catch(() => null);
        const agArray = getArray(jsonAg);

        const agNormalized: AgendamentoNorm[] = agArray.map((a: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: a.id,
          profissional_id:
            a.profissionalId ||
            a.profissional_id ||
            a.profissional?.id ||
            a.profissional?.profissional_id ||
            null,
          profissional_nome:
            a.profissionalNome ||
            a.profissional?.nome ||
            a.profissional_nome ||
            a.profissional?.name ||
            (typeof a.profissional === "string" ? a.profissional : null) ||
            "Sem Profissional",
          data_consulta:
            a.dataISO || a.data_consulta || a.data_consulta || a.data || null,
          status_agendamento: (a.status || a.status_agendamento || "")
            .toString()
            .toLowerCase(),
        }));
        setAgendamentosNorm(agNormalized);

        // 2) Buscar consultas (fonte de "concluidas", "pendentes", "canceladas", etc)
        const resCons = await fetch("/api/agendamentos/prontuarios");
        const jsonCons = await resCons.json().catch(() => null);
        const consArray = getArray(jsonCons?.consultas || jsonCons);

        const consNormalized: ConsultaNorm[] = consArray.map((c: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: c.id,
          profissional_id:
            c.profissional?.id ||
            c.profissional_id ||
            null,
          profissional_nome:
            c.profissional?.nome ||
            c.profissional_nome ||
            "Sem Profissional",
          data_consulta:
            c.data_consulta || c.dataISO || c.data || null,
          status_consulta: (
            c.status ||
            c.status_consulta ||
            ""
          )
            .toString()
            .toLowerCase(),
        }));
        setConsultasNorm(consNormalized);

        // 3) Profissionais (para garantir exibição mesmo sem agendamentos)
        const resProf = await fetch("/api/profissionais");
        const jsonProf = await resProf.json().catch(() => null);
        const profArray = getArray(jsonProf);

        const profNorm: ProfissionalCadastro[] = profArray.map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: p.id,
          nome: p.nome || p.display_name || "Sem Nome",
          email: p.email,
          especialidade:
            p.informacoes_adicionais?.especialidade || p.especialidade || "",
          createdAt: p.created_at || p.createdAt || undefined,
        }));
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-azul-escuro mb-4">
          Métricas Principais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-100">
                Profissionais Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totais.profissionais}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-100">
                Total de Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totais.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-100">
                Agendamentos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totais.confirmadas}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-100">
                Agendamentos Cancelados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totais.canceladas}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estatísticas por Profissional */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-azul-escuro mb-4">
          Desempenho por Profissional
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {statsCompletas.map((p) => {
            const taxaComparecimento =
              p.total > 0 ? Math.round((p.concluidas / p.total) * 100) : 0;
            const taxaCancelamento =
              p.total > 0 ? Math.round((p.canceladas / p.total) * 100) : 0;

            return (
              <Card
                key={p.nome}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-azul-escuro">
                    {p.nome}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-gray-600">
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
                <CardContent className="flex-1">
                  <div className="grid grid-cols-2 gap-2 text-sm h-full">
                    <div className="rounded-md bg-gray-50 p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-500">Agendamento total</p>
                      <p className="text-xl font-semibold text-azul-escuro">
                        {p.total}
                      </p>
                    </div>
                    <div className="rounded-md bg-green-50 p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600">Agendamento confirmado</p>
                      <p className="text-xl font-semibold text-green-700">
                        {p.confirmadas}
                      </p>
                    </div>
                    <div className="rounded-md bg-red-50 p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600">Agendamento cancelado</p>
                      <p className="text-xl font-semibold text-red-700">
                        {p.canceladas}
                      </p>
                    </div>
                    <div className="rounded-md bg-indigo-50 p-3 h-full flex flex-col justify-between">
                      <p className="text-gray-600">Consulta concluída</p>
                      <p className="text-xl font-semibold text-indigo-700">
                        {p.concluidas}
                      </p>
                    </div>
                    <div className="rounded-md bg-blue-50 p-3 h-full col-span-2 flex flex-col justify-between">
                      <p className="text-gray-600">Próximas consultas</p>
                      <p className="text-xl font-semibold text-blue-700">
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
