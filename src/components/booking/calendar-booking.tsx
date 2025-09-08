"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-mobile.css";
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
import { MobileCalendar } from "./mobile-calendar";

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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/profissionais/agenda?profissionalId=${profissionalId}`
      );
      if (res.ok) {
        const data = await res.json();
        
        // Gerar slots para os próximos 6 meses para permitir navegação
        const allSlots: AgendaSlot[] = [];
        const hoje = new Date();
        
        // Para cada slot da configuração
        (data.slots || []).forEach((slot: Record<string, unknown>) => {
          const diaSemana = slot.diaSemana as number;
          const horaInicio = slot.horaInicio as string;
          const disponivel = slot.disponivel as boolean;
          
          // Gerar datas para os próximos 6 meses
          for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
            const targetMonth = new Date(hoje.getFullYear(), hoje.getMonth() + monthOffset, 1);
            
            // Encontrar todas as ocorrências deste dia da semana no mês
            for (let day = 1; day <= 31; day++) {
              const testDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
              
              // Verificar se a data é válida e é o dia da semana correto
              if (testDate.getMonth() === targetMonth.getMonth() && 
                  testDate.getDay() === diaSemana &&
                  testDate >= hoje) {
                
                allSlots.push({
                  id: `${testDate.toISOString().split('T')[0]}-${horaInicio}`,
                  data: testDate.toISOString().split("T")[0],
                  hora: horaInicio,
                  diaSemana,
                  horaInicio,
                  disponivel,
                });
              }
            }
          }
        });
        
        setAgendaSlots(allSlots);
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

  const handleMobileDateSelect = (date: string, slots: AgendaSlot[]) => {
    setSelectedDate(new Date(date + "T00:00:00"));
    setAvailableSlots(slots);
    setIsModalOpen(true);
  };

  const formatDate = (date: Date) =>
    moment(date).format("dddd, DD [de] MMMM [de] YYYY");

  // Renderizar calendário mobile ou desktop baseado no tamanho da tela
  if (isMobile) {
    return (
      <div className="w-full">
        <MobileCalendar
          profissionalNome={profissionalNome}
          agendaSlots={agendaSlots}
          onDateSelect={handleMobileDateSelect}
          loading={loading}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[95vw] mx-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Horários Disponíveis
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedDate && formatDate(selectedDate)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant="outline"
                      className="h-10 text-xs hover:bg-green-50 hover:border-green-500 font-medium"
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.disponivel}
                    >
                      {slot.hora ? slot.hora.slice(0, 5) : "--:--"}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">
                    Nenhum horário disponível para esta data
                  </p>
                </div>
              )}
              <div className="pt-3 border-t">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-10"
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

  // Calendário desktop (react-big-calendar)
  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex justify-between pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agenda - {profissionalNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center h-64 items-center">
              <p className="text-gray-500">Carregando agenda...</p>
            </div>
          ) : (
            <div className="h-[500px] w-full overflow-hidden">
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
                className="rbc-calendar-desktop"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Horários Disponíveis
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedDate && formatDate(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="h-10 sm:h-12 text-xs sm:text-sm hover:bg-green-50 hover:border-green-500 font-medium"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.disponivel}
                  >
                    {slot.hora ? slot.hora.slice(0, 5) : "--:--"}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-gray-500 text-sm">
                  Nenhum horário disponível para esta data
                </p>
              </div>
            )}
            <div className="pt-3 sm:pt-4 border-t">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full h-10 sm:h-11"
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
