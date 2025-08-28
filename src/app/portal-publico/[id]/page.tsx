"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Image, { StaticImageData } from "next/image";
import IconeProfissional from "@/app/assets/icones/logo.png";
import { X, CheckCircle2 } from "lucide-react";

type AgendaDia = {
  disponiveis: string[];
  ocupados: string[];
};

type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  crp: string;
  descricao: string;
  foto: StaticImageData;
  agenda: Record<string, AgendaDia>;
};

// 🔹 Mock com agenda
const hoje = new Date();
const anoAtual = hoje.getFullYear();
const mesAtual = hoje.getMonth();

const formatarData = (dia: number) =>
  `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(
    2,
    "0"
  )}`;

const profissionais: Profissional[] = [
  {
    id: "ana",
    nome: "Dra. Ana Souza",
    especialidade: "Psicóloga Clínica",
    crp: "CRP 12/34567",
    descricao:
      "Atendimento individual e em grupo, com foco em terapia cognitivo-comportamental.",
    foto: IconeProfissional,
    agenda: {
      [formatarData(2)]: {
        disponiveis: ["09:00", "10:00"],
        ocupados: ["14:00"],
      },
      [formatarData(5)]: {
        disponiveis: ["08:30", "11:00"],
        ocupados: ["13:30"],
      },
      [formatarData(10)]: {
        disponiveis: ["15:00"],
        ocupados: ["09:00", "10:00"],
      },
    },
  },
];

export default function PerfilProfissional() {
  const params = useParams();
  const profissional = profissionais.find((p) => p.id === params.id);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [abrirModal, setAbrirModal] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);

  //  Gera estrutura de calendário do mês atual
  const diasCalendario = useMemo(() => {
    const primeiroDiaMes = new Date(anoAtual, mesAtual, 1);
    const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0);

    const dias: (Date | null)[] = [];

    // Espaços antes do primeiro dia
    const inicioSemana = primeiroDiaMes.getDay(); // 0 = domingo
    for (let i = 0; i < inicioSemana; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
      dias.push(new Date(anoAtual, mesAtual, d));
    }

    return dias;
  }, [anoAtual, mesAtual]);

  if (!profissional) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Profissional não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-20 lg:flex-row justify-between items-start min-h-screen bg-gray-50 p-6">
      {/* Perfil (esquerda) */}
      <Card className="w-full lg:w-1/2 max-w-2xl bg-white shadow-md rounded-2xl   p-8 flex flex-col items-center text-center">
        <div className="w-40 h-40 -mt-14 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
          <Image
            src={profissional.foto}
            alt={`Foto de ${profissional.nome}`}
            width={160}
            height={160}
            className="object-cover w-full h-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          {profissional.nome}
        </h1>
        <p className="text-sm text-azul-escuro">{profissional.especialidade}</p>
        <p className="text-xs text-gray-500">{profissional.crp}</p>

        <p className="mt-4 text-gray-600 text-sm leading-relaxed">
          {profissional.descricao}
        </p>
      </Card>

      {/* Calendário (direita) */}
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 lg:ml-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Agenda de {hoje.toLocaleString("pt-BR", { month: "long" })} /{" "}
          {anoAtual}
        </h2>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 text-center mb-2 font-medium text-gray-600">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia}>{dia}</div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {diasCalendario.map((dia, index) => {
            if (!dia) return <div key={index} className="p-1" />;

            const dataStr = dia.toISOString().split("T")[0];
            const temAgenda = Boolean(profissional.agenda[dataStr]);

            return (
              <button
                key={dataStr}
                onClick={() => {
                  if (temAgenda) {
                    setDiaSelecionado(dataStr);
                    setHoraSelecionada(null);
                    setAbrirModal(true);
                  }
                }}
                className={`p-2 rounded-lg text-xs sm:text-sm transition w-full 
                h-10 sm:h-12 md:h-14 flex items-center justify-center
                ${
                  temAgenda
                    ? "bg-azul-escuro text-white hover:bg-azul-medio"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {dia.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de horários */}
      <Dialog open={abrirModal} onOpenChange={setAbrirModal}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-lg w-full rounded-2xl shadow-xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-azul-escuro">
              Horários em {diaSelecionado?.split("-").reverse().join("/")}
            </DialogTitle>
          </DialogHeader>

          {/* Lista de horários */}
          {diaSelecionado && profissional.agenda[diaSelecionado] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {profissional.agenda[diaSelecionado].disponiveis.map((hora) => (
                <Button
                  key={hora}
                  onClick={() => setHoraSelecionada(hora)}
                  className={`rounded-lg py-3 text-sm font-medium transition 
              ${
                horaSelecionada === hora
                  ? "bg-azul-medio text-white shadow-md scale-105"
                  : "bg-azul-escuro text-white hover:bg-azul-medio"
              }`}
                >
                  {hora}
                </Button>
              ))}

              {profissional.agenda[diaSelecionado].ocupados.map((hora) => (
                <div
                  key={hora}
                  className="bg-gray-200 text-gray-500 rounded-lg py-3 flex items-center justify-center text-sm line-through"
                >
                  {hora}
                </div>
              ))}
            </div>
          )}

          {/* Botão confirmar */}
          <DialogFooter className="mt-8">
            <Button
              onClick={() => {
                if (horaSelecionada) {
                  setAbrirModal(false);
                  setAgendamentoConfirmado(true);
                }
              }}
              disabled={!horaSelecionada}
              className="w-full rounded-lg bg-azul-escuro text-white hover:bg-azul-medio disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de sucesso */}
      <Dialog
        open={agendamentoConfirmado}
        onOpenChange={setAgendamentoConfirmado}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md w-full rounded-2xl shadow-xl p-6 bg-white flex flex-col items-center text-center">
          <CheckCircle2 className="text-green-500 w-12 h-12 mb-4" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Agendamento confirmado!
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Seu horário foi reservado com sucesso.
          </p>
          <DialogFooter className="mt-6 w-full">
            <Button
              className="w-full bg-azul-escuro text-white hover:bg-azul-medio"
              onClick={() => (window.location.href = "/tela-usuario")}
            >
              Ir para meus agendamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
