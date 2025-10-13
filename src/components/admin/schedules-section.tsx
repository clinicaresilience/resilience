"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CalendarView } from "./calendar-view"
import {
  Calendar,
  Clock,
  Users,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Building2,
  User,
  Trash2
} from "lucide-react"

type ViewMode = "calendar" | "list" | "statistics" | "presencial"

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

type Profissional = {
  id: string
  nome: string
  email: string
  informacoes_adicionais?: {
    especialidade?: string
    crp?: string
  }
}

type Empresa = {
  id: string
  nome: string
  codigo: string
  ativa: boolean
}

type DesignacaoPresencial = {
  id: string
  profissional_id: string
  data_presencial: string
  hora_inicio?: string
  hora_fim?: string
  criado_em: string
  atualizado_em: string
  usuarios: Profissional
}

type NovaDesignacao = {
  profissional_id: string
  empresa_id: string
  data_presencial: string
  hora_inicio?: string
  hora_fim?: string
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

  // Estados para atendimento presencial
  const [profissionaisPresenciais, setProfissionaisPresenciais] = useState<Profissional[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [designacoes, setDesignacoes] = useState<DesignacaoPresencial[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [salvandoDesignacao, setSalvandoDesignacao] = useState(false)
  const [novaDesignacao, setNovaDesignacao] = useState<NovaDesignacao>({
    profissional_id: '',
    empresa_id: '',
    data_presencial: '',
    hora_inicio: '',
    hora_fim: '',
  })
  const [sucessoPresencial, setSucessoPresencial] = useState('')
  const [erroPresencial, setErroPresencial] = useState('')

  // Buscar dados reais do banco
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar agendamentos
        const agendamentosResponse = await fetch('/api/admin/agendamentos')
        const agendamentosResult = await agendamentosResponse.json()

        if (agendamentosResult.success) {
          setAllAgendamentos(agendamentosResult.data)
        } else {
          setError(agendamentosResult.error || 'Erro ao carregar agendamentos')
        }

        // Buscar profissionais para presencial
        const profResponse = await fetch('/api/profissionais')
        if (profResponse.ok) {
          const profResult = await profResponse.json()
          setProfissionaisPresenciais(profResult.data || profResult || [])
        }

        // Buscar empresas
        const empresasResponse = await fetch('/api/companies')
        if (empresasResponse.ok) {
          const empresasResult = await empresasResponse.json()
          setEmpresas(empresasResult.data || empresasResult || [])
        }

        // Buscar designações presenciais
        const designacoesResponse = await fetch('/api/profissional-presencial')
        const designacoesResult = await designacoesResponse.json()
        if (designacoesResponse.ok) {
          setDesignacoes(designacoesResult.data || [])
        }

      } catch (err) {
        setError('Erro ao conectar com o servidor')
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Obter lista única de profissionais dos agendamentos
  const profissionaisAgendamentos = useMemo(() => {
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
      porProfissional: profissionaisAgendamentos.map((prof, index) => ({
        id: `prof-${index}-${prof.replace(/\s+/g, '-').toLowerCase()}`,
        nome: prof,
        total: allAgendamentos.filter(ag => ag.profissionalNome === prof).length,
        confirmados: allAgendamentos.filter(ag => ag.profissionalNome === prof && ag.status === "confirmado").length,
        pendentes: allAgendamentos.filter(ag => ag.profissionalNome === prof && ag.status === "pendente").length
      }))
    }
  }, [allAgendamentos, profissionaisAgendamentos])

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

  // Funções para atendimento presencial
  const criarDesignacao = async () => {
    try {
      setSalvandoDesignacao(true)
      setErroPresencial('')

      // Validações
      if (!novaDesignacao.profissional_id || !novaDesignacao.empresa_id || !novaDesignacao.data_presencial) {
        setErroPresencial('Profissional, empresa e data são obrigatórios')
        return
      }

      const payload = {
        ...novaDesignacao,
        hora_inicio: novaDesignacao.hora_inicio || null,
        hora_fim: novaDesignacao.hora_fim || null,
      }

      const response = await fetch('/api/profissional-presencial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar designação')
      }

      setSucessoPresencial('Designação presencial criada com sucesso!')
      setModalAberto(false)
      setNovaDesignacao({
        profissional_id: '',
        empresa_id: '',
        data_presencial: '',
        hora_inicio: '',
        hora_fim: '',
      })
      
      // Recarregar designações
      const designacoesResponse = await fetch('/api/profissional-presencial')
      const designacoesResult = await designacoesResponse.json()
      if (designacoesResponse.ok) {
        setDesignacoes(designacoesResult.data || [])
      }

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSucessoPresencial(''), 3000)
    } catch (error) {
      console.error('Erro ao criar designação:', error)
      setErroPresencial(error instanceof Error ? error.message : 'Erro ao criar designação')
    } finally {
      setSalvandoDesignacao(false)
    }
  }

  const removerDesignacao = async (id: string, profissionalNome: string, data: string) => {
    if (!confirm(`Tem certeza que deseja remover a designação presencial de ${profissionalNome} para ${formatarData(data)}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/profissional-presencial?id=${id}`, {
        method: 'DELETE',
      })

      const data_response = await response.json()

      if (!response.ok) {
        throw new Error(data_response.error || 'Erro ao remover designação')
      }

      setSucessoPresencial('Designação presencial removida com sucesso!')
      
      // Recarregar designações
      const designacoesResponse = await fetch('/api/profissional-presencial')
      const designacoesResult = await designacoesResponse.json()
      if (designacoesResponse.ok) {
        setDesignacoes(designacoesResult.data || [])
      }

      setTimeout(() => setSucessoPresencial(''), 3000)
    } catch (error) {
      console.error('Erro ao remover designação:', error)
      setErroPresencial(error instanceof Error ? error.message : 'Erro ao remover designação')
    }
  }

  const formatarData = (dataISO: string) => {
    // Extrair apenas a parte da data (YYYY-MM-DD) ignorando timezone
    const dateOnly = dataISO.split('T')[0]
    const [year, month, day] = dateOnly.split('-')
    return `${day}/${month}/${year}`
  }

  const formatarHora = (horaString?: string) => {
    if (!horaString) return '-'
    return horaString.substring(0, 5)
  }

  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-azul-escuro mb-3 md:mb-4">Agendas e Horários</h2>

        {/* Controles de Visualização */}
        <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Modo de Visualização */}
          <div className="grid grid-cols-2 md:flex gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Calendário</span>
              <span className="sm:hidden">Cal.</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === "statistics" ? "default" : "outline"}
              onClick={() => setViewMode("statistics")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </Button>
            <Button
              variant={viewMode === "presencial" ? "default" : "outline"}
              onClick={() => setViewMode("presencial")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Atend. Presencial</span>
              <span className="sm:hidden">Presenc.</span>
            </Button>
          </div>

          {/* Botão para Criar Designação - aparece apenas na aba presencial */}
          {viewMode === "presencial" && (
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  Nova Designação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Designar Atendimento Presencial</DialogTitle>
                  <DialogDescription>
                    Configure um profissional para atendimento presencial em uma data específica
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="profissional">Profissional *</Label>
                    <Select 
                      value={novaDesignacao.profissional_id}
                      onValueChange={(value) => setNovaDesignacao(prev => ({
                        ...prev,
                        profissional_id: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionaisPresenciais.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{prof.nome}</span>
                              {prof.informacoes_adicionais?.especialidade && (
                                <span className="text-sm text-gray-500">
                                  {prof.informacoes_adicionais.especialidade}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Select 
                      value={novaDesignacao.empresa_id}
                      onValueChange={(value) => setNovaDesignacao(prev => ({
                        ...prev,
                        empresa_id: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.filter(emp => emp.ativa).map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{empresa.nome}</span>
                              <span className="text-sm text-gray-500">
                                Código: {empresa.codigo}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data">Data do Atendimento Presencial *</Label>
                    <Input
                      id="data"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={novaDesignacao.data_presencial}
                      onChange={(e) => setNovaDesignacao(prev => ({
                        ...prev,
                        data_presencial: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hora-inicio">Hora de Início (opcional)</Label>
                      <Input
                        id="hora-inicio"
                        type="time"
                        value={novaDesignacao.hora_inicio}
                        onChange={(e) => setNovaDesignacao(prev => ({
                          ...prev,
                          hora_inicio: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora-fim">Hora de Fim (opcional)</Label>
                      <Input
                        id="hora-fim"
                        type="time"
                        value={novaDesignacao.hora_fim}
                        onChange={(e) => setNovaDesignacao(prev => ({
                          ...prev,
                          hora_fim: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {erroPresencial && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">{erroPresencial}</span>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={criarDesignacao}
                    disabled={salvandoDesignacao}
                  >
                    {salvandoDesignacao ? 'Salvando...' : 'Criar Designação'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Busca */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 md:h-10 text-sm"
            />
          </div>

          {/* Filtros em grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Filtro por Profissional */}
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {profissionaisAgendamentos.map(prof => (
                  <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Data */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">7 dias</SelectItem>
                <SelectItem value="mes">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 mb-4 md:mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-blue-700">{statistics.total}</div>
              <div className="text-[10px] md:text-sm text-blue-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-green-700">{statistics.hoje}</div>
              <div className="text-[10px] md:text-sm text-green-600">Hoje</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-purple-700">{statistics.semana}</div>
              <div className="text-[10px] md:text-sm text-purple-600 hidden sm:inline">Esta Semana</div>
              <div className="text-[10px] md:text-sm text-purple-600 sm:hidden">Semana</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-emerald-700">{statistics.confirmados}</div>
              <div className="text-[10px] md:text-sm text-emerald-600 hidden sm:inline">Confirmados</div>
              <div className="text-[10px] md:text-sm text-emerald-600 sm:hidden">Conf.</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-amber-700">{statistics.pendentes}</div>
              <div className="text-[10px] md:text-sm text-amber-600 hidden sm:inline">Pendentes</div>
              <div className="text-[10px] md:text-sm text-amber-600 sm:hidden">Pend.</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-red-700">{statistics.cancelados}</div>
              <div className="text-[10px] md:text-sm text-red-600 hidden sm:inline">Cancelados</div>
              <div className="text-[10px] md:text-sm text-red-600 sm:hidden">Canc.</div>
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
        <div className="space-y-2 md:space-y-3">
          {filteredAgendamentos.length === 0 ? (
            <Card>
              <CardContent className="p-6 md:p-8 text-center">
                <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-gray-500">Nenhum agendamento encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAgendamentos.map((agendamento) => {
              const { date, time } = formatDateTime(agendamento.dataISO)

              return (
                <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(agendamento.status)}
                          <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                            {agendamento.status}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          {date} às {time}
                        </div>
                      </div>

                      <div className="mb-1">
                        <h4 className="font-semibold text-sm md:text-base text-azul-escuro">{agendamento.profissionalNome}</h4>
                        <p className="text-xs md:text-sm text-gray-600">{agendamento.especialidade}</p>
                      </div>

                      <div className="text-xs md:text-sm text-gray-600">
                        <strong>Paciente:</strong> {agendamento.pacienteNome}
                      </div>

                      {agendamento.pacienteEmail && (
                        <div className="text-xs md:text-sm text-gray-600">
                          <strong>Email:</strong> {agendamento.pacienteEmail}
                        </div>
                      )}

                      {agendamento.pacienteTelefone && (
                        <div className="text-xs md:text-sm text-gray-600">
                          <strong>Telefone:</strong> {agendamento.pacienteTelefone}
                        </div>
                      )}

                      <div className="text-xs md:text-sm text-gray-600">
                        <strong>Local:</strong> {agendamento.local}
                      </div>

                      {agendamento.notas && (
                        <div className="text-xs md:text-sm text-gray-600">
                          <strong>Notas:</strong> {agendamento.notas}
                        </div>
                      )}
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
        <div className="space-y-4 md:space-y-6">
          {/* Estatísticas por Profissional */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Desempenho por Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="grid gap-3 md:gap-4">
                {statistics.porProfissional.map((prof) => (
                  <div key={prof.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{prof.nome}</h4>
                      <p className="text-xs md:text-sm text-gray-600">
                        {prof.total} agendamento(s) total
                      </p>
                    </div>
                    <div className="flex gap-4 md:gap-6 text-xs md:text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{prof.confirmados}</div>
                        <div className="text-gray-500 text-[10px] md:text-xs">Confirmados</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{prof.pendentes}</div>
                        <div className="text-gray-500 text-[10px] md:text-xs">Pendentes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{statistics.confirmados}</div>
                  <div className="text-xs md:text-sm text-green-700">Confirmados</div>
                  <div className="text-[10px] md:text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.confirmados / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-600">{statistics.pendentes}</div>
                  <div className="text-xs md:text-sm text-yellow-700">Pendentes</div>
                  <div className="text-[10px] md:text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.pendentes / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{statistics.cancelados}</div>
                  <div className="text-xs md:text-sm text-red-700">Cancelados</div>
                  <div className="text-[10px] md:text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.cancelados / statistics.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{statistics.concluidos}</div>
                  <div className="text-xs md:text-sm text-blue-700">Concluídos</div>
                  <div className="text-[10px] md:text-xs text-gray-500">
                    {statistics.total > 0 ? Math.round((statistics.concluidos / statistics.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualização de Atendimento Presencial */}
      {viewMode === "presencial" && (
        <div className="space-y-6">
          {/* Mensagens de feedback para presencial */}
          {sucessoPresencial && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{sucessoPresencial}</span>
            </div>
          )}

          {/* Lista de Todos os Profissionais com Status de Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Gestão de Atendimento Presencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profissionaisPresenciais.map((profissional) => {
                  // Verificar se o profissional tem designações ativas
                  const designacoesAtivas = designacoes.filter(d => d.profissional_id === profissional.id)
                  
                  return (
                    <div key={profissional.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{profissional.nome}</h4>
                            {profissional.informacoes_adicionais?.especialidade && (
                              <p className="text-sm text-gray-600">
                                {profissional.informacoes_adicionais.especialidade}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {designacoesAtivas.length > 0 ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              {designacoesAtivas.length} designação(ões) ativa(s)
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Apenas online
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Designações ativas do profissional */}
                      {designacoesAtivas.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Designações Presenciais:</h5>
                          {designacoesAtivas.map((designacao) => (
                            <div key={designacao.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                              <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-900">
                                  {formatarData(designacao.data_presencial)}
                                </span>
                                <Clock className="h-4 w-4 text-blue-600 ml-2" />
                                <span className="text-blue-900">
                                  {designacao.hora_inicio && designacao.hora_fim ? (
                                    `${formatarHora(designacao.hora_inicio)} - ${formatarHora(designacao.hora_fim)}`
                                  ) : (
                                    'Dia inteiro'
                                  )}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removerDesignacao(
                                  designacao.id,
                                  designacao.usuarios.nome,
                                  designacao.data_presencial
                                )}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {profissionaisPresenciais.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum profissional cadastrado no sistema.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
