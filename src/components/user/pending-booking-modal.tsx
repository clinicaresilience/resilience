"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, CheckCircle, X } from "lucide-react";
import { PendingBookingManager, PendingBookingData } from "@/utils/pending-booking";

interface PendingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pendingData: PendingBookingData) => void;
}

export function PendingBookingModal({
  isOpen,
  onClose,
  onConfirm,
}: PendingBookingModalProps) {
  const [pendingData, setPendingData] = useState<PendingBookingData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = PendingBookingManager.get();
      setPendingData(data);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!pendingData) return;

    setLoading(true);
    try {
      await onConfirm(pendingData);
      PendingBookingManager.clear();
      onClose();
    } catch (error) {
      console.error("Erro ao confirmar agendamento pendente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    PendingBookingManager.clear();
    onClose();
  };

  if (!pendingData) return null;

  const { date, time, profissional } = PendingBookingManager.formatPendingBooking(pendingData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Agendamento Pendente
          </DialogTitle>
          <DialogDescription>
            Você iniciou um agendamento antes de fazer login. Deseja continuar?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm">{profissional}</p>
                <p className="text-xs text-gray-500">Profissional</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-sm">{date}</p>
                <p className="text-xs text-gray-500">Data</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="font-medium text-sm">{time}</p>
                <p className="text-xs text-gray-500">Horário</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Modalidade: <span className="font-medium capitalize">{pendingData.modalidade}</span></p>
            <p>Código da Empresa: <span className="font-medium">{pendingData.codigoEmpresa}</span></p>
            {pendingData.notas && (
              <p>Notas: <span className="font-medium">{pendingData.notas}</span></p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Dispensar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continuar Agendamento
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
