"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Edit,
  Plus,
  Calendar,
  User,
  Stethoscope,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import {
  PacienteAtendido,
  Consulta,
} from "@/services/database/consultas.service";

interface ProfessionalProntuariosClientProps {
  profissionalNome: string;
  profissionalId: string;
  isAdmin?: boolean;
}

export function ProfessionalProntuariosClient({
  profissionalNome,
  profissionalId,
  isAdmin = false,
}: ProfessionalProntuariosClientProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [prontuarioSelecionado, setProntuarioSelecionado] =
    useState<Consulta | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarNovoProntuario, setMostrarNovoProntuario] = useState(false);

  const [prontuarios, setProntuarios] = useState<Consulta[]>([]);
  const [carregandoProntuarios, setCarregandoProntuarios] = useState(true);
  const [erro, setErro] = useState<string>("");

  const [dadosEdicao, setDadosEdicao] = useState<Partial<Consulta>>({});
  
  // Estados para funcionalidade admin de transferência
  const [professionals, setProfessionals] = useState<{ id: string; nome: string; tipo_usuario: string }[]>([]);
  const [transferModal, setTransferModal] = useState<{ consulta: Consulta; newProfessionalId: string } | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);

  const [pacientesAtendidos, setPacientesAtendidos] = useState<
    PacienteAtendido[]
  >([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregandoPacientes, setCarregandoPacientes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");

  // Buscar prontuários
  useEffect(() => {
    buscarProntuarios();
    if (isAdmin) {
      fetchProfessionals();
    }
  }, [profissionalId, isAdmin]);

  const buscarProntuarios = async () => {
    try {
      setCarregandoProntuarios(true);
      setErro("");
      
      // Se for admin, usar API de prontuários, senão usar API de agendamentos
      const endpoint = isAdmin ? "/api/prontuarios" : "/api/agendamentos/prontuarios";
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Erro ao buscar prontuários");
      
      // Se for admin, transformar dados do formato de prontuários para formato de consultas
      if (isAdmin) {
        const prontuariosTransformados = data.data?.map((pront: { id: string; paciente_id: string; profissional_atual_id: string; atualizado_em: string; registros?: unknown[]; paciente: { nome: string } }) => ({
          id: pront.id,
          paciente_id: pront.paciente_id,
          profissional_id: pront.profissional_atual_id,
          data_consulta: pront.atualizado_em,
          modalidade: "Prontuário ",
          status: "concluido",
          local: "",
          observacoes: `${pront.registros?.length || 0} registro(s) no prontuário`,
          paciente: pront.paciente,
          profissional: {
            id: pront.profissional_atual_id,
            nome: "Profissional",
            especialidade: "Especialidade"
          },
          prontuario: (pront.registros?.length ?? 0) > 0 ? { id: pront.id, arquivo: "disponivel" } : null
        })) || [];
        setProntuarios(prontuariosTransformados);
      } else {
        setProntuarios(data.data || []);
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar prontuários");
    } finally {
      setCarregandoProntuarios(false);
    }
  };

  // Buscar profissionais para funcionalidade de transferência (admin apenas)
  const fetchProfessionals = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch("/api/profissionais");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.filter((p: { tipo_usuario: string }) => p.tipo_usuario === 'profissional') || []);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  };

  // Transferir paciente para novo profissional (admin apenas)
  const transferPatient = async (consultaId: string, newProfessionalId: string) => {
    if (transferring || !isAdmin) return;

    try {
      setTransferring(consultaId);
      
      const response = await fetch('/api/prontuarios/alterar-profissional', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prontuario_id: consultaId,
          novo_profissional_id: newProfessionalId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTransferModal(null);
        alert('Paciente transferido com sucesso!');
        buscarProntuarios(); // Recarregar os dados
      } else {
        alert(result.error || 'Erro ao transferir paciente');
      }
    } catch (error) {
      console.error('Erro ao transferir paciente:', error);
      alert('Erro ao transferir paciente');
    } finally {
      setTransferring(null);
    }
  };

  const buscarPacientesAtendidos = async () => {
    try {
      setCarregandoPacientes(true);
      const response = await fetch("/api/agendamentos/pacientes-atendidos");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao buscar pacientes");
      setPacientesAtendidos(data.data || []);
    } catch (error) {
      console.error(error);
      setErroModal("Erro ao carregar lista de pacientes atendidos");
    } finally {
      setCarregandoPacientes(false);
    }
  };

  const handleArquivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErroModal("");
    setSucesso("");

    if (file) {
      if (file.type !== "application/pdf") {
        setErroModal("Apenas arquivos PDF são permitidos");
        setArquivo(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErroModal("O arquivo deve ter no máximo 10MB");
        setArquivo(null);
        return;
      }
      setArquivo(file);
    }
  };

  const handleSubmitProntuario = async () => {
    if (!pacienteSelecionado || !arquivo) {
      alert("Escolha o paciente e o arquivo PDF");
      return;
    }

    const formData = new FormData();
    formData.append("paciente_id", pacienteSelecionado);
    formData.append("arquivo", arquivo);

    try {
      setEnviando(true);
      const res = await fetch("/api/agendamentos/prontuarios", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");
      setSucesso("Prontuário enviado com sucesso!");
      setArquivo(null);
      setPacienteSelecionado("");
      buscarProntuarios();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErroModal(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const resetarFormulario = () => {
    setPacienteSelecionado("");
    setArquivo(null);
    setErroModal("");
    setSucesso("");
    setPacientesAtendidos([]);
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  // Filtrar prontuários
  const prontuariosFiltrados = useMemo(() => {
    let resultado = prontuarios;
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.paciente?.nome.toLowerCase().includes(termo) ||
          p.observacoes?.toLowerCase().includes(termo)
      );
    }
    if (filtroStatus !== "todos")
      resultado = resultado.filter((p) => p.status === filtroStatus);
    return resultado.sort(
      (a, b) =>
        new Date(b.data_consulta).getTime() -
        new Date(a.data_consulta).getTime()
    );
  }, [prontuarios, busca, filtroStatus]);

  const iniciarEdicao = (consulta: Consulta) => {
    setProntuarioSelecionado(consulta);
    setDadosEdicao({
      observacoes: consulta.observacoes || "",
      modalidade: consulta.modalidade || "",
      local: consulta.local || "",
      status: consulta.status,
    });
    setModoEdicao(true);
  };

  const salvarEdicao = async () => {
    if (!prontuarioSelecionado) return;
    const prontuarioAtualizado = { ...prontuarioSelecionado, ...dadosEdicao };
    setProntuarios((prev) =>
      prev.map((p) =>
        p.id === prontuarioSelecionado.id ? prontuarioAtualizado : p
      )
    );
    setModoEdicao(false);
    setProntuarioSelecionado(prontuarioAtualizado);
  };

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: prontuariosFiltrados.length,
      comProntuario: prontuariosFiltrados.filter((p) => p.prontuario).length,
      semProntuario: prontuariosFiltrados.filter((p) => !p.prontuario).length,
      recentes: prontuariosFiltrados.filter((p) => {
        const diasAtras =
          (new Date().getTime() - new Date(p.data_consulta).getTime()) /
          (1000 * 60 * 60 * 24);
        return diasAtras <= 30;
      }).length,
    };
  }, [prontuariosFiltrados]);

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
                <p className="text-2xl font-bold">
                  {estatisticas.comProntuario}
                </p>
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
                <p className="text-2xl font-bold">
                  {estatisticas.semProntuario}
                </p>
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
            <Dialog
              open={mostrarNovoProntuario}
              onOpenChange={setMostrarNovoProntuario}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setMostrarNovoProntuario(true);
                    buscarPacientesAtendidos();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prontuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Prontuário</DialogTitle>
                  <DialogDescription>
                    Selecione um paciente atendido e faça upload do prontuário
                    em PDF
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
                        <span className="text-sm">
                          Apenas pacientes com consultas concluídas podem ter
                          prontuários.
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={pacienteSelecionado}
                        onValueChange={setPacienteSelecionado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente atendido" />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientesAtendidos.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {paciente.nome}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Última consulta:{" "}
                                  {formatarData(paciente.ultimaConsulta)} •
                                  {paciente.totalConsultas} consulta
                                  {paciente.totalConsultas > 1 ? "s" : ""}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Informações do Paciente Selecionado */}
                  {pacienteSelecionado &&
                    (() => {
                      const pacienteInfo = pacientesAtendidos.find(
                        (p) => p.id === pacienteSelecionado
                      );
                      return pacienteInfo ? (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                Paciente Selecionado
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Nome:</strong> {pacienteInfo.nome}
                              </p>
                              <p>
                                <strong>Email:</strong> {pacienteInfo.email}
                              </p>
                              <p>
                                <strong>Última consulta:</strong>{" "}
                                {formatarData(pacienteInfo.ultimaConsulta)}
                              </p>
                              <p>
                                <strong>Total de consultas:</strong>{" "}
                                {pacienteInfo.totalConsultas}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null;
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
                          <span className="font-medium text-green-900">
                            Arquivo Selecionado
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Nome:</strong> {arquivo.name}
                          </p>
                          <p>
                            <strong>Tamanho:</strong>{" "}
                            {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p>
                            <strong>Tipo:</strong> {arquivo.type}
                          </p>
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
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMostrarNovoProntuario(false);
                        resetarFormulario();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitProntuario}
                      disabled={
                        !pacienteSelecionado ||
                        !arquivo ||
                        enviando ||
                        pacientesAtendidos.length === 0
                      }
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
                  setBusca("");
                  setFiltroStatus("todos");
                  buscarProntuarios();
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
              <Card
                key={consulta.id}
                className="hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight break-words truncate pr-2 whitespace-break-spaces">
                          {consulta.paciente?.nome ||
                            "Paciente não identificado"}
                        </CardTitle>
                        <CardDescription className="mt-1 break-words truncate">
                          Consulta - {consulta.modalidade}
                        </CardDescription>
                      </div>
                      <div className=" mt-1">
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
                    <span className="break-words">
                      {formatarData(consulta.data_consulta)}
                    </span>
                  </div>

                  {consulta.observacoes && (
                    <div className="p-2 bg-blue-50 rounded text-sm flex-shrink-0">
                      <p className="font-medium text-blue-800">Observações:</p>
                      <p className="text-blue-700 break-words">
                        {consulta.observacoes.substring(0, 100)}...
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 flex-1 min-h-0 overflow-hidden">
                    <p className="break-words">
                      Status:{" "}
                      <span className="font-medium">{consulta.status}</span>
                    </p>
                    <p className="break-words">
                      Modalidade:{" "}
                      <span className="font-medium">{consulta.modalidade}</span>
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
                            setProntuarioSelecionado(consulta);
                            setModoEdicao(false);
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
                              <DialogTitle className="text-blue-900">
                                Consulta 
                              </DialogTitle>
                              <DialogDescription className="text-gray-700">
                                {prontuarioSelecionado?.paciente?.nome} -{" "}
                                {formatarData(
                                  prontuarioSelecionado?.data_consulta || ""
                                )}
                              </DialogDescription>
                            </div>
                            {/* Removed edit functionality - only PDF management needed */}
                          </div>
                        </DialogHeader>

                        {prontuarioSelecionado && (
                          <div className="space-y-6">
                            {/* Informações Básicas */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-800 font-medium">
                                  Paciente
                                </Label>
                                <p className="font-medium text-gray-900">
                                  {prontuarioSelecionado.paciente?.nome}
                                </p>
                              </div>
                              <div>
                                <Label className="text-gray-800 font-medium">
                                  Data da Consulta
                                </Label>
                                <p className="font-medium text-gray-900">
                                  {formatarData(
                                    prontuarioSelecionado.data_consulta
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Informações da Consulta (somente visualização) */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-gray-800 font-medium">
                                    Modalidade
                                  </Label>
                                  <p className="p-2 bg-gray-50 rounded text-gray-900">
                                    {prontuarioSelecionado.modalidade}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-gray-800 font-medium">
                                    Status
                                  </Label>
                                  <div className="p-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {prontuarioSelecionado.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {prontuarioSelecionado.local && (
                                <div>
                                  <Label className="text-gray-800 font-medium">
                                    Local
                                  </Label>
                                  <p className="p-2 bg-gray-50 rounded text-gray-900">
                                    {prontuarioSelecionado.local}
                                  </p>
                                </div>
                              )}

                              {prontuarioSelecionado.observacoes && (
                                <div>
                                  <Label className="text-gray-800 font-medium">
                                    Observações
                                  </Label>
                                  <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap text-gray-900">
                                    {prontuarioSelecionado.observacoes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Prontuário PDF */}
                            <div className="pt-4 border-t border-gray-200">
                              <Label className="text-gray-800 font-medium">
                                Prontuário PDF
                              </Label>
                              {prontuarioSelecionado.prontuario ? (
                                <div className="mt-2 space-y-3">
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <span className="text-green-700 font-medium">
                                          Prontuário disponível
                                        </span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // Abrir PDF em nova aba usando o endpoint correto
                                            if (
                                              prontuarioSelecionado.prontuario &&
                                              typeof prontuarioSelecionado.prontuario ===
                                                "object" &&
                                              "id" in
                                                prontuarioSelecionado.prontuario
                                            ) {
                                              const pdfUrl = `/api/agendamentos/prontuarios/visualizar?prontuarioId=${prontuarioSelecionado.prontuario.id}`;

                                              window.open(pdfUrl, "_blank");
                                            } else {
                                              console.error(
                                                "Prontuário ID not found:",
                                                prontuarioSelecionado.prontuario
                                              );
                                              alert(
                                                "Erro: ID do prontuário não encontrado"
                                              );
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

                                  {/* Ações do PDF - sempre disponíveis */}
                                  <div className="space-y-3">
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          // Implementar substituição de PDF
                                          const input =
                                            document.createElement("input");
                                          input.type = "file";
                                          input.accept = ".pdf";
                                          input.onchange = async (e) => {
                                            const file = (
                                              e.target as HTMLInputElement
                                            ).files?.[0];
                                            if (file) {
                                              if (
                                                file.type !== "application/pdf"
                                              ) {
                                                alert(
                                                  "Apenas arquivos PDF são permitidos"
                                                );
                                                return;
                                              }
                                              if (
                                                file.size >
                                                10 * 1024 * 1024
                                              ) {
                                                alert(
                                                  "O arquivo deve ter no máximo 10MB"
                                                );
                                                return;
                                              }

                                              try {
                                                const formData = new FormData();
                                                // Use prontuario ID, not consulta ID
                                                const prontuarioId =
                                                  prontuarioSelecionado.prontuario &&
                                                  typeof prontuarioSelecionado.prontuario ===
                                                    "object" &&
                                                  "id" in
                                                    prontuarioSelecionado.prontuario
                                                    ? prontuarioSelecionado
                                                        .prontuario.id
                                                    : null;

                                                if (!prontuarioId) {
                                                  alert(
                                                    "Erro: ID do prontuário não encontrado"
                                                  );
                                                  return;
                                                }

                                                formData.append(
                                                  "prontuarioId",
                                                  prontuarioId
                                                );
                                                formData.append(
                                                  "arquivo",
                                                  file
                                                );

                                                const response = await fetch(
                                                  "/api/agendamentos/prontuarios/substituir",
                                                  {
                                                    method: "PUT",
                                                    body: formData,
                                                  }
                                                );

                                                if (response.ok) {
                                                  alert(
                                                    "PDF substituído com sucesso!"
                                                  );
                                                  buscarProntuarios(); // Recarregar dados
                                                } else {
                                                  alert(
                                                    "Erro ao substituir PDF"
                                                  );
                                                }
                                              } catch (error) {
                                                console.error("Erro:", error);
                                                alert("Erro ao substituir PDF");
                                              }
                                            }
                                          };
                                          input.click();
                                        }}
                                      >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Substituir PDF
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                          if (
                                            confirm(
                                              "Tem certeza que deseja excluir o prontuário? Esta ação não pode ser desfeita."
                                            )
                                          ) {
                                            try {
                                              // Get the prontuario ID safely
                                              const prontuarioId =
                                                prontuarioSelecionado.prontuario &&
                                                typeof prontuarioSelecionado.prontuario ===
                                                  "object" &&
                                                "id" in
                                                  prontuarioSelecionado.prontuario
                                                  ? prontuarioSelecionado
                                                      .prontuario.id
                                                  : null;

                                              if (!prontuarioId) {
                                                alert(
                                                  "Erro: ID do prontuário não encontrado"
                                                );
                                                return;
                                              }

                                              const response = await fetch(
                                                "/api/agendamentos/prontuarios/remover",
                                                {
                                                  method: "DELETE",
                                                  headers: {
                                                    "Content-Type":
                                                      "application/json",
                                                  },
                                                  body: JSON.stringify({
                                                    prontuarioId: prontuarioId,
                                                  }),
                                                }
                                              );

                                              if (response.ok) {
                                                alert(
                                                  "Prontuário excluído com sucesso!"
                                                );
                                                buscarProntuarios(); // Recarregar dados
                                              } else {
                                                const errorData =
                                                  await response.json();
                                                console.error(
                                                  "Erro na resposta:",
                                                  errorData
                                                );
                                                alert(
                                                  `Erro ao excluir prontuário: ${
                                                    errorData.error ||
                                                    "Erro desconhecido"
                                                  }`
                                                );
                                              }
                                            } catch (error) {
                                              console.error("Erro:", error);
                                              alert(
                                                "Erro ao excluir prontuário"
                                              );
                                            }
                                          }
                                        }}
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Excluir Prontuário
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Você pode substituir o arquivo atual ou
                                      removê-lo completamente.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-orange-700 font-medium">
                                      Nenhum prontuário PDF
                                    </span>
                                  </div>
                                  <p className="text-sm text-orange-600 mt-1">
                                    Nenhum arquivo PDF foi anexado a esta
                                    consulta ainda.
                                  </p>

                                  {/* Opção para adicionar PDF quando não existe - sempre disponível */}
                                  <div className="mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const input =
                                          document.createElement("input");
                                        input.type = "file";
                                        input.accept = ".pdf";
                                        input.onchange = async (e) => {
                                          const file = (
                                            e.target as HTMLInputElement
                                          ).files?.[0];
                                          if (file) {
                                            if (
                                              file.type !== "application/pdf"
                                            ) {
                                              alert(
                                                "Apenas arquivos PDF são permitidos"
                                              );
                                              return;
                                            }
                                            if (file.size > 10 * 1024 * 1024) {
                                              alert(
                                                "O arquivo deve ter no máximo 10MB"
                                              );
                                              return;
                                            }

                                            try {
                                              const formData = new FormData();
                                              formData.append(
                                                "consultaId",
                                                prontuarioSelecionado.id
                                              );
                                              formData.append("arquivo", file);

                                              const response = await fetch(
                                                "/api/agendamentos/prontuarios/adicionar",
                                                {
                                                  method: "POST",
                                                  body: formData,
                                                }
                                              );

                                              if (response.ok) {
                                                alert(
                                                  "PDF adicionado com sucesso!"
                                                );
                                                buscarProntuarios(); // Recarregar dados
                                              } else {
                                                alert("Erro ao adicionar PDF");
                                              }
                                            } catch (error) {
                                              console.error("Erro:", error);
                                              alert("Erro ao adicionar PDF");
                                            }
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Adicionar PDF
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Informações de Auditoria */}
                            <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-gray-700">
                                    ID da Consulta: {prontuarioSelecionado.id}
                                  </p>
                                  <p className="text-gray-700">
                                    Status: {prontuarioSelecionado.status}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-700">
                                    Modalidade:{" "}
                                    {prontuarioSelecionado.modalidade}
                                  </p>
                                  {prontuarioSelecionado.local && (
                                    <p className="text-gray-700">
                                      Local: {prontuarioSelecionado.local}
                                    </p>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum prontuário encontrado
                </h3>
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
  );
}
