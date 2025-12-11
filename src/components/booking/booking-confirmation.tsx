"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Monitor,
} from "lucide-react";
import { TimezoneUtils } from "@/utils/timezone";
import { useAuth } from "@/features/auth/context/auth-context";
import { PendingBookingManager } from "@/utils/pending-booking";
import { useRouter } from "next/navigation";

type AgendaSlot = {
  id: string;
  profissional_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: "livre" | "ocupado" | "cancelado";
  paciente_id?: string;
  // Campos compatíveis com a interface antiga para não quebrar
  diaSemana?: number;
  horaInicio?: string;
  disponivel?: boolean;
  hora?: string;
};

type Modalidade = "presencial" | "online";

type BookingConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  slot: AgendaSlot | null;
  profissionalNome: string;
  profissionalId: string;
  tipoPaciente?: 'fisica' | 'juridica' | null;
  compraPacoteId?: string | null;
  onConfirm?: (agendamento: {
    id: string;
    usuarioId: string;
    profissionalId: string;
    dataISO: string;
    status: string;
    modalidade: Modalidade;
  }) => void;
};

export function BookingConfirmation({
  isOpen,
  onClose,
  slot,
  profissionalNome,
  profissionalId,
  tipoPaciente,
  compraPacoteId,
  onConfirm,
}: BookingConfirmationProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notas, setNotas] = useState("");
  const modalidade: Modalidade = "online"; // Sempre online para agendamentos via slots
  const [codigoEmpresa, setCodigoEmpresa] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!slot) return;

    try {
      setLoading(true);
      setError("");

      // Usar o horário correto baseado na nova interface
      const horaSlot = slot.hora || slot.hora_inicio || "00:00";

      // Se o usuário não estiver logado, salvar dados e redirecionar para login
      if (!user) {
        console.log("Usuário não autenticado, salvando dados pendentes...");

        PendingBookingManager.save({
          profissionalId,
          profissionalNome,
          slot: {
            id: slot.id,
            data: slot.data,
            hora: horaSlot,
            disponivel: slot.disponivel ?? slot.status === "livre",
          },
          modalidade,
          codigoEmpresa,
          notas: notas.trim() || undefined,
        });

        console.log(
          "Dados salvos no localStorage, redirecionando para login..."
        );
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);

        return;
      }

      // Validar código da empresa apenas para pessoa jurídica
      if (tipoPaciente === 'juridica' && !codigoEmpresa.trim()) {
        setError("Código da empresa é obrigatório");
        return;
      }

      // ✅ USAR NOVO MÉTODO: Enviar slot_id para usar o novo sistema
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          slot_id: slot.id,
          modalidade,
          notas: notas.trim() || undefined,
          codigo_empresa: tipoPaciente === 'juridica' ? codigoEmpresa.trim() : undefined,
          tipo_paciente: tipoPaciente || 'juridica',
          compra_pacote_id: compraPacoteId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setSuccess(true);

        if (onConfirm) onConfirm(data.data);

        setTimeout(() => handleClose(), 3000);
      } else {
        const errorData = await response.json();
        console.error("Erro na API:", errorData);
        setError(errorData.error || "Erro ao criar agendamento");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNotas("");
    setCodigoEmpresa("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const formatDateTime = (data: string, hora: string) => {
    const utcDateTime = TimezoneUtils.createDateTime(data, hora);
    return {
      date: TimezoneUtils.formatForDisplay(
        utcDateTime,
        undefined,
        "full"
      ).replace(/,.*,/, ","),
      time: TimezoneUtils.formatForDisplay(utcDateTime, undefined, "time"),
    };
  };

  if (!slot) return null;

  const horaParaExibir = slot.hora || slot.hora_inicio || "00:00";
  const { date, time } = formatDateTime(slot.data, horaParaExibir);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg font-['Red_Hat_Display'] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            {success ? (
              <>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Agendamento Confirmado!
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Confirmar Agendamento
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {success
              ? "Seu agendamento foi criado com sucesso!"
              : "Revise os detalhes do seu agendamento antes de confirmar"}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Agendamento Realizado!
            </h3>
            <p className="text-sm text-gray-600">
              Você receberá uma confirmação por email em breve.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Detalhes do Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{profissionalNome}</p>
                    <p className="text-sm text-gray-500">Profissional</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">{date}</p>
                    <p className="text-sm text-gray-500">Data</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">{time}</p>
                    <p className="text-sm text-gray-500">Horário</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Clínica Resilience</p>
                    <p className="text-sm text-gray-500">Local</p>
                  </div>
                </div>

                {/* Modalidade - Sempre Online para agendamentos via slots */}
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Online</p>
                    <p className="text-sm text-gray-500">Modalidade</p>
                  </div>
                </div>

                {/* Código da Empresa - Apenas para pessoa jurídica */}
                {tipoPaciente === 'juridica' && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="codigoEmpresa">Código da Empresa *</Label>
                    <input
                      id="codigoEmpresa"
                      type="text"
                      placeholder="Digite o código da empresa"
                      value={codigoEmpresa}
                      onChange={(e) => setCodigoEmpresa(e.target.value)}
                      className="border rounded px-3 py-2"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Campo obrigatório para agendamentos corporativos
                    </p>
                    {codigoEmpresa.trim().length === 0 && (
                      <p className="text-xs text-red-600">
                        O código da empresa é obrigatório
                      </p>
                    )}
                  </div>
                )}

                {/* Info para pessoa física */}
                {tipoPaciente === 'fisica' && compraPacoteId && (
                  <div className="flex flex-col gap-1 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">
                      Pacote de sessões ativo
                    </p>
                    <p className="text-xs text-green-600">
                      Você está usando uma sessão do seu pacote pré-pago
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notas">Observações (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Adicione observações sobre a consulta, sintomas ou informações relevantes..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">Máximo 500 caracteres</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Confirmando..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
