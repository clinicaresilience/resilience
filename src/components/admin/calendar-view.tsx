"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateMockAgendamentos, type Agendamento } from "@/lib/mocks/agendamentos"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react"
import { DayDetailsModal } from "./day-details-modal"
import moment from "moment"
import "moment/locale/pt-br"

moment.locale("pt-br")

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
  const [currentDate, setCurrentDate] = useState(moment())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Usar agendamentos externos ou gerar mock
  const allAgendamentos = useMemo(() =>
    externalAgendamentos || generateMockAgendamentos(),
    [externalAgendamentos]
  ) as AgendamentoReal[]

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
    setCurrentDate(prev => prev.clone().add(direction === "prev" ? -1 : 1, 'month'))
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => prev.clone().add(direction === "prev" ? -1 : 1, 'week'))
  }

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate(prev => prev.clone().add(direction === "prev" ? -1 : 1, 'day'))
  }

  const goToToday = () => {
    setCurrentDate(moment())
  }

  // Funções de formatação
  const formatDate = (date: moment.Moment) => {
    return date.format('MMMM YYYY')
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
  const getAgendamentosForDate = (date: moment.Moment) => {
    const dateStr = date.format('YYYY-MM-DD')
    return filteredAgendamentos.filter(ag => {
      const agDate = moment(ag.dataISO).format('YYYY-MM-DD')
      return agDate === dateStr
    }).sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
  }

  // Gerar dias do mês para visualização mensal
  const getMonthDays = () => {
    const startOfMonth = currentDate.clone().startOf('month')
    const endOfMonth = currentDate.clone().endOf('month')
    const startOfWeek = startOfMonth.clone().startOf('week')
    const endOfWeek = endOfMonth.clone().endOf('week')

    const days = []
    const current = startOfWeek.clone()

    for (let i = 0; i < 42; i++) {
      days.push(current.clone())
      current.add(1, 'day')
    }

    return days
  }

  // Gerar dias da semana para visualização semanal
  const getWeekDays = () => {
    const startOfWeek = currentDate.clone().startOf('week')

    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'day'))
    }

    return days
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmado: "bg-green-100 text-green-800 border-green-200",
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
      concluido: "bg-blue-100 text-blue-800 border-blue-200"
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
            {viewMode === "week" && `Semana de ${formatDateShort(weekDays[0]?.toISOString() || "")} - ${formatDateShort(weekDays[6]?.toISOString() || "")}`}
            {viewMode === "day" && currentDate.format('dddd, DD [de] MMMM [de] YYYY')}
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
                {currentDate.format('MMMM YYYY')}
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
                const isCurrentMonth = day.month() === currentDate.month()
                const isToday = day.isSame(moment(), 'day')
                const isPast = day.isBefore(moment(), 'day')
                const hasAppointments = agendamentos.length > 0

                const isClickable = !isPast && isCurrentMonth && hasAppointments

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isClickable) {
                        setSelectedDate(day.toDate())
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
                    <span className="block">{day.date()}</span>
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
                const isToday = day.isSame(moment(), 'day')

                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${
                      isToday ? "bg-blue-100 text-blue-800" : "bg-gray-50"
                    }`}>
                      <div className="text-xs text-gray-500">
                        {day.format('ddd')}
                      </div>
                      <div className="text-lg font-semibold">
                        {day.date()}
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
