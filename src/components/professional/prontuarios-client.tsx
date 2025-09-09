"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Edit, Save, Plus, Calendar, User, Stethoscope, Upload, AlertCircle, CheckCircle, X } from "lucide-react"
import { PacienteAtendido, Consulta } from "@/services/database/consultas.service"

interface ProfessionalProntuariosClientProps {
  profissionalNome: string
  profissionalId: string
}

export function ProfessionalProntuariosClient({ profissionalNome, profissionalId }: ProfessionalProntuariosClientProps) {
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [prontuarioSelecionado, setProntuarioSelecionado] = useState<Consulta | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [mostrarNovoProntuario, setMostrarNovoProntuario] = useState(false)

  // Estados para dados do banco
  const [prontuarios, setProntuarios] = useState<Consulta[]>([])
  const [carregandoProntuarios, setCarregandoProntuarios] = useState(true)
  const [erro, setErro] = useState<string>("")

  // Estados para edição
  const [dadosEdicao, setDadosEdicao] = useState<Partial<Consulta>>({})

  // Estados para criação de prontuário PDF
  const [pacientesAtendidos, setPacientesAtendidos] = useState<PacienteAtendido[]>([])
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [carregandoPacientes, setCarregandoPacientes] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroModal, setErroModal] = useState<string>("")
  const [sucesso, setSucesso] = useState<string>("")

  // Buscar prontuários do banco
  useEffect(() => {
    buscarProntuarios()
  }, [profissionalId])

  const buscarProntuarios = async () => {
    try {
      setCarregandoProntuarios(true)
      setErro("")
      const response = await fetch('/api/consultas/prontuarios')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar prontuários')
      }

      setProntuarios(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar prontuários:', error)
      setErro('Erro ao carregar prontuários')
    } finally {
      setCarregandoProntuarios(false)
    }
  }

  // Filtrar prontuários
  const prontuariosFiltrados = useMemo(() => {
    let resultado = prontuarios

    // Busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase()
      resultado = resultado.filter(p =>
        p.paciente?.nome.toLowerCase().includes(termoBusca) ||
        p.observacoes?.toLowerCase().includes(termoBusca)
      )
    }

    // Filtro por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(p => p.status_consulta === filtroStatus)
    }

    return resultado.sort((a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime())
  }, [prontuarios, busca, filtroStatus])

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  const iniciarEdicao = (consulta: Consulta) => {
    setProntuarioSelecionado(consulta)
    setDadosEdicao({
      observacoes: consulta.observacoes || "",
      modalidade: consulta.modalidade || "",
      local: consulta.local || "",
      status_consulta: consulta.status_consulta
    })
    setModoEdicao(true)
  }

  const salvarEdicao = async () => {
    if (!prontuarioSelecionado) return

    try {
      // Em uma implementação real, aqui faria uma chamada à API para atualizar
      console.log("Dados para salvar:", dadosEdicao)
      
      // Simular atualização local por enquanto
      const prontuarioAtualizado = {
        ...prontuarioSelecionado,
        ...dadosEdicao
      }

      // Atualizar na lista local
      setProntuarios(prev => 
        prev.map(p => p.id === prontuarioSelecionado.id ? prontuarioAtualizado : p)
      )

      setModoEdicao(false)
      setProntuarioSelecionado(prontuarioAtualizado)
    } catch (error) {
      console.error('Erro ao salvar edição:', error)
    }
  }

  // Funções para criação de prontuário PDF
  const buscarPacientesAtendidos = async () => {
    try {
      setCarregandoPacientes(true)
      const response = await fetch('/api/consultas/pacientes-atendidos')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar pacientes')
      }

      setPacientesAtendidos(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar pacientes atendidos:', error)
      setErroModal('Erro ao carregar lista de pacientes atendidos')
    } finally {
      setCarregandoPacientes(false)
    }
  }

  const handleArquivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setErroModal("")
    setSucesso("")

    if (file) {
      // Verificar se é PDF
      if (file.type !== 'application/pdf') {
        setErroModal('Apenas arquivos PDF são permitidos')
        setArquivo(null)
        return
      }

      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErroModal('O arquivo deve ter no máximo 10MB')
        setArquivo(null)
        return
      }

      setArquivo(file)
    }
  }

  const handleSubmitProntuario = async () => {
    if (!pacienteSelecionado) {
      setErroModal('Selecione um paciente')
      return
    }

    if (!arquivo) {
      setErroModal('Selecione um arquivo PDF')
      return
    }

    try {
      setEnviando(true)
      setErroModal("")
      setSucesso("")

      const formData = new FormData()
      formData.append('pacienteId', pacienteSelecionado)
      formData.append('arquivo', arquivo)

      const response = await fetch('/api/consultas/prontuarios', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar prontuário')
      }

      setSucesso('Prontuário criado com sucesso!')
      
      // Recarregar lista de prontuários e fechar modal após 2 segundos
      setTimeout(() => {
        setMostrarNovoProntuario(false)
        resetarFormulario()
        buscarProntuarios() // Recarregar a lista
      }, 2000)

    } catch (error) {
      console.error('Erro ao criar prontuário:', error)
      setErroModal(error instanceof Error ? error.message : 'Erro ao criar prontuário')
    } finally {
      setEnviando(false)
    }
  }

  const resetarFormulario = () => {
    setPacienteSelecionado("")
    setArquivo(null)
    setErroModal("")
    setSucesso("")
    setPacientesAtendidos([])
  }

  const estatisticas = useMemo(() => {
    return {
      total: prontuariosFiltrados.length,
      comProntuario: prontuariosFiltrados.filter(p => p.prontuario).length,
      semProntuario: prontuariosFiltrados.filter(p => !p.prontuario).length,
      recentes: prontuariosFiltrados.filter(p => {
        const dataConsulta = new Date(p.data_consulta)
        const agora = new Date()
        const diasAtras = (agora.getTime() - dataConsulta.getTime()) / (1000 * 60 * 60 * 24)
        return diasAtras <= 30
      }).length
    }
  }, [prontuariosFiltrados])

  return (
    <div className="space-y-6">
      {/* Mensagem de Erro Global */}
      {erro && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{erro}</span>
        </div>
      )}

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
                <p className="text-sm text-gray-600">Com Prontuário</p>
                <p className="text-2xl font-bold">{estatisticas.comProntuario}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Prontuário</p>
                <p className="text-2xl font-bold">{estatisticas.semProntuario}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Recentes (30d)</p>
                <p className="text-2xl font-bold">{estatisticas.recentes}</p>
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
                <Button onClick={() => {
                  setMostrarNovoProntuario(true)
                  buscarPacientesAtendidos()
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prontuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Prontuário</DialogTitle>
                  <DialogDescription>
                    Selecione um paciente atendido e faça upload do prontuário em PDF
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Seleção de Paciente */}
                  <div>
                    <Label htmlFor="paciente">Paciente *</Label>
                    {carregandoPacientes ? (
                      <div className="p-3 text-center text-gray-500">
                        Carregando pacientes...
                      </div>
                    ) : pacientesAtendidos.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 bg-gray-50 rounded-md">
                        Nenhum paciente atendido encontrado.
                        <br />
                        <span className="text-sm">Apenas pacientes com consultas concluídas podem ter prontuários.</span>
                      </div>
                    ) : (
                      <Select value={pacienteSelecionado} onValueChange={setPacienteSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente atendido" />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientesAtendidos.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{paciente.nome}</span>
                                <span className="text-sm text-gray-500">
                                  Última consulta: {formatarData(paciente.ultimaConsulta)} • 
                                  {paciente.totalConsultas} consulta{paciente.totalConsultas > 1 ? 's' : ''}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Informações do Paciente Selecionado */}
                  {pacienteSelecionado && (() => {
                    const pacienteInfo = pacientesAtendidos.find(p => p.id === pacienteSelecionado)
                    return pacienteInfo ? (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Paciente Selecionado</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><strong>Nome:</strong> {pacienteInfo.nome}</p>
                            <p><strong>Email:</strong> {pacienteInfo.email}</p>
                            <p><strong>Última consulta:</strong> {formatarData(pacienteInfo.ultimaConsulta)}</p>
                            <p><strong>Total de consultas:</strong> {pacienteInfo.totalConsultas}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null
                  })()}

                  {/* Upload de Arquivo */}
                  <div>
                    <Label htmlFor="arquivo">Arquivo PDF do Prontuário *</Label>
                    <div className="mt-1">
                      <Input
                        id="arquivo"
                        type="file"
                        accept=".pdf"
                        onChange={handleArquivoChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Apenas arquivos PDF são aceitos. Tamanho máximo: 10MB
                    </p>
                  </div>

                  {/* Informações do Arquivo */}
                  {arquivo && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Arquivo Selecionado</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Nome:</strong> {arquivo.name}</p>
                          <p><strong>Tamanho:</strong> {(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p><strong>Tipo:</strong> {arquivo.type}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mensagens de Erro e Sucesso */}
                  {erroModal && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">{erroModal}</span>
                    </div>
                  )}

                  {sucesso && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">{sucesso}</span>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setMostrarNovoProntuario(false)
                      resetarFormulario()
                    }}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitProntuario}
                      disabled={!pacienteSelecionado || !arquivo || enviando || pacientesAtendidos.length === 0}
                      className="flex items-center space-x-2"
                    >
                      {enviando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Criar Prontuário</span>
                        </>
                      )}
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
                placeholder="Buscar por paciente, observações..."
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
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusca("")
                  setFiltroStatus("todos")
                  buscarProntuarios()
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prontuários */}
      {carregandoProntuarios ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando prontuários...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prontuariosFiltrados.map((consulta) => (
              <Card key={consulta.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight break-words truncate pr-2">
                          {consulta.paciente?.nome || 'Paciente não identificado'}
                        </CardTitle>
                        <CardDescription className="mt-1 break-words truncate">
                          Consulta - {consulta.modalidade}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {consulta.prontuario ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Com PDF
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Sem PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 flex-shrink-0">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words">{formatarData(consulta.data_consulta)}</span>
                  </div>

                  {consulta.observacoes && (
                    <div className="p-2 bg-blue-50 rounded text-sm flex-shrink-0">
                      <p className="font-medium text-blue-800">Observações:</p>
                      <p className="text-blue-700 break-words">{consulta.observacoes.substring(0, 100)}...</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 flex-1 min-h-0 overflow-hidden">
                    <p className="break-words">
                      Status: <span className="font-medium">{consulta.status_consulta}</span>
                    </p>
                    <p className="break-words">
                      Modalidade: <span className="font-medium">{consulta.modalidade}</span>
                    </p>
                  </div>

                  {/* Botão sempre na base */}
                  <div className="mt-auto pt-3 border-t flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            setProntuarioSelecionado(consulta)
                            setModoEdicao(false)
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <DialogTitle className="text-blue-900">Consulta Médica</DialogTitle>
                              <DialogDescription className="text-gray-700">
                                {prontuarioSelecionado?.paciente?.nome} - {formatarData(prontuarioSelecionado?.data_consulta || '')}
                              </DialogDescription>
                            </div>
                            <div className="flex space-x-2">
                              {!modoEdicao ? (
                                <Button onClick={() => iniciarEdicao(consulta)}>
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
                                <Label className="text-gray-800 font-medium">Paciente</Label>
                                <p className="font-medium text-gray-900">{prontuarioSelecionado.paciente?.nome}</p>
                              </div>
                              <div>
                                <Label className="text-gray-800 font-medium">Data da Consulta</Label>
                                <p className="font-medium text-gray-900">{formatarData(prontuarioSelecionado.data_consulta)}</p>
                              </div>
                            </div>

                            {/* Campos Editáveis */}
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="modalidadeEdit" className="text-gray-800 font-medium">Modalidade</Label>
                                {modoEdicao ? (
                                  <Select
                                    value={dadosEdicao.modalidade || ""}
                                    onValueChange={(value) => setDadosEdicao({...dadosEdicao, modalidade: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a modalidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="presencial">Presencial</SelectItem>
                                      <SelectItem value="online">Online</SelectItem>
                                      <SelectItem value="domicilio">Domicílio</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <p className="p-2 bg-gray-50 rounded text-gray-900">{prontuarioSelecionado.modalidade}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="localEdit" className="text-gray-800 font-medium">Local</Label>
                                {modoEdicao ? (
                                  <Input
                                    id="localEdit"
                                    value={dadosEdicao.local || ""}
                                    onChange={(e) => setDadosEdicao({...dadosEdicao, local: e.target.value})}
                                    placeholder="Local da consulta"
                                  />
                                ) : (
                                  <p className="p-2 bg-gray-50 rounded text-gray-900">{prontuarioSelecionado.local || "Não informado"}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="observacoesEdit" className="text-gray-800 font-medium">Observações</Label>
                                {modoEdicao ? (
                                  <Textarea
                                    id="observacoesEdit"
                                    value={dadosEdicao.observacoes || ""}
                                    onChange={(e) => setDadosEdicao({...dadosEdicao, observacoes: e.target.value})}
                                    rows={4}
                                    placeholder="Observações da consulta"
                                  />
                                ) : (
                                  <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap text-gray-900">{prontuarioSelecionado.observacoes || "Nenhuma observação"}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="statusEdit" className="text-gray-800 font-medium">Status</Label>
                                {modoEdicao ? (
                                  <Select
                                    value={dadosEdicao.status_consulta || ""}
                                    onValueChange={(value) => setDadosEdicao({...dadosEdicao, status_consulta: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="agendado">Agendado</SelectItem>
                                      <SelectItem value="concluido">Concluído</SelectItem>
                                      <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="p-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {prontuarioSelecionado.status_consulta}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Prontuário PDF */}
                            <div className="pt-4 border-t border-gray-200">
                              <Label className="text-gray-800 font-medium">Prontuário PDF</Label>
                              {prontuarioSelecionado.prontuario ? (
                                <div className="mt-2 space-y-3">
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <span className="text-green-700 font-medium">Prontuário disponível</span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // Abrir PDF em nova aba
                                            const pdfWindow = window.open()
                                            if (pdfWindow) {
                                              pdfWindow.document.write(`
                                                <iframe width='100%' height='100%' src='${prontuarioSelecionado.prontuario}'></iframe>
                                              `)
                                            }
                                          }}
                                        >
                                          <FileText className="h-3 w-3 mr-1" />
                                          Ver PDF
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">
                                      Arquivo PDF anexado a esta consulta.
                                    </p>
                                  </div>

                                  {/* Ações do PDF */}
                                  {modoEdicao && (
                                    <div className="space-y-3">
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // Implementar substituição de PDF
                                            const input = document.createElement('input')
                                            input.type = 'file'
                                            input.accept = '.pdf'
                                            input.onchange = async (e) => {
                                              const file = (e.target as HTMLInputElement).files?.[0]
                                              if (file) {
                                                if (file.type !== 'application/pdf') {
                                                  alert('Apenas arquivos PDF são permitidos')
                                                  return
                                                }
                                                if (file.size > 10 * 1024 * 1024) {
                                                  alert('O arquivo deve ter no máximo 10MB')
                                                  return
                                                }
                                                
                                                try {
                                                  const formData = new FormData()
                                                  formData.append('consultaId', prontuarioSelecionado.id)
                                                  formData.append('arquivo', file)
                                                  
                                                  const response = await fetch('/api/consultas/prontuarios/substituir', {
                                                    method: 'PUT',
                                                    body: formData,
                                                  })
                                                  
                                                  if (response.ok) {
                                                    alert('PDF substituído com sucesso!')
                                                    buscarProntuarios() // Recarregar dados
                                                  } else {
                                                    alert('Erro ao substituir PDF')
                                                  }
                                                } catch (error) {
                                                  console.error('Erro:', error)
                                                  alert('Erro ao substituir PDF')
                                                }
                                              }
                                            }
                                            input.click()
                                          }}
                                        >
                                          <Upload className="h-3 w-3 mr-1" />
                                          Substituir PDF
                                        </Button>
                                        
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={async () => {
                                            if (confirm('Tem certeza que deseja remover o prontuário PDF? Esta ação não pode ser desfeita.')) {
                                              try {
                                                const response = await fetch('/api/consultas/prontuarios/remover', {
                                                  method: 'DELETE',
                                                  headers: {
                                                    'Content-Type': 'application/json',
                                                  },
                                                  body: JSON.stringify({ consultaId: prontuarioSelecionado.id }),
                                                })
                                                
                                                if (response.ok) {
                                                  alert('PDF removido com sucesso!')
                                                  buscarProntuarios() // Recarregar dados
                                                } else {
                                                  alert('Erro ao remover PDF')
                                                }
                                              } catch (error) {
                                                console.error('Erro:', error)
                                                alert('Erro ao remover PDF')
                                              }
                                            }
                                          }}
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Remover PDF
                                        </Button>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Você pode substituir o arquivo atual ou removê-lo completamente.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-orange-700 font-medium">Nenhum prontuário PDF</span>
                                  </div>
                                  <p className="text-sm text-orange-600 mt-1">
                                    Nenhum arquivo PDF foi anexado a esta consulta ainda.
                                  </p>
                                  
                                  {/* Opção para adicionar PDF quando não existe */}
                                  {modoEdicao && (
                                    <div className="mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          const input = document.createElement('input')
                                          input.type = 'file'
                                          input.accept = '.pdf'
                                          input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0]
                                            if (file) {
                                              if (file.type !== 'application/pdf') {
                                                alert('Apenas arquivos PDF são permitidos')
                                                return
                                              }
                                              if (file.size > 10 * 1024 * 1024) {
                                                alert('O arquivo deve ter no máximo 10MB')
                                                return
                                              }
                                              
                                              try {
                                                const formData = new FormData()
                                                formData.append('consultaId', prontuarioSelecionado.id)
                                                formData.append('arquivo', file)
                                                
                                                const response = await fetch('/api/consultas/prontuarios/adicionar', {
                                                  method: 'POST',
                                                  body: formData,
                                                })
                                                
                                                if (response.ok) {
                                                  alert('PDF adicionado com sucesso!')
                                                  buscarProntuarios() // Recarregar dados
                                                } else {
                                                  alert('Erro ao adicionar PDF')
                                                }
                                              } catch (error) {
                                                console.error('Erro:', error)
                                                alert('Erro ao adicionar PDF')
                                              }
                                            }
                                          }
                                          input.click()
                                        }}
                                      >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Adicionar PDF
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Informações de Auditoria */}
                            <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-gray-700">ID da Consulta: {prontuarioSelecionado.id}</p>
                                  <p className="text-gray-700">Status: {prontuarioSelecionado.status}</p>
                                </div>
                                <div>
                                  <p className="text-gray-700">Modalidade: {prontuarioSelecionado.modalidade}</p>
                                  {prontuarioSelecionado.local && (
                                    <p className="text-gray-700">Local: {prontuarioSelecionado.local}</p>
                                  )}
                                </div>
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

          {prontuariosFiltrados.length === 0 && (
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
        </>
      )}
    </div>
  )
}
