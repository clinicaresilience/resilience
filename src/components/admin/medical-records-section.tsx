"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  generateMockProntuarios, 
  generateHistoricoPacientes,
  buscarProntuarios,
  filtrarProntuariosPorStatus,
 
} from "@/lib/mocks/medical-records"
import { Search, FileText, User, Calendar, Filter, Eye } from "lucide-react"
import { StatusBadge, type GenericStatus } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ViewMode = "prontuarios" | "historico"

export function MedicalRecordsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("prontuarios")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")

  // Dados mock
  const allProntuarios = useMemo(() => generateMockProntuarios(), [])
  const historicoPacientes = useMemo(() => generateHistoricoPacientes(allProntuarios), [allProntuarios])

  // Filtros aplicados
  const filteredProntuarios = useMemo(() => {
    let filtered = buscarProntuarios(allProntuarios, searchTerm)
    filtered = filtrarProntuariosPorStatus(filtered, statusFilter)
    return filtered.sort((a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime())
  }, [allProntuarios, searchTerm, statusFilter])

  const filteredHistorico = useMemo(() => {
    if (!searchTerm.trim()) return historicoPacientes
    const termoLower = searchTerm.toLowerCase()
    return historicoPacientes.filter(hist => 
      hist.pacienteNome.toLowerCase().includes(termoLower) ||
      hist.profissionaisAtendentes.some(prof => prof.toLowerCase().includes(termoLower))
    )
  }, [historicoPacientes, searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  return (
    <div className="w-full">
      {/* Cabeçalho e filtros */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-azul-escuro mb-4">Prontuários e Histórico Médico</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Botões de modo */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "prontuarios" ? "default" : "outline"}
              onClick={() => setViewMode("prontuarios")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Prontuários
            </Button>
            <Button
              variant={viewMode === "historico" ? "default" : "outline"}
              onClick={() => setViewMode("historico")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Histórico por Paciente
            </Button>
          </div>

          {/* Busca */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={viewMode === "prontuarios" ? "Buscar por paciente, profissional, diagnóstico..." : "Buscar por paciente ou profissional..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Filtro de status */}
          {viewMode === "prontuarios" && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Prontuários */}
      {viewMode === "prontuarios" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProntuarios.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum prontuário encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            filteredProntuarios.map((prontuario) => (
              <Card key={prontuario.id} className="flex flex-col hover:shadow-md transition-shadow h-full overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-azul-escuro truncate">{prontuario.pacienteNome}</CardTitle>
                        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
                          <span className="truncate max-w-[150px]">Dr(a). {prontuario.profissionalNome}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{formatDate(prontuario.dataConsulta)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate max-w-[120px]">{prontuario.tipoConsulta}</span>
                        </div>
                      </div>
                      <StatusBadge status={prontuario.status as GenericStatus} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 space-y-2">
                    {prontuario.diagnostico && (
                      <div>
                        <strong className="text-sm text-gray-700">Diagnóstico:</strong>
                        <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">{prontuario.diagnostico}</p>
                      </div>
                    )}
                    <div>
                      <strong className="text-sm text-gray-700">Observações:</strong>
                      <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">{prontuario.observacoes}</p>
                    </div>
                    {prontuario.proximaConsulta && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Calendar className="h-4 w-4" />
                        <span className="truncate">Próxima: {formatDate(prontuario.proximaConsulta)}</span>
                      </div>
                    )}
                  </div>

                  {/* Botão Ver Detalhes */}
                  <div className="mt-auto pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full flex items-center gap-1 justify-center">
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-azul-escuro">Detalhes do Prontuário</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <strong className="text-sm text-gray-800 font-medium">Paciente:</strong>
                            <p className="mt-1 text-gray-900 break-words">{prontuario.pacienteNome}</p>
                          </div>

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">Profissional:</strong>
                            <p className="mt-1 text-gray-900 break-words">{prontuario.profissionalNome}</p>
                          </div>

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">Tipo de Consulta:</strong>
                            <p className="mt-1 text-gray-900">{prontuario.tipoConsulta}</p>
                          </div>

                          {prontuario.diagnostico && (
                            <div>
                              <strong className="text-sm text-gray-800 font-medium">Diagnóstico:</strong>
                              <p className="mt-1 text-gray-900 break-words">{prontuario.diagnostico}</p>
                            </div>
                          )}

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">Observações:</strong>
                            <p className="mt-1 text-gray-900 whitespace-pre-wrap break-words">{prontuario.observacoes}</p>
                          </div>

                          {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
                            <div>
                              <strong className="text-sm text-gray-800 font-medium">Prescrições/Recomendações:</strong>
                              <ul className="mt-1 list-disc list-inside space-y-1">
                                {prontuario.prescricoes.map((prescricao, index) => (
                                  <li key={index} className="text-sm text-gray-900 break-words">{prescricao}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {prontuario.proximaConsulta && (
                            <div>
                              <strong className="text-sm text-gray-800 font-medium">Próxima Consulta:</strong>
                              <p className="mt-1 text-gray-900">{formatDate(prontuario.proximaConsulta)}</p>
                            </div>
                          )}

                          <div className="flex justify-between text-xs text-gray-600 pt-4 border-t border-gray-200">
                            <span>Criado em: {formatDate(prontuario.criadoEm)}</span>
                            <span>Atualizado em: {formatDate(prontuario.atualizadoEm)}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Histórico por Paciente */}
      {viewMode === "historico" && (
        <div className="grid gap-4">
          {filteredHistorico.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum histórico encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            filteredHistorico.map((historico) => (
              <Card key={historico.pacienteId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <CardTitle className="text-lg text-azul-escuro truncate">{historico.pacienteNome}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{historico.totalConsultas} consulta(s)</span>
                        <span>•</span>
                        <span>Última: {formatDate(historico.ultimaConsulta)}</span>
                        {historico.proximaConsulta && (
                          <>
                            <span>•</span>
                            <span>Próxima: {formatDate(historico.proximaConsulta)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={historico.statusAtual as GenericStatus} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <strong className="text-sm text-gray-700">Profissionais Atendentes:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {historico.profissionaisAtendentes.map((prof, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs truncate">
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                  {historico.observacoesGerais && (
                    <div>
                      <strong className="text-sm text-gray-700">Observações Gerais:</strong>
                      <p className="text-sm text-gray-600 mt-1 break-words">{historico.observacoesGerais}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
