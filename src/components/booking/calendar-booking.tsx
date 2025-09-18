"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";
import "@/styles/calendar-mobile.css";
import { TimezoneUtils, formatarDataHora } from "@/utils/timezone";
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
  profissional_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'livre' | 'ocupado' | 'cancelado';
  paciente_id?: string;
  // Campos compatíveis com a interface antiga para não quebrar
  diaSemana?: number;
  horaInicio?: string;
  disponivel?: boolean;
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
  const [currentDate, setCurrentDate] = useState(new Date());

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
      // Buscar slots dos próximos 3 meses para performance usando Luxon
      const hoje = TimezoneUtils.now();
      const dataInicio = TimezoneUtils.extractDate(hoje);
      const dataFim = TimezoneUtils.extractDate(TimezoneUtils.addTime(hoje, 90, 'days'));
      
      const res = await fetch(
        `/api/agenda-slots/${profissionalId}?dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      
      if (res.ok) {
        const slotsFromAPI = await res.json();
        
        // A nova API já retorna slots formatados com Luxon
        const slotsProcessados = (slotsFromAPI || []).map((slot: Record<string, unknown>): AgendaSlot => ({
          id: String(slot.id || ''),
          profissional_id: String(slot.profissional_id || ''),
          data: String(slot.data || ''), // Já convertido para timezone local pela API
          hora_inicio: String(slot.hora_inicio || ''), // Já convertido para timezone local
          hora_fim: String(slot.hora_fim || ''), // Já convertido para timezone local
          status: String(slot.status || 'livre') as 'livre' | 'ocupado' | 'cancelado',
          paciente_id: slot.paciente_id ? String(slot.paciente_id) : undefined,
          // Campos de compatibilidade para não quebrar a interface
          hora: String(slot.hora_inicio || ''),
          horaInicio: String(slot.hora_inicio || ''),
          disponivel: Boolean(slot.disponivel),
          diaSemana: slot.data_hora_inicio ? TimezoneUtils.fromUTC(String(slot.data_hora_inicio)).weekday % 7 : 0, // Luxon weekday (1=segunda) -> JS (0=domingo)
        }));
        
        // Filtrar apenas slots disponíveis
        const slotsDisponiveis = slotsProcessados.filter((slot: AgendaSlot) => slot.disponivel);
        
        setAgendaSlots(slotsDisponiveis);
      }
    } catch (err) {
      console.error('Erro ao buscar agenda:', err);
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

  // Função para verificar se um slot está no passado usando Luxon
  const isSlotInPast = (slot: AgendaSlot) => {
    if (!slot.data || !slot.hora_inicio) return false;

    const slotDateTimeUTC = TimezoneUtils.createDateTime(slot.data, slot.hora_inicio);
    return TimezoneUtils.isPast(slotDateTimeUTC);
  };

  const handleMobileDateSelect = (date: string, slots: AgendaSlot[]) => {
    setSelectedDate(new Date(date + "T00:00:00"));
    setAvailableSlots(slots);
    setIsModalOpen(true);
  };

  const formatDate = (date: Date) => {
    // Converter Date para timestamp UTC e formatar usando Luxon
    const utcTimestamp = TimezoneUtils.toUTC(date.toISOString());
    return TimezoneUtils.formatForDisplay(utcTimestamp, undefined, 'full').replace(/,/, ',');
  };

  // Renderizar calendário mobile ou desktop baseado no tamanho da tela
  if (isMobile) {
    return (
      <div className="w-full font-['Red_Hat_Display']">
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
                  {availableSlots.map((slot: AgendaSlot) => {
                    const isPast = isSlotInPast(slot);
                    return (
                      <Button
                        key={slot.id}
                        variant="outline"
                        className={`h-10 text-xs font-medium ${
                          isPast
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                            : 'hover:bg-green-50 hover:border-green-500'
                        }`}
                        onClick={() => !isPast && handleSlotSelect(slot)}
                        disabled={!slot.disponivel || isPast}
                      >
                        {slot.hora ? slot.hora.slice(0, 5) : "--:--"}
                      </Button>
                    );
                  })}
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
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                toolbar={true}
                showMultiDayTimes={false}
                step={60}
                timeslots={1}
                className="rbc-calendar-desktop"
                style={{
                  height: '100%',
                  width: '100%'
                }}
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
                {availableSlots.map((slot: AgendaSlot) => {
                  const isPast = isSlotInPast(slot);
                  return (
                    <Button
                      key={slot.id}
                      variant="outline"
                      className={`h-10 sm:h-12 text-xs sm:text-sm font-medium ${
                        isPast
                          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                          : 'hover:bg-green-50 hover:border-green-500'
                      }`}
                      onClick={() => !isPast && handleSlotSelect(slot)}
                      disabled={!slot.disponivel || isPast}
                    >
                      {slot.hora ? slot.hora.slice(0, 5) : "--:--"}
                    </Button>
                  );
                })}
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
