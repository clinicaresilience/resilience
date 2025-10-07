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
import { PatientTypeModal, TipoPaciente } from "@/components/patient-type-modal";
import { PackageSelector } from "@/components/package-selector";
import { MercadoPagoCheckout } from "@/components/mercadopago-checkout";

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

  // Estados para o novo fluxo de pessoa física
  const [showPatientTypeModal, setShowPatientTypeModal] = useState(false);
  const [tipoPaciente, setTipoPaciente] = useState<TipoPaciente | null>(null);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showFirstSlotSelector, setShowFirstSlotSelector] = useState(false);
  const [selectedFirstSlot, setSelectedFirstSlot] = useState<{
    data: string;
    slot_id: string;
    hora: string;
  } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [compraPacoteId, setCompraPacoteId] = useState<string | null>(null);

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

  // Iniciar fluxo de agendamento - mostrar modal de tipo de paciente
  const handleIniciarAgendamento = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowPatientTypeModal(true);
  };

  // Handler quando usuário seleciona tipo de paciente
  const handlePatientTypeSelect = (tipo: TipoPaciente) => {
    setTipoPaciente(tipo);
    setShowPatientTypeModal(false);

    if (tipo === 'fisica') {
      // Pessoa física: mostrar seletor de pacotes
      setShowPackageSelector(true);
    } else {
      // Pessoa jurídica: fluxo normal (já está autenticado, vai direto para calendário)
      // O calendário já está visível, usuário só precisa selecionar horário
    }
  };

  // Handler quando usuário seleciona pacote
  const handlePackageSelect = (pacote: any) => {
    setSelectedPackage(pacote);
    setShowPackageSelector(false);
    // NOVO: Mostrar seletor de primeiro horário antes do checkout
    setShowFirstSlotSelector(true);
  };

  // Handler quando usuário seleciona o primeiro horário
  const handleFirstSlotSelect = (slot: AgendaSlot) => {
    const dataHoraInicio = slot.data_hora_inicio ||
                          (slot.data && slot.hora ? `${slot.data}T${slot.hora}` : '');

    setSelectedFirstSlot({
      data: dataHoraInicio,
      slot_id: slot.id,
      hora: slot.hora || slot.hora_inicio || slot.horaInicio || '',
    });
    setShowFirstSlotSelector(false);
    // Agora sim vai para checkout
    setShowCheckout(true);
  };

  // Handler quando pagamento é bem-sucedido
  const handleCheckoutSuccess = (compraId: string) => {
    setCompraPacoteId(compraId);
    setShowCheckout(false);
    // Usuário já pagou, agora pode selecionar horário no calendário
  };

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
        modalidade: "presencial",
        codigoEmpresa: "",
        notas: undefined,
      });

      setShowLoginModal(true);
      return;
    }

    // Neste ponto, tipoPaciente já foi selecionado (calendário só aparece após seleção)

    // Se for pessoa física e não tiver compra de pacote, redirecionar para seleção
    if (tipoPaciente === 'fisica' && !compraPacoteId) {
      setShowPackageSelector(true);
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
    <div className="flex font-['Red_Hat_Display'] flex-col items-center min-h-screen bg-gradient-to-br  from-slate-50 via-[#edfffe]/30 to-[#f5b26b]/5 p-4 md:p-6">
      <Card className="font-['Red_Hat_Display'] w-full mt-20 md:mt-24 max-w-5xl bg-white/95 backdrop-blur-xl shadow-xl shadow-[#02b1aa]/10 border border-white/50 rounded-3xl p-4 md:p-6 lg:p-8 xl:p-10">
        {/* Cabeçalho do Profissional */}
        <div className="flex flex-col items-center text-center mb-6 md:mb-10">
          {/* Foto */}
          {profissional.avatar_url && (
            <div className="relative -mt-12 md:-mt-14 lg:-mt-16 mb-4 md:mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-full blur-lg opacity-50"></div>
              <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white/90 backdrop-blur-sm">
                <img
                  src={profissional.avatar_url}
                  alt={`Foto de ${profissional.nome}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight mb-2 md:mb-3 px-4">
            {profissional.nome}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-[#02b1aa] font-semibold mb-2">
            {profissional.especialidade || "Psicólogo"}
          </p>
          <p className="text-xs md:text-sm lg:text-base text-[#029fdf] font-medium mb-4 md:mb-6 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#edfffe] to-blue-50/50 rounded-full border border-[#02b1aa]/20">
            {profissional.crp
              ? `CRP ${profissional.crp}`
              : "Profissional Certificado"}
          </p>

          <div className="max-w-3xl">
            <p className="text-gray-700 text-sm md:text-base leading-relaxed bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/30 shadow-lg">
              {profissional.bio ||
                "Profissional experiente em sua área de atuação."}
            </p>
          </div>
        </div>

        {/* Botão Agendar Consulta ou Calendário */}
        <div className="mt-6 md:mt-10">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight mb-2 px-4">
              Agendar Consulta
            </h2>
            <p className="text-gray-600 text-sm md:text-base px-4">
              {!tipoPaciente
                ? "Clique no botão abaixo para iniciar seu agendamento"
                : "Escolha uma data e horário disponíveis para sua sessão"}
            </p>
          </div>

          {!tipoPaciente ? (
            // Botão para iniciar agendamento
            <div className="flex justify-center px-4">
              <Button
                onClick={handleIniciarAgendamento}
                size="lg"
                className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] hover:from-[#02b1aa]/90 hover:via-[#029fdf]/90 hover:to-[#01c2e3]/90 shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl border-0 transition-all duration-300 w-full md:w-auto"
              >
                Ver Agenda e Agendar
              </Button>
            </div>
          ) : (
            // Calendário (só aparece depois de selecionar tipo)
            <div className="bg-gradient-to-r from-[#edfffe]/50 to-blue-50/30 rounded-2xl p-4 md:p-6 border border-white/30 shadow-lg backdrop-blur-sm">
              <CalendarBooking
                profissionalId={profissional.id}
                profissionalNome={profissional.nome}
                onBookingSelect={handleSlotSelect}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Login/Cadastro */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#02b1aa]/20 to-[#029fdf]/20 rounded-xl">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-[#02b1aa]" />
              </div>
              <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                Acesso Necessário
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Para fazer um agendamento, você precisa estar logado no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-4 sm:py-6">
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-full blur-lg opacity-50"></div>
                <div className="relative p-3 sm:p-4 bg-white/90 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-[#02b1aa]" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Faça login ou crie sua conta
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
                É rápido e fácil! Após o login, você poderá agendar sua
                consulta.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                asChild
                className="w-full h-11 sm:h-12 text-white font-semibold text-sm sm:text-base rounded-2xl bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] hover:from-[#02b1aa]/90 hover:via-[#029fdf]/90 hover:to-[#01c2e3]/90 shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl border-0"
              >
                <Link href="/auth/login">Fazer Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 sm:h-12 text-[#02b1aa] font-semibold text-sm sm:text-base rounded-2xl border-2 border-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href="/auth/cadastro">Criar Conta</Link>
              </Button>
            </div>

            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowLoginModal(false)}
                className="w-full h-9 sm:h-10 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Tipo de Paciente */}
      <PatientTypeModal
        open={showPatientTypeModal}
        onClose={() => setShowPatientTypeModal(false)}
        onSelect={handlePatientTypeSelect}
      />

      {/* Modal de Seleção de Pacote */}
      <Dialog open={showPackageSelector} onOpenChange={setShowPackageSelector}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <PackageSelector
            profissionalId={profissional.id}
            onSelectPackage={handlePackageSelect}
            onCancel={() => {
              setShowPackageSelector(false);
              setTipoPaciente(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção do Primeiro Horário */}
      <Dialog open={showFirstSlotSelector} onOpenChange={setShowFirstSlotSelector}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Escolha o horário da primeira sessão</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {selectedPackage && (
                <span>
                  Você selecionou o pacote de <strong>{selectedPackage.quantidade_sessoes} sessões</strong>.
                  <br />
                  As demais sessões serão agendadas automaticamente toda semana no mesmo horário.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 sm:py-4">
            <CalendarBooking
              profissionalId={profissional.id}
              profissionalNome={profissional.nome}
              onBookingSelect={handleFirstSlotSelect}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowFirstSlotSelector(false);
                setShowPackageSelector(true);
              }}
              className="w-full sm:w-auto"
            >
              Voltar aos Pacotes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Checkout Mercado Pago */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-lg">
          {selectedPackage && selectedFirstSlot && (
            <MercadoPagoCheckout
              pacote={selectedPackage}
              profissionalId={profissional.id}
              primeiroHorario={selectedFirstSlot}
              modalidade="online"
              onSuccess={handleCheckoutSuccess}
              onCancel={() => {
                setShowCheckout(false);
                setShowFirstSlotSelector(true);
              }}
            />
          )}
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
        tipoPaciente={tipoPaciente}
        compraPacoteId={compraPacoteId}
      />
    </div>
  );
}
