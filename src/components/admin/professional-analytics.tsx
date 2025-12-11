"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Agendamento } from "@/services/database/agendamentos.service"
import { type ConsultaComProntuario } from "@/services/database/consultas.service"
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Target,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle
} from "lucide-react"

type ProfessionalAnalytics = {
  id: string
  nome: string
  totalAgendamentos: number
  agendamentosConfirmados: number
  agendamentosCancelados: number
  agendamentosConcluidos: number
  agendamentosPendentes: number
  taxaComparecimento: number
  taxaCancelamento: number
  taxaConfirmacao: number
  pacientesUnicos: number
  mediaConsultasPorPaciente: number
  proximosAgendamentos: number
  consultasUltimos30Dias: number
  tendenciaUltimos30Dias: "crescimento" | "estavel" | "declinio"
  especialidade?: string
  avaliacaoGeral: "excelente" | "bom" | "regular" | "precisa_melhorar"
}

export function ProfessionalAnalytics() {
  const [selectedProfessional, setSelectedProfessional] = useState<string>("todos")
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "comparison">("overview")
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [prontuarios, setProntuarios] = useState<ConsultaComProntuario[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar dados reais do banco
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Buscar todos os agendamentos
        const agendamentosResponse = await fetch('/api/agendamentos')
        if (agendamentosResponse.ok) {
          const agendamentosData = await agendamentosResponse.json()
          setAgendamentos(agendamentosData.data || [])
        }

        // Buscar todos os prontuários
        const prontuariosResponse = await fetch('/api/agendamentos/prontuarios')
        if (prontuariosResponse.ok) {
          const prontuariosData = await prontuariosResponse.json()
          setProntuarios(prontuariosData.data || [])
        }
      } catch (error: unknown) {
        console.error('Erro ao buscar dados para analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calcular análises por profissional
  const professionalAnalytics = useMemo(() => {
    if (agendamentos.length === 0) return []

    const profissionais = Array.from(new Set(agendamentos.map((ag: Agendamento) => 
      (ag as unknown as Record<string, unknown>).profissional as string || 'Profissional não identificado'
    )))

    return profissionais.map((nome, index) => {
      const agendamentosProfissional = agendamentos.filter((ag: Agendamento) =>
        (ag as unknown as Record<string, unknown>).profissional === nome
      )
      const prontuariosProfissional = prontuarios.filter((p: ConsultaComProntuario) =>
        (p as unknown as Record<string, unknown>).profissional === nome
      )

      const totalAgendamentos = agendamentosProfissional.length
      const confirmados = agendamentosProfissional.filter((ag: Agendamento) => ag.status === "confirmado").length
      const cancelados = agendamentosProfissional.filter((ag: Agendamento) => ag.status === "cancelado").length
      const concluidos = agendamentosProfissional.filter((ag: Agendamento) => ag.status === "concluido").length
      const pendentes = agendamentosProfissional.filter((ag: Agendamento) => ag.status === "pendente").length

      const taxaComparecimento = totalAgendamentos > 0 ? (concluidos / totalAgendamentos) * 100 : 0
      const taxaCancelamento = totalAgendamentos > 0 ? (cancelados / totalAgendamentos) * 100 : 0
      const taxaConfirmacao = totalAgendamentos > 0 ? (confirmados / totalAgendamentos) * 100 : 0

      // Pacientes únicos
      const pacientesUnicos = new Set(agendamentosProfissional.map((ag: Agendamento) =>
        (ag as unknown as Record<string, unknown>).paciente_id as string
      ).filter(Boolean)).size
      const mediaConsultasPorPaciente = pacientesUnicos > 0 ? totalAgendamentos / pacientesUnicos : 0

      // Próximos agendamentos
      const now = new Date()
      const proximosAgendamentos = agendamentosProfissional.filter((ag: Agendamento) =>
        ag.data_consulta && new Date(ag.data_consulta) > now && (ag.status === "confirmado" || ag.status === "pendente")
      ).length

      // Consultas últimos 30 dias
      const trinta_dias_atras = new Date()
      trinta_dias_atras.setDate(now.getDate() - 30)
      const consultasUltimos30Dias = agendamentosProfissional.filter((ag: Agendamento) =>
        ag.data_consulta && new Date(ag.data_consulta) >= trinta_dias_atras && ag.status === "concluido"
      ).length

      // Tendência baseada em dados reais
      const tendencia: "crescimento" | "estavel" | "declinio" =
        consultasUltimos30Dias > 5 ? "crescimento" :
        consultasUltimos30Dias > 2 ? "estavel" : "declinio"

      // Avaliação geral
      let avaliacaoGeral: "excelente" | "bom" | "regular" | "precisa_melhorar"
      if (taxaComparecimento >= 85 && taxaCancelamento <= 10) {
        avaliacaoGeral = "excelente"
      } else if (taxaComparecimento >= 70 && taxaCancelamento <= 20) {
        avaliacaoGeral = "bom"
      } else if (taxaComparecimento >= 50 && taxaCancelamento <= 30) {
        avaliacaoGeral = "regular"
      } else {
        avaliacaoGeral = "precisa_melhorar"
      }

      return {
        id: `prof-${index}-${nome.replace(/\s+/g, '-').toLowerCase()}`,
        nome,
        totalAgendamentos,
        agendamentosConfirmados: confirmados,
        agendamentosCancelados: cancelados,
        agendamentosConcluidos: concluidos,
        agendamentosPendentes: pendentes,
        taxaComparecimento: Math.round(taxaComparecimento),
        taxaCancelamento: Math.round(taxaCancelamento),
        taxaConfirmacao: Math.round(taxaConfirmacao),
        pacientesUnicos,
        mediaConsultasPorPaciente: Math.round(mediaConsultasPorPaciente * 10) / 10,
        proximosAgendamentos,
        consultasUltimos30Dias,
        tendenciaUltimos30Dias: tendencia,
        especialidade: agendamentosProfissional[0]?.profissional?.especialidade,
        avaliacaoGeral
      } as ProfessionalAnalytics
    }).sort((a, b) => b.totalAgendamentos - a.totalAgendamentos)
  }, [agendamentos, prontuarios])

  const selectedAnalytics = selectedProfessional === "todos" 
    ? null 
    : professionalAnalytics.find(p => p.nome === selectedProfessional)

  const getAvaliacaoColor = (avaliacao: string) => {
    const colors = {
      excelente: "text-green-600 bg-green-100",
      bom: "text-blue-600 bg-blue-100",
      regular: "text-yellow-600 bg-yellow-100",
      precisa_melhorar: "text-red-600 bg-red-100"
    }
    return colors[avaliacao as keyof typeof colors] || colors.regular
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "crescimento":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declinio":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-azul-escuro mb-4">Análises Detalhadas por Profissional</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-escuro mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados das análises...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-azul-escuro mb-3 md:mb-4">Análises Detalhadas por Profissional</h2>

        {/* Controles */}
        <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={viewMode === "overview" ? "default" : "outline"}
              onClick={() => setViewMode("overview")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </Button>
            <Button
              variant={viewMode === "detailed" ? "default" : "outline"}
              onClick={() => setViewMode("detailed")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <PieChart className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Detalhado</span>
              <span className="sm:hidden">Detalhes</span>
            </Button>
            <Button
              variant={viewMode === "comparison" ? "default" : "outline"}
              onClick={() => setViewMode("comparison")}
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
            >
              <Target className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Comparação</span>
              <span className="sm:hidden">Comp.</span>
            </Button>
          </div>

          {viewMode === "detailed" && (
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-full md:w-[200px] h-9 text-sm">
                <SelectValue placeholder="Selecione um Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Selecione um Profissional</SelectItem>
                {professionalAnalytics.map(prof => (
                  <SelectItem key={prof.id} value={prof.nome}>{prof.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Visão Geral */}
      {viewMode === "overview" && (
        <div className="space-y-4 md:space-y-6">
          {/* Métricas Gerais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-blue-100 text-[10px] md:text-sm">Total de Profissionais</p>
                    <p className="text-xl md:text-2xl font-bold">{professionalAnalytics.length}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-green-100 text-[10px] md:text-sm">Taxa Média Comparecimento</p>
                    <p className="text-xl md:text-2xl font-bold">
                      {professionalAnalytics.length > 0
                        ? Math.round(professionalAnalytics.reduce((acc, p) => acc + p.taxaComparecimento, 0) / professionalAnalytics.length)
                        : 0
                      }%
                    </p>
                  </div>
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-purple-100 text-[10px] md:text-sm">Total de Consultas</p>
                    <p className="text-xl md:text-2xl font-bold">
                      {professionalAnalytics.reduce((acc, p) => acc + p.totalAgendamentos, 0)}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-orange-100 text-[10px] md:text-sm">Próximas Consultas</p>
                    <p className="text-xl md:text-2xl font-bold">
                      {professionalAnalytics.reduce((acc, p) => acc + p.proximosAgendamentos, 0)}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking de Profissionais */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Award className="h-4 w-4 md:h-5 md:w-5" />
                Ranking de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                {professionalAnalytics.map((prof, index) => (
                  <div key={prof.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm md:text-base truncate">{prof.nome}</h4>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{prof.especialidade}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:flex md:items-center gap-3 md:gap-6 text-xs md:text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{prof.totalAgendamentos}</div>
                        <div className="text-gray-500 text-[10px] md:text-xs">Consultas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{prof.taxaComparecimento}%</div>
                        <div className="text-gray-500 text-[10px] md:text-xs hidden md:block">Comparec.</div>
                        <div className="text-gray-500 text-[10px] md:hidden">Comp.</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{prof.pacientesUnicos}</div>
                        <div className="text-gray-500 text-[10px] md:text-xs">Pacientes</div>
                      </div>
                      <div className="flex items-center justify-center md:block">
                        {getTendenciaIcon(prof.tendenciaUltimos30Dias)}
                      </div>
                      <div className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium ${getAvaliacaoColor(prof.avaliacaoGeral)} text-center col-span-3 md:col-span-1`}>
                        {prof.avaliacaoGeral.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visão Detalhada */}
      {viewMode === "detailed" && selectedAnalytics && (
        <div className="space-y-6">
          {/* Cabeçalho do Profissional */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedAnalytics.nome}</CardTitle>
                  <p className="text-gray-600">{selectedAnalytics.especialidade}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium ${getAvaliacaoColor(selectedAnalytics.avaliacaoGeral)}`}>
                  {selectedAnalytics.avaliacaoGeral.replace('_', ' ')}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Taxa de Comparecimento</h3>
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {selectedAnalytics.taxaComparecimento}%
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAnalytics.agendamentosConcluidos} de {selectedAnalytics.totalAgendamentos} consultas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Taxa de Cancelamento</h3>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {selectedAnalytics.taxaCancelamento}%
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAnalytics.agendamentosCancelados} consultas canceladas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Pacientes Únicos</h3>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {selectedAnalytics.pacientesUnicos}
                </div>
                <p className="text-sm text-gray-600">
                  Média de {selectedAnalytics.mediaConsultasPorPaciente} consultas/paciente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Próximas Consultas</h3>
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {selectedAnalytics.proximosAgendamentos}
                </div>
                <p className="text-sm text-gray-600">
                  Agendamentos confirmados e pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Últimos 30 Dias</h3>
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-3xl font-bold text-orange-600">
                    {selectedAnalytics.consultasUltimos30Dias}
                  </div>
                  {getTendenciaIcon(selectedAnalytics.tendenciaUltimos30Dias)}
                </div>
                <p className="text-sm text-gray-600">
                  Consultas realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Taxa de Confirmação</h3>
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {selectedAnalytics.taxaConfirmacao}%
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAnalytics.agendamentosConfirmados} consultas confirmadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Comparação */}
      {viewMode === "comparison" && (
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg">Comparação de Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 sticky left-0 bg-white z-10">Profissional</th>
                      <th className="text-center p-2 whitespace-nowrap">Total</th>
                      <th className="text-center p-2 whitespace-nowrap hidden sm:table-cell">Taxa Comp.</th>
                      <th className="text-center p-2 whitespace-nowrap hidden sm:table-cell">Taxa Canc.</th>
                      <th className="text-center p-2 whitespace-nowrap">Pacientes</th>
                      <th className="text-center p-2 whitespace-nowrap hidden md:table-cell">Próximas</th>
                      <th className="text-center p-2 whitespace-nowrap">Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionalAnalytics.map((prof) => (
                      <tr key={prof.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 sticky left-0 bg-white">
                          <div>
                            <div className="font-medium text-xs md:text-sm truncate max-w-[120px]">{prof.nome}</div>
                            <div className="text-gray-500 text-[10px] md:text-xs truncate max-w-[120px] hidden sm:block">{prof.especialidade}</div>
                          </div>
                        </td>
                        <td className="text-center p-2 font-semibold">{prof.totalAgendamentos}</td>
                        <td className="text-center p-2 hidden sm:table-cell">
                          <span className={`font-semibold ${prof.taxaComparecimento >= 80 ? 'text-green-600' : prof.taxaComparecimento >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {prof.taxaComparecimento}%
                          </span>
                        </td>
                        <td className="text-center p-2 hidden sm:table-cell">
                          <span className={`font-semibold ${prof.taxaCancelamento <= 10 ? 'text-green-600' : prof.taxaCancelamento <= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {prof.taxaCancelamento}%
                          </span>
                        </td>
                        <td className="text-center p-2 font-semibold">{prof.pacientesUnicos}</td>
                        <td className="text-center p-2 font-semibold hidden md:table-cell">{prof.proximosAgendamentos}</td>
                        <td className="text-center p-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getAvaliacaoColor(prof.avaliacaoGeral)} whitespace-nowrap`}>
                            {prof.avaliacaoGeral.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "detailed" && !selectedAnalytics && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Selecione um profissional para ver as análises detalhadas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
