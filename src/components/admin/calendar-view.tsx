"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateMockAgendamentos, type Agendamento } from "@/lib/mocks/agendamentos"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react"
import { DayDetailsModal } from "./day-details-modal"
import { TimezoneUtils } from "@/utils/timezone"
import { DateTime } from "luxon"

type AgendamentoReal = {
  id: string
  usuarioId: string
  profissionalId: string
  profissionalNome: string
  especialidade?: string
  dataISO: string
  data_consulta: string
  local: string
  status: string
  notas?: string
  modalidade: string
  pacienteNome: string
  pacienteEmail?: string
  pacienteTelefone?: string
  paciente: {
    id: string
    nome: string
    email?: string
    telefone?: string
  }
  profissional: {
    nome: string
    especialidade?: string
  }
}

type DesignacaoPresencial = {
  id: string
  profissional_id: string
  empresa_id: string
  data_presencial: string
  hora_inicio?: string
  hora_fim?: string
  criado_em: string
  atualizado_em: string
  usuarios?: {
    id: string
    nome: string
    email: string
    informacoes_adicionais?: {
      especialidade?: string
      crp?: string
    }
  }
  empresas?: {
    id: string
    nome: string
    codigo: string
  }
}

type CalendarViewProps = {
  agendamentos?: AgendamentoReal[]
  selectedProfessional?: string
  selectedStatus?: string
}

export function CalendarView({
  agendamentos: externalAgendamentos,
  selectedProfessional = "todos",
  selectedStatus = "todos"
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(DateTime.now().setZone('America/Sao_Paulo'))
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [presentialDesignations, setPresentialDesignations] = useState<DesignacaoPresencial[]>([])

  // Fetch presential designations
  const fetchPresentialDesignations = async () => {
    try {
      const response = await fetch('/api/profissional-presencial')
      if (response.ok) {
        const result = await response.json()
        setPresentialDesignations(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching presential designations:', error)
    }
  }

  // Load presential designations on component mount
  useEffect(() => {
    fetchPresentialDesignations()
  }, [])

  // Usar agendamentos externos ou gerar mock
  const baseAgendamentos = useMemo(() =>
    externalAgendamentos || generateMockAgendamentos(),
    [externalAgendamentos]
  ) as AgendamentoReal[]

  // Combine regular appointments with presential designations
  const allAgendamentos = useMemo(() => {
    const combined = [...baseAgendamentos]
    
    // Add presential designations as special appointments
    if (presentialDesignations && presentialDesignations.length > 0) {
      const presentialAgendamentos = presentialDesignations.map((designation: DesignacaoPresencial) => ({
        id: `presential-${designation.id}`,
        usuarioId: '',
        profissionalId: designation.profissional_id,
        profissionalNome: designation.usuarios?.nome || 'Profissional',
        especialidade: designation.usuarios?.informacoes_adicionais?.especialidade || '',
        dataISO: designation.hora_inicio ? `${designation.data_presencial}T${designation.hora_inicio}` : `${designation.data_presencial}T08:00:00`,
        data_consulta: designation.data_presencial,
        local: 'Presencial',
        status: 'presencial',
        notas: `Presencial ${designation.hora_inicio && designation.hora_fim 
          ? `das ${designation.hora_inicio.substring(0, 5)} às ${designation.hora_fim.substring(0, 5)}` 
          : 'dia inteiro'}${designation.empresas?.nome ? ` - ${designation.empresas.nome}` : ''}`,
        modalidade: 'presencial',
        pacienteNome: `🏥 Presencial${designation.empresas?.nome ? ` - ${designation.empresas.nome}` : ''}`,
        pacienteEmail: '',
        pacienteTelefone: '',
        paciente: {
          id: '',
          nome: `🏥 Presencial${designation.empresas?.nome ? ` - ${designation.empresas.nome}` : ''}`,
          email: '',
          telefone: ''
        },
        profissional: {
          nome: designation.usuarios?.nome || 'Profissional',
          especialidade: designation.usuarios?.informacoes_adicionais?.especialidade || ''
        },
        isPresential: true,
        empresa: designation.empresas || null
      }))
      
      combined.push(...presentialAgendamentos)
    }
    
    return combined
  }, [baseAgendamentos, presentialDesignations])

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

  // Navegação do calendário
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => prev.plus({ months: direction === "prev" ? -1 : 1 }))
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => prev.plus({ weeks: direction === "prev" ? -1 : 1 }))
  }

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate(prev => prev.plus({ days: direction === "prev" ? -1 : 1 }))
  }

  const goToToday = () => {
    setCurrentDate(DateTime.now().setZone('America/Sao_Paulo'))
  }

  // Funções de formatação
  const formatDate = (date: DateTime) => {
    return date.setLocale('pt-BR').toFormat('MMMM yyyy')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  // Obter agendamentos para uma data específica
  const getAgendamentosForDate = (date: DateTime) => {
    const dateStr = date.toISODate()
    return filteredAgendamentos.filter(ag => {
      // Para designações presenciais, extrair apenas a data sem conversão de timezone
      let agDate: string
      if (ag.dataISO.includes('T')) {
        agDate = ag.dataISO.split('T')[0]
      } else {
        agDate = TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(ag.dataISO))
      }
      return agDate === dateStr
    }).sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
  }

  // Gerar dias do mês para visualização mensal
  const getMonthDays = () => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')
    const startOfWeek = startOfMonth.startOf('week')
    const endOfWeek = endOfMonth.endOf('week')

    const days = []
    let current = startOfWeek

    for (let i = 0; i < 42; i++) {
      days.push(current)
      current = current.plus({ days: 1 })
    }

    return days
  }

  // Gerar dias da semana para visualização semanal
  const getWeekDays = () => {
    const startOfWeek = currentDate.startOf('week')

    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.plus({ days: i }))
    }

    return days
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmado: "bg-green-100 text-green-800 border-green-200",
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
      concluido: "bg-blue-100 text-blue-800 border-blue-200",
      presencial: "bg-blue-100 text-blue-800 border-blue-200"
    }
    return colors[status as keyof typeof colors] || colors.confirmado
  }

  const monthDays = viewMode === "month" ? getMonthDays() : []
  const weekDays = viewMode === "week" ? getWeekDays() : []
  const dayAgendamentos = viewMode === "day" ? getAgendamentosForDate(currentDate) : []

  return (
    <div className="w-full">
      {/* Controles do Calendário */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-azul-escuro">
            {viewMode === "month" && formatDate(currentDate)}
            {viewMode === "week" && `Semana de ${formatDateShort(weekDays[0]?.toISO() || "")} - ${formatDateShort(weekDays[6]?.toISO() || "")}`}
            {viewMode === "day" && currentDate.setLocale('pt-BR').toFormat('cccc, dd \'de\' MMMM \'de\' yyyy')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Visualização */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-none"
            >
              Mês
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-none"
            >
              Semana
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="rounded-none"
            >
              Dia
            </Button>
          </div>

          {/* Navegação */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === "month") navigateMonth("prev")
                else if (viewMode === "week") navigateWeek("prev")
                else navigateDay("prev")
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === "month") navigateMonth("next")
                else if (viewMode === "week") navigateWeek("next")
                else navigateDay("next")
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Visualização Mensal */}
      {viewMode === "month" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
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
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
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
              {monthDays.map((day, index) => {
                const agendamentos = getAgendamentosForDate(day)
                const isCurrentMonth = day.month === currentDate.month
                const isToday = day.hasSame(DateTime.now().setZone('America/Sao_Paulo'), 'day')
                const isPast = day < DateTime.now().setZone('America/Sao_Paulo').startOf('day')
                const hasAppointments = agendamentos.length > 0

                const isClickable = !isPast && isCurrentMonth && hasAppointments

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isClickable) {
                        setSelectedDate(day.toJSDate())
                        setIsModalOpen(true)
                      }
                    }}
                    disabled={!isClickable}
                    className={`
                      relative h-12 text-sm rounded-md transition-colors
                      ${!isCurrentMonth
                        ? 'text-gray-300 cursor-not-allowed'
                        : isPast
                          ? 'text-gray-400 cursor-not-allowed'
                          : hasAppointments
                            ? 'text-gray-900 hover:bg-green-50 hover:border-green-200 border border-transparent cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                      }
                      ${isToday ? 'bg-blue-50 border-blue-200 border' : ''}
                    `}
                  >
                    <span className="block">{day.day}</span>
                    {hasAppointments && isCurrentMonth && !isPast && (
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
                <span>Com agendamentos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                <span>Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualização Semanal */}
      {viewMode === "week" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const agendamentos = getAgendamentosForDate(day)
                const isToday = day.hasSame(DateTime.now().setZone('America/Sao_Paulo'), 'day')

                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${
                      isToday ? "bg-blue-100 text-blue-800" : "bg-gray-50"
                    }`}>
                      <div className="text-xs text-gray-500">
                        {day.setLocale('pt-BR').toFormat('ccc')}
                      </div>
                      <div className="text-lg font-semibold">
                        {day.day}
                      </div>
                    </div>

                    <div className="space-y-1 min-h-[300px]">
                      {agendamentos.map((ag, agIndex) => (
                        <Card key={agIndex} className={`p-2 ${getStatusColor(ag.status)}`}>
                          <div className="text-xs font-medium">
                            {formatTime(ag.dataISO)}
                          </div>
                          <div className="text-xs truncate">
                            {ag.profissionalNome}
                          </div>
                          <div className="text-xs truncate text-gray-600">
                            {ag.especialidade}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualização Diária */}
      {viewMode === "day" && (
        <Card>
          <CardContent className="p-4">
            {dayAgendamentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum agendamento para este dia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAgendamentos.map((ag, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {formatTime(ag.dataISO)}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ag.status)}`}>
                              {ag.status}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{ag.profissionalNome}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{ag.especialidade}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {ag.local}
                          </div>
                          
                          {ag.notas && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Notas:</strong> {ag.notas}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Dia */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        agendamentos={filteredAgendamentos}
      />
    </div>
  )
}
