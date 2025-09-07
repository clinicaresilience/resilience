"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Configurar moment para português
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

// Mensagens em português para o calendário
const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Nenhum horário disponível neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`
}

type AgendaSlot = {
  id: string
  data: string
  hora: string
  disponivel: boolean
}

type CalendarBookingProps = {
  profissionalId: string
  profissionalNome: string
  onBookingSelect?: (slot: AgendaSlot) => void
}

export function CalendarBooking({ 
  profissionalId, 
  profissionalNome,
  onBookingSelect 
}: CalendarBookingProps) {
  const [agendaSlots, setAgendaSlots] = useState<AgendaSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AgendaSlot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Buscar slots disponíveis do profissional
  const fetchAgendaSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agenda-slots/${profissionalId}`)
      if (response.ok) {
        const data = await response.json()
        setAgendaSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Erro ao buscar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar slots para uma data específica
  const fetchSlotsForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/agenda-slots/${profissionalId}?data=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error)
      setAvailableSlots([])
    }
  }

  // Carregar slots quando o componente montar
  useEffect(() => {
    fetchAgendaSlots()
  }, [profissionalId])

  // Converter slots para eventos do calendário (apenas para mostrar dias disponíveis)
  const events = useMemo(() => {
    // Agrupar slots por data
    const slotsByDate = agendaSlots.reduce((acc, slot) => {
      if (!acc[slot.data]) {
        acc[slot.data] = []
      }
      acc[slot.data].push(slot)
      return acc
    }, {} as Record<string, AgendaSlot[]>)

    // Criar eventos para cada data que tem slots disponíveis
    return Object.entries(slotsByDate).map(([date, slots]) => {
      const eventDate = new Date(date + 'T00:00:00')
      return {
        id: date,
        title: `${slots.length} horário(s) disponível(is)`,
        start: eventDate,
        end: eventDate,
        allDay: true,
        resource: {
          date,
          slotsCount: slots.length,
          slots
        }
      }
    })
  }, [agendaSlots])

  // Função para estilizar eventos (dias disponíveis)
  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
        color: 'white',
        border: `2px solid #059669`,
        borderRadius: '6px',
        fontSize: '11px',
        padding: '2px 4px'
      }
    }
  }

  // Função chamada quando um dia é clicado
  const handleSelectEvent = async (event: { resource: { date: string } }) => {
    const date = event.resource.date
    setSelectedDate(new Date(date + 'T00:00:00'))
    await fetchSlotsForDate(date)
    setIsModalOpen(true)
  }

  // Função para selecionar um horário
  const handleSlotSelect = (slot: AgendaSlot) => {
    setIsModalOpen(false)
    if (onBookingSelect) {
      onBookingSelect(slot)
    }
  }

  // Função para formatar data
  const formatDate = (date: Date) => {
    return moment(date).format('dddd, DD [de] MMMM [de] YYYY')
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agenda - {profissionalNome}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Horários Disponíveis</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Carregando agenda...</p>
            </div>
          ) : (
            <div style={{ height: '500px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
                culture="pt-BR"
                formats={{
                  monthHeaderFormat: 'MMMM YYYY',
                }}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              />
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>• Clique nos dias destacados em verde para ver os horários disponíveis</p>
            <p>• Selecione um horário para fazer seu agendamento</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Seleção de Horários */}
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
                    {slot.hora.slice(0, 5)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhum horário disponível para esta data</p>
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
  )
}
