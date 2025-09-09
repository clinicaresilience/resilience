"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'moment-timezone'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User, MapPin, Phone, Mail, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import '../../styles/calendar.css'

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
  noEventsInRange: 'Não há agendamentos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`
}

type Agendamento = {
  id: string
  usuarioId: string
  profissionalId: string
  profissionalNome: string
  dataISO: string
  local: string
  status: string
  notas?: string
  pacienteNome?: string
  pacienteEmail?: string
  pacienteTelefone?: string
  data_consulta?: string
  data_hora_inicio?: string
  data_hora_fim?: string
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Agendamento & {
    duracao: string
  }
}

export function AgendaCalendar() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Buscar agendamentos do profissional
  const fetchAgendamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agendamentos')
      if (response.ok) {
        const data = await response.json()
        // Se os dados vêm da tabela agendamento_slot, mapear corretamente
        const agendamentosFormatados = (data.data || []).map((ag: Record<string, any>) => ({
          ...ag,
          dataISO: ag.data_consulta || ag.data_hora_inicio || ag.dataISO
        }))
        setAgendamentos(agendamentosFormatados)
      } else {
        setError('Erro ao carregar agendamentos')
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      setError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  // Converter agendamentos para eventos do calendário
  const events = useMemo(() => {
    return agendamentos.map(ag => {
      // Usar o campo correto baseado no que está disponível nos dados
      const dataHora = ag.dataISO || ag.data_consulta || ag.data_hora_inicio
      if (!dataHora) {
        console.warn('Data não encontrada no agendamento:', ag)
        return null
      }

      // Garantir que a data seja interpretada corretamente para o timezone local
      const startDate = new Date(dataHora)
      
      // Calcular duração baseada nos dados do banco ou usar 1 hora como padrão
      let endDate: Date
      let duracaoTexto: string
      
      if (ag.data_hora_fim) {
        endDate = new Date(ag.data_hora_fim)
        const duracaoMs = endDate.getTime() - startDate.getTime()
        const duracaoMinutos = Math.round(duracaoMs / (1000 * 60))
        duracaoTexto = `${duracaoMinutos} minutos`
      } else {
        // Fallback para 1 hora se não houver data_hora_fim
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        duracaoTexto = '60 minutos'
      }

      return {
        id: ag.id,
        title: `${ag.pacienteNome || 'Paciente'} - ${startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`,
        start: startDate,
        end: endDate,
        resource: {
          ...ag,
          duracao: duracaoTexto
        }
      }
    }).filter((event): event is CalendarEvent => event !== null) // Remove null events with proper type guard
  }, [agendamentos])

  // Função para estilizar eventos baseado no status
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'

    switch (status) {
      case 'confirmado':
        backgroundColor = '#10b981'
        borderColor = '#059669'
        break
      case 'pendente':
        backgroundColor = '#f59e0b'
        borderColor = '#d97706'
        break
      case 'cancelado':
        backgroundColor = '#ef4444'
        borderColor = '#dc2626'
        break
      case 'concluido':
        backgroundColor = '#8b5cf6'
        borderColor = '#7c3aed'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        fontSize: '12px',
        padding: '2px 6px'
      }
    }
  }

  // Função chamada quando um evento é clicado
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  // Função para formatar data e hora
  const formatDateTime = (date: Date) => {
    return moment(date).format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando agenda...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Minha Agenda ({agendamentos.length} agendamentos)
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Cancelado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Concluído</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              toolbar={true}
              popup
              popupOffset={{ x: 30, y: 20 }}
              culture="pt-BR"
              formats={{
                monthHeaderFormat: 'MMMM YYYY',
                dayHeaderFormat: 'dddd DD/MM',
                dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
                  `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`,
                agendaDateFormat: 'DD/MM',
                agendaTimeFormat: 'HH:mm',
                agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
              }}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Detalhes do Agendamento
            </DialogTitle>
            <DialogDescription>
              Informações completas do agendamento
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Consulta Agendada</h3>
                <StatusBadge status={selectedEvent.resource.status} />
              </div>

              <div className="space-y-4">
                {/* Data e Hora */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Data e Hora:</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">
                    {formatDateTime(selectedEvent.start)}
                  </p>
                  <p className="text-xs text-gray-500 ml-6">
                    Duração: {selectedEvent.resource.duracao}
                  </p>
                </div>

                {/* Paciente */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Paciente:</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-sm text-gray-700">{selectedEvent.resource.pacienteNome || 'Nome não informado'}</p>
                    {selectedEvent.resource.pacienteEmail && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{selectedEvent.resource.pacienteEmail}</span>
                      </div>
                    )}
                    {selectedEvent.resource.pacienteTelefone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{selectedEvent.resource.pacienteTelefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Local:</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">{selectedEvent.resource.local}</p>
                </div>

                {/* Observações */}
                {selectedEvent.resource.notas && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Observações:</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6 p-2 bg-gray-50 rounded">{selectedEvent.resource.notas}</p>
                  </div>
                )}
              </div>

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
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
