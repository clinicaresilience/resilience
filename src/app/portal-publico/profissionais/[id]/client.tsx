"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarBooking } from "@/components/booking/calendar-booking";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Lock } from "lucide-react";
import Link from "next/link";
import { PendingBookingManager } from "@/utils/pending-booking";

type Profissional = {
  id: string;
  nome: string;
  avatar_url?: string;
  bio?: string;
  especialidade?: string;
  area?: string;
  crp?: string;
};

type Agenda = {
  id: string;
  data: string;
  hora: string;
  disponivel: boolean;
};

type AgendaSlot = {
  id: string;
  data?: string;
  hora?: string;
  disponivel: boolean;
  diaSemana?: number;
  horaInicio?: string;
};

export function PerfilProfissionalClient({
  profissional,
  agendas,
}: {
  profissional: Profissional;
  agendas: Agenda[];
}) {
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user");
        // 401 é esperado quando não logado - não é erro
        setIsAuthenticated(response.ok);
      } catch (error) {
        // Ignorar completamente erros de autenticação no portal público
        setIsAuthenticated(false);
      }
    };
    
    // Executar silenciosamente
    checkAuth().catch(() => {
      // Suprime qualquer erro de rede/autenticação
      setIsAuthenticated(false);
    });
  }, []);

  const handleSlotSelect = (slot: AgendaSlot) => {
    setSelectedSlot(slot);

    if (!isAuthenticated) {
      // Salvar dados no localStorage antes de mostrar o modal de login
      console.log("Salvando dados no localStorage...");
      PendingBookingManager.save({
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        slot: {
          id: slot.id,
          data: slot.data || "",
          hora: slot.hora || slot.horaInicio || "",
          disponivel: slot.disponivel,
        },
        modalidade: "presencial", // Valor padrão
        codigoEmpresa: "", // Será preenchido no modal de confirmação
        notas: undefined,
      });

      setShowLoginModal(true);
      return;
    }

    setShowConfirmation(true);
  };

  const handleBookingConfirm = (agendamento: {
    id: string;
    usuarioId: string;
    profissionalId: string;
    dataISO: string;
    status: string;
  }) => {
    setShowConfirmation(false);
    setSelectedSlot(null);
    // Redirecionar para página de agendamentos
    window.location.href = "/tela-usuario/agendamentos";
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsAuthenticated(true);
    if (selectedSlot) {
      setShowConfirmation(true);
    }
  };

  return (
    <div className="flex font-['Red_Hat_Display'] flex-col items-center min-h-screen bg-gradient-to-br  from-slate-50 via-[#edfffe]/30 to-[#f5b26b]/5 p-6 ">
      <Card className="font-['Red_Hat_Display'] w-full mt-24 max-w-5xl bg-white/95 backdrop-blur-xl shadow-xl shadow-[#02b1aa]/10 border border-white/50 rounded-3xl p-8 md:p-10">
        {/* Cabeçalho do Profissional */}
        <div className="flex flex-col items-center text-center mb-10">
          {/* Foto */}
          {profissional.avatar_url && (
            <div className="relative -mt-16 mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-full blur-lg opacity-50"></div>
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white/90 backdrop-blur-sm">
                <img
                  src={profissional.avatar_url}
                  alt={`Foto de ${profissional.nome}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight mb-3">
            {profissional.nome}
          </h1>
          <p className="text-lg md:text-xl text-[#02b1aa] font-semibold mb-2">
            {profissional.especialidade || "Psicólogo"}
          </p>
          <p className="text-sm md:text-base text-[#029fdf] font-medium mb-6 px-4 py-2 bg-gradient-to-r from-[#edfffe] to-blue-50/50 rounded-full border border-[#02b1aa]/20">
            {profissional.crp
              ? `CRP ${profissional.crp}`
              : "Profissional Certificado"}
          </p>

          <div className="max-w-3xl">
            <p className="text-gray-700 text-base leading-relaxed bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              {profissional.bio ||
                "Profissional experiente em sua área de atuação."}
            </p>
          </div>
        </div>

        {/* Calendário de Agendamento - Sempre Visível */}
        <div className="mt-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight mb-2">
              Agendar Consulta
            </h2>
            <p className="text-gray-600 text-base">
              Escolha uma data e horário disponíveis para sua sessão
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#edfffe]/50 to-blue-50/30 rounded-2xl p-6 border border-white/30 shadow-lg backdrop-blur-sm">
            <CalendarBooking
              profissionalId={profissional.id}
              profissionalNome={profissional.nome}
              onBookingSelect={handleSlotSelect}
            />
          </div>
        </div>
      </Card>

      {/* Modal de Login/Cadastro */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-r from-[#02b1aa]/20 to-[#029fdf]/20 rounded-xl">
                <Lock className="h-6 w-6 text-[#02b1aa]" />
              </div>
              <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                Acesso Necessário
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Para fazer um agendamento, você precisa estar logado no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-full blur-lg opacity-50"></div>
                <div className="relative p-4 bg-white/90 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                  <User className="h-12 w-12 text-[#02b1aa]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Faça login ou crie sua conta
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                É rápido e fácil! Após o login, você poderá agendar sua
                consulta.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                asChild
                className="w-full h-12 text-white font-semibold text-base rounded-2xl bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] hover:from-[#02b1aa]/90 hover:via-[#029fdf]/90 hover:to-[#01c2e3]/90 shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl border-0"
              >
                <Link href="/auth/login">Fazer Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-[#02b1aa] font-semibold text-base rounded-2xl border-2 border-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href="/auth/cadastro">Criar Conta</Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowLoginModal(false)}
                className="w-full h-10 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Agendamento */}
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setSelectedSlot(null);
        }}
        slot={
          selectedSlot
            ? {
                id: selectedSlot.id,
                data: selectedSlot.data || "",
                hora: selectedSlot.hora || selectedSlot.horaInicio || "",
                disponivel: selectedSlot.disponivel,
              }
            : null
        }
        profissionalNome={profissional.nome}
        profissionalId={profissional.id}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}
