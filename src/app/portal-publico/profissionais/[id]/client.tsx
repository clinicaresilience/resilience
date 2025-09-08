"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarBooking } from "@/components/booking/calendar-booking";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Lock } from "lucide-react";
import Link from "next/link";
import { PendingBookingManager } from "@/utils/pending-booking";
import { useRouter } from "next/navigation";

type Profissional = {
  id: string;
  nome: string;
  informacoes_adicionais: {
    crp: string;
    especialidade: string;
    descricao: string;
    foto: string;
  };
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
        const response = await fetch('/api/auth/user');
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleSlotSelect = (slot: AgendaSlot) => {
    console.log('Slot selecionado:', slot);
    console.log('Usuário autenticado:', isAuthenticated);
    
    setSelectedSlot(slot);
    
    if (!isAuthenticated) {
      // Salvar dados no localStorage antes de mostrar o modal de login
      console.log('Salvando dados no localStorage...');
      PendingBookingManager.save({
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        slot: {
          id: slot.id,
          data: slot.data || '',
          hora: slot.hora || slot.horaInicio || '',
          disponivel: slot.disponivel,
        },
        modalidade: 'presencial', // Valor padrão
        codigoEmpresa: '', // Será preenchido no modal de confirmação
        notas: undefined,
      });
      
      setShowLoginModal(true);
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleBookingConfirm = (agendamento: { id: string; usuarioId: string; profissionalId: string; dataISO: string; status: string }) => {
    console.log('Agendamento criado:', agendamento);
    setShowConfirmation(false);
    setSelectedSlot(null);
    // Redirecionar para página de agendamentos
    window.location.href = '/tela-usuario/agendamentos';
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsAuthenticated(true);
    if (selectedSlot) {
      setShowConfirmation(true);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6 pt-20">
      <Card className="w-full max-w-5xl bg-white shadow-md rounded-2xl p-8">
        {/* Cabeçalho do Profissional */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Foto */}
          {profissional.informacoes_adicionais?.foto && (
            <div className="w-32 h-32 -mt-12 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
              <img
                src={profissional.informacoes_adicionais.foto}
                alt={`Foto de ${profissional.nome}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {profissional.nome}
          </h1>
          <p className="text-lg text-azul-escuro mb-1">
            {profissional.informacoes_adicionais?.especialidade}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            CRP {profissional.informacoes_adicionais?.crp}
          </p>

          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
            {profissional.informacoes_adicionais?.descricao}
          </p>
        </div>

        {/* Calendário de Agendamento - Sempre Visível */}
        <div className="mt-8">
          <CalendarBooking
            profissionalId={profissional.id}
            profissionalNome={profissional.nome}
            onBookingSelect={handleSlotSelect}
          />
        </div>
      </Card>

      {/* Modal de Login/Cadastro */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso Necessário
            </DialogTitle>
            <DialogDescription>
              Para fazer um agendamento, você precisa estar logado no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-4">
              <User className="h-16 w-16 mx-auto mb-4 text-azul-escuro" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Faça login ou crie sua conta
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                É rápido e fácil! Após o login, você poderá agendar sua consulta.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Fazer Login
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/cadastro">
                  Criar Conta
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowLoginModal(false)}
                className="w-full"
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
        slot={selectedSlot ? {
          id: selectedSlot.id,
          data: selectedSlot.data || '',
          hora: selectedSlot.hora || selectedSlot.horaInicio || '',
          disponivel: selectedSlot.disponivel,
        } : null}
        profissionalNome={profissional.nome}
        profissionalId={profissional.id}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}
