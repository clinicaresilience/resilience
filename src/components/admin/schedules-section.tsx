"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarView } from "./calendar-view"
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"

type ViewMode = "calendar" | "list" | "statistics"

type Agendamento = {
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

export function SchedulesSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [selectedProfessional, setSelectedProfessional] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("todos") // hoje, semana, mes, todos
  const [allAgendamentos, setAllAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados reais do banco
  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/agendamentos')
        const result = await response.json()

        if (result.success) {
          setAllAgendamentos(result.data)
        } else {
          setError(result.error || 'Erro ao carregar agendamentos')
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor')
        console.error('Erro ao buscar agendamentos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgendamentos()
  }, [])

  // Obter lista única de profissionais
  const profissionais = useMemo(() => {
    const uniqueProfs = Array.from(new Set(allAgendamentos.map(ag => ag.profissionalNome)))
    return uniqueProfs.sort()
  }, [allAgendamentos])

  // Filtros aplicados
  const filteredAgendamentos = useMemo(() => {
    let filtered = allAgendamentos

    // Filtro por profissional
    if (selectedProfessional !== "todos") {
      filtered = filtered.filter(ag => ag.profissionalNome === selectedProfessional)
    }

    // Filtro por status
    if (selectedStatus !== "todos") {
      filtered = filtered.filter(ag => ag.status === selectedStatus)
    }

    // Filtro por data
    if (dateFilter !== "todos") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(ag => {
        const agDate = new Date(ag.dataISO)
        
        switch (dateFilter) {
          case "hoje":
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            return agDate >= today && agDate < tomorrow
          
          case "semana":
            const weekEnd = new Date(today)
            weekEnd.setDate(today.getDate() + 7)
            return agDate >= today && agDate < weekEnd
          
          case "mes":
            const monthEnd = new Date(today)
            monthEnd.setMonth(today.getMonth() + 1)
            return agDate >= today && agDate < monthEnd
          
          default:
            return true
        }
      })
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase()
      filtered = filtered.filter(ag => 
        ag.profissionalNome.toLowerCase().includes(termo) ||
        ag.especialidade?.toLowerCase().includes(termo) ||
        ag.local.toLowerCase().includes(termo) ||
        ag.notas?.toLowerCase().includes(termo)
      )
    }

    return filtered.sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
  }, [allAgendamentos, selectedProfessional, selectedStatus, dateFilter, searchTerm])

  // Estatísticas
  const statistics = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)

    return {
      total: allAgendamentos.length,
      hoje: allAgendamentos.filter(ag => {
        const agDate = new Date(ag.dataISO)
        return agDate >= today && agDate < tomorrow
      }).length,
      semana: allAgendamentos.filter(ag => {
        const agDate = new Date(ag.dataISO)
        return agDate >= today && agDate < weekEnd
      }).length,
      confirmados: allAgendamentos.filter(ag => ag.status === "confirmado").length,
      pendentes: allAgendamentos.filter(ag => ag.status === "pendente").length,
      cancelados: allAgendamentos.filter(ag => ag.status === "cancelado").length,
      concluidos: allAgendamentos.filter(ag => ag.status === "concluido").length,
      porProfissional: profissionais.map(prof => ({
        nome: prof,
        total: allAgendamentos.filter(ag => ag.profissionalNome === prof).length,
        confirmados: allAgendamentos.filter(ag => ag.profissionalNome === prof && ag.status === "confirmado").length,
        pendentes: allAgendamentos.filter(ag => ag.profissionalNome === prof && ag.status === "pendente").length
      }))
    }
  }, [allAgendamentos, profissionais])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pendente":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelado":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "concluido":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-azul-escuro mb-4">Agendas e Horários</h2>
        
        {/* Controles de Visualização */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Modo de Visualização */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendário
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === "statistics" ? "default" : "outline"}
              onClick={() => setViewMode("statistics")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Estatísticas
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 flex-1">
            {/* Busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Profissional */}
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Todos os Profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Profissionais</SelectItem>
                {profissionais.map(prof => (
                  <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Data */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Todas as Datas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Datas</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Próximos 7 dias</SelectItem>
                <SelectItem value="mes">Próximos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700">{statistics.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{statistics.hoje}</div>
              <div className="text-sm text-green-600">Hoje</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-700">{statistics.semana}</div>
              <div className="text-sm text-purple-600">Esta Semana</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-700">{statistics.confirmados}</div>
              <div className="text-sm text-emerald-600">Confirmados</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-700">{statistics.pendentes}</div>
              <div className="text-sm text-amber-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-700">{statistics.cancelados}</div>
              <div className="text-sm text-red-600">Cancelados</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visualização de Calendário */}
      {viewMode === "calendar" && (
        <CalendarView 
          agendamentos={filteredAgendamentos}
          selectedProfessional={selectedProfessional}
          selectedStatus={selectedStatus}
        />
      )}

      {/* Visualização em Lista */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredAgendamentos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAgendamentos.map((agendamento) => {
              const { date, time } = formatDateTime(agendamento.dataISO)
              
              return (
                <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(agendamento.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {date} às {time}
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="font-semibold text-azul-escuro">{agendamento.profissionalNome}</h4>
                          <p className="text-sm text-gray-600">{agendamento.especialidade}</p>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Local:</strong> {agendamento.local}
                        </div>
                        
                        {agendamento.notas && (
                          <div className="text-sm text-gray-600">
                            <strong>Notas:</strong> {agendamento.notas}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Visualização de Estatísticas */}
      {viewMode === "statistics" && (
        <div className="space-y-6">
          {/* Estatísticas por Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Desempenho por Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {statistics.porProfissional.map((prof) => (
                  <div key={prof.nome} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{prof.nome}</h4>
                      <p className="text-sm text-gray-600">
                        {prof.total} agendamento(s) total
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{prof.confirmados}</div>
                        <div className="text-gray-500">Confirmados</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{prof.pendentes}</div>
                        <div className="text-gray-500">Pendentes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{statistics.confirmados}</div>
                  <div className="text-sm text-green-700">Confirmados</div>
                  <div className="text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.confirmados / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{statistics.pendentes}</div>
                  <div className="text-sm text-yellow-700">Pendentes</div>
                  <div className="text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.pendentes / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{statistics.cancelados}</div>
                  <div className="text-sm text-red-700">Cancelados</div>
                  <div className="text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.cancelados / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{statistics.concluidos}</div>
                  <div className="text-sm text-blue-700">Concluídos</div>
                  <div className="text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.concluidos / statistics.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
