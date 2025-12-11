"use client";

import React, { useState, useEffect } from 'react';
import { EmpresaComSubmissoes, ConsolidatedReport, DRPS_TOPICS, SCORE_LABELS, convertToRiskScore, DrpsScore } from '@/types/drps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Building2,
  Users,
  TrendingUp,
  ArrowLeft,
  FileDown,
  Calendar,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';

export default function DrpsConsolidadoPage() {
  const [empresas, setEmpresas] = useState<EmpresaComSubmissoes[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaComSubmissoes | null>(null);
  const [selectedSetor, setSelectedSetor] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<ConsolidatedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState<ConsolidatedReport['participantes'][0] | null>(null);
  const [showRespostasModal, setShowRespostasModal] = useState(false);
  const [showSetorSelectModal, setShowSetorSelectModal] = useState(false);
  const [empresaForSetorReport, setEmpresaForSetorReport] = useState<EmpresaComSubmissoes | null>(null);
  const [selectedSetorForReport, setSelectedSetorForReport] = useState<string>('');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drps/empresas');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar empresas');
      }

      setEmpresas(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatorio = async (empresaId: string, setor?: string) => {
    try {
      setLoadingRelatorio(true);
      setError('');

      const tipo = setor ? 'setor' : 'empresa';
      const params = new URLSearchParams({
        tipo,
        empresa_id: empresaId
      });

      if (setor) {
        params.append('setor', setor);
      }

      const response = await fetch(`/api/drps/relatorio-consolidado?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar relatório');
      }

      setRelatorio(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
      setRelatorio(null);
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const handleSelectEmpresa = (empresa: EmpresaComSubmissoes) => {
    setSelectedEmpresa(empresa);
    setSelectedSetor(null);
    fetchRelatorio(empresa.id);
  };

  const handleSelectSetor = (empresa: EmpresaComSubmissoes, setorNome: string) => {
    setSelectedEmpresa(empresa);
    setSelectedSetor(setorNome);
    fetchRelatorio(empresa.id, setorNome);
  };

  const handleVoltar = () => {
    setSelectedEmpresa(null);
    setSelectedSetor(null);
    setRelatorio(null);
    setError('');
  };

  const handleViewRespostas = (participante: ConsolidatedReport['participantes'][0]) => {
    setSelectedParticipante(participante);
    setShowRespostasModal(true);
  };

  const handleOpenSetorSelect = (empresa: EmpresaComSubmissoes) => {
    // Sempre abre o modal para selecionar o setor
    setEmpresaForSetorReport(empresa);
    // Se só tem 1 setor, já pré-seleciona
    setSelectedSetorForReport(empresa.setores.length === 1 ? empresa.setores[0].nome : '');
    setShowSetorSelectModal(true);
  };

  const handleConfirmSetorSelect = () => {
    if (empresaForSetorReport && selectedSetorForReport) {
      handleSelectSetor(empresaForSetorReport, selectedSetorForReport);
      setShowSetorSelectModal(false);
      setEmpresaForSetorReport(null);
      setSelectedSetorForReport('');
    }
  };

  const getRiskLevel = (average: number) => {
    if (average <= 1) return { level: 'Baixo', color: 'text-green-600 bg-green-50' };
    if (average <= 2) return { level: 'Médio', color: 'text-yellow-600 bg-yellow-50' };
    if (average <= 3) return { level: 'Alto', color: 'text-orange-600 bg-orange-50' };
    return { level: 'Crítico', color: 'text-red-600 bg-red-50' };
  };

  const getProbability = (average: number) => {
    if (average <= 1) return 'Baixa';
    if (average <= 2) return 'Média';
    if (average <= 3) return 'Alta';
    return 'Alta';
  };

  const getRiskMatrix = (severity: string, probability: string) => {
    const matrix: Record<string, Record<string, string>> = {
      'Baixo': { 'Baixa': 'Baixo', 'Média': 'Baixo', 'Alta': 'Médio' },
      'Médio': { 'Baixa': 'Baixo', 'Média': 'Médio', 'Alta': 'Alto' },
      'Alto': { 'Baixa': 'Médio', 'Média': 'Alto', 'Alta': 'Crítico' },
      'Crítico': { 'Baixa': 'Alto', 'Média': 'Crítico', 'Alta': 'Crítico' }
    };
    return matrix[severity]?.[probability] || 'Médio';
  };

  const RISK_COLORS = {
    'Baixo': '#22c55e',
    'Médio': '#eab308',
    'Alto': '#f97316',
    'Crítico': '#ef4444'
  };

  const getRiskBadgeColor = (risk: string) => {
    if (risk === 'Baixo') return 'bg-green-500';
    if (risk === 'Médio') return 'bg-yellow-500';
    if (risk === 'Alto') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToPDF = async () => {
    if (!relatorio) return;

    setGeneratingPdf(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);

      let yPos = 20;

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const getRiskColorRGB = (risk: string): [number, number, number] => {
        if (risk === 'Baixo') return [34, 197, 94];
        if (risk === 'Médio') return [234, 179, 8];
        if (risk === 'Alto') return [249, 115, 22];
        return [239, 68, 68];
      };

      // === PÁGINA 1: CAPA ===
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 80, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      const titulo = relatorio.tipo === 'empresa'
        ? 'Relatório DRPS Consolidado'
        : 'Relatório DRPS por Setor';
      pdf.text(titulo, pageWidth / 2, 35, { align: 'center' });

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(relatorio.empresa.nome, pageWidth / 2, 50, { align: 'center' });

      if (relatorio.setor) {
        pdf.setFontSize(12);
        pdf.text(`Setor: ${relatorio.setor}`, pageWidth / 2, 60, { align: 'center' });
      }

      pdf.setTextColor(0, 0, 0);
      yPos = 100;

      // Cards de informação
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações Gerais', margin, yPos);
      yPos += 8;

      const cardHeight = 15;
      const cardWidth = (maxWidth - 10) / 3;

      // Card 1: Participantes
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Total de Participantes', margin + 3, yPos + 5);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138);
      pdf.text(relatorio.total_submissoes.toString(), margin + 3, yPos + 12);

      // Card 2: Período
      pdf.setFillColor(243, 232, 255);
      pdf.roundedRect(margin + cardWidth + 5, yPos, cardWidth, cardHeight, 2, 2, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Período', margin + cardWidth + 8, yPos + 5);
      pdf.setFontSize(7);
      pdf.setTextColor(109, 40, 217);
      const dataInicio = new Date(relatorio.periodo.data_inicio).toLocaleDateString('pt-BR');
      const dataFim = new Date(relatorio.periodo.data_fim).toLocaleDateString('pt-BR');
      pdf.text(`${dataInicio}`, margin + cardWidth + 8, yPos + 10);
      pdf.text(`a ${dataFim}`, margin + cardWidth + 8, yPos + 13);

      // Card 3: Risco Geral
      const totalAverage = Object.values(relatorio.topicos_scores).reduce((acc, score) => acc + score.average, 0) / Object.keys(relatorio.topicos_scores).length;
      const overallRisk = getRiskLevel(totalAverage);
      const riskColor = getRiskColorRGB(overallRisk.level);

      pdf.setFillColor(254, 242, 242);
      pdf.roundedRect(margin + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 2, 2, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Risco Geral', margin + (cardWidth + 5) * 2 + 3, yPos + 5);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      pdf.text(overallRisk.level, margin + (cardWidth + 5) * 2 + 3, yPos + 12);

      yPos += cardHeight + 15;

      // === MATRIZ DE RISCO ===
      checkPageBreak(80);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Matriz de Risco - Classificação por Tópicos', margin, yPos);
      yPos += 8;

      // Cabeçalho da tabela
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, yPos - 5, maxWidth, 8, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');

      const col1 = margin + 2;
      const col2 = margin + 55;
      const col3 = margin + 100;
      const col4 = margin + 140;
      const col5 = margin + 165;

      pdf.text('Fator de Risco', col1, yPos);
      pdf.text('Gravidade', col2, yPos);
      pdf.text('Probabilidade', col3, yPos);
      pdf.text('Matriz', col4, yPos);
      pdf.text('Média', col5, yPos);
      yPos += 5;

      // Linhas da tabela
      DRPS_TOPICS.forEach((topic, index) => {
        if (checkPageBreak(12)) {
          // Repetir cabeçalho
          pdf.setFillColor(243, 244, 246);
          pdf.rect(margin, yPos - 5, maxWidth, 8, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Fator de Risco', col1, yPos);
          pdf.text('Gravidade', col2, yPos);
          pdf.text('Probabilidade', col3, yPos);
          pdf.text('Matriz', col4, yPos);
          pdf.text('Média', col5, yPos);
          yPos += 5;
        }

        const score = relatorio.topicos_scores[topic.id];
        const severity = getRiskLevel(score.average);
        const probability = getProbability(score.average);
        const matrixRisk = getRiskMatrix(severity.level, probability);

        // Alternar cor de fundo
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.rect(margin, yPos - 4, maxWidth, 10, 'F');

        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPos - 4, maxWidth, 10, 'S');

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        const titleText = pdf.splitTextToSize(topic.title, 50);
        pdf.text(titleText[0], col1, yPos);

        // Gravidade com cor
        const sevColor = getRiskColorRGB(severity.level);
        pdf.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(severity.level, col2, yPos);

        // Probabilidade
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.text(probability, col3, yPos);

        // Matriz com cor
        const matrixColor = getRiskColorRGB(matrixRisk);
        pdf.setTextColor(matrixColor[0], matrixColor[1], matrixColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(matrixRisk, col4, yPos);

        // Média
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.text(score.average.toFixed(2), col5, yPos);

        yPos += 10;
      });

      // === DISTRIBUIÇÃO POR TÓPICO ===
      pdf.addPage();
      yPos = margin;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Distribuição de Respostas por Tópico', margin, yPos);
      yPos += 10;

      DRPS_TOPICS.forEach((topic) => {
        if (checkPageBreak(45)) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Distribuição de Respostas por Tópico (continuação)', margin, yPos);
          yPos += 10;
        }

        const topicData = relatorio.respostas_agregadas[topic.id];
        const score = relatorio.topicos_scores[topic.id];

        // Título do tópico com badge
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(topic.title, margin, yPos);

        const riskLevel = getRiskLevel(score.average);
        const rColor = getRiskColorRGB(riskLevel.level);
        pdf.setFillColor(rColor[0], rColor[1], rColor[2]);
        pdf.setTextColor(255, 255, 255);
        pdf.roundedRect(margin + 90, yPos - 3, 20, 5, 1, 1, 'F');
        pdf.setFontSize(7);
        pdf.text(riskLevel.level, margin + 100, yPos, { align: 'center' });

        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Média: ${score.average.toFixed(2)}`, margin + 120, yPos);

        yPos += 8;

        // Distribuição
        const distribuicaoTotal: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        Object.values(topicData).forEach(questionStats => {
          Object.entries(questionStats.distribuicao).forEach(([scoreKey, count]) => {
            distribuicaoTotal[parseInt(scoreKey)] += count;
          });
        });

        const total = Object.values(distribuicaoTotal).reduce((a, b) => a + b, 0);
        const barWidth = maxWidth - 40;
        const barHeight = 6;

        pdf.setFontSize(7);
        pdf.setTextColor(0, 0, 0);
        Object.entries(distribuicaoTotal).forEach(([scoreKey, count], index) => {
          const score = parseInt(scoreKey);
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const width = (percentage / 100) * barWidth;

          // Label
          pdf.text(`${SCORE_LABELS[score as keyof typeof SCORE_LABELS]} (${count})`, margin, yPos + (index * 5) + 4);

          // Barra
          const barX = margin + 35;
          const barY = yPos + (index * 5);

          pdf.setFillColor(229, 231, 235);
          pdf.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');

          if (width > 0) {
            const barColor =
              score === 0 ? [34, 197, 94] :
              score === 1 ? [59, 130, 246] :
              score === 2 ? [234, 179, 8] :
              score === 3 ? [249, 115, 22] :
              [239, 68, 68];

            pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
            pdf.roundedRect(barX, barY, width, barHeight, 1, 1, 'F');
          }

          // Percentual
          pdf.text(`${percentage.toFixed(1)}%`, barX + barWidth + 3, yPos + (index * 5) + 4);
        });

        yPos += 30;
      });

      // === PARTICIPANTES ===
      pdf.addPage();
      yPos = margin;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Participantes (${relatorio.participantes.length})`, margin, yPos);
      yPos += 8;

      // Cabeçalho tabela participantes
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, yPos - 5, maxWidth, 7, 'F');
      pdf.setFontSize(8);
      pdf.text('#', margin + 2, yPos);
      pdf.text('Nome', margin + 10, yPos);
      pdf.text('Função', margin + 70, yPos);
      pdf.text('Setor', margin + 120, yPos);
      pdf.text('Data', margin + 160, yPos);
      yPos += 5;

      relatorio.participantes.forEach((participante, index) => {
        if (checkPageBreak(8)) {
          pdf.setFillColor(243, 244, 246);
          pdf.rect(margin, yPos - 5, maxWidth, 7, 'F');
          pdf.setFontSize(8);
          pdf.text('#', margin + 2, yPos);
          pdf.text('Nome', margin + 10, yPos);
          pdf.text('Função', margin + 70, yPos);
          pdf.text('Setor', margin + 120, yPos);
          pdf.text('Data', margin + 160, yPos);
          yPos += 5;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPos - 4, maxWidth, 7, 'F');
        }

        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPos - 4, maxWidth, 7, 'S');

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text(`${index + 1}`, margin + 2, yPos);
        pdf.text(participante.nome.substring(0, 25), margin + 10, yPos);
        pdf.text(participante.funcao.substring(0, 20), margin + 70, yPos);
        pdf.text(participante.setor.substring(0, 15), margin + 120, yPos);
        pdf.text(new Date(participante.data).toLocaleDateString('pt-BR'), margin + 160, yPos);

        yPos += 7;
      });

      // Rodapé em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      pdf.save(`relatorio-drps-consolidado-${relatorio.empresa.nome.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Visualização do Relatório Consolidado
  if (relatorio) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {relatorio.tipo === 'empresa' ? 'Relatório Consolidado da Empresa' : 'Relatório Consolidado do Setor'}
                </h1>
                {relatorio.tipo === 'setor' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Filtrado por Setor
                  </span>
                )}
              </div>
              <p className="text-gray-600 font-medium">
                <Building2 className="w-4 h-4 inline mr-1" />
                {relatorio.empresa.nome}
                {relatorio.setor && (
                  <span className="ml-2 text-blue-600">
                    → Setor: {relatorio.setor}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={exportToPDF}
                disabled={generatingPdf}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <FileDown className="w-4 h-4" />
                {generatingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
              </Button>
              <Button
                onClick={handleVoltar}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
          </div>

          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <p className="text-red-800">{error}</p>
            </Card>
          )}

          {/* Informações Gerais */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">{relatorio.total_submissoes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(relatorio.periodo.data_inicio).toLocaleDateString('pt-BR')}
                    <br />
                    a {new Date(relatorio.periodo.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risco Geral</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const mediaGeral = Object.values(relatorio.topicos_scores).reduce((acc, score) => acc + score.average, 0) / Object.keys(relatorio.topicos_scores).length;
                      return getRiskLevel(mediaGeral).level;
                    })()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Matriz de Risco */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matriz de Risco - Classificação por Tópicos</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold">Fatores de Risco</th>
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold">Fonte Geradora do Risco</th>
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold text-center">Gravidade (Severidade)</th>
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold text-center">Probabilidade de Ocorrência</th>
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold text-center">Matriz Risco</th>
                    <th className="border border-gray-300 px-4 py-3 text-sm font-semibold text-center">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {DRPS_TOPICS.map(topic => {
                    const score = relatorio.topicos_scores[topic.id];
                    const severity = getRiskLevel(score.average);
                    const probability = getProbability(score.average);
                    const matrixRisk = getRiskMatrix(severity.level, probability);

                    return (
                      <tr key={topic.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{topic.title}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">{topic.description}</td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getRiskBadgeColor(severity.level)} text-white font-semibold text-sm`}>
                          {severity.level}
                        </td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getProbability(score.average) === 'Baixa' ? 'bg-green-500' : getProbability(score.average) === 'Média' ? 'bg-yellow-500' : 'bg-orange-500'} text-white font-semibold text-sm`}>
                          {probability}
                        </td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getRiskBadgeColor(matrixRisk)} text-white font-semibold text-sm`}>
                          {matrixRisk}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">
                          {score.average.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Gráfico 1: Distribuição de Risco (Matriz) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Distribuição de Risco (Matriz)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const riskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        const probability = getProbability(score.average);
                        const matrixRisk = getRiskMatrix(severity.level, probability);
                        riskCounts[matrixRisk] = (riskCounts[matrixRisk] || 0) + 1;
                      });
                      return Object.entries(riskCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({
                          name,
                          value,
                          percentage: ((value / DRPS_TOPICS.length) * 100).toFixed(0)
                        }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {(() => {
                      const riskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        const probability = getProbability(score.average);
                        const matrixRisk = getRiskMatrix(severity.level, probability);
                        riskCounts[matrixRisk] = (riskCounts[matrixRisk] || 0) + 1;
                      });
                      return Object.entries(riskCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name]) => (
                          <Cell key={name} fill={RISK_COLORS[name as keyof typeof RISK_COLORS]} />
                        ));
                    })()}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} tópico(s)`} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const riskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        const probability = getProbability(score.average);
                        const matrixRisk = getRiskMatrix(severity.level, probability);
                        riskCounts[matrixRisk] = (riskCounts[matrixRisk] || 0) + 1;
                      });
                      const count = riskCounts[value as string] || 0;
                      return `${value} (${count})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico 2: Distribuição de Gravidade */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Distribuição de Gravidade</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        severityCounts[severity.level] = (severityCounts[severity.level] || 0) + 1;
                      });
                      return Object.entries(severityCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({
                          name,
                          value,
                          percentage: ((value / DRPS_TOPICS.length) * 100).toFixed(0)
                        }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {(() => {
                      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        severityCounts[severity.level] = (severityCounts[severity.level] || 0) + 1;
                      });
                      return Object.entries(severityCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name]) => (
                          <Cell key={name} fill={RISK_COLORS[name as keyof typeof RISK_COLORS]} />
                        ));
                    })()}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} tópico(s)`} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const severity = getRiskLevel(score.average);
                        severityCounts[severity.level] = (severityCounts[severity.level] || 0) + 1;
                      });
                      const count = severityCounts[value as string] || 0;
                      return `${value} (${count})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico 3: Distribuição de Probabilidade */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Distribuição de Probabilidade</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const probabilityCounts: Record<string, number> = { 'Baixa': 0, 'Média': 0, 'Alta': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const probability = getProbability(score.average);
                        probabilityCounts[probability] = (probabilityCounts[probability] || 0) + 1;
                      });
                      return Object.entries(probabilityCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({
                          name,
                          value,
                          percentage: ((value / DRPS_TOPICS.length) * 100).toFixed(0)
                        }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {(() => {
                      const PROBABILITY_COLORS = {
                        'Baixa': '#22c55e',
                        'Média': '#eab308',
                        'Alta': '#ef4444'
                      };
                      const probabilityCounts: Record<string, number> = { 'Baixa': 0, 'Média': 0, 'Alta': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const probability = getProbability(score.average);
                        probabilityCounts[probability] = (probabilityCounts[probability] || 0) + 1;
                      });
                      return Object.entries(probabilityCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name]) => (
                          <Cell key={name} fill={PROBABILITY_COLORS[name as keyof typeof PROBABILITY_COLORS]} />
                        ));
                    })()}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} tópico(s)`} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const probabilityCounts: Record<string, number> = { 'Baixa': 0, 'Média': 0, 'Alta': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = relatorio.topicos_scores[topic.id];
                        const probability = getProbability(score.average);
                        probabilityCounts[probability] = (probabilityCounts[probability] || 0) + 1;
                      });
                      const count = probabilityCounts[value as string] || 0;
                      return `${value} (${count})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Distribuição de Respostas por Tópico */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Respostas por Tópico</h2>
            <div className="space-y-6">
              {DRPS_TOPICS.map(topic => {
                const topicData = relatorio.respostas_agregadas[topic.id];
                const score = relatorio.topicos_scores[topic.id];

                // Agregar distribuição do tópico inteiro
                const distribuicaoTotal: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
                Object.values(topicData).forEach(questionStats => {
                  Object.entries(questionStats.distribuicao).forEach(([scoreKey, count]) => {
                    distribuicaoTotal[parseInt(scoreKey)] += count;
                  });
                });

                const chartData = Object.entries(distribuicaoTotal).map(([score, count]) => ({
                  score: SCORE_LABELS[parseInt(score) as keyof typeof SCORE_LABELS],
                  count
                }));

                return (
                  <div key={topic.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{topic.title}</h3>
                        <p className="text-sm text-gray-600">Média: {score.average.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevel(score.average).color}`}>
                        {getRiskLevel(score.average).level}
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="score" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Lista de Participantes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Participantes ({relatorio.participantes.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-3 text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-sm font-semibold">Função</th>
                    <th className="px-4 py-3 text-sm font-semibold">Setor</th>
                    <th className="px-4 py-3 text-sm font-semibold">Data</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.participantes.map((participante, index) => (
                    <tr key={participante.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{participante.nome}</td>
                      <td className="px-4 py-3 text-sm">{participante.funcao}</td>
                      <td className="px-4 py-3 text-sm">{participante.setor}</td>
                      <td className="px-4 py-3 text-sm">{new Date(participante.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <Button
                          onClick={() => handleViewRespostas(participante)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Respostas
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Modal de Respostas Detalhadas */}
        <Dialog open={showRespostasModal} onOpenChange={setShowRespostasModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Respostas Detalhadas</DialogTitle>
              <DialogDescription>
                {selectedParticipante && (
                  <div className="mt-2 space-y-1">
                    <p><strong>Nome:</strong> {selectedParticipante.nome}</p>
                    <p><strong>Função:</strong> {selectedParticipante.funcao}</p>
                    <p><strong>Setor:</strong> {selectedParticipante.setor}</p>
                    <p><strong>Data:</strong> {new Date(selectedParticipante.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedParticipante && (
              <div className="space-y-6 mt-4">
                {DRPS_TOPICS.map((topic) => {
                  const respostas = topic.questions
                    .map(q => ({
                      question: q,
                      userScore: selectedParticipante.respostas[q.id],
                      riskScore: selectedParticipante.respostas[q.id] !== undefined
                        ? convertToRiskScore(q.id, selectedParticipante.respostas[q.id] as DrpsScore)
                        : undefined
                    }))
                    .filter(r => r.userScore !== undefined && r.riskScore !== undefined);

                  if (respostas.length === 0) return null;

                  const mediaTopico = respostas.reduce((acc, r) => acc + (r.riskScore || 0), 0) / respostas.length;
                  const riskLevel = getRiskLevel(mediaTopico);

                  return (
                    <div key={topic.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                          <p className="text-sm text-gray-600 italic">{topic.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskLevel.color}`}>
                            {riskLevel.level}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            Média: {mediaTopico.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {respostas.map(({ question, userScore, riskScore }) => (
                          <div key={question.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{question.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded text-sm font-medium ${
                                riskScore === 0 ? 'bg-green-100 text-green-800' :
                                riskScore === 1 ? 'bg-blue-100 text-blue-800' :
                                riskScore === 2 ? 'bg-yellow-100 text-yellow-800' :
                                riskScore === 3 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {SCORE_LABELS[userScore!]} (Risco: {riskScore})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Overlay de loading para geração de PDF */}
        {generatingPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#02b1aa]"></div>
              <p className="text-lg font-semibold text-gray-900">Gerando PDF...</p>
              <p className="text-sm text-gray-600">Por favor, aguarde</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Lista de Empresas
  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios DRPS Consolidados</h1>
            <p className="text-gray-600">
              Diagnóstico de Riscos Psicossociais por Empresa e Setor
            </p>
          </div>
        </div>

        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Busca */}
        <Card className="p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        {/* Grid de Empresas */}
        {filteredEmpresas.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">
              {empresas.length === 0
                ? 'Ainda não há avaliações DRPS submetidas.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmpresas.map(empresa => (
              <Card key={empresa.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{empresa.nome}</h3>
                        {empresa.cnpj && (
                          <p className="text-xs text-gray-500">CNPJ: {empresa.cnpj}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevel(0).color}`}>
                      {empresa.risco_geral}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{empresa.total_submissoes} participantes</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Setores disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {empresa.setores.map(setor => (
                        <div
                          key={setor.nome}
                          className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          {setor.nome} ({setor.total})
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSelectEmpresa(empresa)}
                      variant="outline"
                      className="w-full"
                    >
                      Relatório Geral
                    </Button>
                    <Button
                      onClick={() => handleOpenSetorSelect(empresa)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Relatório por Setor
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Seleção de Setor */}
        <Dialog open={showSetorSelectModal} onOpenChange={setShowSetorSelectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Selecione o Setor</DialogTitle>
              <DialogDescription>
                {empresaForSetorReport && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Escolha o setor para visualizar o relatório consolidado da empresa <strong>{empresaForSetorReport.nome}</strong>
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {empresaForSetorReport && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Setor:
                  </label>
                  <Select value={selectedSetorForReport} onValueChange={setSelectedSetorForReport}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha o setor..." />
                    </SelectTrigger>
                    <SelectContent className="!z-[200]">
                      {empresaForSetorReport.setores.map(setor => (
                        <SelectItem key={setor.nome} value={setor.nome}>
                          {setor.nome} ({setor.total} participante{setor.total > 1 ? 's' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSetorSelectModal(false);
                      setEmpresaForSetorReport(null);
                      setSelectedSetorForReport('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmSetorSelect}
                    disabled={!selectedSetorForReport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
