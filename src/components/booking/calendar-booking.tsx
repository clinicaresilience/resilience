"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/auth-context";
import { PendingBookingManager } from "@/utils/pending-booking";
import { useRouter } from "next/navigation";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Nenhum horário disponível neste período.",
  showMore: (total: number) => `+ Ver mais (${total})`,
};

type AgendaSlot = {
  id: string;
  diaSemana: number;
  horaInicio: string;
  disponivel: boolean;
  data?: string;
  hora?: string;
};

type CalendarBookingProps = {
  profissionalId: string;
  profissionalNome: string;
  onBookingSelect?: (slot: AgendaSlot) => void;
};

export function CalendarBooking({
  profissionalId,
  profissionalNome,
  onBookingSelect,
}: CalendarBookingProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [agendaSlots, setAgendaSlots] = useState<AgendaSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AgendaSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/profissionais/agenda?profissionalId=${profissionalId}`
      );
      if (res.ok) {
        const data = await res.json();
        const slots: AgendaSlot[] = (data.slots || []).map((slot: Record<string, unknown>) => {
          // Calcular a próxima data do dia da semana
          const hoje = new Date();
          const diaSemanaAtual = hoje.getDay();
          let diff = slot.diaSemana - diaSemanaAtual;
          if (diff < 0) diff += 7;
          const dataSlot = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate() + diff
          );

          return {
            ...slot,
            id: `${slot.diaSemana}-${slot.horaInicio}`,
            data: dataSlot.toISOString().split("T")[0],
            hora: slot.horaInicio, // <-- adicionamos hora aqui
          };
        });
        setAgendaSlots(slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [profissionalId]);

  const events = useMemo(() => {
    const slotsByDate = agendaSlots.reduce((acc, slot) => {
      if (!acc[slot.data!]) acc[slot.data!] = [];
      acc[slot.data!].push(slot);
      return acc;
    }, {} as Record<string, AgendaSlot[]>);

    return Object.entries(slotsByDate).map(([date, slots]) => {
      const availableCount = slots.filter((slot) => slot.disponivel).length;

      return {
        id: date,
        title: `${availableCount} horário(s) disponível(is)`,
        start: new Date(date + "T00:00:00"),
        end: new Date(date + "T00:00:00"),
        allDay: true,
        resource: { date, slotsCount: availableCount, slots },
      };
    });
  }, [agendaSlots]);

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#10b981",
      borderColor: "#059669",
      color: "white",
      border: `2px solid #059669`,
      borderRadius: "6px",
      fontSize: "11px",
      padding: "2px 4px",
    },
  });

  const handleSelectEvent = (event: { resource: { date: string } }) => {
    const date = event.resource.date;
    setSelectedDate(new Date(date + "T00:00:00"));
    const slotsForDate = agendaSlots.filter((s) => s.data === date);
    setAvailableSlots(slotsForDate);
    setIsModalOpen(true);
  };

  const handleSlotSelect = (slot: AgendaSlot) => {
    setIsModalOpen(false);
    if (onBookingSelect) onBookingSelect(slot);
  };

  const formatDate = (date: Date) =>
    moment(date).format("dddd, DD [de] MMMM [de] YYYY");

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex justify-between pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agenda - {profissionalNome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center h-64 items-center">
              <p className="text-gray-500">Carregando agenda...</p>
            </div>
          ) : (
            <div style={{ height: "500px" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={["month"]}
                defaultView="month"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Disponíveis
            </DialogTitle>
            <DialogDescription>
              {selectedDate && formatDate(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="h-12 text-sm hover:bg-green-50 hover:border-green-500"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.disponivel}
                  >
                    {slot.hora ? slot.hora.slice(0, 5) : "--:--"}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  Nenhum horário disponível para esta data
                </p>
              </div>
            )}
            <div className="pt-4 border-t">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full"
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
