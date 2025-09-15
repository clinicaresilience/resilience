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

  // Exportar relatório em PDF usando o PDFExporter
  const exportarRelatorio = async () => {
    const { default: PDFExporter } = await import('@/utils/export-pdf');
    
    // Preparar dados dos gráficos
    const chartData = [];
    
    // Gráfico de pizza - distribuição por tipo
    if (Object.keys(metricas.evolucoesPorTipo).length > 0) {
      chartData.push({
        type: 'pie' as const,
        title: 'Distribuição por Tipo de Evolução',
        data: Object.entries(metricas.evolucoesPorTipo).map(([tipo, quantidade]) => ({
          quantidade,
          label: TIPOS_EVOLUCAO.find(t => t.value === tipo)?.label || tipo,
          tipo
        }))
      });
    }
    
    // Gráfico de rosca - profissionais
    if (Object.keys(metricas.profissionaisEnvolvidos).length > 0) {
      chartData.push({
        type: 'donut' as const,
        title: 'Profissionais Envolvidos',
        data: Object.entries(metricas.profissionaisEnvolvidos).map(([id, info]) => ({
          quantidade: info.quantidade,
          nome: info.nome,
          id
        })),
        options: {
          centerText: metricas.totalEvolucoes.toString()
        }
      });
    }
    
    // Gráfico de barras - evolução mensal
    if (metricas.evolucoesPorMes.length > 0) {
      chartData.push({
        type: 'bar' as const,
        title: 'Evolução Mensal',
        data: metricas.evolucoesPorMes.map(item => {
          const [ano, mes] = item.mes.split('-');
          const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const mesNome = nomesMeses[parseInt(mes) - 1];
          return {
            quantidade: item.quantidade,
            label: mesNome,
            sublabel: ano,
            mes: item.mes
          };
        })
      });
    }
    
    // Preparar métricas
    const metrics = [
      {
        value: metricas.totalEvolucoes,
        label: 'Total de Evoluções',
        color: '#2563eb'
      },
      {
        value: `${Math.round(metricas.mediaDiasEntreEvolucoes)} dias`,
        label: 'Média entre Evoluções',
        color: '#10b981'
      },
      {
        value: Object.keys(metricas.profissionaisEnvolvidos).length,
        label: 'Profissionais Envolvidos',
        color: '#8b5cf6'
      },
      {
        value: metricas.tendenciaFrequencia.toUpperCase(),
        label: 'Tendência de Frequência',
        color: metricas.tendenciaFrequencia === 'crescente' ? '#10b981' : 
              metricas.tendenciaFrequencia === 'decrescente' ? '#ef4444' : '#6b7280'
      }
    ];
    
    // Preparar seções customizadas
    const sections = [];
    
    // Seção de informações gerais
    const filtroTexto = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <strong>ID do Prontuário:</strong><br>${prontuarioId}
        </div>
        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <strong>Período:</strong><br>
          ${metricas.primeiraEvolucao ? formatarDataSimples(metricas.primeiraEvolucao) : 'N/A'} - 
          ${metricas.ultimaEvolucao ? formatarDataSimples(metricas.ultimaEvolucao) : 'N/A'}
        </div>
        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <strong>Filtros Aplicados:</strong><br>
          Tipo: ${filtroTipo === 'todos' ? 'Todos' : TIPOS_EVOLUCAO.find(t => t.value === filtroTipo)?.label || filtroTipo}<br>
          Período: ${filtroMes === 'todos' && filtroAno === 'todos' ? 'Todos' : `${filtroMes === 'todos' ? '' : new Date(2024, parseInt(filtroMes) - 1).toLocaleDateString('pt-BR', { month: 'long' })} ${filtroAno === 'todos' ? '' : filtroAno}`}
        </div>
      </div>
    `;
    
    sections.push({
      title: 'Informações Gerais',
      content: filtroTexto
    });
    
    // Timeline
    if (metricas.primeiraEvolucao || metricas.ultimaEvolucao) {
      const timelineContent = `
        ${metricas.primeiraEvolucao ? `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0ea5e9;">
            <strong>Primeira Evolução:</strong> ${formatarData(metricas.primeiraEvolucao)}
          </div>
        ` : ''}
        ${metricas.ultimaEvolucao ? `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0ea5e9;">
            <strong>Última Evolução:</strong> ${formatarData(metricas.ultimaEvolucao)}
          </div>
        ` : ''}
        ${metricas.primeiraEvolucao && metricas.ultimaEvolucao && metricas.primeiraEvolucao !== metricas.ultimaEvolucao ? `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0ea5e9;">
            <strong>Duração do Tratamento:</strong> ${Math.ceil((new Date(metricas.ultimaEvolucao).getTime() - new Date(metricas.primeiraEvolucao).getTime()) / (1000 * 60 * 60 * 24))} dias
          </div>
        ` : ''}
      `;
      
      sections.push({
        title: 'Timeline de Atividade',
        content: timelineContent
      });
    }
    
    // Preparar dados de evolução
    const evolutionData = evolucoesFiltradas
      .sort((a, b) => new Date(b.data_evolucao).getTime() - new Date(a.data_evolucao).getTime())
      .map((evolucao) => {
        const tipoInfo = TIPOS_EVOLUCAO.find(t => t.value === evolucao.tipo_evolucao);
        return {
          tipo: tipoInfo?.label || evolucao.tipo_evolucao,
          data: formatarData(evolucao.data_evolucao),
          texto: evolucao.texto,
          profissional: `Profissional: ${evolucao.profissional.nome}${
            evolucao.profissional.informacoes_adicionais?.especialidade ? 
            ` - ${evolucao.profissional.informacoes_adicionais.especialidade}` : ''
          }`
        };
      });
    
    // Exportar usando PDFExporter
    PDFExporter.export({
      header: {
        title: 'Histórico e Métricas de Evolução',
        patientName: pacienteNome,
        reportDate: formatarData(new Date().toISOString()),
        additionalInfo: [
          `Relatório de ${evolucoesFiltradas.length} evolução${evolucoesFiltradas.length !== 1 ? 'ões' : ''}`
        ]
      },
      metrics,
      charts: chartData,
      sections,
      evolutionData,
      autoprint: true
    });
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
          {/* Gráfico de Pizza - Distribuição por Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Distribuição por Tipo (Gráfico Pizza)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(metricas.evolucoesPorTipo).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
                ) : (
                  <div className="relative">
                    {/* SVG Pie Chart */}
                    <div className="flex justify-center mb-4">
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {Object.entries(metricas.evolucoesPorTipo).map(([tipo, quantidade], index) => {
                          const total = metricas.totalEvolucoes;
                          const percentage = (quantidade / total) * 100;
                          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280'];
                          const color = colors[index % colors.length];
                          
                          // Calculate pie slice
                          const radius = 80;
                          const centerX = 100;
                          const centerY = 100;
                          
                          let cumulativePercentage = 0;
                          Object.entries(metricas.evolucoesPorTipo).slice(0, index).forEach(([_, qty]) => {
                            cumulativePercentage += (qty / total) * 100;
                          });
                          
                          const startAngle = (cumulativePercentage / 100) * 360 - 90;
                          const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
                          
                          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                          
                          const largeArc = percentage > 50 ? 1 : 0;
                          
                          const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                            'Z'
                          ].join(' ');

                          return (
                            <path
                              key={tipo}
                              d={pathData}
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    
                    {/* Legenda */}
                    <div className="space-y-2">
                      {Object.entries(metricas.evolucoesPorTipo).map(([tipo, quantidade], index) => {
                        const tipoInfo = TIPOS_EVOLUCAO.find(t => t.value === tipo);
                        const percentage = ((quantidade / metricas.totalEvolucoes) * 100).toFixed(1);
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280'];
                        const color = colors[index % colors.length];
                        
                        return (
                          <div key={tipo} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="text-sm font-medium">
                                {tipoInfo?.label || tipo}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{quantidade}</span>
                              <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de Rosca - Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profissionais (Gráfico Rosca)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(metricas.profissionaisEnvolvidos).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
                ) : (
                  <div className="relative">
                    {/* SVG Donut Chart */}
                    <div className="flex justify-center mb-4">
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {Object.entries(metricas.profissionaisEnvolvidos).map(([id, info], index) => {
                          const total = metricas.totalEvolucoes;
                          const percentage = (info.quantidade / total) * 100;
                          const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6B7280'];
                          const color = colors[index % colors.length];
                          
                          // Calculate donut slice
                          const outerRadius = 80;
                          const innerRadius = 45;
                          const centerX = 100;
                          const centerY = 100;
                          
                          let cumulativePercentage = 0;
                          Object.entries(metricas.profissionaisEnvolvidos).slice(0, index).forEach(([_, profInfo]) => {
                            cumulativePercentage += (profInfo.quantidade / total) * 100;
                          });
                          
                          const startAngle = (cumulativePercentage / 100) * 360 - 90;
                          const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
                          
                          const x1Outer = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
                          const y1Outer = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
                          const x2Outer = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
                          const y2Outer = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);
                          
                          const x1Inner = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                          const y1Inner = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
                          const x2Inner = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                          const y2Inner = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                          
                          const largeArc = percentage > 50 ? 1 : 0;
                          
                          const pathData = [
                            `M ${x1Outer} ${y1Outer}`,
                            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
                            `L ${x2Inner} ${y2Inner}`,
                            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
                            'Z'
                          ].join(' ');

                          return (
                            <path
                              key={id}
                              d={pathData}
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })}
                        
                        {/* Centro do donut com total */}
                        <text x="100" y="95" textAnchor="middle" className="text-lg font-bold fill-gray-700">
                          Total
                        </text>
                        <text x="100" y="110" textAnchor="middle" className="text-2xl font-bold fill-blue-600">
                          {metricas.totalEvolucoes}
                        </text>
                      </svg>
                    </div>
                    
                    {/* Legenda */}
                    <div className="space-y-2">
                      {Object.entries(metricas.profissionaisEnvolvidos).map(([id, info], index) => {
                        const percentage = ((info.quantidade / metricas.totalEvolucoes) * 100).toFixed(1);
                        const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6B7280'];
                        const color = colors[index % colors.length];
                        
                        return (
                          <div key={id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="text-sm font-medium">
                                {info.nome}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{info.quantidade}</span>
                              <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Barras Detalhado - Evolução por Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Evolução Mensal (Gráfico de Barras Detalhado)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.evolucoesPorMes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Dados insuficientes para gráfico</p>
                ) : (
                  <div className="space-y-6">
                    {/* Gráfico de barras principal */}
                    <div className="relative h-64 border border-gray-200 rounded-lg p-4 bg-gradient-to-b from-blue-50 to-white">
                      <div className="h-full flex items-end justify-between gap-2">
                        {metricas.evolucoesPorMes.map((item, index) => {
                          const [ano, mes] = item.mes.split('-');
                          const nomesMeses = [
                            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                          ];
                          const mesNome = nomesMeses[parseInt(mes) - 1];
                          const maxValue = Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade));
                          const height = (item.quantidade / maxValue) * 100;
                          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                          const color = colors[index % colors.length];
                          
                          return (
                            <div key={item.mes} className="flex flex-col items-center flex-1">
                              <div 
                                className="w-full rounded-t-lg flex items-end justify-center text-white text-xs font-bold shadow-lg relative group transition-all hover:shadow-xl hover:scale-105"
                                style={{ 
                                  height: `${height}%`, 
                                  backgroundColor: color,
                                  minHeight: '20px'
                                }}
                              >
                                <span className="pb-1">{item.quantidade}</span>
                                
                                {/* Tooltip hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {item.quantidade} evolução{item.quantidade !== 1 ? 'ões' : ''} em {mesNome}/{ano}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1 text-center">
                                <div className="font-medium">{mesNome}</div>
                                <div className="text-gray-500">{ano}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Linhas de grade horizontais */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[0, 25, 50, 75, 100].map((percentage) => (
                          <div
                            key={percentage}
                            className="absolute w-full border-t border-gray-300 border-dashed"
                            style={{ bottom: `${percentage}%` }}
                          >
                            <span className="absolute -left-8 -top-2 text-xs text-gray-500">
                              {Math.ceil((percentage / 100) * Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade)))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estatísticas detalhadas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade))}
                        </div>
                        <div className="text-sm text-blue-800">Pico Máximo</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.min(...metricas.evolucoesPorMes.map(i => i.quantidade))}
                        </div>
                        <div className="text-sm text-green-800">Mínimo</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {(metricas.evolucoesPorMes.reduce((acc, item) => acc + item.quantidade, 0) / metricas.evolucoesPorMes.length).toFixed(1)}
                        </div>
                        <div className="text-sm text-orange-800">Média Mensal</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {metricas.evolucoesPorMes.length}
                        </div>
                        <div className="text-sm text-purple-800">Meses Ativos</div>
                      </div>
                    </div>

                    {/* Análise de tendência */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Análise de Tendência
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            metricas.tendenciaFrequencia === 'crescente' ? 'bg-green-500' :
                            metricas.tendenciaFrequencia === 'decrescente' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="capitalize font-medium">Tendência: {metricas.tendenciaFrequencia}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Período mais ativo:</span>
                          <span className="font-medium ml-2">
                            {metricas.evolucoesPorMes.length > 0 
                              ? (() => {
                                  const maisAtivo = metricas.evolucoesPorMes.reduce((prev, current) => 
                                    prev.quantidade > current.quantidade ? prev : current
                                  );
                                  const [ano, mes] = maisAtivo.mes.split('-');
                                  const nomesMeses = [
                                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                  ];
                                  return `${nomesMeses[parseInt(mes) - 1]} ${ano}`;
                                })()
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Variação:</span>
                          <span className="font-medium ml-2">
                            {metricas.evolucoesPorMes.length > 1 
                              ? `±${(Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade)) - Math.min(...metricas.evolucoesPorMes.map(i => i.quantidade)))} evolução${Math.max(...metricas.evolucoesPorMes.map(i => i.quantidade)) - Math.min(...metricas.evolucoesPorMes.map(i => i.quantidade)) !== 1 ? 'ões' : ''}`
                              : '0'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
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
