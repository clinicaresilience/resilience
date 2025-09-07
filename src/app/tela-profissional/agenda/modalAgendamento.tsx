"use client";

import { useState } from "react";
import { createClient } from "@/lib/client"; // Cliente do Supabase
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
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("17:00");
  const [intervalo, setIntervalo] = useState(60);

  const toggleDia = (valor: number) => {
    setDiasSelecionados((prev) =>
      prev.includes(valor) ? prev.filter((d) => d !== valor) : [...prev, valor]
    );
  };

  const salvarAgenda = async () => {
    const supabase = createClient();
    try {
      for (const dia of diasSelecionados) {
        const { error } = await supabase.from("agenda_configuracoes").upsert({
          profissional_id: profissionalId,
          dia_semana: dia,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          intervalo_minutos: intervalo,
          ativo: true,
        });
        if (error) console.error("Erro ao salvar configuração:", error);
      }
      alert("Agenda salva com sucesso!");
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
                checked={diasSelecionados.includes(d.valor)}
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
