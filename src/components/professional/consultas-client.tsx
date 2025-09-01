"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { generateMockAgendamentos, type Agendamento } from "@/lib/mocks/agendamentos"
import { Calendar, Clock, User, Phone, MapPin, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ProfessionalConsultasClientProps {
  profissionalNome: string
  profissionalId: string
}

export function ProfessionalConsultasClient({ profissionalNome, profissionalId }: ProfessionalConsultasClientProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroData, setFiltroData] = useState<string>("")
  const [busca, setBusca] = useState("")
  const [consultaSelecionada, setConsultaSelecionada] = useState<Agendamento | null>(null)
  const [observacoes, setObservacoes] = useState("")

  // Gerar consultas mock para este profissional
  const todasConsultas = useMemo(() => {
    const consultas = generateMockAgendamentos()
    // Filtrar apenas as consultas deste profissional
    return consultas.filter(consulta => 
      consulta.profissionalNome === profissionalNome ||
      consulta.profissionalNome.includes(profissionalNome.split(' ')[1]) // Match parcial pelo sobrenome
    )
  }, [profissionalNome])

  // Filtrar consultas
  const consultasFiltradas = useMemo(() => {
    let resultado = todasConsultas

    // Filtro por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(consulta => consulta.status === filtroStatus)
    }

    // Filtro por data
    if (filtroData) {
      resultado = resultado.filter(consulta => 
        consulta.dataISO.startsWith(filtroData)
      )
    }

    // Busca por nome do paciente
    if (busca) {
      resultado = resultado.filter(consulta =>
        consulta.usuarioId?.toLowerCase().includes(busca.toLowerCase()) ||
        consulta.especialidade?.toLowerCase().includes(busca.toLowerCase()) ||
        consulta.notas?.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Ordenar por data (mais próximas primeiro)
    return resultado.sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
  }, [todasConsultas, filtroStatus, filtroData, busca])


  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'long' })
    }
  }

  const handleAcaoConsulta = (consulta: Agendamento, acao: 'confirmar' | 'cancelar' | 'concluir') => {
    // Aqui seria feita a chamada para a API
    console.log(`Ação ${acao} na consulta:`, consulta.id)
    // Por enquanto, apenas log
  }

  const estatisticas = useMemo(() => {
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000)

    return {
      total: todasConsultas.length,
      hoje: todasConsultas.filter(c => {
        const dataConsulta = new Date(c.dataISO)
        return dataConsulta >= inicioHoje && dataConsulta < fimHoje
      }).length,
      pendentes: todasConsultas.filter(c => c.status === "pendente").length,
      confirmadas: todasConsultas.filter(c => c.status === "confirmado").length,
      concluidas: todasConsultas.filter(c => c.status === "concluido").length
    }
  }, [todasConsultas])

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold">{estatisticas.hoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold">{estatisticas.confirmadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{estatisticas.concluidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Buscar por paciente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                  setFiltroData("")
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {consultasFiltradas.map((consulta) => {
          const { data, hora, diaSemana } = formatarData(consulta.dataISO)
          
          return (
            <Card key={consulta.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Paciente: {consulta.usuarioId || "Não informado"}</h3>
                        <p className="text-gray-600">{consulta.especialidade}</p>
                      </div>
                      <StatusBadge status={consulta.status as any} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{data} ({diaSemana})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{hora}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{consulta.local}</span>
                      </div>
                    </div>

                    {consulta.notas && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Observações:</strong> {consulta.notas}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 md:ml-4">
                    {consulta.status === "pendente" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleAcaoConsulta(consulta, 'confirmar')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAcaoConsulta(consulta, 'cancelar')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    {consulta.status === "confirmado" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleAcaoConsulta(consulta, 'concluir')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAcaoConsulta(consulta, 'cancelar')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setConsultaSelecionada(consulta)
                            setObservacoes(consulta.notas || "")
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Consulta</DialogTitle>
                          <DialogDescription>
                            Informações completas e observações da consulta
                          </DialogDescription>
                        </DialogHeader>
                        
                        {consultaSelecionada && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Paciente</Label>
                                <p className="font-medium">{consultaSelecionada.usuarioId || "Não informado"}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="mt-1">
                                  <StatusBadge status={consultaSelecionada.status as any} />
                                </div>
                              </div>
                              <div>
                                <Label>Data e Hora</Label>
                                <p className="font-medium">{formatarData(consultaSelecionada.dataISO).data} às {formatarData(consultaSelecionada.dataISO).hora}</p>
                              </div>
                              <div>
                                <Label>Local</Label>
                                <p className="font-medium">{consultaSelecionada.local}</p>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="observacoes">Observações</Label>
                              <Textarea
                                id="observacoes"
                                value={observacoes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacoes(e.target.value)}
                                placeholder="Adicione observações sobre a consulta..."
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Cancelar</Button>
                              <Button>Salvar Observações</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {consultasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma consulta encontrada</h3>
              <p className="text-gray-600">
                Não há consultas que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
