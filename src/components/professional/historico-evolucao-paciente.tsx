"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  User,
  Download,
  Filter,
  AlertCircle,
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

interface MetricasEvolucao {
  totalEvolucoes: number;
  evolucoesPorTipo: { [key: string]: number };
  evolucoesPorMes: { mes: string; quantidade: number }[];
  profissionaisEnvolvidos: { [key: string]: { nome: string; quantidade: number } };
  mediaDiasEntreEvolucoes: number;
  ultimaEvolucao: string;
  primeiraEvolucao: string;
  tendenciaFrequencia: 'crescente' | 'decrescente' | 'estavel';
}

interface HistoricoEvolucaoPacienteProps {
  prontuarioId: string;
  pacienteNome: string;
  isAdmin?: boolean;
  profissionalId: string;
  profissionalAtualId?: string;
}

const TIPOS_EVOLUCAO = [
  { value: 'consulta', label: 'Consulta', color: 'bg-blue-100 text-blue-800' },
  { value: 'avaliacao', label: 'Avaliação', color: 'bg-purple-100 text-purple-800' },
  { value: 'sessao', label: 'Sessão', color: 'bg-green-100 text-green-800' },
  { value: 'reavaliacao', label: 'Reavaliação', color: 'bg-orange-100 text-orange-800' },
  { value: 'alta', label: 'Alta', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'intercorrencia', label: 'Intercorrência', color: 'bg-red-100 text-red-800' },
  { value: 'observacao', label: 'Observação', color: 'bg-gray-100 text-gray-800' },
];

export function HistoricoEvolucaoPaciente({
  prontuarioId,
  pacienteNome,
  isAdmin = false,
  profissionalId,
  profissionalAtualId,
}: HistoricoEvolucaoPacienteProps) {
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAno, setFiltroAno] = useState<string>("todos");

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
      setErro("Erro ao carregar histórico de evoluções");
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

  const formatarDataSimples = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  };

  // Calcular métricas
  const metricas = useMemo<MetricasEvolucao>(() => {
    if (evolucoes.length === 0) {
      return {
        totalEvolucoes: 0,
        evolucoesPorTipo: {},
        evolucoesPorMes: [],
        profissionaisEnvolvidos: {},
        mediaDiasEntreEvolucoes: 0,
        ultimaEvolucao: "",
        primeiraEvolucao: "",
        tendenciaFrequencia: 'estavel',
      };
    }

    // Ordenar evoluções por data
    const evolucaesOrdenadas = [...evolucoes].sort(
      (a, b) => new Date(a.data_evolucao).getTime() - new Date(b.data_evolucao).getTime()
    );

    // Total de evoluções
    const totalEvolucoes = evolucoes.length;

    // Evoluções por tipo
    const evolucoesPorTipo = evolucoes.reduce((acc, evolucao) => {
      acc[evolucao.tipo_evolucao] = (acc[evolucao.tipo_evolucao] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Evoluções por mês
    const evolucoesPorMes = evolucoes.reduce((acc, evolucao) => {
      const data = new Date(evolucao.data_evolucao);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const existente = acc.find(item => item.mes === mes);
      if (existente) {
        existente.quantidade++;
      } else {
        acc.push({ mes, quantidade: 1 });
      }
      return acc;
    }, [] as { mes: string; quantidade: number }[]);

    // Ordenar por mês
    evolucoesPorMes.sort((a, b) => a.mes.localeCompare(b.mes));

    // Profissionais envolvidos
    const profissionaisEnvolvidos = evolucoes.reduce((acc, evolucao) => {
      const profId = evolucao.profissional_id;
      if (!acc[profId]) {
        acc[profId] = {
          nome: evolucao.profissional.nome,
          quantidade: 0,
        };
      }
      acc[profId].quantidade++;
      return acc;
    }, {} as { [key: string]: { nome: string; quantidade: number } });

    // Média de dias entre evoluções
    let mediaDiasEntreEvolucoes = 0;
    if (evolucaesOrdenadas.length > 1) {
      const diferencas = [];
      for (let i = 1; i < evolucaesOrdenadas.length; i++) {
        const dataAnterior = new Date(evolucaesOrdenadas[i - 1].data_evolucao);
        const dataAtual = new Date(evolucaesOrdenadas[i].data_evolucao);
        const diferenca = (dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24);
        diferencas.push(diferenca);
      }
      mediaDiasEntreEvolucoes = diferencas.reduce((acc, diff) => acc + diff, 0) / diferencas.length;
    }

    // Primeira e última evolução
    const primeiraEvolucao = evolucaesOrdenadas[0]?.data_evolucao || "";
    const ultimaEvolucao = evolucaesOrdenadas[evolucaesOrdenadas.length - 1]?.data_evolucao || "";

    // Tendência de frequência (últimos 3 vs 3 anteriores)
    let tendenciaFrequencia: 'crescente' | 'decrescente' | 'estavel' = 'estavel';
    if (evolucoesPorMes.length >= 6) {
      const ultimos3 = evolucoesPorMes.slice(-3);
      const anteriores3 = evolucoesPorMes.slice(-6, -3);
      const mediaUltimos = ultimos3.reduce((acc, item) => acc + item.quantidade, 0) / 3;
      const mediaAnteriores = anteriores3.reduce((acc, item) => acc + item.quantidade, 0) / 3;
      
      if (mediaUltimos > mediaAnteriores * 1.1) {
        tendenciaFrequencia = 'crescente';
      } else if (mediaUltimos < mediaAnteriores * 0.9) {
        tendenciaFrequencia = 'decrescente';
      }
    }

    return {
      totalEvolucoes,
      evolucoesPorTipo,
      evolucoesPorMes,
      profissionaisEnvolvidos,
      mediaDiasEntreEvolucoes,
      ultimaEvolucao,
      primeiraEvolucao,
      tendenciaFrequencia,
    };
  }, [evolucoes]);

  // Filtrar evoluções
  const evolucoesFiltradas = useMemo(() => {
    return evolucoes.filter(evolucao => {
      // Filtro por tipo
      if (filtroTipo !== "todos" && evolucao.tipo_evolucao !== filtroTipo) {
        return false;
      }

      // Filtro por mês/ano
      const data = new Date(evolucao.data_evolucao);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      if (filtroMes !== "todos" && mes !== parseInt(filtroMes)) {
        return false;
      }

      if (filtroAno !== "todos" && ano !== parseInt(filtroAno)) {
        return false;
      }

      return true;
    });
  }, [evolucoes, filtroTipo, filtroMes, filtroAno]);

  // Obter anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(evolucoes.map(e => new Date(e.data_evolucao).getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [evolucoes]);

  // Exportar relatório
  const exportarRelatorio = () => {
    const relatorio = {
      paciente: pacienteNome,
      prontuario_id: prontuarioId,
      data_relatorio: new Date().toISOString(),
      periodo: {
        primeira_evolucao: metricas.primeiraEvolucao,
        ultima_evolucao: metricas.ultimaEvolucao,
      },
      metricas,
      evolucoes: evolucoesFiltradas.map(e => ({
        data: e.data_evolucao,
        tipo: e.tipo_evolucao,
        profissional: e.profissional.nome,
        texto: e.texto,
      })),
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-evolucao-${pacienteNome.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{erro}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Histórico e Métricas de Evolução
              </CardTitle>
              <CardDescription>
                Análise detalhada da evolução clínica de {pacienteNome}
              </CardDescription>
            </div>
            <Button onClick={exportarRelatorio} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Evoluções</p>
                <p className="text-2xl font-bold">{metricas.totalEvolucoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Média entre Evoluções</p>
                <p className="text-2xl font-bold">
                  {Math.round(metricas.mediaDiasEntreEvolucoes)} dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Profissionais</p>
                <p className="text-2xl font-bold">
                  {Object.keys(metricas.profissionaisEnvolvidos).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {metricas.tendenciaFrequencia === 'crescente' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : metricas.tendenciaFrequencia === 'decrescente' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Activity className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Tendência</p>
                <p className="text-sm font-bold capitalize">
                  {metricas.tendenciaFrequencia}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analise" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="historico">Histórico Detalhado</TabsTrigger>
        </TabsList>

        {/* Tab de Análise */}
        <TabsContent value="analise" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribuição por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metricas.evolucoesPorTipo).map(([tipo, quantidade]) => {
                    const tipoInfo = TIPOS_EVOLUCAO.find(t => t.value === tipo);
                    const porcentagem = (quantidade / metricas.totalEvolucoes) * 100;
                    return (
                      <div key={tipo} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={tipoInfo?.color || 'bg-gray-100 text-gray-800'}>
                            {tipoInfo?.label || tipo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${porcentagem}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {quantidade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Profissionais Envolvidos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profissionais Envolvidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metricas.profissionaisEnvolvidos).map(([id, info]) => {
                    const porcentagem = (info.quantidade / metricas.totalEvolucoes) * 100;
                    return (
                      <div key={id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{info.nome}</span>
                          <span className="text-sm text-gray-600">{info.quantidade} evoluções</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${porcentagem}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Atividade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.primeiraEvolucao && (
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Primeira Evolução</p>
                      <p className="text-sm text-blue-700">{formatarData(metricas.primeiraEvolucao)}</p>
                    </div>
                  </div>
                )}
                {metricas.ultimaEvolucao && (
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Última Evolução</p>
                      <p className="text-sm text-green-700">{formatarData(metricas.ultimaEvolucao)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Gráficos */}
        <TabsContent value="graficos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.evolucoesPorMes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Dados insuficientes para gráfico</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {metricas.evolucoesPorMes.map((item) => {
                      const [ano, mes] = item.mes.split('-');
                      const nomesMeses = [
                        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                      ];
                      const mesNome = nomesMeses[parseInt(mes) - 1];
                      const maxValue = Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade));
                      const width = (item.quantidade / maxValue) * 100;
                      
                      return (
                        <div key={item.mes} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-gray-600">
                            {mesNome} {ano}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2" 
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-white text-xs font-medium">
                                {item.quantidade}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Histórico Detalhado */}
        <TabsContent value="historico" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Evolução</Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      {TIPOS_EVOLUCAO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Mês</Label>
                  <Select value={filtroMes} onValueChange={setFiltroMes}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os meses</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                        <SelectItem key={mes} value={mes.toString()}>
                          {new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ano</Label>
                  <Select value={filtroAno} onValueChange={setFiltroAno}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os anos</SelectItem>
                      {anosDisponiveis.map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Evoluções Filtradas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Histórico Detalhado ({evolucoesFiltradas.length} {evolucoesFiltradas.length === 1 ? 'evolução' : 'evoluções'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evolucoesFiltradas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma evolução encontrada com os filtros aplicados
                </p>
              ) : (
                <div className="space-y-4">
                  {evolucoesFiltradas
                    .sort((a, b) => new Date(b.data_evolucao).getTime() - new Date(a.data_evolucao).getTime())
                    .map((evolucao, index) => {
                      const tipoInfo = TIPOS_EVOLUCAO.find(t => t.value === evolucao.tipo_evolucao);
                      return (
                        <div key={evolucao.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={tipoInfo?.color || 'bg-gray-100 text-gray-800'}>
                                {tipoInfo?.label || evolucao.tipo_evolucao}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{evolucoesFiltradas.length - index}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatarDataSimples(evolucao.data_evolucao)}</p>
                              <p className="text-xs text-gray-500">{evolucao.profissional.nome}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {evolucao.texto.length > 200 
                              ? `${evolucao.texto.substring(0, 200)}...` 
                              : evolucao.texto}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
