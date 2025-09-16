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
  status?: string;
};

export default function TelaUsuario() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [historico, setHistorico] = useState<Consulta[]>([]);
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

    async function fetchHistorico() {
      const res = await fetch("/api/agendamentos/passados");
      const data = await res.json();
      if (data.success) {
        // Pegar apenas os últimos 3 para mostrar como resumo
        setHistorico(data.data.slice(0, 3));
      }
    }

    fetchConsultas();
    fetchHistorico();
  }, []);

  // Efeito separado para verificar agendamento pendente
  useEffect(() => {
    console.log(
      "Componente TelaUsuario montado, verificando agendamento pendente..."
    );

    // Verificar imediatamente se há dados no localStorage
    const pendingData = PendingBookingManager.get();

    if (pendingData) {
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
          <Link href="/tela-usuario/avaliacoes">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-lg">Avaliar Profissionais</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Avalie os profissionais após suas consultas
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

      {/* Próximas Consultas e Histórico Recente */}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Histórico Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-48 overflow-y-auto ">
              {historico.length === 0 && (
                <p className="text-gray-600">
                  Você não possui consultas concluídas ainda.
                </p>
              )}
              {historico.map((c) => {
                const dataObj = new Date(c.data_consulta);
                const hora = dataObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const diaTexto = dataObj.toLocaleDateString();

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Dr. {c.profissional_nome}</p>
                      <p className="text-sm text-gray-600">{c.tipo}</p>
                      <p className="text-sm text-gray-500">{c.modalidade}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {c.status === "concluido" ? "Concluída" : "Realizada"}
                      </span>
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
              <Button asChild className="w-full" variant="outline">
                <Link href="/tela-usuario/historico">
                  Ver Histórico Completo
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
