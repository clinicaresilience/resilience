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
  Activity,
  Plus,
  Calendar,
  User,
  Clock,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface Evolucao {
  id: string;
  prontuario_id: string;
  profissional_id: string;
  agendamento_id?: string;
  data_evolucao: string;
  tipo_evolucao: string;
  texto: string;
  dados_structurados?: any;
  criado_em: string;
  atualizado_em: string;
  profissional: {
    id: string;
    nome: string;
    informacoes_adicionais?: {
      especialidade?: string;
      crp?: string;
    };
  };
  agendamento?: {
    id: string;
    data_consulta: string;
    status: string;
  };
}

interface EvolucoesPacienteProps {
  prontuarioId: string;
  pacienteNome: string;
  isAdmin?: boolean;
  profissionalId: string;
  profissionalAtualId?: string;
}

const TIPOS_EVOLUCAO = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'avaliacao', label: 'Avaliação' },
  { value: 'sessao', label: 'Sessão' },
  { value: 'reavaliacao', label: 'Reavaliação' },
  { value: 'alta', label: 'Alta' },
  { value: 'intercorrencia', label: 'Intercorrência' },
  { value: 'observacao', label: 'Observação' },
];

export function EvolucoesPaciente({
  prontuarioId,
  pacienteNome,
  isAdmin = false,
  profissionalId,
  profissionalAtualId,
}: EvolucoesPacienteProps) {
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string>("");

  // Estados para nova evolução
  const [mostrarNovaEvolucao, setMostrarNovaEvolucao] = useState(false);
  const [tipoEvolucao, setTipoEvolucao] = useState("consulta");
  const [dataEvolucao, setDataEvolucao] = useState("");
  const [textoEvolucao, setTextoEvolucao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");

  // Estados para edição
  const [editandoEvolucao, setEditandoEvolucao] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [tipoEdicao, setTipoEdicao] = useState("");
  const [dataEdicao, setDataEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Carregar evoluções
  useEffect(() => {
    buscarEvolucoes();
  }, [prontuarioId]);

  const buscarEvolucoes = async () => {
    try {
      setCarregando(true);
      setErro("");
      
      const response = await fetch(`/api/evolucoes?prontuario_id=${prontuarioId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar evoluções");
      }

      setEvolucoes(data.data || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar evoluções do paciente");
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  const formatarDataInput = (dataISO: string) => {
    // Convert to Brazil timezone for input
    const data = new Date(dataISO);
    const offset = data.getTimezoneOffset() * 60000; // offset in milliseconds
    const brasilTime = new Date(data.getTime() - offset - (3 * 60 * 60 * 1000)); // Brazil is UTC-3
    return brasilTime.toISOString().slice(0, 16);
  };

  // Criar nova evolução
  const handleCriarEvolucao = async () => {
    if (!textoEvolucao.trim() || !tipoEvolucao) {
      setErroModal("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setEnviando(true);
      setErroModal("");

      const response = await fetch("/api/evolucoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prontuario_id: prontuarioId,
          tipo_evolucao: tipoEvolucao,
          texto: textoEvolucao,
          data_evolucao: dataEvolucao || new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar evolução");
      }

      setSucesso("Evolução criada com sucesso!");
      setTextoEvolucao("");
      setTipoEvolucao("consulta");
      setDataEvolucao("");
      buscarEvolucoes();

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setMostrarNovaEvolucao(false);
        resetarFormulario();
      }, 2000);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErroModal(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const resetarFormulario = () => {
    setTextoEvolucao("");
    setTipoEvolucao("consulta");
    setDataEvolucao("");
    setErroModal("");
    setSucesso("");
  };

  // Editar evolução
  const iniciarEdicao = (evolucao: Evolucao) => {
    setEditandoEvolucao(evolucao.id);
    setTextoEdicao(evolucao.texto);
    setTipoEdicao(evolucao.tipo_evolucao);
    setDataEdicao(formatarDataInput(evolucao.data_evolucao));
  };

  const cancelarEdicao = () => {
    setEditandoEvolucao(null);
    setTextoEdicao("");
    setTipoEdicao("");
    setDataEdicao("");
  };

  const salvarEdicao = async (evolucaoId: string) => {
    if (!textoEdicao.trim() || !tipoEdicao) {
      return;
    }

    try {
      setSalvandoEdicao(true);

      const response = await fetch(`/api/evolucoes/${evolucaoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_evolucao: tipoEdicao,
          texto: textoEdicao,
          data_evolucao: dataEdicao,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar edição");
      }

      buscarEvolucoes();
      setEditandoEvolucao(null);
      alert("Evolução editada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao salvar edição da evolução");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Excluir evolução
  const excluirEvolucao = async (evolucaoId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta evolução? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await fetch(`/api/evolucoes/${evolucaoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir evolução");
      }

      buscarEvolucoes();
      alert("Evolução excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evolução:", error);
      alert("Erro ao excluir evolução");
    }
  };

  // Verificar permissões
  const podeEditarEvolucao = (evolucao: Evolucao) => {
    return isAdmin || 
           evolucao.profissional_id === profissionalId || 
           profissionalAtualId === profissionalId;
  };

  const podeExcluirEvolucao = () => {
    return isAdmin;
  };

  const podeAdicionarEvolucao = () => {
    return isAdmin || profissionalAtualId === profissionalId;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Evolução do Paciente
              </CardTitle>
              <CardDescription>
                Acompanhe a evolução clínica de {pacienteNome}
              </CardDescription>
            </div>
            {podeAdicionarEvolucao() && (
              <Dialog open={mostrarNovaEvolucao} onOpenChange={setMostrarNovaEvolucao}>
                <DialogTrigger asChild>
                  <Button onClick={() => setMostrarNovaEvolucao(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Evolução
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Evolução</DialogTitle>
                    <DialogDescription>
                      Registre uma nova evolução do paciente {pacienteNome}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Tipo de Evolução */}
                    <div>
                      <Label htmlFor="tipo">Tipo de Evolução *</Label>
                      <Select value={tipoEvolucao} onValueChange={setTipoEvolucao}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_EVOLUCAO.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data e Hora */}
                    <div>
                      <Label htmlFor="data">Data e Hora</Label>
                      <Input
                        id="data"
                        type="datetime-local"
                        value={dataEvolucao}
                        onChange={(e) => setDataEvolucao(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe em branco para usar data/hora atual
                      </p>
                    </div>

                    {/* Texto da Evolução */}
                    <div>
                      <Label htmlFor="texto">Descrição da Evolução *</Label>
                      <Textarea
                        id="texto"
                        placeholder="Descreva a evolução do paciente..."
                        value={textoEvolucao}
                        onChange={(e) => setTextoEvolucao(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    {/* Mensagens */}
                    {erroModal && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-red-700 text-sm">{erroModal}</span>
                      </div>
                    )}

                    {sucesso && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 text-sm">{sucesso}</span>
                      </div>
                    )}

                    {/* Botões */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMostrarNovaEvolucao(false);
                          resetarFormulario();
                        }}
                        disabled={enviando}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCriarEvolucao}
                        disabled={!textoEvolucao.trim() || !tipoEvolucao || enviando}
                      >
                        {enviando ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Evolução
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Mensagem de erro */}
      {erro && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{erro}</span>
        </div>
      )}

      {/* Lista de evoluções */}
      {carregando ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando evoluções...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {evolucoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma evolução registrada
                </h3>
                <p className="text-gray-600">
                  {podeAdicionarEvolucao()
                    ? "Adicione a primeira evolução deste paciente."
                    : "Este paciente ainda não possui evoluções registradas."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {evolucoes.map((evolucao) => (
                <Card key={evolucao.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {TIPOS_EVOLUCAO.find(t => t.value === evolucao.tipo_evolucao)?.label || evolucao.tipo_evolucao}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatarData(evolucao.data_evolucao)}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {evolucao.profissional.nome}
                          {evolucao.profissional.informacoes_adicionais?.especialidade && (
                            <span className="ml-2 text-xs text-gray-500">
                              • {evolucao.profissional.informacoes_adicionais.especialidade}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {podeEditarEvolucao(evolucao) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => iniciarEdicao(evolucao)}
                            className="h-8 px-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                            disabled={editandoEvolucao === evolucao.id}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                        {podeExcluirEvolucao() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => excluirEvolucao(evolucao.id)}
                            className="h-8 px-2 border-red-300 text-red-600 hover:bg-red-50"
                            disabled={editandoEvolucao === evolucao.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editandoEvolucao === evolucao.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Tipo de Evolução</Label>
                          <Select value={tipoEdicao} onValueChange={setTipoEdicao}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_EVOLUCAO.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Data e Hora</Label>
                          <Input
                            type="datetime-local"
                            value={dataEdicao}
                            onChange={(e) => setDataEdicao(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={textoEdicao}
                            onChange={(e) => setTextoEdicao(e.target.value)}
                            className="min-h-[120px]"
                            placeholder="Descrição da evolução..."
                          />
                        </div>
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
                            onClick={() => salvarEdicao(evolucao.id)}
                            disabled={salvandoEdicao || !textoEdicao.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {salvandoEdicao ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                              <Save className="h-3 w-3 mr-1" />
                            )}
                            {salvandoEdicao ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {evolucao.texto}
                        </p>
                        {evolucao.agendamento && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Vinculado ao agendamento de {formatarData(evolucao.agendamento.data_consulta)}
                            </div>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Criado em {formatarData(evolucao.criado_em)}
                            {evolucao.criado_em !== evolucao.atualizado_em && (
                              <span className="ml-2">
                                • Atualizado em {formatarData(evolucao.atualizado_em)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
