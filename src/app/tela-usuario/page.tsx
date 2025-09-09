"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User, Clock, FileText, Heart } from "lucide-react";
import PendingAppointmentResumer from "@/components/user/pending-appointment-resumer";
import { PendingBookingModal } from "@/components/user/pending-booking-modal";
import {
  PendingBookingManager,
  PendingBookingData,
} from "@/utils/pending-booking";
import { useEffect, useState } from "react";

type Consulta = {
  id: string;
  profissional_nome: string;
  tipo: string;
  data_consulta: string;
  modalidade: string;
};

export default function TelaUsuario() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [usuario, setUsuario] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    async function fetchConsultas() {
      const res = await fetch("/api/agendamentos/proximos");
      const data = await res.json();
      if (data.success) {
        setConsultas(data.data);
        setUsuario(data.usuario);
      }
    }
    fetchConsultas();
  }, []);

  // Efeito separado para verificar agendamento pendente
  useEffect(() => {
    console.log(
      "Componente TelaUsuario montado, verificando agendamento pendente..."
    );

    // Verificar imediatamente se há dados no localStorage
    const pendingData = PendingBookingManager.get();
    console.log("Dados do localStorage:", pendingData);

    if (pendingData) {
      console.log("Agendamento pendente encontrado:", pendingData);
      setShowPendingModal(true);
    } else {
      console.log("Nenhum agendamento pendente encontrado no localStorage");
    }

    // Também verificar após um pequeno delay para garantir que tudo carregou
    const timer = setTimeout(() => {
      const hasPending = PendingBookingManager.hasPending();
      console.log("Verificação com delay - agendamento pendente:", hasPending);
      if (hasPending && !showPendingModal) {
        console.log(
          "Agendamento pendente encontrado no delay, mostrando modal"
        );
        setShowPendingModal(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirmPendingBooking = async (
    pendingData: PendingBookingData
  ) => {
    try {
      const dataHora = `${pendingData.slot.data}T${pendingData.slot.hora}:00.000Z`;

      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: pendingData.profissionalId,
          data_consulta: dataHora,
          local: "Clínica Resilience",
          notas: pendingData.notas || undefined,
          modalidade: pendingData.modalidade,
        }),
      });

      if (response.ok) {
        // Recarregar a página para mostrar o novo agendamento
        window.location.reload();
      } else {
        console.error("Erro ao confirmar agendamento pendente");
      }
    } catch (error) {
      console.error("Erro ao confirmar agendamento pendente:", error);
    }
  };

  console.log(usuario);

  return (
    <>
      <PendingAppointmentResumer />
      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro-secundario">
          Área do Paciente
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Bem-vindo, <span className="font-semibold">{usuario}</span>! Gerencie
          seus agendamentos e acompanhe seu cuidado.
        </p>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Próxima Consulta</p>
                <p className="text-lg font-semibold">Hoje 14:30</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Consultas Este Mês</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Profissional</p>
                <p className="text-lg font-semibold">Dr. Silva</p>
              </div>
              <User className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Bem-estar</p>
                <p className="text-lg font-semibold">Ótimo</p>
              </div>
              <Heart className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/agendamentos">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Meus Agendamentos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize, agende ou cancele suas consultas
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/perfil">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Meu Perfil</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/historico">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Histórico Médico</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesse seu histórico de consultas e tratamentos
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/portal-publico">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Nossos Profissionais</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conheça nossa equipe de profissionais qualificados
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Próximas Consultas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Próximas Consultas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-48 overflow-y-auto ">
              {consultas.length === 0 && (
                <p className="text-gray-600">
                  Você não tem próximas consultas agendadas.
                </p>
              )}
              {consultas.map((c) => {
                const dataObj = new Date(c.data_consulta);
                const hora = dataObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const diaTexto = dataObj.toLocaleDateString();

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Dr. {c.profissional_nome}</p>
                      <p className="text-sm text-gray-600">{c.tipo}</p>
                      <p className="text-sm text-gray-500">{c.modalidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{hora}</p>
                      <p className="text-sm text-gray-600">{diaTexto}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/tela-usuario/agendamentos">
                  Ver Todos os Agendamentos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Agendamento Pendente */}
      <PendingBookingModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onConfirm={handleConfirmPendingBooking}
      />
    </>
  );
}
