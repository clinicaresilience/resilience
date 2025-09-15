"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Edit3,
  UserCheck,
  Clock,
  Download,
  ArrowRightLeft,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { ProntuarioCompleto } from "@/services/database/prontuarios.service";
import { PacienteAtendido } from "@/services/database/consultas.service";
import { CarimboDigital } from "./carimbo-digital";
import { exportarProntuarioPDF } from "./exportar-prontuario-pdf";

interface NovoProntuarioClientV2Props {
  profissionalNome: string;
  profissionalId: string;
  isAdmin?: boolean;
}

export function NovoProntuarioClient({
  profissionalNome,
  profissionalId,
  isAdmin = false,
}: NovoProntuarioClientV2Props) {
  const [busca, setBusca] = useState("");
  const [prontuarios, setProntuarios] = useState<ProntuarioCompleto[]>([]);
  const [carregandoProntuarios, setCarregandoProntuarios] = useState(true);
  const [erro, setErro] = useState<string>("");

  // Estados para novo registro
  const [mostrarNovoRegistro, setMostrarNovoRegistro] = useState(false);
  const [pacientesAtendidos, setPacientesAtendidos] = useState<
    PacienteAtendido[]
  >([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>("");
  const [textoRegistro, setTextoRegistro] = useState<string>("");
  const [cpfProfissional, setCpfProfissional] = useState<string>("");
  const [carregandoPacientes, setCarregandoPacientes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");

  // Estados para visualizar prontuário
  const [prontuarioSelecionado, setProntuarioSelecionado] =
    useState<ProntuarioCompleto | null>(null);
  const [mostrarProntuario, setMostrarProntuario] = useState(false);

  // Estados para edição (admin apenas)
  const [editandoRegistro, setEditandoRegistro] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState<string>("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Estados para transferência de paciente (admin apenas)
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [transferModal, setTransferModal] = useState<{
    prontuario: ProntuarioCompleto;
    newProfessionalId: string;
  } | null>(null);
  const [transferring, setTransferring] = useState<boolean>(false);

  // Buscar prontuários
  useEffect(() => {
    buscarProntuarios();
    if (isAdmin) {
      buscarProfissionais();
    }
  }, [profissionalId, isAdmin]);

  const buscarProntuarios = async () => {
    try {
      setCarregandoProntuarios(true);
      setErro("");
      const response = await fetch("/api/prontuarios");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar prontuários");
      }

      setProntuarios(data.data || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar prontuários");
    } finally {
      setCarregandoProntuarios(false);
    }
  };

  const buscarPacientesAtendidos = async () => {
    try {
      setCarregandoPacientes(true);
      const response = await fetch("/api/agendamentos/pacientes-atendidos");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar pacientes");
      }
      setPacientesAtendidos(data.data || []);
    } catch (error) {
      console.error(error);
      setErroModal("Erro ao carregar lista de pacientes atendidos");
    } finally {
      setCarregandoPacientes(false);
    }
  };

  const handleCriarRegistro = async () => {
    if (!pacienteSelecionado || !textoRegistro.trim()) {
      setErroModal("Selecione o paciente e escreva o texto do registro");
      return;
    }

    if (!cpfProfissional.trim()) {
      setErroModal("Digite seu CPF para assinatura digital");
      return;
    }

    try {
      setEnviando(true);
      setErroModal("");

      const response = await fetch("/api/prontuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paciente_id: pacienteSelecionado,
          texto: textoRegistro,
          cpf_profissional: cpfProfissional,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar registro");
      }

      setSucesso("Registro criado com sucesso!");
      setTextoRegistro("");
      setPacienteSelecionado("");
      setCpfProfissional("");
      buscarProntuarios();

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setMostrarNovoRegistro(false);
        resetarFormulario();
      }, 2000);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErroModal(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const resetarFormulario = () => {
    setPacienteSelecionado("");
    setTextoRegistro("");
    setCpfProfissional("");
    setErroModal("");
    setSucesso("");
    setPacientesAtendidos([]);
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para lidar com exportação de PDF
  const handleExportarPDF = (prontuario: ProntuarioCompleto) => {
    exportarProntuarioPDF({ prontuario, formatarData });
  };

  // Funções de edição (admin apenas)
  const iniciarEdicaoRegistro = (registroId: string, textoAtual: string) => {
    if (!isAdmin) return;
    setEditandoRegistro(registroId);
    setTextoEdicao(textoAtual);
  };

  const cancelarEdicao = () => {
    setEditandoRegistro(null);
    setTextoEdicao("");
  };

  const salvarEdicaoRegistro = async (registroId: string) => {
    if (!isAdmin || !textoEdicao.trim()) return;

    try {
      setSalvandoEdicao(true);
      const response = await fetch(`/api/prontuarios/registro/${registroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texto: textoEdicao.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar edição');
      }

      // Recarregar prontuários primeiro
      await buscarProntuarios();
      
      // Atualizar prontuário selecionado se estiver aberto
      if (prontuarioSelecionado) {
        // Buscar dados atualizados do prontuário
        try {
          const response = await fetch("/api/prontuarios");
          const data = await response.json();
          if (response.ok && data.data) {
            const prontuarioAtualizado = data.data.find((p: any) => p.id === prontuarioSelecionado.id);
            if (prontuarioAtualizado) {
              setProntuarioSelecionado(prontuarioAtualizado);
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar prontuário selecionado:', error);
        }
      }

      setEditandoRegistro(null);
      setTextoEdicao("");
      alert('Registro editado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição do registro');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const excluirRegistro = async (registroId: string, prontuarioId: string) => {
    if (!isAdmin) return;

    if (!confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/prontuarios/registro/${registroId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir registro');
      }

      // Recarregar prontuários
      await buscarProntuarios();
      
      // Atualizar prontuário selecionado se estiver aberto
      if (prontuarioSelecionado && prontuarioSelecionado.id === prontuarioId) {
        const prontuarioAtualizado = prontuarios.find(p => p.id === prontuarioId);
        if (prontuarioAtualizado) {
          setProntuarioSelecionado(prontuarioAtualizado);
        } else {
          // Se prontuário não existe mais, fechar modal
          setMostrarProntuario(false);
          setProntuarioSelecionado(null);
        }
      }

      alert('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro');
    }
  };

  const excluirProntuario = async (prontuarioId: string) => {
    if (!isAdmin) return;

    if (!confirm('Tem certeza que deseja excluir este prontuário inteiro? Todos os registros serão perdidos e esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/prontuarios/${prontuarioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir prontuário');
      }

      // Recarregar prontuários
      await buscarProntuarios();
      
      // Fechar modal se estava aberto
      if (prontuarioSelecionado && prontuarioSelecionado.id === prontuarioId) {
        setMostrarProntuario(false);
        setProntuarioSelecionado(null);
      }

      alert('Prontuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
      alert('Erro ao excluir prontuário');
    }
  };

  // Buscar profissionais para transferência
  const buscarProfissionais = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch("/api/profissionais");
      if (response.ok) {
        const data = await response.json();
        console.log("Profissionais carregados:", data); // Debug
        // A API já retorna apenas profissionais, não precisa filtrar por tipo_usuario
        setProfessionals(data || []);
      } else {
        console.error("Erro na resposta da API profissionais:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  };

  // Transferir paciente para novo profissional
  const transferirPaciente = async (prontuario: ProntuarioCompleto, newProfessionalId: string) => {
    if (!isAdmin || !newProfessionalId || transferring) return;

    if (!confirm(`Tem certeza que deseja transferir o paciente ${prontuario.paciente.nome} para o novo profissional?`)) {
      return;
    }

    try {
      setTransferring(true);
      
      const response = await fetch('/api/prontuarios/transferir-paciente', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prontuario_id: prontuario.id,
          novo_profissional_id: newProfessionalId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTransferModal(null);
        alert(`Paciente ${prontuario.paciente.nome} transferido com sucesso!`);
        
        // Recarregar prontuários
        await buscarProntuarios();
        
        // Fechar modal de prontuário se estava aberto
        if (prontuarioSelecionado && prontuarioSelecionado.id === prontuario.id) {
          setMostrarProntuario(false);
          setProntuarioSelecionado(null);
        }
      } else {
        alert(result.error || 'Erro ao transferir paciente');
      }
    } catch (error) {
      console.error('Erro ao transferir paciente:', error);
      alert('Erro ao transferir paciente');
    } finally {
      setTransferring(false);
    }
  };

  // Iniciar transferência
  const iniciarTransferencia = (prontuario: ProntuarioCompleto) => {
    if (!isAdmin) return;
    setTransferModal({
      prontuario,
      newProfessionalId: '',
    });
  };

  // Filtrar prontuários
  const prontuariosFiltrados = prontuarios.filter((p) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      p.paciente?.nome.toLowerCase().includes(termo) ||
      p.registros.some((r) => r.texto.toLowerCase().includes(termo))
    );
  });

  // Estatísticas
  const estatisticas = {
    totalProntuarios: prontuarios.length,
    totalRegistros: prontuarios.reduce((acc, p) => acc + p.registros.length, 0),
    pacientesAtivos: prontuarios.filter(
      (p) => p.profissional_atual_id === profissionalId
    ).length,
    ultimosRegistros: prontuarios.filter((p) => {
      const ultimoRegistro = p.registros[p.registros.length - 1];
      if (!ultimoRegistro) return false;
      const diasAtras =
        (new Date().getTime() - new Date(ultimoRegistro.criado_em).getTime()) /
        (1000 * 60 * 60 * 24);
      return diasAtras <= 7;
    }).length,
  };

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
                <p className="text-sm text-gray-600">Prontuários</p>
                <p className="text-2xl font-bold">
                  {estatisticas.totalProntuarios}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Registros</p>
                <p className="text-2xl font-bold">
                  {estatisticas.totalRegistros}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold">
                  {estatisticas.pacientesAtivos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Recentes (7d)</p>
                <p className="text-2xl font-bold">
                  {estatisticas.ultimosRegistros}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cabeçalho com Busca e Novo Registro */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prontuários </CardTitle>
            <Dialog
              open={mostrarNovoRegistro}
              onOpenChange={setMostrarNovoRegistro}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setMostrarNovoRegistro(true);
                    buscarPacientesAtendidos();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Registro de Prontuário</DialogTitle>
                  <DialogDescription>
                    Selecione um paciente e escreva o registro 
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
                      </div>
                    ) : (
                      <Select
                        value={pacienteSelecionado}
                        onValueChange={setPacienteSelecionado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientesAtendidos.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {paciente.nome}
                                </span>
                                <span className="text-sm text-gray-500">
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

                  {/* Texto do Registro */}
                  <div>
                    <Label htmlFor="texto">Texto do Registro *</Label>
                    <Textarea
                      id="texto"
                      placeholder="Digite o registro ..."
                      value={textoRegistro}
                      onChange={(e) => setTextoRegistro(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Descreva detalhadamente o atendimento, diagnóstico,
                      tratamento, etc.
                    </p>
                  </div>

                  {/* CPF do Profissional */}
                  <div>
                    <Label htmlFor="cpf">
                      Seu CPF (para assinatura digital) *
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpfProfissional}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 11) value = value.slice(0, 11);
                        value = value.replace(/(\d{3})(\d)/, "$1.$2");
                        value = value.replace(/(\d{3})(\d)/, "$1.$2");
                        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                        setCpfProfissional(value);
                      }}
                      maxLength={14}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Necessário para a assinatura digital do registro
                    </p>
                  </div>

                  {/* Informações do Profissional */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Assinatura Digital
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        O registro será automaticamente assinado digitalmente
                        com seus dados profissionais.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mensagens */}
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
                        setMostrarNovoRegistro(false);
                        resetarFormulario();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCriarRegistro}
                      disabled={
                        !pacienteSelecionado ||
                        !textoRegistro.trim() ||
                        !cpfProfissional.trim() ||
                        enviando ||
                        pacientesAtendidos.length === 0
                      }
                      className="flex items-center space-x-2"
                    >
                      {enviando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          <span>Criar Registro</span>
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
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Buscar por paciente ou texto do registro..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setBusca("");
                  buscarProntuarios();
                }}
              >
                Limpar
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
          <div className="grid grid-cols-1 gap-4">
            {prontuariosFiltrados.map((prontuario) => (
              <Card
                key={prontuario.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {prontuario.paciente?.nome ||
                          "Paciente não identificado"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {prontuario.registros.length} registro
                        {prontuario.registros.length !== 1 ? "s" : ""} • Criado
                        em {formatarData(prontuario.criado_em)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      {prontuario.profissional_atual_id === profissionalId ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Responsável Atual
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Acesso de Leitura
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Último registro */}
                  {prontuario.registros.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Último registro:
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {prontuario.registros[
                          prontuario.registros.length - 1
                        ].texto.substring(0, 150)}
                        {prontuario.registros[prontuario.registros.length - 1]
                          .texto.length > 150
                          ? "..."
                          : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatarData(
                          prontuario.registros[prontuario.registros.length - 1]
                            .criado_em
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProntuarioSelecionado(prontuario);
                        setMostrarProntuario(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Completo
                    </Button>
                    
                    {/* Botão de transferência apenas para admin */}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => iniciarTransferencia(prontuario)}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Transferir
                      </Button>
                    )}
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
                  {busca.trim()
                    ? "Não há prontuários que correspondam à sua busca."
                    : "Você ainda não tem prontuários cadastrados."}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de Visualização do Prontuário */}
      <Dialog open={mostrarProntuario} onOpenChange={setMostrarProntuario}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prontuário - {prontuarioSelecionado?.paciente?.nome}
            </DialogTitle>
            <DialogDescription>
              Histórico completo de registros 
            </DialogDescription>
          </DialogHeader>

          {prontuarioSelecionado && (
            <div className="space-y-6">
              {/* Informações do Paciente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informações do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Nome</Label>
                      <p className="font-medium">
                        {prontuarioSelecionado.paciente.nome}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-700">Email</Label>
                      <p className="font-medium">
                        {prontuarioSelecionado.paciente.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registros */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Registros ({prontuarioSelecionado.registros.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleExportarPDF(prontuarioSelecionado)
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {prontuarioSelecionado.registros.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum registro encontrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {prontuarioSelecionado.registros.slice().reverse().map(
                        (registro, index) => (
                          <div
                            key={registro.id}
                            className="p-4 border rounded-lg bg-white"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">
                                  Registro #
                                  {prontuarioSelecionado.registros.length -
                                    index}
                                </span>
                                {registro.profissional_id ===
                                  profissionalId && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Seu registro
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {formatarData(registro.criado_em)}
                                </span>
                                
                                {/* Botões de edição (admin apenas) */}
                                {isAdmin && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => iniciarEdicaoRegistro(registro.id, registro.texto)}
                                      className="h-7 px-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                                      disabled={editandoRegistro === registro.id}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => excluirRegistro(registro.id, prontuarioSelecionado.id)}
                                      className="h-7 px-2 border-red-300 text-red-600 hover:bg-red-50"
                                      disabled={editandoRegistro === registro.id}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Conteúdo do registro - editável se admin */}
                            <div className="prose prose-sm max-w-none mb-3">
                              {isAdmin && editandoRegistro === registro.id ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={textoEdicao}
                                    onChange={(e) => setTextoEdicao(e.target.value)}
                                    className="min-h-[120px] text-gray-800"
                                    placeholder="Edite o texto do registro..."
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelarEdicao}
                                      disabled={salvandoEdicao}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => salvarEdicaoRegistro(registro.id)}
                                      disabled={salvandoEdicao || !textoEdicao.trim()}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      {salvandoEdicao ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                      ) : (
                                        <Save className="h-3 w-3 mr-1" />
                                      )}
                                      {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {registro.texto}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                              {/* Carimbo Digital Redesenhado */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                  <p className="text-xs text-gray-600 mb-2">
                                    <strong>Assinatura Digital </strong>
                                  </p>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <p>
                                      <strong>Profissional:</strong>{" "}
                                      {registro.assinatura_digital.nome}
                                    </p>
                                    <p>
                                      <strong>CPF:</strong>{" "}
                                      {registro.assinatura_digital.cpf}
                                    </p>
                                    <p>
                                      <strong>CRP:</strong>{" "}
                                      {registro.assinatura_digital.crp}
                                    </p>
                                    <p>
                                      <strong>Data/Hora:</strong>{" "}
                                      {formatarData(
                                        registro.assinatura_digital.data
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <CarimboDigital 
                                  assinaturaDigital={registro.assinatura_digital} 
                                  formatarData={formatarData} 
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência (admin apenas) */}
      {transferModal && (
        <Dialog open={true} onOpenChange={() => setTransferModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                Transferir Paciente
              </DialogTitle>
              <DialogDescription>
                Transferir o prontuário do paciente para outro profissional
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Paciente:</strong> {transferModal.prontuario.paciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Profissional atual:</strong> {
                    professionals.find(p => p.id === transferModal.prontuario.profissional_atual_id)?.nome || 'Nome não encontrado'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Novo profissional:</Label>
                <Select
                  value={transferModal.newProfessionalId}
                  onValueChange={(value) => 
                    setTransferModal({ ...transferModal, newProfessionalId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals
                      .filter(prof => prof.id !== transferModal.prontuario.profissional_atual_id)
                      .map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.nome} - {professional.informacoes_adicionais?.especialidade || professional.especialidade || 'Especialidade não informada'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-2">Atenção:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>O prontuário será transferido para o novo profissional</li>
                      <li>O profissional anterior perderá acesso para novos registros</li>
                      <li>Todos os registros anteriores serão mantidos</li>
                      <li>Apenas o novo profissional poderá adicionar registros futuros</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setTransferModal(null)}
                disabled={transferring}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => transferirPaciente(transferModal.prontuario, transferModal.newProfessionalId)}
                disabled={!transferModal.newProfessionalId || transferring}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {transferring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Transferindo...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Confirmar Transferência
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
