"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { generateMockProntuarios, type ProntuarioMedico } from "@/lib/mocks/medical-records"
import { generateMockPacientes } from "@/lib/mocks/patients"
import { FileText, Edit, Save, Plus, Search, Calendar, User, Stethoscope, X } from "lucide-react"

interface ProfessionalProntuariosClientProps {
  profissionalNome: string
  profissionalId: string
}

export function ProfessionalProntuariosClient({ profissionalNome, profissionalId }: ProfessionalProntuariosClientProps) {
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [prontuarioSelecionado, setProntuarioSelecionado] = useState<ProntuarioMedico | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [novosProntuarios, setNovosProntuarios] = useState<ProntuarioMedico[]>([])
  const [mostrarNovoProntuario, setMostrarNovoProntuario] = useState(false)

  // Estados para edição
  const [dadosEdicao, setDadosEdicao] = useState<Partial<ProntuarioMedico>>({})

  // Gerar dados mock
  const prontuariosMock = useMemo(() => generateMockProntuarios(), [])
  const pacientesMock = useMemo(() => generateMockPacientes(), [])

  // Filtrar prontuários do profissional
  const prontuariosProfissional = useMemo(() => {
    // Para demonstração, vamos mostrar todos os prontuários mock
    // Em produção, filtraria apenas os do profissional logado
    const prontuarios = [...prontuariosMock, ...novosProntuarios]

    let resultado = prontuarios

    // Filtro por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(p => p.status === filtroStatus)
    }

    // Busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase()
      resultado = resultado.filter(p =>
        p.pacienteNome.toLowerCase().includes(termoBusca) ||
        p.tipoConsulta.toLowerCase().includes(termoBusca) ||
        p.diagnostico?.toLowerCase().includes(termoBusca) ||
        p.observacoes.toLowerCase().includes(termoBusca)
      )
    }

    return resultado.sort((a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime())
  }, [prontuariosMock, novosProntuarios, profissionalNome, filtroStatus, busca])

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }


  const iniciarEdicao = (prontuario: ProntuarioMedico) => {
    setProntuarioSelecionado(prontuario)
    setDadosEdicao({
      tipoConsulta: prontuario.tipoConsulta,
      diagnostico: prontuario.diagnostico || "",
      observacoes: prontuario.observacoes,
      prescricoes: prontuario.prescricoes || [],
      proximaConsulta: prontuario.proximaConsulta || "",
      status: prontuario.status
    })
    setModoEdicao(true)
  }

  const salvarEdicao = () => {
    if (!prontuarioSelecionado) return

    // Atualizar prontuário (em um app real, seria uma chamada à API)
    const prontuarioAtualizado = {
      ...prontuarioSelecionado,
      ...dadosEdicao,
      atualizadoEm: new Date().toISOString()
    }

    // Atualizar na lista de novos prontuários se for um novo, senão simular atualização
    if (novosProntuarios.find(p => p.id === prontuarioSelecionado.id)) {
      setNovosProntuarios(prev => 
        prev.map(p => p.id === prontuarioSelecionado.id ? prontuarioAtualizado : p)
      )
    }

    console.log("Prontuário salvo:", prontuarioAtualizado)
    setModoEdicao(false)
    setProntuarioSelecionado(prontuarioAtualizado)
  }

  const criarNovoProntuario = () => {
    const novoProntuario: ProntuarioMedico = {
      id: `pront_${Date.now()}`,
      pacienteId: dadosEdicao.pacienteId || "",
      pacienteNome: dadosEdicao.pacienteNome || "",
      profissionalId: profissionalId,
      profissionalNome: profissionalNome,
      dataConsulta: new Date().toISOString(),
      tipoConsulta: dadosEdicao.tipoConsulta || "",
      diagnostico: dadosEdicao.diagnostico,
      observacoes: dadosEdicao.observacoes || "",
      prescricoes: dadosEdicao.prescricoes || [],
      proximaConsulta: dadosEdicao.proximaConsulta,
      status: "ativo",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    setNovosProntuarios(prev => [novoProntuario, ...prev])
    setMostrarNovoProntuario(false)
    setDadosEdicao({})
  }

  const adicionarPrescricao = () => {
    const prescricoes = dadosEdicao.prescricoes || []
    setDadosEdicao({
      ...dadosEdicao,
      prescricoes: [...prescricoes, ""]
    })
  }

  const atualizarPrescricao = (index: number, valor: string) => {
    const prescricoes = [...(dadosEdicao.prescricoes || [])]
    prescricoes[index] = valor
    setDadosEdicao({
      ...dadosEdicao,
      prescricoes
    })
  }

  const removerPrescricao = (index: number) => {
    const prescricoes = [...(dadosEdicao.prescricoes || [])]
    prescricoes.splice(index, 1)
    setDadosEdicao({
      ...dadosEdicao,
      prescricoes
    })
  }

  const estatisticas = useMemo(() => {
    return {
      total: prontuariosProfissional.length,
      ativos: prontuariosProfissional.filter(p => p.status === "ativo").length,
      emAndamento: prontuariosProfissional.filter(p => p.status === "em_andamento").length,
      arquivados: prontuariosProfissional.filter(p => p.status === "arquivado").length
    }
  }, [prontuariosProfissional])

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
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
              <Stethoscope className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">{estatisticas.emAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Arquivados</p>
                <p className="text-2xl font-bold">{estatisticas.arquivados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Novo Prontuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <Dialog open={mostrarNovoProntuario} onOpenChange={setMostrarNovoProntuario}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prontuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Prontuário</DialogTitle>
                  <DialogDescription>
                    Preencha as informações para criar um novo prontuário médico
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pacienteNome">Nome do Paciente</Label>
                      <Input
                        id="pacienteNome"
                        value={dadosEdicao.pacienteNome || ""}
                        onChange={(e) => setDadosEdicao({...dadosEdicao, pacienteNome: e.target.value})}
                        placeholder="Nome completo do paciente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipoConsulta">Tipo de Consulta</Label>
                      <Input
                        id="tipoConsulta"
                        value={dadosEdicao.tipoConsulta || ""}
                        onChange={(e) => setDadosEdicao({...dadosEdicao, tipoConsulta: e.target.value})}
                        placeholder="Ex: Consulta inicial, Retorno"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diagnostico">Diagnóstico</Label>
                    <Input
                      id="diagnostico"
                      value={dadosEdicao.diagnostico || ""}
                      onChange={(e) => setDadosEdicao({...dadosEdicao, diagnostico: e.target.value})}
                      placeholder="Diagnóstico médico"
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={dadosEdicao.observacoes || ""}
                      onChange={(e) => setDadosEdicao({...dadosEdicao, observacoes: e.target.value})}
                      placeholder="Observações detalhadas sobre a consulta"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setMostrarNovoProntuario(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={criarNovoProntuario}>
                      Criar Prontuário
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Buscar por paciente, diagnóstico..."
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prontuários */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prontuariosProfissional.map((prontuario) => (
          <Card key={prontuario.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight break-words pr-2">{prontuario.pacienteNome}</CardTitle>
                    <CardDescription className="mt-1 break-words">{prontuario.tipoConsulta}</CardDescription>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <StatusBadge status={prontuario.status} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 flex-shrink-0">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{formatarData(prontuario.dataConsulta)}</span>
              </div>

              {prontuario.diagnostico && (
                <div className="p-2 bg-blue-50 rounded text-sm flex-shrink-0">
                  <p className="font-medium text-blue-800">Diagnóstico:</p>
                  <p className="text-blue-700 break-words">{prontuario.diagnostico}</p>
                </div>
              )}

              <div className="text-sm text-gray-600 flex-1 min-h-0 overflow-hidden">
                <p className="break-words line-clamp-3">{prontuario.observacoes.substring(0, 150)}...</p>
              </div>

              {/* Botão sempre na base */}
              <div className="mt-auto pt-3 border-t flex-shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setProntuarioSelecionado(prontuario)
                        setModoEdicao(false)
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver/Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <DialogTitle>Prontuário Médico</DialogTitle>
                          <DialogDescription>
                            {prontuarioSelecionado?.pacienteNome} - {prontuarioSelecionado?.tipoConsulta}
                          </DialogDescription>
                        </div>
                        <div className="flex space-x-2">
                          {!modoEdicao ? (
                            <Button onClick={() => iniciarEdicao(prontuario)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" onClick={() => setModoEdicao(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={salvarEdicao}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogHeader>
                    
                    {prontuarioSelecionado && (
                      <div className="space-y-6">
                        {/* Informações Básicas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Paciente</Label>
                            <p className="font-medium">{prontuarioSelecionado.pacienteNome}</p>
                          </div>
                          <div>
                            <Label>Data da Consulta</Label>
                            <p className="font-medium">{formatarData(prontuarioSelecionado.dataConsulta)}</p>
                          </div>
                        </div>

                        {/* Campos Editáveis */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="tipoConsultaEdit">Tipo de Consulta</Label>
                            {modoEdicao ? (
                              <Input
                                id="tipoConsultaEdit"
                                value={dadosEdicao.tipoConsulta || ""}
                                onChange={(e) => setDadosEdicao({...dadosEdicao, tipoConsulta: e.target.value})}
                              />
                            ) : (
                              <p className="p-2 bg-gray-50 rounded">{prontuarioSelecionado.tipoConsulta}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="diagnosticoEdit">Diagnóstico</Label>
                            {modoEdicao ? (
                              <Input
                                id="diagnosticoEdit"
                                value={dadosEdicao.diagnostico || ""}
                                onChange={(e) => setDadosEdicao({...dadosEdicao, diagnostico: e.target.value})}
                                placeholder="Diagnóstico médico"
                              />
                            ) : (
                              <p className="p-2 bg-gray-50 rounded">{prontuarioSelecionado.diagnostico || "Não informado"}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="observacoesEdit">Observações</Label>
                            {modoEdicao ? (
                              <Textarea
                                id="observacoesEdit"
                                value={dadosEdicao.observacoes || ""}
                                onChange={(e) => setDadosEdicao({...dadosEdicao, observacoes: e.target.value})}
                                rows={4}
                              />
                            ) : (
                              <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap">{prontuarioSelecionado.observacoes}</p>
                            )}
                          </div>

                          {/* Prescrições */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Prescrições</Label>
                              {modoEdicao && (
                                <Button size="sm" variant="outline" onClick={adicionarPrescricao}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              )}
                            </div>
                            {modoEdicao ? (
                              <div className="space-y-2">
                                {(dadosEdicao.prescricoes || []).map((prescricao, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Input
                                      value={prescricao}
                                      onChange={(e) => atualizarPrescricao(index, e.target.value)}
                                      placeholder="Digite a prescrição"
                                    />
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => removerPrescricao(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2 bg-gray-50 rounded">
                                {prontuarioSelecionado.prescricoes && prontuarioSelecionado.prescricoes.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {prontuarioSelecionado.prescricoes.map((prescricao, index) => (
                                      <li key={index}>{prescricao}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">Nenhuma prescrição registrada</p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="proximaConsultaEdit">Próxima Consulta</Label>
                              {modoEdicao ? (
                                <Input
                                  id="proximaConsultaEdit"
                                  type="date"
                                  value={dadosEdicao.proximaConsulta ? dadosEdicao.proximaConsulta.split('T')[0] : ""}
                                  onChange={(e) => setDadosEdicao({...dadosEdicao, proximaConsulta: e.target.value ? new Date(e.target.value).toISOString() : ""})}
                                />
                              ) : (
                                <p className="p-2 bg-gray-50 rounded">
                                  {prontuarioSelecionado.proximaConsulta ? formatarData(prontuarioSelecionado.proximaConsulta) : "Não agendada"}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="statusEdit">Status</Label>
                              {modoEdicao ? (
                                <Select
                                  value={dadosEdicao.status || ""}
                                  onValueChange={(value) => setDadosEdicao({...dadosEdicao, status: value as "ativo" | "arquivado" | "em_andamento"})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                    <SelectItem value="arquivado">Arquivado</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-2">
                                  <StatusBadge status={prontuarioSelecionado.status} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Informações de Auditoria */}
                        <div className="pt-4 border-t text-sm text-gray-500">
                          <p>Criado em: {formatarData(prontuarioSelecionado.criadoEm)}</p>
                          <p>Última atualização: {formatarData(prontuarioSelecionado.atualizadoEm)}</p>
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

      {prontuariosProfissional.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prontuário encontrado</h3>
            <p className="text-gray-600">
              {busca || filtroStatus !== "todos" 
                ? "Não há prontuários que correspondam aos filtros selecionados." 
                : "Você ainda não tem prontuários cadastrados."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
