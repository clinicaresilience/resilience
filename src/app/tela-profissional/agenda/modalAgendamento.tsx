"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const diasSemana = [
  { nome: "Domingo", valor: 0 },
  { nome: "Segunda-feira", valor: 1 },
  { nome: "Terça-feira", valor: 2 },
  { nome: "Quarta-feira", valor: 3 },
  { nome: "Quinta-feira", valor: 4 },
  { nome: "Sexta-feira", valor: 5 },
  { nome: "Sábado", valor: 6 },
];

interface AgendaModalProps {
  profissionalId: string;
}

export function AgendaModal({ profissionalId }: AgendaModalProps) {
  const [diasSelecionados, setDiasSelecionados] = useState<any[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("17:00");
  const [intervalo, setIntervalo] = useState(60);
  const [agendaExistente, setAgendaExistente] = useState(false);

  // 🔹 Carrega cronograma existente ao abrir modal
  useEffect(() => {
    fetch(`/api/profissionais/agenda?profissionalId=${profissionalId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.configuracao) {
          setDiasSelecionados(data.configuracao.dias || []);
          setHoraInicio(data.configuracao.horaInicio || "08:00");
          setHoraFim(data.configuracao.horaFim || "17:00");
          setIntervalo(data.configuracao.intervalo_minutos || 60);
          setAgendaExistente(true);
        }
      })
      .catch((err) => console.error("Erro ao carregar agenda:", err));
  }, [profissionalId]);

  const toggleDia = (valor: number) => {
    setDiasSelecionados((prev) => {
      const existe = prev.find((d) => d.diaSemana === valor);
      if (existe) return prev.filter((d) => d.diaSemana !== valor);
      return [...prev, { diaSemana: valor, horaInicio, horaFim }];
    });
  };

  const salvarAgenda = async () => {
    if (diasSelecionados.length === 0) {
      alert("Selecione ao menos um dia da semana");
      return;
    }

    const configuracao = {
      dias: diasSelecionados.map((d) => ({
        diaSemana: d.diaSemana,
        horaInicio,
        horaFim,
      })),
      intervalo_minutos: intervalo,
    };

    try {
      const res = await fetch("/api/profissionais/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          configuracao,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAgendaExistente(true);
        alert("Agenda salva com sucesso!");
      } else {
        alert(data.error || "Erro ao salvar agenda");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agenda");
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div>
        <Label>Dias da Semana</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {diasSemana.map((d) => (
            <div key={d.valor} className="flex items-center gap-1">
              <Checkbox
                checked={diasSelecionados.some(
                  (ds) => ds.diaSemana === d.valor
                )}
                onCheckedChange={() => toggleDia(d.valor)}
              />
              <span>{d.nome}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <Label>Horário de Início</Label>
        <Input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <Label>Horário de Fim</Label>
        <Input
          type="time"
          value={horaFim}
          onChange={(e) => setHoraFim(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <Label>Intervalo entre consultas (minutos)</Label>
        <Input
          type="number"
          value={intervalo}
          onChange={(e) => setIntervalo(Number(e.target.value))}
        />
      </div>

      <Button onClick={salvarAgenda}>
        {agendaExistente ? "Atualizar Cronograma" : "Salvar Cronograma"}
      </Button>
    </div>
  );
}
