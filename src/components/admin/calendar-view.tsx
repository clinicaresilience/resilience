"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateMockAgendamentos, type Agendamento } from "@/lib/mocks/agendamentos"
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from "lucide-react"

type CalendarViewProps = {
  agendamentos?: Agendamento[]
  selectedProfessional?: string
  selectedStatus?: string
}

export function CalendarView({ 
  agendamentos: externalAgendamentos, 
  selectedProfessional = "todos",
  selectedStatus = "todos" 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  // Usar agendamentos externos ou gerar mock
  const allAgendamentos = useMemo(() => 
    externalAgendamentos || generateMockAgendamentos(), 
    [externalAgendamentos]
  )

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
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      const days = direction === "prev" ? -7 : 7
      newDate.setDate(prev.getDate() + days)
      return newDate
    })
  }

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      const days = direction === "prev" ? -1 : 1
      newDate.setDate(prev.getDate() + days)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Funções de formatação
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
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
  const getAgendamentosForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return filteredAgendamentos.filter(ag => {
      const agDate = new Date(ag.dataISO)
      return agDate.toDateString() === dateStr
    }).sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
  }

  // Gerar dias do mês para visualização mensal
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateObj = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    return days
  }

  // Gerar dias da semana para visualização semanal
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
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
            {viewMode === "day" && currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
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
          <CardContent className="p-4">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Grade do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => {
                const agendamentos = getAgendamentosForDate(day)
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border rounded-lg ${
                      isCurrentMonth ? "bg-white" : "bg-gray-50"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {agendamentos.slice(0, 3).map((ag, agIndex) => (
                        <div
                          key={agIndex}
                          className={`text-xs p-1 rounded border ${getStatusColor(ag.status)}`}
                          title={`${formatTime(ag.dataISO)} - ${ag.profissionalNome}`}
                        >
                          <div className="truncate">
                            {formatTime(ag.dataISO)}
                          </div>
                          <div className="truncate font-medium">
                            {ag.profissionalNome}
                          </div>
                        </div>
                      ))}
                      {agendamentos.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{agendamentos.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${
                      isToday ? "bg-blue-100 text-blue-800" : "bg-gray-50"
                    }`}>
                      <div className="text-xs text-gray-500">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-semibold">
                        {day.getDate()}
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
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
    </div>
  )
}
