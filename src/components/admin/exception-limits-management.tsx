"use client";

import { useState, useEffect, useCallback } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Timer,
  Users,
  Globe,
} from "lucide-react";

interface ExceptionLimit {
  id: string;
  profissional_id: string | null;
  tipo_excecao: string;
  limite_diario: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  profissional?: {
    nome: string;
    email: string;
  };
}

interface Professional {
  id: string;
  nome: string;
  email: string;
}

export function ExceptionLimitsManagement() {
  const [limits, setLimits] = useState<ExceptionLimit[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<ExceptionLimit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [profissionalId, setProfissionalId] = useState<string>("");
  const [tipoExcecao, setTipoExcecao] = useState<string>("qualquer");
  const [limiteDiario, setLimiteDiario] = useState<string>("");
  const [ativo, setAtivo] = useState<boolean>(true);

  // Filter states
  const [filterProfissional, setFilterProfissional] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterAtivo, setFilterAtivo] = useState<string>("");

  const tiposExcecao = [
    { value: "qualquer", label: "Qualquer Exceção" },
    { value: "almoco", label: "Almoço" },
    { value: "pausa", label: "Pausa" },
    { value: "reuniao", label: "Reunião" },
    { value: "emergencia", label: "Emergência" },
    { value: "outro", label: "Outro" },
  ];

  const limitesPreDefinidos = [
    { value: "30 minutes", label: "30 minutos" },
    { value: "1 hour", label: "1 hora" },
    { value: "1 hour 30 minutes", label: "1 hora e 30 minutos" },
    { value: "2 hours", label: "2 horas" },
    { value: "3 hours", label: "3 horas" },
    { value: "4 hours", label: "4 horas" },
  ];

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProfissional) params.set("profissional_id", filterProfissional);
      if (filterTipo) params.set("tipo_excecao", filterTipo);
      if (filterAtivo) params.set("ativo", filterAtivo);

      const response = await fetch(`/api/exception-limits?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar limites");
      }

      setLimits(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar limites:", error);
      setError("Erro ao carregar limites de exceção");
    } finally {
      setLoading(false);
    }
  }, [filterProfissional, filterTipo, filterAtivo]);

  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await fetch("/api/profissionais");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar profissionais");
      }

      setProfessionals(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
    fetchProfessionals();
  }, [fetchLimits, fetchProfessionals]);

  const resetForm = () => {
    setProfissionalId("");
    setTipoExcecao("qualquer");
    setLimiteDiario("");
    setAtivo(true);
    setEditingLimit(null);
    setError("");
    setSuccess("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (limit: ExceptionLimit) => {
    setEditingLimit(limit);
    setProfissionalId(limit.profissional_id || "");
    setTipoExcecao(limit.tipo_excecao);
    setLimiteDiario(limit.limite_diario);
    setAtivo(limit.ativo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!tipoExcecao || !limiteDiario) {
        setError("Tipo de exceção e limite diário são obrigatórios");
        return;
      }

      const data = {
        profissional_id: profissionalId === "global-rule" ? null : profissionalId || null,
        tipo_excecao: tipoExcecao,
        limite_diario: limiteDiario,
        ativo,
      };

      const url = editingLimit
        ? `/api/exception-limits/${editingLimit.id}`
        : "/api/exception-limits";
      const method = editingLimit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ao ${editingLimit ? "atualizar" : "criar"} limite`);
      }

      setSuccess(`Limite ${editingLimit ? "atualizado" : "criado"} com sucesso!`);
      await fetchLimits();
      closeModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar limite:", error);
      setError(error instanceof Error ? error.message : "Erro ao salvar limite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (limit: ExceptionLimit) => {
    const confirmMessage = limit.profissional_id
      ? `Tem certeza que deseja remover o limite de ${limit.tipo_excecao} para ${limit.profissional?.nome}?`
      : `Tem certeza que deseja remover o limite global de ${limit.tipo_excecao}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/exception-limits/${limit.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao remover limite");
      }

      setSuccess("Limite removido com sucesso!");
      await fetchLimits();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao remover limite:", error);
      setError(error instanceof Error ? error.message : "Erro ao remover limite");
    }
  };

  const toggleStatus = async (limit: ExceptionLimit) => {
    try {
      const response = await fetch(`/api/exception-limits/${limit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !limit.ativo }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar status");
      }

      setSuccess(`Limite ${!limit.ativo ? "ativado" : "desativado"} com sucesso!`);
      await fetchLimits();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setError(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  };

  const formatLimit = (limit: string) => {
    // Convert PostgreSQL interval to readable format
    return limit
      .replace("minutes", "min")
      .replace("minute", "min")
      .replace("hours", "h")
      .replace("hour", "h");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Timer className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="truncate">Limites de Exceção</span>
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Configure o tempo máximo de exceção diário que profissionais podem ter
              </CardDescription>
            </div>
            <Button 
              onClick={openCreateModal} 
              className="flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Novo Limite</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Profissional</Label>
              <Select value={filterProfissional} onValueChange={setFilterProfissional}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="global">Regras Globais</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <span className="truncate">{prof.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Exceção</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Todos os tipos</SelectItem>
                  {tiposExcecao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterAtivo} onValueChange={setFilterAtivo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilterProfissional("");
                  setFilterTipo("");
                  setFilterAtivo("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Limites Configurados ({limits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : limits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum limite de exceção configurado</p>
              <p className="text-sm mt-2">
                Clique em "Novo Limite" para criar o primeiro limite
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {limits.map((limit) => (
                <div
                  key={limit.id}
                  className={`border rounded-lg p-4 ${
                    limit.ativo ? "hover:bg-gray-50" : "bg-gray-50 opacity-75"
                  }`}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Professional */}
                      <div className="flex items-center gap-2">
                        {limit.profissional_id ? (
                          <>
                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{limit.profissional?.nome}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {limit.profissional?.email}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-900">Regra Global</p>
                              <p className="text-sm text-green-700">
                                Aplicável a todos os profissionais
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Exception Details */}
                      <div className="flex items-center gap-4 ml-6 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Tipo:</span>
                          <Badge variant="outline">
                            {
                              tiposExcecao.find((t) => t.value === limit.tipo_excecao)
                                ?.label || limit.tipo_excecao
                            }
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-900">
                            {formatLimit(limit.limite_diario)} por dia
                          </span>
                        </div>
                        <Badge
                          className={`${
                            limit.ativo
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-200 text-gray-700 border-gray-300"
                          }`}
                        >
                          {limit.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      {/* Created date */}
                      <div className="text-sm text-gray-500 ml-6">
                        Criado em: {new Date(limit.criado_em).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Actions - Desktop */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(limit)}
                        className={
                          limit.ativo
                            ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                        }
                      >
                        {limit.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(limit)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden lg:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(limit)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden lg:inline">Remover</span>
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    {/* Professional Info */}
                    <div className="flex items-start gap-3">
                      {limit.profissional_id ? (
                        <>
                          <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm leading-tight">{limit.profissional?.nome}</p>
                            <p className="text-xs text-gray-500 mt-1 break-all">
                              {limit.profissional?.email}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Globe className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900 text-sm">Regra Global</p>
                            <p className="text-xs text-green-700 mt-1">
                              Para todos os profissionais
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Exception Details */}
                    <div className="space-y-2 pl-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Tipo:</span>
                          <Badge variant="outline" className="text-xs">
                            {
                              tiposExcecao.find((t) => t.value === limit.tipo_excecao)
                                ?.label || limit.tipo_excecao
                            }
                          </Badge>
                        </div>
                        <Badge
                          className={`text-xs ${
                            limit.ativo
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-200 text-gray-700 border-gray-300"
                          }`}
                        >
                          {limit.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">
                          {formatLimit(limit.limite_diario)} por dia
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Criado em: {new Date(limit.criado_em).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Actions - Mobile */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(limit)}
                        className={`flex-1 text-xs ${
                          limit.ativo
                            ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                        }`}
                      >
                        {limit.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(limit)}
                        className="flex-1 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(limit)}
                        className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingLimit ? "Editar Limite de Exceção" : "Novo Limite de Exceção"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingLimit
                ? "Atualize os dados do limite de exceção"
                : "Configure um novo limite de exceção diário"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profissional" className="text-sm font-medium">
                Profissional (opcional)
              </Label>
              <Select value={profissionalId} onValueChange={setProfissionalId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um profissional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global-rule">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">Regra Global</span>
                    </div>
                  </SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{prof.nome}</span>
                        <span className="text-xs text-gray-500 truncate">{prof.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Regra global aplica-se a todos os profissionais
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium">
                Tipo de Exceção *
              </Label>
              <Select value={tipoExcecao} onValueChange={setTipoExcecao}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposExcecao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limite" className="text-sm font-medium">
                Limite Diário *
              </Label>
              <Select value={limiteDiario} onValueChange={setLimiteDiario}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o limite..." />
                </SelectTrigger>
                <SelectContent>
                  {limitesPreDefinidos.map((limite) => (
                    <SelectItem key={limite.value} value={limite.value}>
                      {limite.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo" className="text-sm">
                Limite ativo
              </Label>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 break-words">{error}</span>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeModal}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting
                  ? "Salvando..."
                  : editingLimit
                  ? "Atualizar"
                  : "Criar Limite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
