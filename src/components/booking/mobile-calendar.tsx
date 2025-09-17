"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { TimezoneUtils } from "@/utils/timezone";
import { DateTime } from "luxon";

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

type MobileCalendarProps = {
  profissionalNome: string;
  agendaSlots: AgendaSlot[];
  onDateSelect: (date: string, slots: AgendaSlot[]) => void;
  loading?: boolean;
};

export function MobileCalendar({
  profissionalNome,
  agendaSlots,
  onDateSelect,
  loading = false,
}: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(DateTime.now().setZone('America/Sao_Paulo'));

  // Gerar dias do mês atual
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days = [];
    let current = startOfWeek;

    while (current <= endOfWeek) {
      const dateStr = current.toISODate() || current.toFormat('yyyy-MM-dd');
      const slotsForDate = agendaSlots.filter(slot => slot.data === dateStr);
      const availableCount = slotsForDate.filter(slot => slot.disponivel).length;
      
      days.push({
        date: current,
        dateStr,
        isCurrentMonth: current.month === currentDate.month,
        isToday: current.hasSame(DateTime.now().setZone('America/Sao_Paulo'), 'day'),
        isPast: current < DateTime.now().setZone('America/Sao_Paulo').startOf('day'),
        slots: slotsForDate,
        availableCount,
      });
      
      current = current.plus({ days: 1 });
    }

    return days;
  }, [currentDate, agendaSlots]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handlePrevMonth = () => {
    setCurrentDate(prev => prev.minus({ months: 1 }));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => prev.plus({ months: 1 }));
  };

  type CalendarDay = {
    date: DateTime;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    slots: AgendaSlot[];
    availableCount: number;
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth || day.availableCount === 0) return;
    onDateSelect(day.dateStr, day.slots);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agenda - {profissionalNome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center h-64 items-center">
            <p className="text-gray-500">Carregando agenda...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Agenda - {profissionalNome}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-base font-semibold">
            {currentDate.setLocale('pt-BR').toFormat('MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isClickable = !day.isPast && day.isCurrentMonth && day.availableCount > 0;
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={!isClickable}
                className={`
                  relative h-12 text-sm rounded-md transition-colors
                  ${!day.isCurrentMonth 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : day.isPast 
                      ? 'text-gray-400 cursor-not-allowed'
                      : day.availableCount > 0
                        ? 'text-gray-900 hover:bg-green-50 hover:border-green-200 border border-transparent cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                  }
                  ${day.isToday ? 'bg-blue-50 border-blue-200 border' : ''}
                `}
              >
                <span className="block">{day.date.day}</span>
                {day.availableCount > 0 && day.isCurrentMonth && !day.isPast && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
            <span>Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
