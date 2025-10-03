"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DrpsSubmission, DRPS_TOPICS, SCORE_LABELS } from '@/types/drps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Trash2,
  FileDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function DrpsAdminPage() {
  const [submissions, setSubmissions] = useState<DrpsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedSetor, setSelectedSetor] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<DrpsSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drps');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar dados');
      }

      setSubmissions(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Obter empresas únicas
  const empresas = Array.from(new Set(submissions.map(s => s.nome_empresa))).sort();

  // Obter setores únicos com base na empresa selecionada
  const setores = selectedEmpresa
    ? Array.from(new Set(
        submissions
          .filter(s => s.nome_empresa === selectedEmpresa)
          .map(s => s.setor)
      )).sort()
    : [];

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      submission.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmpresa = !selectedEmpresa || submission.nome_empresa === selectedEmpresa;
    const matchesSetor = !selectedSetor || submission.setor === selectedSetor;

    return matchesSearch && matchesEmpresa && matchesSetor;
  });

  const calculateScores = (respostas: Record<string, number>) => {
    const topicScores: Record<string, { total: number; count: number; average: number }> = {};
    
    DRPS_TOPICS.forEach(topic => {
      const questions = topic.questions;
      let total = 0;
      let count = 0;
      
      questions.forEach(question => {
        if (respostas[question.id] !== undefined) {
          total += respostas[question.id];
          count++;
        }
      });
      
      topicScores[topic.id] = {
        total,
        count,
        average: count > 0 ? total / count : 0
      };
    });
    
    return topicScores;
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

  const exportToCSV = () => {
    const csvData = filteredSubmissions.map(submission => ({
      Nome: submission.nome,
      Email: submission.email,
      Telefone: submission.telefone,
      'Nome da Empresa': submission.nome_empresa,
      Função: submission.funcao,
      Setor: submission.setor,
      'Data de Submissão': new Date(submission.created_at).toLocaleDateString('pt-BR'),
      ...Object.entries(submission.respostas).reduce((acc, [questionId, score]) => {
        acc[questionId] = score as number;
        return acc;
      }, {} as Record<string, number>)
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `drps-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação DRPS? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingId(submissionId);
      
      const response = await fetch(`/api/drps?id=${submissionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir avaliação');
      }

      // Remove da lista local
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      
      // Se estava visualizando os detalhes desta submissão, volta para a lista
      if (selectedSubmission?.id === submissionId) {
        setShowDetails(false);
        setSelectedSubmission(null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir avaliação');
    } finally {
      setDeletingId(null);
    }
  };

  const exportToPDF = async (submission: DrpsSubmission) => {
    setGeneratingPdf(true);

    try {
      const topicScores = calculateScores(submission.respostas);
      const pdf = new jsPDF('p', 'mm', 'a4');

      let yPos = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório DRPS - Diagnóstico de Riscos Psicossociais', margin, yPos);
      yPos += 10;

      // Informações do Participante
      pdf.setFontSize(12);
      pdf.text('Informações do Participante', margin, yPos);
      yPos += 7;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const info = [
        `Nome: ${submission.nome}`,
        `Email: ${submission.email}`,
        `Telefone: ${submission.telefone}`,
        `Empresa: ${submission.nome_empresa}`,
        `Função: ${submission.funcao}`,
        `Setor: ${submission.setor}`,
        `Data: ${new Date(submission.created_at).toLocaleString('pt-BR')}`
      ];

      info.forEach(line => {
        pdf.text(line, margin, yPos);
        yPos += 5;
      });

      yPos += 5;
      checkPageBreak(60);

      // Matriz de Risco
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Matriz de Risco - Classificação por Tópicos', margin, yPos);
      yPos += 8;

      // Cabeçalho da tabela
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, yPos - 5, maxWidth, 8, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');

      const col1 = margin + 2;
      const col2 = margin + 45;
      const col3 = margin + 100;
      const col4 = margin + 130;
      const col5 = margin + 160;

      pdf.text('Fator de Risco', col1, yPos);
      pdf.text('Fonte Geradora', col2, yPos);
      pdf.text('Gravidade', col3, yPos);
      pdf.text('Probabilidade', col4, yPos);
      pdf.text('Matriz', col5, yPos);
      yPos += 5;

      // Linhas da tabela
      pdf.setFont('helvetica', 'normal');
      DRPS_TOPICS.forEach((topic) => {
        checkPageBreak(15);

        const score = topicScores[topic.id];
        const severity = getRiskLevel(score.average);
        const probability = getProbability(score.average);
        const matrixRisk = getRiskMatrix(severity.level, probability);

        // Fundo da linha
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, yPos - 4, maxWidth, 10, 'F');

        // Borda
        pdf.setDrawColor(209, 213, 219);
        pdf.rect(margin, yPos - 4, maxWidth, 10, 'S');

        // Texto
        pdf.setTextColor(0, 0, 0);
        const titleLines = pdf.splitTextToSize(topic.title, 40);
        pdf.text(titleLines[0], col1, yPos);

        const descLines = pdf.splitTextToSize(topic.description, 50);
        pdf.text(descLines[0], col2, yPos);

        // Cor para gravidade
        const getSeverityColor = (level: string) => {
          if (level === 'Baixo') return [34, 197, 94];
          if (level === 'Médio') return [234, 179, 8];
          if (level === 'Alto') return [249, 115, 22];
          return [239, 68, 68];
        };

        const getProbColor = (prob: string) => {
          if (prob === 'Baixa') return [34, 197, 94];
          if (prob === 'Média') return [234, 179, 8];
          return [249, 115, 22];
        };

        const getMatrixColor = (risk: string) => {
          if (risk === 'Baixo') return [34, 197, 94];
          if (risk === 'Médio') return [234, 179, 8];
          if (risk === 'Alto') return [249, 115, 22];
          return [239, 68, 68];
        };

        // Gravidade (com fundo colorido)
        const sevColor = getSeverityColor(severity.level);
        pdf.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
        pdf.rect(col3 - 2, yPos - 3, 25, 6, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text(severity.level, col3, yPos);

        // Probabilidade (com fundo colorido)
        const probColor = getProbColor(probability);
        pdf.setFillColor(probColor[0], probColor[1], probColor[2]);
        pdf.rect(col4 - 2, yPos - 3, 25, 6, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text(probability, col4, yPos);

        // Matriz (com fundo colorido)
        const matrixColor = getMatrixColor(matrixRisk);
        pdf.setFillColor(matrixColor[0], matrixColor[1], matrixColor[2]);
        pdf.rect(col5 - 2, yPos - 3, 25, 6, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text(matrixRisk, col5, yPos);

        yPos += 10;
        pdf.setTextColor(0, 0, 0);
      });

      // Adicionar gráficos de pizza
      pdf.addPage();
      yPos = margin;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise Gráfica dos Riscos', margin, yPos);
      yPos += 15;

      // Função para desenhar gráfico de pizza simplificado
      const drawPieChart = (
        x: number,
        y: number,
        radius: number,
        data: Array<{ label: string; value: number; color: [number, number, number] }>,
        title: string
      ) => {
        // Título do gráfico
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const titleWidth = pdf.getTextWidth(title);
        pdf.text(title, x - titleWidth / 2, y - radius - 5);

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        // Desenhar círculo de fundo
        pdf.setFillColor(240, 240, 240);
        pdf.circle(x, y, radius, 'F');

        let currentY = y - radius;

        // Desenhar barras horizontais em vez de pizza (mais simples e confiável)
        data.forEach((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          const height = (radius * 2 * item.value) / total;

          pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
          pdf.rect(x - radius, currentY, radius * 2, height, 'F');

          // Texto da porcentagem
          if (percentage >= 8) {
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${percentage}%`, x - 5, currentY + height / 2 + 1);
          }

          currentY += height;
        });

        // Desenhar contorno
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.circle(x, y, radius, 'S');

        // Legenda
        let legendY = y + radius + 8;
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');

        data.forEach((item) => {
          if (item.value > 0) {
            // Quadrado colorido
            pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
            pdf.rect(x - radius, legendY - 2, 3, 3, 'F');

            // Label
            pdf.setTextColor(0, 0, 0);
            const percentage = Math.round((item.value / total) * 100);
            pdf.text(`${item.label} (${percentage}%)`, x - radius + 5, legendY);
            legendY += 4;
          }
        });
      };

      // Preparar dados dos gráficos

      // 1. Matriz de Risco
      const matrixRiskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
      DRPS_TOPICS.forEach(topic => {
        const score = topicScores[topic.id];
        const severity = getRiskLevel(score.average);
        const probability = getProbability(score.average);
        const matrixRisk = getRiskMatrix(severity.level, probability);
        matrixRiskCounts[matrixRisk] = (matrixRiskCounts[matrixRisk] || 0) + 1;
      });

      const matrixData = [
        { label: 'Baixo', value: matrixRiskCounts['Baixo'], color: [34, 197, 94] as [number, number, number] },
        { label: 'Médio', value: matrixRiskCounts['Médio'], color: [234, 179, 8] as [number, number, number] },
        { label: 'Alto', value: matrixRiskCounts['Alto'], color: [249, 115, 22] as [number, number, number] },
        { label: 'Crítico', value: matrixRiskCounts['Crítico'], color: [239, 68, 68] as [number, number, number] }
      ].filter(item => item.value > 0);

      // 2. Gravidade Por Tópico
      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
      DRPS_TOPICS.forEach(topic => {
        const score = topicScores[topic.id];
        const severity = getRiskLevel(score.average);
        severityCounts[severity.level] = (severityCounts[severity.level] || 0) + 1;
      });

      const severityData = [
        { label: 'Baixo', value: severityCounts['Baixo'], color: [34, 197, 94] as [number, number, number] },
        { label: 'Médio', value: severityCounts['Médio'], color: [234, 179, 8] as [number, number, number] },
        { label: 'Alto', value: severityCounts['Alto'], color: [249, 115, 22] as [number, number, number] },
        { label: 'Crítico', value: severityCounts['Crítico'], color: [239, 68, 68] as [number, number, number] }
      ].filter(item => item.value > 0);

      // 3. Gravidade Geral
      const totalAverage = Object.values(topicScores).reduce((acc, score) => acc + score.average, 0) / Object.keys(topicScores).length;
      const overallRisk = getRiskLevel(totalAverage);

      const overallData = [
        { label: overallRisk.level, value: 80, color: (() => {
          if (overallRisk.level === 'Baixo') return [34, 197, 94] as [number, number, number];
          if (overallRisk.level === 'Médio') return [234, 179, 8] as [number, number, number];
          if (overallRisk.level === 'Alto') return [249, 115, 22] as [number, number, number];
          return [239, 68, 68] as [number, number, number];
        })() },
        { label: 'Outros', value: 20, color: [148, 163, 184] as [number, number, number] }
      ];

      // Desenhar os 3 gráficos lado a lado
      const chartRadius = 25;
      const chartY = yPos + chartRadius + 5;

      drawPieChart(margin + chartRadius + 10, chartY, chartRadius, matrixData, 'Matriz de Risco');
      drawPieChart(pageWidth / 2, chartY, chartRadius, severityData, 'Gravidade Por Tópico');
      drawPieChart(pageWidth - margin - chartRadius - 10, chartY, chartRadius, overallData, 'Gravidade Geral');

      // Nova página para respostas detalhadas
      pdf.addPage();
      yPos = margin;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Respostas Detalhadas por Tópico', margin, yPos);
      yPos += 10;

      // Respostas detalhadas
      DRPS_TOPICS.forEach((topic) => {
        checkPageBreak(30);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(topic.title, margin, yPos);
        yPos += 5;

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        const descLines = pdf.splitTextToSize(topic.description, maxWidth);
        descLines.forEach((line: string) => {
          pdf.text(line, margin, yPos);
          yPos += 4;
        });
        yPos += 2;

        pdf.setFont('helvetica', 'normal');
        topic.questions.forEach((question) => {
          checkPageBreak(12);

          const answer = submission.respostas[question.id];

          pdf.setTextColor(0, 0, 0);
          const qLines = pdf.splitTextToSize(question.text, maxWidth - 5);
          qLines.forEach((line: string) => {
            pdf.text(line, margin + 2, yPos);
            yPos += 4;
          });

          if (answer !== undefined) {
            pdf.setFillColor(219, 234, 254);
            pdf.setTextColor(30, 64, 175);
            const answerText = `${answer} - ${SCORE_LABELS[answer as keyof typeof SCORE_LABELS]}`;
            pdf.text(answerText, margin + 2, yPos);
          } else {
            pdf.setTextColor(156, 163, 175);
            pdf.text('Não respondida', margin + 2, yPos);
          }

          yPos += 6;
          pdf.setTextColor(0, 0, 0);
        });

        yPos += 5;
      });

      // Save
      pdf.save(`relatorio-drps-${submission.nome.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const viewDetails = (submission: DrpsSubmission) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
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

  if (showDetails && selectedSubmission) {
    const topicScores = calculateScores(selectedSubmission.respostas);

    return (
      <div className="p-8">
        <div className="space-y-6 details-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Avaliação DRPS</h1>
              <p className="text-gray-600">Visualização completa das respostas</p>
            </div>
            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              Voltar à Lista
            </Button>
          </div>

          {/* Informações do Participante */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Participante</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{selectedSubmission.nome}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedSubmission.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{selectedSubmission.telefone}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nome da Empresa</p>
                    <p className="font-medium">{selectedSubmission.nome_empresa}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Função</p>
                    <p className="font-medium">{selectedSubmission.funcao}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Setor</p>
                    <p className="font-medium">{selectedSubmission.setor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Submissão</p>
                    <p className="font-medium">
                      {new Date(selectedSubmission.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabela de Matriz de Risco */}
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
                  </tr>
                </thead>
                <tbody>
                  {DRPS_TOPICS.map(topic => {
                    const score = topicScores[topic.id];
                    const severity = getRiskLevel(score.average);
                    const probability = getProbability(score.average);
                    const matrixRisk = getRiskMatrix(severity.level, probability);

                    const getSeverityBgColor = (level: string) => {
                      if (level === 'Baixo') return 'bg-green-500';
                      if (level === 'Médio') return 'bg-yellow-500';
                      if (level === 'Alto') return 'bg-orange-500';
                      return 'bg-red-500';
                    };

                    const getProbabilityBgColor = (prob: string) => {
                      if (prob === 'Baixa') return 'bg-green-500';
                      if (prob === 'Média') return 'bg-yellow-500';
                      return 'bg-orange-500';
                    };

                    const getMatrixBgColor = (risk: string) => {
                      if (risk === 'Baixo') return 'bg-green-500';
                      if (risk === 'Médio') return 'bg-yellow-500';
                      if (risk === 'Alto') return 'bg-orange-500';
                      return 'bg-red-500';
                    };

                    return (
                      <tr key={topic.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{topic.title}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">{topic.description}</td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getSeverityBgColor(severity.level)} text-white font-semibold text-sm`}>
                          {severity.level}
                        </td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getProbabilityBgColor(probability)} text-white font-semibold text-sm`}>
                          {probability}
                        </td>
                        <td className={`border border-gray-300 px-4 py-3 text-center ${getMatrixBgColor(matrixRisk)} text-white font-semibold text-sm`}>
                          {matrixRisk}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Gráficos de Análise */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Gráfico de Matriz de Risco */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Matriz de Risco</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const riskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = topicScores[topic.id];
                        const severity = getRiskLevel(score.average);
                        const probability = getProbability(score.average);
                        const matrixRisk = getRiskMatrix(severity.level, probability);
                        riskCounts[matrixRisk] = (riskCounts[matrixRisk] || 0) + 1;
                      });
                      return Object.entries(riskCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({ name, value, percentage: ((value / DRPS_TOPICS.length) * 100).toFixed(0) }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percentage }) => `${percentage}%`}
                  >
                    {(() => {
                      const riskCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = topicScores[topic.id];
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Gravidade por Setor */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Gravidade Por Setor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = topicScores[topic.id];
                        const severity = getRiskLevel(score.average);
                        severityCounts[severity.level] = (severityCounts[severity.level] || 0) + 1;
                      });
                      return Object.entries(severityCounts)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({ name, value, percentage: ((value / DRPS_TOPICS.length) * 100).toFixed(0) }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percentage }) => `${percentage}%`}
                  >
                    {(() => {
                      const severityCounts: Record<string, number> = { 'Baixo': 0, 'Médio': 0, 'Alto': 0 };
                      DRPS_TOPICS.forEach(topic => {
                        const score = topicScores[topic.id];
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Gravidade Geral */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Gravidade Geral</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const totalAverage = Object.values(topicScores).reduce((acc, score) => acc + score.average, 0) / Object.keys(topicScores).length;
                      const overallRisk = getRiskLevel(totalAverage);

                      return [
                        { name: overallRisk.level, value: 80, percentage: '80' },
                        { name: 'Outros', value: 20, percentage: '20' }
                      ];
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {(() => {
                      const totalAverage = Object.values(topicScores).reduce((acc, score) => acc + score.average, 0) / Object.keys(topicScores).length;
                      const overallRisk = getRiskLevel(totalAverage);

                      return [
                        <Cell key="overall" fill={RISK_COLORS[overallRisk.level as keyof typeof RISK_COLORS]} />,
                        <Cell key="others" fill="#94a3b8" />
                      ];
                    })()}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Resumo dos Riscos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Riscos por Tópico</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              {DRPS_TOPICS.map(topic => {
                const score = topicScores[topic.id];
                const risk = getRiskLevel(score.average);
                
                return (
                  <div key={topic.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{topic.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                        {risk.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Média: {score.average.toFixed(1)}</span>
                      <span>Respondidas: {score.count}/10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Respostas Detalhadas */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Respostas Detalhadas</h2>
            {DRPS_TOPICS.map(topic => (
              <Card key={topic.id} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-gray-600 mb-4">{topic.description}</p>
                
                <div className="space-y-4">
                  {topic.questions.map(question => {
                    const answer = selectedSubmission.respostas[question.id];
                    
                    return (
                      <div key={question.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <p className="text-gray-900 mb-2">{question.text}</p>
                        {answer !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {answer} - {SCORE_LABELS[answer as keyof typeof SCORE_LABELS]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Não respondida</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Avaliações DRPS</h1>
            <p className="text-gray-600">
              Diagnóstico de Riscos Psicossociais - {submissions.length} submissões
            </p>
          </div>
        </div>

        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Filtros e Busca */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email, empresa, função ou setor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Empresa
                </label>
                <select
                  value={selectedEmpresa}
                  onChange={(e) => {
                    setSelectedEmpresa(e.target.value);
                    setSelectedSetor(''); // Limpa o setor ao mudar de empresa
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map(empresa => (
                    <option key={empresa} value={empresa}>{empresa}</option>
                  ))}
                </select>
              </div>

              {selectedEmpresa && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Setor
                  </label>
                  <select
                    value={selectedSetor}
                    onChange={(e) => setSelectedSetor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os setores</option>
                    {setores.map(setor => (
                      <option key={setor} value={setor}>{setor}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {(selectedEmpresa || selectedSetor) && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setSelectedEmpresa('');
                    setSelectedSetor('');
                  }}
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                >
                  Limpar Filtros
                </Button>
                <span className="text-sm text-gray-600">
                  {filteredSubmissions.length} resultado(s) encontrado(s)
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Lista de Submissões */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {submissions.length === 0 ? 'Nenhuma avaliação encontrada' : 'Nenhum resultado'}
              </h3>
              <p className="text-gray-600">
                {submissions.length === 0 
                  ? 'Ainda não há avaliações DRPS submetidas.'
                  : 'Tente ajustar os filtros de busca.'}
              </p>
            </Card>
          ) : (
            filteredSubmissions.map(submission => {
              const topicScores = calculateScores(submission.respostas);
              const overallAverage = Object.values(topicScores).reduce((acc, score) => acc + score.average, 0) / Object.keys(topicScores).length;
              const overallRisk = getRiskLevel(overallAverage);
              
              return (
                <Card key={submission.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{submission.nome}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {submission.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {submission.nome_empresa}
                          </p>
                          <p className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {submission.funcao} - {submission.setor}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallRisk.color}`}>
                            Risco {overallRisk.level}
                          </span>
                          <span className="text-sm text-gray-600">
                            Média: {overallAverage.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Object.keys(submission.respostas).length} respostas
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => exportToPDF(submission)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF
                      </Button>
                      
                      <Button
                        onClick={() => viewDetails(submission)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
                      </Button>
                      
                      <Button
                        onClick={() => deleteSubmission(submission.id)}
                        size="sm"
                        variant="outline"
                        disabled={deletingId === submission.id}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === submission.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deletingId === submission.id ? 'Excluindo...' : 'Excluir'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

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
