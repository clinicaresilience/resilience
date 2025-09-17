"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'moment-timezone'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User, MapPin, Phone, Mail, FileText, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { TimezoneUtils } from '@/utils/timezone'
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
  type: 'appointment' | 'presential'
}

export function AgendaCalendar() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [justificativa, setJustificativa] = useState("")
  const [showCancelForm, setShowCancelForm] = useState(false)

  // Buscar designações presenciais do profissional
  const fetchPresentialDesignations = async () => {
    try {
      // Get current user first
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) {
        console.log('Could not get user info')
        return []
      }

      const userData = await userResponse.json()
      const userId = userData.id
      console.log('Current user ID:', userId)
      
      if (!userId) {
        console.log('No user ID found')
        return []
      }

      // Get designations filtered by current professional
      const response = await fetch(`/api/profissional-presencial?profissional_id=${userId}`)
      if (response.ok) {
        const result = await response.json()
        console.log('Presential designations fetched for professional:', result)
        return result.data || []
      } else {
        console.log('Failed to fetch presential designations')
        return []
      }
    } catch (error) {
      console.error('Erro ao buscar designações presenciais:', error)
      return []
    }
  }

  // Buscar agendamentos do profissional
  const fetchAgendamentos = async () => {
    try {
      setLoading(true)
      
      // Fetch both appointments and presential designations
      const [agendamentosResponse, presentialData] = await Promise.all([
        fetch('/api/agendamentos'),
        fetchPresentialDesignations()
      ])
      
      if (agendamentosResponse.ok) {
        const data = await agendamentosResponse.json()
        // Se os dados vêm da tabela agendamento_slot, mapear corretamente
        const agendamentosFormatados = (data.data || []).map((ag: Record<string, unknown>) => ({
          ...ag,
          dataISO: ag.data_consulta || ag.data_hora_inicio || ag.dataISO
        }))
        
        // Combine appointments with presential designations
        const allAgendamentos = [...agendamentosFormatados]
        
        // Add presential designations as special appointments
        if (presentialData && presentialData.length > 0) {
          console.log('Processing presential data:', presentialData)
          
          const presentialAgendamentos = presentialData.map((designation: Record<string, unknown>) => {
            console.log('Processing designation:', designation)
            
            // Extrair data de forma mais robusta
            const dataPresencial = designation.data_presencial as string
            const horaInicio = designation.hora_inicio as string || '08:00:00'
            const horaFim = designation.hora_fim as string || '18:00:00'
            
            // Criar dataISO simples
            const dateOnly = dataPresencial.split('T')[0] // YYYY-MM-DD
            const timeStart = horaInicio.split('T')[1] || horaInicio // pegar apenas HH:mm:ss
            const dataISO = `${dateOnly}T${timeStart}`
            
            const presentialItem = {
              id: `presential-${designation.id}`,
              usuarioId: '',
              profissionalId: designation.profissional_id,
              profissionalNome: 'Atendimento Presencial',
              dataISO: dataISO,
              local: 'Presencial',
              status: 'presencial',
              notas: `Presencial ${designation.hora_inicio && designation.hora_fim 
                ? `das ${horaInicio.substring(0, 5)} às ${horaFim.substring(0, 5)}` 
                : 'dia inteiro'}${designation.empresas && (designation.empresas as any).nome ? ` - ${(designation.empresas as any).nome}` : ''}`,
              pacienteNome: `🏥 Presencial${designation.empresas && (designation.empresas as any).nome ? ` - ${(designation.empresas as any).nome}` : ''}`,
              pacienteEmail: '',
              pacienteTelefone: '',
              data_consulta: dataPresencial,
              data_hora_inicio: dataISO,
              data_hora_fim: `${dateOnly}T${(horaFim.split('T')[1] || horaFim)}`,
              isPresential: true,
              empresa: designation.empresas || null
            }
            
            console.log('Created presential item:', presentialItem)
            return presentialItem
          })
          
          console.log('All presential agendamentos:', presentialAgendamentos)
          allAgendamentos.push(...presentialAgendamentos)
        }
        
        setAgendamentos(allAgendamentos)
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

      // Check if this is a presential designation
      const isPresential = (ag as Record<string, unknown>).isPresential || ag.status === 'presencial'

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

      // Special handling for presential designations
      if (isPresential) {
        return {
          id: ag.id,
          title: ag.pacienteNome || '🏥 Atendimento Presencial',
          start: startDate,
          end: endDate,
          type: 'presential' as const,
          resource: {
            ...ag,
            duracao: duracaoTexto
          }
        }
      }

      return {
        id: ag.id,
        title: `${ag.pacienteNome || 'Paciente'} - ${startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`,
        start: startDate,
        end: endDate,
        type: 'appointment' as const,
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

    // Special styling for presential designations
    if (event.type === 'presential') {
      backgroundColor = '#2563eb'
      borderColor = '#1d4ed8'
      return {
        style: {
          backgroundColor,
          borderColor,
          color: 'white',
          border: `3px solid ${borderColor}`,
          borderRadius: '6px',
          fontSize: '12px',
          padding: '2px 6px',
          fontWeight: 'bold',
          opacity: 0.9
        }
      }
    }

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

  // Função para cancelar agendamento
  const handleCancelAgendamento = async () => {
    if (!selectedEvent || !justificativa.trim()) {
      alert('Por favor, informe uma justificativa para o cancelamento.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/agendamentos/${selectedEvent.resource.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelado',
          justificativa: justificativa.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Agendamento cancelado com sucesso!')
        setIsModalOpen(false)
        setShowCancelForm(false)
        setJustificativa("")
        // Recarregar agendamentos
        fetchAgendamentos()
      } else {
        alert(result.error || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      alert('Erro ao cancelar agendamento')
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex items-center gap-4 text-sm flex-wrap">
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded border-2 border-blue-800"></div>
              <span>🏥 Presencial</span>
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
              {selectedEvent?.type === 'presential' ? 'Designação Presencial' : 'Detalhes do Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.type === 'presential' ? 'Informações da designação presencial' : 'Informações completas do agendamento'}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {selectedEvent.type === 'presential' ? '🏥 Atendimento Presencial' : 'Consulta Agendada'}
                </h3>
                {selectedEvent.type !== 'presential' && (
                  <StatusBadge status={selectedEvent.resource.status} />
                )}
                {selectedEvent.type === 'presential' && (
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    <Building2 className="h-3 w-3 mr-1" />
                    Presencial
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedEvent.type === 'presential' ? (
                  <>
                    {/* Data e Hora */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Período:</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-6">
                        {formatDateTime(selectedEvent.start)}
                      </p>
                      <p className="text-xs text-gray-500 ml-6">
                        Duração: {selectedEvent.resource.duracao}
                      </p>
                    </div>

                    {/* Local */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Modalidade:</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-6">Presencial</p>
                    </div>

                    {/* Observações */}
                    {selectedEvent.resource.notas && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Detalhes:</span>
                        </div>
                        <p className="text-sm text-gray-700 ml-6 p-2 bg-blue-50 rounded border border-blue-200">{selectedEvent.resource.notas}</p>
                      </div>
                    )}

                    {/* Endereço da Empresa */}
                    {(selectedEvent.resource as any).empresa && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Detalhes do Local:</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          <p className="text-sm font-medium text-purple-900">
                            {(selectedEvent.resource as any).empresa.nome} ({(selectedEvent.resource as any).empresa.codigo})
                          </p>
                          {(() => {
                            const empresa = (selectedEvent.resource as any).empresa;
                            const enderecoParts = [];
                            
                            if (empresa.endereco_logradouro) {
                              let endereco = empresa.endereco_logradouro;
                              if (empresa.endereco_numero) {
                                endereco += `, ${empresa.endereco_numero}`;
                              }
                              if (empresa.endereco_complemento) {
                                endereco += `, ${empresa.endereco_complemento}`;
                              }
                              enderecoParts.push(endereco);
                            }
                            
                            if (empresa.endereco_bairro) {
                              enderecoParts.push(empresa.endereco_bairro);
                            }
                            
                            if (empresa.endereco_cidade && empresa.endereco_estado) {
                              enderecoParts.push(`${empresa.endereco_cidade} - ${empresa.endereco_estado}`);
                            }
                            
                            if (empresa.endereco_cep) {
                              enderecoParts.push(`CEP: ${empresa.endereco_cep}`);
                            }
                            
                            return enderecoParts.length > 0 ? (
                              <p className="text-sm text-gray-600 p-2 bg-purple-50 rounded border border-purple-200">
                                📍 {enderecoParts.join(', ')}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Aviso Importante */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Atenção:</strong> Durante este período, você está designado para atendimento presencial. 
                        Novos agendamentos online não poderão ser criados para este horário.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Form de cancelamento */}
              {showCancelForm && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="font-medium text-red-800 mb-2">Cancelar Consulta</h3>
                  <div className="mb-3">
                    <label htmlFor="justificativa" className="block text-sm font-medium text-red-700 mb-1">
                      Justificativa (obrigatória)
                    </label>
                    <textarea
                      id="justificativa"
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Digite o motivo do cancelamento..."
                      className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                  </div>
                  <p className="text-sm text-red-600">
                    Esta ação irá cancelar a consulta e liberar o horário para outros agendamentos.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                {selectedEvent.type === 'presential' ? (
                  <Button 
                    onClick={() => setSelectedEvent(null)}
                    className="w-full"
                    variant="outline"
                  >
                    Fechar
                  </Button>
                ) : (
                  <>
                    {selectedEvent.resource.status === 'confirmado' || selectedEvent.resource.status === 'pendente' ? (
                      <>
                        {!showCancelForm ? (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => setSelectedEvent(null)}
                              className="flex-1"
                              variant="outline"
                            >
                              Fechar
                            </Button>
                            <Button
                              onClick={() => setShowCancelForm(true)}
                              className="flex-1"
                              variant="destructive"
                            >
                              Cancelar Consulta
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setShowCancelForm(false)
                                setJustificativa("")
                              }}
                              className="flex-1"
                              variant="outline"
                              disabled={isLoading}
                            >
                              Voltar
                            </Button>
                            <Button
                              onClick={handleCancelAgendamento}
                              disabled={isLoading || !justificativa.trim()}
                              className="flex-1"
                              variant="destructive"
                            >
                              {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Button 
                        onClick={() => setSelectedEvent(null)}
                        className="w-full"
                        variant="outline"
                      >
                        Fechar
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
