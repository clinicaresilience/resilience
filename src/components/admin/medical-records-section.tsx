"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  generateMockProntuarios,
  generateHistoricoPacientes,
  buscarProntuarios,
  filtrarProntuariosPorStatus,
} from "@/lib/mocks/medical-records";
import { Search, FileText, User, Calendar, Filter, Eye } from "lucide-react";
import { StatusBadge, type GenericStatus } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ViewMode = "prontuarios" | "historico";

export function MedicalRecordsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("prontuarios");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Dados mock
  const allProntuarios = useMemo(() => generateMockProntuarios(), []);
  const historicoPacientes = useMemo(
    () => generateHistoricoPacientes(allProntuarios),
    [allProntuarios]
  );

  // Filtros aplicados
  const filteredProntuarios = useMemo(() => {
    let filtered = buscarProntuarios(allProntuarios, searchTerm);
    filtered = filtrarProntuariosPorStatus(filtered, statusFilter);
    return filtered.sort(
      (a, b) =>
        new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime()
    );
  }, [allProntuarios, searchTerm, statusFilter]);

  const filteredHistorico = useMemo(() => {
    if (!searchTerm.trim()) return historicoPacientes;
    const termoLower = searchTerm.toLowerCase();
    return historicoPacientes.filter(
      (hist) =>
        hist.pacienteNome.toLowerCase().includes(termoLower) ||
        hist.profissionaisAtendentes.some((prof) =>
          prof.toLowerCase().includes(termoLower)
        )
    );
  }, [historicoPacientes, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho com gradiente */}
      <div className="bg-gradient-to-r from-azul-escuro to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">
            Prontuários e Histórico Médico
          </h2>
        </div>
        <p className="text-blue-100 text-sm">
          Gerencie prontuários médicos e acompanhe o histórico de pacientes
        </p>
      </div>

      {/* Controles - Card estilizado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Botões de modo - Estilizados */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={viewMode === "prontuarios" ? "default" : "outline"}
            onClick={() => setViewMode("prontuarios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              viewMode === "prontuarios"
                ? "bg-azul-escuro hover:bg-azul-escuro/90 text-white shadow-md"
                : "border-2 border-azul-escuro/20 text-azul-escuro hover:bg-azul-escuro/5 hover:border-azul-escuro/30"
            }`}
          >
            <FileText className="h-4 w-4" />
            Prontuários
          </Button>
          <Button
            variant={viewMode === "historico" ? "default" : "outline"}
            onClick={() => setViewMode("historico")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              viewMode === "historico"
                ? "bg-azul-escuro hover:bg-azul-escuro/90 text-white shadow-md"
                : "border-2 border-azul-escuro/20 text-azul-escuro hover:bg-azul-escuro/5 hover:border-azul-escuro/30"
            }`}
          >
            <User className="h-4 w-4" />
            Histórico por Paciente
          </Button>
        </div>

        {/* Busca e Filtros - Layout responsivo melhorado */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca com estilo aprimorado */}
          <div className="flex-1 relative min-w-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-azul-escuro/60" />
            </div>
            <Input
              placeholder={
                viewMode === "prontuarios"
                  ? "Buscar por paciente, profissional, diagnóstico..."
                  : "Buscar por paciente ou profissional..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Filtro de status com design melhorado */}
          {viewMode === "prontuarios" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-azul-escuro/10 to-blue-50 rounded-lg border border-azul-escuro/20 shadow-sm">
                <Filter className="h-4 w-4 text-azul-escuro" />
                <span className="text-sm font-semibold text-azul-escuro whitespace-nowrap">Status</span>
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm font-semibold text-gray-900 shadow-sm hover:border-azul-escuro/40 hover:bg-azul-escuro/5 focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 focus:outline-none transition-all duration-200 cursor-pointer w-full min-w-[160px] h-12"
                >
                  <option value="todos" className="text-gray-900 font-medium">Todos os Status</option>
                  <option value="ativo" className="text-green-700 font-medium">Ativo</option>
                  <option value="em_andamento" className="text-yellow-700 font-medium">Em Andamento</option>
                  <option value="arquivado" className="text-gray-600 font-medium">Arquivado</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-azul-escuro/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
                <p className="text-gray-500">
                  Nenhum prontuário encontrado com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProntuarios.map((prontuario) => (
              <Card
                key={prontuario.id}
                className="flex flex-col hover:shadow-xl hover:shadow-azul-escuro/10 transition-all duration-300 h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-azul-escuro/5 to-blue-50/50 rounded-t-xl">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl text-azul-escuro font-bold truncate flex items-center gap-2">
                          <div className="w-2 h-2 bg-azul-escuro rounded-full"></div>
                          {prontuario.pacienteNome}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">
                              Dr(a). {prontuario.profissionalNome}
                            </span>
                          </div>
                          <span className="hidden sm:inline text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(prontuario.dataConsulta)}</span>
                          </div>
                          <span className="hidden sm:inline text-gray-400">•</span>
                          <span className="truncate max-w-[120px] bg-gray-100 px-2 py-1 rounded text-xs">
                            {prontuario.tipoConsulta}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge
                          status={prontuario.status as GenericStatus}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
                  <div className="flex-1 space-y-4">
                    {prontuario.diagnostico && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <strong className="text-sm text-red-800 font-semibold">
                            Diagnóstico
                          </strong>
                        </div>
                        <p className="text-sm text-red-700 break-words line-clamp-2 leading-relaxed">
                          {prontuario.diagnostico}
                        </p>
                      </div>
                    )}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <strong className="text-sm text-blue-800 font-semibold">
                          Observações
                        </strong>
                      </div>
                      <p className="text-sm text-blue-700 break-words line-clamp-2 leading-relaxed">
                        {prontuario.observacoes}
                      </p>
                    </div>
                    {prontuario.proximaConsulta && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            Próxima consulta: {formatDate(prontuario.proximaConsulta)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão Ver Detalhes */}
                  <div className="mt-auto pt-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2 justify-center bg-azul-escuro hover:bg-azul-escuro/90 text-white border-azul-escuro hover:border-azul-escuro/90 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalhes Completos</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-azul-escuro">
                            Detalhes do Prontuário
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <strong className="text-sm text-gray-800 font-medium">
                              Paciente:
                            </strong>
                            <p className="mt-1 text-gray-900 break-words">
                              {prontuario.pacienteNome}
                            </p>
                          </div>

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">
                              Profissional:
                            </strong>
                            <p className="mt-1 text-gray-900 break-words">
                              {prontuario.profissionalNome}
                            </p>
                          </div>

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">
                              Tipo de Consulta:
                            </strong>
                            <p className="mt-1 text-gray-900">
                              {prontuario.tipoConsulta}
                            </p>
                          </div>

                          {prontuario.diagnostico && (
                            <div>
                              <strong className="text-sm text-gray-800 font-medium">
                                Diagnóstico:
                              </strong>
                              <p className="mt-1 text-gray-900 break-words">
                                {prontuario.diagnostico}
                              </p>
                            </div>
                          )}

                          <div>
                            <strong className="text-sm text-gray-800 font-medium">
                              Observações:
                            </strong>
                            <p className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
                              {prontuario.observacoes}
                            </p>
                          </div>

                          {prontuario.prescricoes &&
                            prontuario.prescricoes.length > 0 && (
                              <div>
                                <strong className="text-sm text-gray-800 font-medium">
                                  Prescrições/Recomendações:
                                </strong>
                                <ul className="mt-1 list-disc list-inside space-y-1">
                                  {prontuario.prescricoes.map(
                                    (prescricao, index) => (
                                      <li
                                        key={index}
                                        className="text-sm text-gray-900 break-words"
                                      >
                                        {prescricao}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {prontuario.proximaConsulta && (
                            <div>
                              <strong className="text-sm text-gray-800 font-medium">
                                Próxima Consulta:
                              </strong>
                              <p className="mt-1 text-gray-900">
                                {formatDate(prontuario.proximaConsulta)}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between text-xs text-gray-600 pt-4 border-t border-gray-200">
                            <span>
                              Criado em: {formatDate(prontuario.criadoEm)}
                            </span>
                            <span>
                              Atualizado em:{" "}
                              {formatDate(prontuario.atualizadoEm)}
                            </span>
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
                <p className="text-gray-500">
                  Nenhum histórico encontrado com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistorico.map((historico) => (
              <Card
                key={historico.pacienteId}
                className="hover:shadow-xl hover:shadow-azul-escuro/10 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-azul-escuro/5 to-blue-50/50 rounded-t-xl">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl text-azul-escuro font-bold truncate flex items-center gap-2">
                        <div className="w-2 h-2 bg-azul-escuro rounded-full"></div>
                        {historico.pacienteNome}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span className="font-medium">{historico.totalConsultas} consulta(s)</span>
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3 text-green-600" />
                          <span>Última: {formatDate(historico.ultimaConsulta)}</span>
                        </div>
                        {historico.proximaConsulta && (
                          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                            <Calendar className="h-3 w-3 text-orange-600" />
                            <span>Próxima: {formatDate(historico.proximaConsulta)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge
                        status={historico.statusAtual as GenericStatus}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <strong className="text-sm text-purple-800 font-semibold">
                        Profissionais Atendentes
                      </strong>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {historico.profissionaisAtendentes.map((prof, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium truncate border border-purple-200"
                        >
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                  {historico.observacoesGerais && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <strong className="text-sm text-indigo-800 font-semibold">
                          Observações Gerais
                        </strong>
                      </div>
                      <p className="text-sm text-indigo-700 break-words leading-relaxed">
                        {historico.observacoesGerais}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
