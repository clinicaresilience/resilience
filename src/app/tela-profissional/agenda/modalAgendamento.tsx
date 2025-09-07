"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// mesma lista de dias
const diasSemana = [
  { nome: "Domingo", valor: 0 },
  { nome: "Segunda-feira", valor: 1 },
  { nome: "Terça-feira", valor: 2 },
  { nome: "Quarta-feira", valor: 3 },
  { nome: "Quinta-feira", valor: 4 },
  { nome: "Sexta-feira", valor: 5 },
  { nome: "Sábado", valor: 6 },
];

// Função de geração de slots
function generateSlots(dias: any[], intervaloMinutos: number) {
  const slots: any[] = [];
  dias.forEach((dia) => {
    const { diaSemana, horaInicio, horaFim } = dia;
    const [hStart, mStart] = horaInicio.split(":").map(Number);
    const [hEnd, mEnd] = horaFim.split(":").map(Number);
    const startMinutes = hStart * 60 + mStart;
    const endMinutes = hEnd * 60 + mEnd;

    for (
      let t = startMinutes;
      t + intervaloMinutos <= endMinutes;
      t += intervaloMinutos
    ) {
      const slotH = Math.floor(t / 60)
        .toString()
        .padStart(2, "0");
      const slotM = (t % 60).toString().padStart(2, "0");

      slots.push({
        diaSemana,
        horaInicio: `${slotH}:${slotM}`,
        disponivel: true,
        agendamento_id: null,
      });
    }
  });
  return slots;
}

interface AgendaModalProps {
  profissionalId: string;
}

export function AgendaModal({ profissionalId }: AgendaModalProps) {
  const [diasSelecionados, setDiasSelecionados] = useState<any[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("17:00");
  const [intervalo, setIntervalo] = useState(60);

  // Carrega agenda existente
  useEffect(() => {
    fetch(`/api/profissionais/agenda?profissionalId=${profissionalId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.length > 0) {
          // pega os dias existentes do slots
          const dias = data.map((s: any) => ({
            diaSemana: s.diaSemana,
            horaInicio: s.horaInicio,
            horaFim: s.horaFim,
          }));
          setDiasSelecionados(dias);
        }
      });
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

    const diasAtualizados = diasSelecionados.map((d) => ({
      ...d,
      horaInicio,
      horaFim,
    }));

    try {
      const res = await fetch("/api/profissionais/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          dias: diasAtualizados,
          intervalo_minutos: intervalo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Agenda salva:", data);
        alert("Agenda salva com sucesso!");
      } else {
        console.error("Erro ao salvar agenda:", data);
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

      <Button onClick={salvarAgenda}>Salvar</Button>
    </div>
  );
}
