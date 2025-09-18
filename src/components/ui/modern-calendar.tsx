"use client"

import { useState, useMemo } from "react"
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateMockAgendamentos } from "@/lib/mocks/agendamentos"
import { generateMockPacientes } from "@/lib/mocks/patients"
import { StatusBadge } from "@/components/ui/status-badge"
import { Calendar as CalendarIcon, Clock, User, MapPin, Phone, Mail, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

type ModernCalendarProps = {
  agendamentos?: Array<Record<string, unknown>>
  selectedProfessional?: string
  selectedStatus?: string
  onEventSelect?: (event: Record<string, unknown>) => void
}

export function ModernCalendar({ 
  agendamentos: externalAgendamentos,
  selectedProfessional = "todos",
  selectedStatus = "todos",
  onEventSelect
}: ModernCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Usar agendamentos externos ou gerar mock
  const allAgendamentos = useMemo(() => 
    externalAgendamentos || generateMockAgendamentos(), 
    [externalAgendamentos]
  )

  // Gerar dados mock de pacientes
  const pacientes = useMemo(() => generateMockPacientes(), [])

  // Filtrar agendamentos
  const filteredAgendamentos = useMemo(() => {
    let filtered = allAgendamentos

    if (selectedProfessional !== "todos") {
      filtered = filtered.filter(ag => ag.profissionalNome === selectedProfessional)
    }

    if (selectedStatus !== "todos") {
      filtered = filtered.filter(ag => ag.status === selectedStatus)
    }

    return filtered
  }, [allAgendamentos, selectedProfessional, selectedStatus])

  // Converter agendamentos para eventos do calendário
  const events = useMemo(() => {
    const motivosConsulta = [
      'Consulta de rotina',
      'Primeira consulta',
      'Consulta de retorno',
      'Avaliação psicológica',
      'Terapia individual',
      'Consulta de emergência',
      'Acompanhamento terapêutico',
      'Terapia de casal',
      'Consulta familiar'
    ]

    return filteredAgendamentos.map(ag => {
      const agData = ag as Record<string, unknown>
      const startDate = new Date((agData.dataISO as string) || (agData.data_hora_inicio as string))
      
      // Calcular duração baseada nos dados do banco ou usar 1 hora como padrão
      let endDate: Date
      let duracaoTexto: string
      
      if (agData.data_hora_fim) {
        endDate = new Date(agData.data_hora_fim as string)
        const duracaoMs = endDate.getTime() - startDate.getTime()
        const duracaoMinutos = Math.round(duracaoMs / (1000 * 60))
        duracaoTexto = `${duracaoMinutos} minutos`
      } else {
        // Fallback para 1 hora se não houver data_hora_fim
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        duracaoTexto = '60 minutos'
      }

      // Encontrar paciente correspondente ou criar um mock
      const paciente = pacientes.find(p => p.id === agData.usuarioId) || {
        id: (agData.usuarioId as string) || 'pac_mock',
        nome: `Paciente ${Math.floor(Math.random() * 100) + 1}`,
        email: `paciente${Math.floor(Math.random() * 100) + 1}@email.com`,
        telefone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
      }

      return {
        id: agData.id,
        title: `${paciente.nome} - ${agData.profissionalNome}`,
        start: startDate,
        end: endDate,
        resource: {
          ...agData,
          pacienteDetalhes: paciente,
          motivoConsulta: motivosConsulta[Math.floor(Math.random() * motivosConsulta.length)],
          duracao: duracaoTexto
        }
      }
    })
  }, [filteredAgendamentos, pacientes])

  // Função para estilizar eventos baseado no status
  const eventStyleGetter = (event: Record<string, unknown>) => {
    const resource = event.resource as Record<string, unknown>
    const status = resource.status
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
  const handleSelectEvent = (event: Record<string, unknown>) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
    if (onEventSelect) {
      onEventSelect(event)
    }
  }

  // Função para formatar data e hora
  const formatDateTime = (date: Date) => {
    return moment(date).format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm')
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Agendamentos
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
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              defaultView={Views.MONTH}
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
              Informações completas do agendamento selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (() => {
            const resource = selectedEvent.resource as Record<string, unknown>
            const pacienteDetalhes = resource.pacienteDetalhes as Record<string, unknown>
            const start = selectedEvent.start as Date
            
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{String(resource.profissionalNome)}</h3>
                  <StatusBadge status={String(resource.status)} />
                </div>

                <div className="space-y-4">
                  {/* Data e Hora */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Data e Hora:</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">
                      {formatDateTime(start)}
                    </p>
                    <p className="text-xs text-gray-500 ml-6">
                      Duração: {String(resource.duracao)}
                    </p>
                  </div>

                  {/* Profissional */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Profissional:</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{String(resource.profissionalNome)}</p>
                    {resource.especialidade && (
                      <p className="text-xs text-gray-500 ml-6">{String(resource.especialidade)}</p>
                    )}
                  </div>

                  {/* Paciente */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Paciente:</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <p className="text-sm text-gray-700">{String(pacienteDetalhes.nome)}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{String(pacienteDetalhes.email)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{String(pacienteDetalhes.telefone)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Motivo da Consulta */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Motivo da Consulta:</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{String(resource.motivoConsulta)}</p>
                  </div>

                  {/* Local */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Local:</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{String(resource.local)}</p>
                  </div>

                  {/* Observações */}
                  {resource.notas && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Observações:</span>
                      <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded">{String(resource.notas)}</p>
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
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
