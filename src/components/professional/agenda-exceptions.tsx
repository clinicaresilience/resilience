"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgendaException {
  id?: string
  profissional_id: string
  tipo: 'recorrente' | 'pontual' | 'feriado'
  motivo: string
  data_excecao?: string
  data_fim?: string
  hora_inicio?: string
  hora_fim?: string
  disponivel: boolean
  criado_em?: string
  atualizado_em?: string
}

interface AgendaExceptionsProps {
  profissionalId: string;
}

export function AgendaExceptions({ profissionalId }: AgendaExceptionsProps) {
  const [excecoes, setExcecoes] = useState<AgendaException[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingException, setEditingException] =
    useState<AgendaException | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<AgendaException>>({
    profissional_id: profissionalId,
    tipo: "recorrente",
    motivo: "",
    data_excecao: "",
    data_fim: "",
    hora_inicio: "",
    hora_fim: "",
    disponivel: false,
  });

  const fetchExcecoes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/agenda-excecoes?profissionalId=${profissionalId}`
      );
      if (response.ok) {
        const data = await response.json();
        setExcecoes(data.excecoes || []);
      } else {
        console.error("Erro ao carregar exceções");
      }
    } catch (error) {
      console.error("Erro ao carregar exceções:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcecoes();
  }, [profissionalId]);

  const resetForm = () => {
    setFormData({
      profissional_id: profissionalId,
      tipo: "recorrente",
      motivo: "",
      data_excecao: "",
      data_fim: "",
      hora_inicio: "",
      hora_fim: "",
      disponivel: false,
    });
    setEditingException(null);
  };

  const openModal = (exception?: AgendaException) => {
    if (exception) {
      setEditingException(exception);
      setFormData({
        ...exception,
        data_excecao: exception.data_excecao || "",
        data_fim: exception.data_fim || "",
        hora_inicio: exception.hora_inicio || "",
        hora_fim: exception.hora_fim || "",
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validações básicas
      if (!formData.tipo || !formData.motivo) {
        alert("Tipo e motivo são obrigatórios");
        return;
      }

      if (
        formData.tipo === "recorrente" &&
        (!formData.hora_inicio || !formData.hora_fim)
      ) {
        alert(
          "Para exceções recorrentes, horário de início e fim são obrigatórios"
        );
        return;
      }

      if (
        (formData.tipo === "pontual" || formData.tipo === "feriado") &&
        !formData.data_excecao
      ) {
        alert("Para exceções pontuais e feriados, a data é obrigatória");
        return;
      }

      const url = editingException
        ? `/api/agenda-excecoes/${editingException.id}`
        : "/api/agenda-excecoes";

      const method = editingException ? "PUT" : "POST";

      // Map frontend form data to API expected format
      const apiData = {
        ...formData,
        data: formData.data_excecao // Map data_excecao to data for API
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Exceção salva com sucesso!");
        closeModal();
        fetchExcecoes();
      } else {
        alert(result.error || "Erro ao salvar exceção");
      }
    } catch (error) {
      console.error("Erro ao salvar exceção:", error);
      alert("Erro ao salvar exceção");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exceptionId: string) => {
    if (!confirm("Tem certeza que deseja remover esta exceção?")) {
      return;
    }

    try {
      const response = await fetch(`/api/agenda-excecoes/${exceptionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Exceção removida com sucesso!");
        fetchExcecoes();
      } else {
        alert(result.error || "Erro ao remover exceção");
      }
    } catch (error) {
      console.error("Erro ao remover exceção:", error);
      alert("Erro ao remover exceção");
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "recorrente":
        return "Recorrente";
      case "pontual":
        return "Pontual";
      case "feriado":
        return "Feriado/Férias";
      default:
        return tipo;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "recorrente":
        return "bg-blue-100 text-blue-800";
      case "pontual":
        return "bg-yellow-100 text-yellow-800";
      case "feriado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatException = (exception: AgendaException) => {
    switch (exception.tipo) {
      case "recorrente":
        if (exception.hora_inicio && exception.hora_fim) {
          // Extrair hora corretamente considerando timezone do Brasil
          const horaInicio = new Date(exception.hora_inicio).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false,
            timeZone: 'America/Sao_Paulo'
          });
          const horaFim = new Date(exception.hora_fim).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false,
            timeZone: 'America/Sao_Paulo'
          });
          return `${horaInicio} às ${horaFim} (todos os dias)`;
        }
        return "Configuração incompleta";
      case "pontual":
        if (exception.data_excecao) {
          const dataFormatada = new Date(exception.data_excecao).toLocaleDateString('pt-BR');
          if (exception.hora_inicio && exception.hora_fim) {
            const horaInicio = new Date(exception.hora_inicio).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false,
              timeZone: 'America/Sao_Paulo'
            });
            const horaFim = new Date(exception.hora_fim).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false,
              timeZone: 'America/Sao_Paulo'
            });
            return `${dataFormatada} - ${horaInicio} às ${horaFim}`;
          }
          return dataFormatada;
        }
        return "Data não informada";
      case "feriado":
        if (exception.data_excecao) {
          const dataInicio = new Date(exception.data_excecao).toLocaleDateString('pt-BR');
          if (exception.data_fim) {
            const dataFim = new Date(exception.data_fim).toLocaleDateString('pt-BR');
            return `${dataInicio} a ${dataFim}`;
          }
          return dataInicio;
        }
        return "Data não informada";
      default:
        return "Configuração inválida";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Carregando exceções...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Exceções de Agenda
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openModal()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Exceção
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingException
                    ? "Editar Exceção"
                    : "Nova Exceção de Agenda"}
                </DialogTitle>
                <DialogDescription>
                  Configure horários indisponíveis em sua agenda
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Exceção</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        tipo: value as "recorrente" | "pontual" | "feriado",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recorrente">
                        Recorrente (ex: almoço)
                      </SelectItem>
                      <SelectItem value="pontual">
                        Pontual (data específica)
                      </SelectItem>
                      <SelectItem value="feriado">
                        Feriado/Férias (período)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                    placeholder="Ex: Horário de almoço, Consulta , etc."
                    rows={2}
                  />
                </div>

                {formData.tipo === "recorrente" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hora_inicio">Hora Início</Label>
                      <Input
                        id="hora_inicio"
                        type="time"
                        value={formData.hora_inicio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hora_inicio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora_fim">Hora Fim</Label>
                      <Input
                        id="hora_fim"
                        type="time"
                        value={formData.hora_fim}
                        onChange={(e) =>
                          setFormData({ ...formData, hora_fim: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {formData.tipo === "pontual" && (
                  <div>
                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data_excecao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            data_excecao: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="hora_inicio_pontual">
                          Hora Início (opcional)
                        </Label>
                        <Input
                          id="hora_inicio_pontual"
                          type="time"
                          value={formData.hora_inicio}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hora_inicio: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="hora_fim_pontual">
                          Hora Fim (opcional)
                        </Label>
                        <Input
                          id="hora_fim_pontual"
                          type="time"
                          value={formData.hora_fim}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hora_fim: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.tipo === "feriado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_inicio">Data Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_excecao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            data_excecao: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_fim">Data Fim (opcional)</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) =>
                          setFormData({ ...formData, data_fim: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving
                    ? "Salvando..."
                    : editingException
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {excecoes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhuma exceção configurada
              </h3>
              <p className="mt-2 text-gray-500">
                Configure horários indisponíveis para bloquear agendamentos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {excecoes.map((exception) => (
                <div
                  key={exception.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTipoBadgeColor(exception.tipo)}>
                        {getTipoLabel(exception.tipo)}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatException(exception)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{exception.motivo}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(exception)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exception.id!)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
