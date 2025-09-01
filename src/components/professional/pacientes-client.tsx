"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { generateMockAgendamentos } from "@/lib/mocks/agendamentos"
import { generateMockProntuarios } from "@/lib/mocks/medical-records"
import { generateMockPacientes } from "@/lib/mocks/patients"
import { User, Calendar, FileText, Phone, MapPin, Clock, Activity, TrendingUp } from "lucide-react"

interface ProfessionalPacientesClientProps {
  profissionalNome: string
  profissionalId: string
}

type PacienteInfo = {
  id: string
  nome: string
  email: string
  telefone: string
  totalConsultas: number
  ultimaConsulta: string
  proximaConsulta?: string
  statusAtual: "ativo" | "inativo" | "alta"
  observacoes?: string
}

export function ProfessionalPacientesClient({ profissionalNome, profissionalId }: ProfessionalPacientesClientProps) {
  const [busca, setBusca] = useState("")
  const [pacienteSelecionado, setPacienteSelecionado] = useState<PacienteInfo | null>(null)

  // Gerar dados mock
  const agendamentos = useMemo(() => generateMockAgendamentos(), [])
  const prontuarios = useMemo(() => generateMockProntuarios(), [])
  const pacientesMock = useMemo(() => generateMockPacientes(), [])

  // Processar pacientes do profissional
  const pacientesInfo = useMemo(() => {
    // Filtrar consultas deste profissional
    const consultasProfissional = agendamentos.filter(ag => 
      ag.profissionalNome === profissionalNome ||
      ag.profissionalNome.includes(profissionalNome.split(' ')[1])
    )

    // Agrupar por paciente
    const pacientesPorId = new Map<string, PacienteInfo>()

    consultasProfissional.forEach(consulta => {
      const pacienteId = consulta.usuarioId || `pac_${Math.random().toString(36).slice(2, 8)}`
      
      if (!pacientesPorId.has(pacienteId)) {
        // Buscar dados do paciente mock
        const pacienteMock = pacientesMock.find(p => p.id === pacienteId) || {
          id: pacienteId,
          nome: `Paciente ${pacienteId}`,
          email: `${pacienteId}@email.com`,
          telefone: "(11) 99999-0000"
        }

        pacientesPorId.set(pacienteId, {
          id: pacienteId,
          nome: pacienteMock.nome,
          email: pacienteMock.email,
          telefone: pacienteMock.telefone,
          totalConsultas: 0,
          ultimaConsulta: consulta.dataISO,
          statusAtual: "ativo"
        })
      }

      const pacienteInfo = pacientesPorId.get(pacienteId)!
      pacienteInfo.totalConsultas += 1

      // Atualizar última consulta (mais recente)
      if (new Date(consulta.dataISO) > new Date(pacienteInfo.ultimaConsulta)) {
        pacienteInfo.ultimaConsulta = consulta.dataISO
      }

      // Verificar próxima consulta
      const agora = new Date()
      const dataConsulta = new Date(consulta.dataISO)
      if (dataConsulta > agora && (consulta.status === "confirmado" || consulta.status === "pendente")) {
        if (!pacienteInfo.proximaConsulta || dataConsulta < new Date(pacienteInfo.proximaConsulta)) {
          pacienteInfo.proximaConsulta = consulta.dataISO
        }
      }
    })

    return Array.from(pacientesPorId.values()).sort((a, b) => 
      new Date(b.ultimaConsulta).getTime() - new Date(a.ultimaConsulta).getTime()
    )
  }, [agendamentos, profissionalNome, pacientesMock])

  // Filtrar pacientes por busca
  const pacientesFiltrados = useMemo(() => {
    if (!busca.trim()) return pacientesInfo

    const termoBusca = busca.toLowerCase()
    return pacientesInfo.filter(paciente =>
      paciente.nome.toLowerCase().includes(termoBusca) ||
      paciente.email.toLowerCase().includes(termoBusca) ||
      paciente.telefone.includes(termoBusca)
    )
  }, [pacientesInfo, busca])

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }


  const obterHistoricoPaciente = (pacienteId: string) => {
    const consultasPaciente = agendamentos.filter(ag => 
      ag.usuarioId === pacienteId && 
      (ag.profissionalNome === profissionalNome || ag.profissionalNome.includes(profissionalNome.split(' ')[1]))
    ).sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime())

    const prontuariosPaciente = prontuarios.filter(p => p.pacienteId === pacienteId)

    return { consultas: consultasPaciente, prontuarios: prontuariosPaciente }
  }

  const estatisticas = useMemo(() => {
    return {
      totalPacientes: pacientesInfo.length,
      pacientesAtivos: pacientesInfo.filter(p => p.statusAtual === "ativo").length,
      totalConsultas: pacientesInfo.reduce((acc, p) => acc + p.totalConsultas, 0),
      proximasConsultas: pacientesInfo.filter(p => p.proximaConsulta).length
    }
  }, [pacientesInfo])

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold">{estatisticas.totalPacientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.pacientesAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold">{estatisticas.totalConsultas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Próximas Consultas</p>
                <p className="text-2xl font-bold">{estatisticas.proximasConsultas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="busca">Buscar por nome, email ou telefone</Label>
              <Input
                id="busca"
                placeholder="Digite para buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setBusca("")}
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacientesFiltrados.map((paciente) => (
          <Card key={paciente.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{paciente.nome}</CardTitle>
                <StatusBadge status={paciente.statusAtual as any} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{paciente.telefone}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Consultas</p>
                    <p className="font-semibold">{paciente.totalConsultas}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Última</p>
                    <p className="font-semibold">{formatarData(paciente.ultimaConsulta)}</p>
                  </div>
                </div>

                {paciente.proximaConsulta && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <p className="text-blue-600 font-medium">Próxima consulta:</p>
                    <p className="text-blue-800">{formatarData(paciente.proximaConsulta)}</p>
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setPacienteSelecionado(paciente)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Histórico do Paciente</DialogTitle>
                      <DialogDescription>
                        {pacienteSelecionado?.nome} - Histórico completo de consultas e prontuários
                      </DialogDescription>
                    </DialogHeader>
                    
                    {pacienteSelecionado && (
                      <div className="space-y-6">
                        {/* Informações do Paciente */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label>Nome</Label>
                            <p className="font-medium">{pacienteSelecionado.nome}</p>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="font-medium">{pacienteSelecionado.email}</p>
                          </div>
                          <div>
                            <Label>Telefone</Label>
                            <p className="font-medium">{pacienteSelecionado.telefone}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <div className="mt-1">
                              <StatusBadge status={pacienteSelecionado.statusAtual as any} />
                            </div>
                          </div>
                        </div>

                        {/* Histórico de Consultas */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Histórico de Consultas</h3>
                          <div className="space-y-2">
                            {obterHistoricoPaciente(pacienteSelecionado.id).consultas.map((consulta) => (
                              <div key={consulta.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                <div>
                                  <p className="font-medium">{consulta.especialidade}</p>
                                  <p className="text-sm text-gray-600">{formatarData(consulta.dataISO)}</p>
                                  {consulta.notas && (
                                    <p className="text-sm text-gray-500 mt-1">{consulta.notas}</p>
                                  )}
                                </div>
                                <StatusBadge status={consulta.status as any} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prontuários */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Prontuários</h3>
                          <div className="space-y-2">
                            {obterHistoricoPaciente(pacienteSelecionado.id).prontuarios.map((prontuario) => (
                              <div key={prontuario.id} className="p-3 bg-white border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{prontuario.tipoConsulta}</p>
                                  <span className="text-sm text-gray-500">{formatarData(prontuario.dataConsulta)}</span>
                                </div>
                                {prontuario.diagnostico && (
                                  <p className="text-sm text-blue-600 mb-2">
                                    <strong>Diagnóstico:</strong> {prontuario.diagnostico}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600">{prontuario.observacoes}</p>
                                {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Prescrições:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                      {prontuario.prescricoes.map((prescricao, index) => (
                                        <li key={index}>{prescricao}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pacientesFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-600">
              {busca ? "Não há pacientes que correspondam à busca." : "Você ainda não tem pacientes cadastrados."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
