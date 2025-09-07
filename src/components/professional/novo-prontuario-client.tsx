"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, User, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { PacienteAtendido } from "@/services/database/consultas.service"

interface NovoProntuarioClientProps {
  profissionalNome: string
  profissionalId: string
}

export function NovoProntuarioClient({ profissionalNome, profissionalId }: NovoProntuarioClientProps) {
  const router = useRouter()
  const [pacientesAtendidos, setPacientesAtendidos] = useState<PacienteAtendido[]>([])
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [carregandoPacientes, setCarregandoPacientes] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>("")
  const [sucesso, setSucesso] = useState<string>("")

  // Buscar pacientes atendidos ao carregar o componente
  useEffect(() => {
    buscarPacientesAtendidos()
  }, [])

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
      setErro('Erro ao carregar lista de pacientes atendidos')
    } finally {
      setCarregandoPacientes(false)
    }
  }

  const handleArquivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setErro("")
    setSucesso("")

    if (file) {
      // Verificar se é PDF
      if (file.type !== 'application/pdf') {
        setErro('Apenas arquivos PDF são permitidos')
        setArquivo(null)
        return
      }

      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErro('O arquivo deve ter no máximo 10MB')
        setArquivo(null)
        return
      }

      setArquivo(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!pacienteSelecionado) {
      setErro('Selecione um paciente')
      return
    }

    if (!arquivo) {
      setErro('Selecione um arquivo PDF')
      return
    }

    try {
      setEnviando(true)
      setErro("")
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
      
      // Limpar formulário
      setPacienteSelecionado("")
      setArquivo(null)
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/tela-profissional/prontuarios')
      }, 2000)

    } catch (error) {
      console.error('Erro ao criar prontuário:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao criar prontuário')
    } finally {
      setEnviando(false)
    }
  }

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  const pacienteInfo = pacientesAtendidos.find(p => p.id === pacienteSelecionado)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Informações do Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Informações do Profissional</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-900">{profissionalNome}</p>
          <p className="text-sm text-gray-600">ID: {profissionalId}</p>
        </CardContent>
      </Card>

      {/* Formulário de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>Criar Prontuário</span>
          </CardTitle>
          <CardDescription>
            Selecione um paciente que já foi atendido e faça upload do prontuário em PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            {pacienteInfo && (
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
            )}

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
            {erro && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700">{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{sucesso}</span>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/tela-profissional/prontuarios')}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
