'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AgendamentoData {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  dataISO: string;
  numero_reagendamentos?: number;
}

interface ModalReagendarAgendamentoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agendamento: AgendamentoData;
}

interface Slot {
  id: string;
  data: string;
  hora: string;
  data_hora_inicio: string;
  modalidade: string;
  disponivel: boolean;
}

export function ModalReagendarAgendamento({
  open,
  onClose,
  onSuccess,
  agendamento,
}: ModalReagendarAgendamentoProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const reagendamentosRestantes = 3 - (agendamento.numero_reagendamentos || 0);
  const podeReagendar = reagendamentosRestantes > 0;

  // Buscar slots disponíveis quando uma data for selecionada
  useEffect(() => {
    if (selectedDate && agendamento.profissionalId) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, agendamento.profissionalId]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    try {
      // Converter data para formato YYYY-MM-DD mantendo timezone local
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dataFormatada = `${year}-${month}-${day}`;

      console.log('Buscando slots para data:', dataFormatada);

      const response = await fetch(
        `/api/agenda-slots/${agendamento.profissionalId}?dataInicio=${dataFormatada}&dataFim=${dataFormatada}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis');
      }

      const slots = await response.json();

      console.log('Slots recebidos da API:', slots.length);
      console.log('Primeiro slot (exemplo):', slots[0]);

      // Filtrar apenas slots da data selecionada e disponíveis
      const slotsDodia = slots.filter((slot: Slot) => {
        const slotDisponivel = slot.disponivel === true || slot.disponivel === undefined;
        const mesmaData = slot.data === dataFormatada;

        console.log('Slot:', {
          id: slot.id,
          data: slot.data,
          hora: slot.hora,
          disponivel: slot.disponivel,
          mesmaData,
          slotDisponivel
        });

        return mesmaData && slotDisponivel;
      });

      console.log('Slots filtrados:', slotsDodia.length);

      setAvailableSlots(slotsDodia);

      if (slotsDodia.length === 0) {
        toast.info('Não há horários disponíveis para esta data');
      }
    } catch (error) {
      console.error('Erro ao buscar slots:', error);
      toast.error('Erro ao buscar horários disponíveis');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReagendar = async () => {
    if (!selectedSlot) {
      toast.error('Selecione um horário');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/agendamentos/${agendamento.id}/reagendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nova_data_consulta: selectedSlot.data_hora_inicio,
          motivo: motivo || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reagendar');
      }

      toast.success(data.message || 'Agendamento reagendado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao reagendar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setMotivo('');
    setAvailableSlots([]);
    onClose();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Reagendar Consulta
          </DialogTitle>
          <DialogDescription className="text-sm">
            {podeReagendar ? (
              <>
                Você pode reagendar este agendamento mais <strong>{reagendamentosRestantes}</strong> vez(es)
              </>
            ) : (
              <span className="text-destructive font-semibold">
                Limite de reagendamentos atingido (3/3)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!podeReagendar ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <p className="text-center text-muted-foreground">
              Você já reagendou este agendamento 3 vezes.
              <br />
              Para fazer um novo agendamento, cancele este e crie um novo.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 py-4">
            {/* Info do agendamento atual */}
            <div className="bg-muted p-3 sm:p-4 rounded-lg space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Agendamento atual</p>
              <p className="font-semibold">{agendamento.profissionalNome}</p>
              <p className="text-sm flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(agendamento.dataISO)}
              </p>
            </div>

            {/* Seleção de nova data */}
            <div className="space-y-2">
              <Label>Selecione a nova data</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* Seleção de horário */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>Selecione o horário</Label>
                {loadingSlots ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando horários...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum horário disponível para esta data
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                        className="flex items-center gap-1 text-xs sm:text-sm"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock className="h-3 w-3" />
                        {slot.hora}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Motivo (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do reagendamento (opcional)</Label>
              <Textarea
                id="motivo"
                placeholder="Ex: Compromisso inesperado, viagem, etc."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          {podeReagendar && (
            <Button
              onClick={handleReagendar}
              disabled={!selectedSlot || loading}
            >
              {loading ? 'Reagendando...' : 'Confirmar Reagendamento'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
