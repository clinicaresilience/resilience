"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Search, Phone, Mail, Calendar, Eye, User, Activity } from "lucide-react"
import { generateMockPacientes } from "@/lib/mocks/patients"
import { generateMockAgendamentos } from "@/lib/mocks/agendamentos"

type PacienteComHistorico = {
  id: string
  nome: string
  email: string
  telefone: string
  status: "ativo" | "inativo" | "pendente"
  totalConsultas: number
  ultimaConsulta?: string
  proximaConsulta?: string
  profissionaisAtendentes: string[]
}

export function PacientesListClient() {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("")
  const [pacienteSelecionado, setPacienteSelecionado] = useState<PacienteComHistorico | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  // Gerar dados mock
  const pacientesMock = useMemo(() => generateMockPacientes(), [])
  const agendamentosMock = useMemo(() => generateMockAgendamentos(), [])

  // Processar pacientes com histórico
  const pacientesComHistorico = useMemo(() => {
    return pacientesMock.map(paciente => {
      // Encontrar agendamentos do paciente
      const agendamentosPaciente = agendamentosMock.filter(ag => ag.usuarioId === paciente.id)
      
      // Calcular estatísticas
      const totalConsultas = agendamentosPaciente.length
      const consultasConcluidas = agendamentosPaciente.filter(ag => ag.status === "concluido")
      
      // Última consulta
      const ultimaConsulta = consultasConcluidas
        .sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime())[0]
      
      // Próxima consulta
      const agora = new Date()
      const proximaConsulta = agendamentosPaciente
        .filter(ag => new Date(ag.dataISO) > agora && (ag.status === "confirmado" || ag.status === "pendente"))
        .sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())[0]
      
      // Profissionais que atenderam
      const profissionaisAtendentes = [...new Set(agendamentosPaciente.map(ag => ag.profissionalNome))]
      
      // Status baseado na atividade
      let status: "ativo" | "inativo" | "pendente" = "inativo"
      if (proximaConsulta) {
        status = "ativo"
      } else if (ultimaConsulta && new Date(ultimaConsulta.dataISO) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
        status = "ativo"
      } else if (agendamentosPaciente.some(ag => ag.status === "pendente")) {
        status = "pendente"
      }

      return {
        ...paciente,
        status,
        totalConsultas,
        ultimaConsulta: ultimaConsulta?.dataISO,
        proximaConsulta: proximaConsulta?.dataISO,
        profissionaisAtendentes
      }
    })
  }, [pacientesMock, agendamentosMock])

  // Filtrar pacientes
  const pacientesFiltrados = useMemo(() => {
    let filtrados = pacientesComHistorico

    // Filtro por busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase()
      filtrados = filtrados.filter(p => 
        p.nome.toLowerCase().includes(termoBusca) ||
        p.email.toLowerCase().includes(termoBusca) ||
        p.telefone.includes(termoBusca)
      )
    }

    // Filtro por status
    if (statusFiltro) {
      filtrados = filtrados.filter(p => p.status === statusFiltro)
    }

    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome))
  }, [pacientesComHistorico, busca, statusFiltro])

  const formatarData = (dataISO?: string) => {
    if (!dataISO) return "Não informado"
    return new Date(dataISO).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-100 text-green-800"
      case "inativo": return "bg-gray-100 text-gray-800"
      case "pendente": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo": return "Ativo"
      case "inativo": return "Inativo"
      case "pendente": return "Pendente"
      default: return status
    }
  }

  const abrirDetalhes = (paciente: PacienteComHistorico) => {
    setPacienteSelecionado(paciente)
    setModalAberto(true)
  }

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: pacientesComHistorico.length,
      ativos: pacientesComHistorico.filter(p => p.status === "ativo").length,
      inativos: pacientesComHistorico.filter(p => p.status === "inativo").length,
      pendentes: pacientesComHistorico.filter(p => p.status === "pendente").length,
      totalConsultas: pacientesComHistorico.reduce((acc, p) => acc + p.totalConsultas, 0)
    }
  }, [pacientesComHistorico])

  return (
    <div className="space-y-6">
      {/* Estatísticas Atualizadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-azul-escuro">{estatisticas.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.ativos}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
              </div>
              <User className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consultas</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.totalConsultas}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Buscar por nome, email ou telefone..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              <Button 
                variant="outline"
                onClick={() => {
                  setBusca("")
                  setStatusFiltro("")
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes ({pacientesFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
              <p className="text-gray-600">
                {busca || statusFiltro ? "Tente ajustar os filtros de busca." : "Não há pacientes cadastrados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {pacientesFiltrados.map((paciente) => (
                <Card key={paciente.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 flex-shrink-0">
                        <h3 className="font-semibold text-azul-escuro break-words flex-1 min-w-0">{paciente.nome}</h3>
                        <Badge className={`${getStatusColor(paciente.status)} flex-shrink-0`}>
                          {getStatusLabel(paciente.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words truncate">{paciente.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words truncate">{paciente.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words truncate">{paciente.totalConsultas} consulta(s)</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-end">
                        <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3 overflow-hidden">
                          <span className="break-words truncate">Última: {formatarData(paciente.ultimaConsulta)}</span>
                          {paciente.proximaConsulta && (
                            <span className="text-blue-600 break-words truncate">Próxima: {formatarData(paciente.proximaConsulta)}</span>
                          )}
                        </div>

                        {/* Botão sempre na base */}
                        <div className="mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center gap-2 justify-center"
                            onClick={() => abrirDetalhes(paciente)}
                          >
                            <Eye className="h-3 w-3 flex-shrink-0" />
                            <span>Ver Detalhes</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-azul-escuro">
              <User className="h-5 w-5" />
              Detalhes do Paciente
            </DialogTitle>
          </DialogHeader>

          {pacienteSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-azul-escuro">{pacienteSelecionado.nome}</h3>
                <Badge className={getStatusColor(pacienteSelecionado.status)}>
                  {getStatusLabel(pacienteSelecionado.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{pacienteSelecionado.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{pacienteSelecionado.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{pacienteSelecionado.totalConsultas} consulta(s) realizadas</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Histórico:</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Última consulta: {formatarData(pacienteSelecionado.ultimaConsulta)}</p>
                  {pacienteSelecionado.proximaConsulta && (
                    <p>Próxima consulta: {formatarData(pacienteSelecionado.proximaConsulta)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Profissionais Atendentes:</h4>
                <div className="flex flex-wrap gap-1">
                  {pacienteSelecionado.profissionaisAtendentes.map((prof, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {prof}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setModalAberto(false)}
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
