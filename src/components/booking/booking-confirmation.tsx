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
  LogIn,
} from "lucide-react";
import moment from "moment";
import "moment/locale/pt-br";
import { useAuth } from "@/features/auth/context/auth-context";
import { PendingBookingManager } from "@/utils/pending-booking";
import { useRouter } from "next/navigation";

moment.locale("pt-br");

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
  onConfirm,
}: BookingConfirmationProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notas, setNotas] = useState("");
  const [modalidade, setModalidade] = useState<Modalidade>("presencial");
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
      const dataHora = `${slot.data}T${horaSlot}:00.000Z`;

      console.log("Tentando criar agendamento:", {
        profissional_id: profissionalId,
        slot_id: slot.id,
        data_consulta: dataHora,
        modalidade,
        notas: notas.trim(),
        codigoEmpresa,
        usuarioAutenticado: !!user,
      });

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

      // Validar código da empresa antes de enviar
      if (!codigoEmpresa.trim()) {
        setError("Código da empresa é obrigatório");
        return;
      }

      // ✅ USAR NOVO MÉTODO: Enviar slot_id para usar o novo sistema
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          slot_id: slot.id, // ✅ Usar slot_id específico
          modalidade,
          notas: notas.trim() || undefined,
          codigo_empresa: codigoEmpresa.trim(),
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
    setModalidade("presencial");
    setCodigoEmpresa("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const formatDateTime = (data: string, hora: string) => {
    const dateTime = moment(`${data} ${hora}`, "YYYY-MM-DD HH:mm");
    return {
      date: dateTime.format("dddd, DD [de] MMMM [de] YYYY"),
      time: dateTime.format("HH:mm"),
    };
  };

  if (!slot) return null;

  const horaParaExibir = slot.hora || slot.hora_inicio || "00:00";
  const { date, time } = formatDateTime(slot.data, horaParaExibir);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg font-['Red_Hat_Display']">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Agendamento Confirmado!
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                Confirmar Agendamento
              </>
            )}
          </DialogTitle>
          <DialogDescription>
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

                {/* Modalidade */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <select
                    id="modalidade"
                    value={modalidade}
                    onChange={(e) =>
                      setModalidade(e.target.value as Modalidade)
                    }
                    className="border rounded px-3 py-2"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                {/* Código da Empresa */}
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
