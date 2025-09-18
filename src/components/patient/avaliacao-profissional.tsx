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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Calendar,
  User,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface AgendamentoParaAvaliar {
  id: string;
  data_consulta: string;
  modalidade: string;
  profissional: {
    id: string;
    nome: string;
    especialidade: string;
  };
}

interface AvaliacaoProfissionalProps {
  pacienteId: string;
}

export function AvaliacaoProfissional({ pacienteId }: AvaliacaoProfissionalProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoParaAvaliar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string>("");

  // Estados para avaliação
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoParaAvaliar | null>(null);
  const [nota, setNota] = useState(0);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);

  // Carregar agendamentos para avaliar
  useEffect(() => {
    buscarAgendamentosParaAvaliar();
  }, [pacienteId]);

  const buscarAgendamentosParaAvaliar = async () => {
    try {
      setCarregando(true);
      setErro("");
      
      const response = await fetch('/api/avaliacoes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar agendamentos");
      }

      setAgendamentos(data.data || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar consultas para avaliação");
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

  const abrirModalAvaliacao = (agendamento: AgendamentoParaAvaliar) => {
    setAgendamentoSelecionado(agendamento);
    setNota(0);
    setNotaHover(0);
    setComentario("");
    setErroModal("");
    setSucesso("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAgendamentoSelecionado(null);
    setNota(0);
    setNotaHover(0);
    setComentario("");
    setErroModal("");
    setSucesso("");
  };

  const handleEnviarAvaliacao = async () => {
    if (!agendamentoSelecionado || nota === 0) {
      setErroModal("Por favor, selecione uma nota de 1 a 5 estrelas");
      return;
    }

    try {
      setEnviando(true);
      setErroModal("");

      const response = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agendamento_id: agendamentoSelecionado.id,
          profissional_id: agendamentoSelecionado.profissional.id,
          nota: nota,
          comentario: comentario.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar avaliação");
      }

      setSucesso("Avaliação enviada com sucesso!");
      
      // Remover o agendamento da lista após avaliação
      setAgendamentos(prev => prev.filter(ag => ag.id !== agendamentoSelecionado.id));

      // Fechar modal após 2 segundos
      setTimeout(() => {
        fecharModal();
      }, 2000);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErroModal(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  const renderEstrelas = (notaAtual: number, isHover: boolean = false) => {
    const estrelas = [];
    const notaParaUsar = notaHover > 0 ? notaHover : notaAtual;

    for (let i = 1; i <= 5; i++) {
      const isSelected = i <= notaAtual;
      const isHovered = i <= notaHover;
      const shouldHighlight = isHovered || (isSelected && notaHover === 0);

      estrelas.push(
        <button
          key={i}
          type="button"
          className={`p-1 transition-colors ${
            shouldHighlight
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onClick={() => setNota(i)}
          onMouseEnter={() => setNotaHover(i)}
          onMouseLeave={() => setNotaHover(0)}
          disabled={enviando}
        >
          <Star
            className={`h-8 w-8 ${
              shouldHighlight ? "fill-current" : ""
            }`}
          />
        </button>
      );
    }

    return <div className="flex items-center gap-1">{estrelas}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Avaliar Profissionais
          </CardTitle>
          <CardDescription>
            Avalie os profissionais após suas consultas concluídas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mensagem de erro */}
      {erro && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{erro}</span>
        </div>
      )}

      {/* Lista de consultas para avaliar */}
      {carregando ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando consultas...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {agendamentos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Todas as consultas avaliadas
                </h3>
                <p className="text-gray-600">
                  Você não possui consultas pendentes de avaliação no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {agendamento.profissional.nome}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {agendamento.profissional.especialidade}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatarData(agendamento.data_consulta)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="capitalize">{agendamento.modalidade}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => abrirModalAvaliacao(agendamento)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Avaliar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Avaliação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Profissional</DialogTitle>
            <DialogDescription>
              Como foi sua experiência com{" "}
              {agendamentoSelecionado?.profissional.nome}?
            </DialogDescription>
          </DialogHeader>

          {agendamentoSelecionado && (
            <div className="space-y-6">
              {/* Informações da consulta */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">
                    {agendamentoSelecionado.profissional.nome}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatarData(agendamentoSelecionado.data_consulta)}</span>
                </div>
              </div>

              {/* Avaliação por estrelas */}
              <div>
                <Label className="text-base font-medium">
                  Avalie sua experiência *
                </Label>
                <div className="mt-2 flex flex-col items-center gap-3">
                  {renderEstrelas(nota, true)}
                  <div className="text-sm text-gray-600 text-center">
                    {nota === 0 && "Clique nas estrelas para avaliar"}
                    {nota === 1 && "Muito insatisfeito"}
                    {nota === 2 && "Insatisfeito"}
                    {nota === 3 && "Neutro"}
                    {nota === 4 && "Satisfeito"}
                    {nota === 5 && "Muito satisfeito"}
                  </div>
                </div>
              </div>

              {/* Comentário opcional */}
              <div>
                <Label htmlFor="comentario">
                  Comentário (opcional)
                </Label>
                <Textarea
                  id="comentario"
                  placeholder="Compartilhe sua experiência ou deixe uma observação..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="mt-2 min-h-[100px]"
                  disabled={enviando}
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
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 text-sm">{sucesso}</span>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={fecharModal}
                  disabled={enviando}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEnviarAvaliacao}
                  disabled={nota === 0 || enviando}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {enviando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
