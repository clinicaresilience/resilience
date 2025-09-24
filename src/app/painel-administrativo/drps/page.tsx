"use client";

import React, { useState, useEffect } from 'react';
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

export default function DrpsAdminPage() {
  const [submissions, setSubmissions] = useState<DrpsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DrpsSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filteredSubmissions = submissions.filter(submission =>
    submission.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const exportToCSV = () => {
    const csvData = filteredSubmissions.map(submission => ({
      Nome: submission.nome,
      Email: submission.email,
      Telefone: submission.telefone,
      Função: submission.funcao,
      Setor: submission.setor,
      'Data de Submissão': new Date(submission.created_at).toLocaleDateString('pt-BR'),
      ...Object.entries(submission.respostas).reduce((acc, [questionId, score]) => {
        acc[questionId] = score;
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
    const topicScores = calculateScores(submission.respostas);
    const overallAverage = Object.values(topicScores).reduce((acc, score) => acc + score.average, 0) / Object.keys(topicScores).length;
    const overallRisk = getRiskLevel(overallAverage);

    // Create a professional HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório DRPS - ${submission.nome}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #fff;
            padding: 40px 30px;
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding: 30px 0;
            border-bottom: 3px solid #02b1aa;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          
          .header h1 { 
            font-size: 2.5em; 
            color: #02b1aa; 
            margin-bottom: 10px; 
            font-weight: 700;
          }
          
          .header h2 { 
            font-size: 1.5em; 
            color: #6c757d; 
            margin-bottom: 15px;
            font-weight: 400;
          }
          
          .header p { 
            font-size: 1.1em; 
            color: #495057;
            background: #fff;
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .section { 
            margin-bottom: 35px; 
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .section h2 { 
            background: linear-gradient(135deg, #02b1aa 0%, #029fdf 100%);
            color: white;
            padding: 20px 25px;
            margin: 0;
            font-size: 1.4em;
            font-weight: 600;
          }
          
          .section-content {
            padding: 25px;
          }
          
          .participant-info table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .participant-info th { 
            background: #f8f9fa; 
            padding: 15px 20px; 
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
            width: 30%;
          }
          
          .participant-info td { 
            padding: 15px 20px; 
            border-bottom: 1px solid #f1f3f4;
            color: #212529;
          }
          
          .participant-info tr:last-child td,
          .participant-info tr:last-child th {
            border-bottom: none;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #02b1aa;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
          
          .summary-card h3 {
            color: #02b1aa;
            margin-bottom: 8px;
            font-size: 1.1em;
          }
          
          .summary-card p {
            margin: 5px 0;
            color: #495057;
          }
          
          .risk-analysis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .risk-card { 
            border: 2px solid #e9ecef;
            padding: 20px; 
            border-radius: 12px; 
            background: #fff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          
          .risk-card h3 {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: #212529;
          }
          
          .risk-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .risk-low { 
            border-color: #28a745;
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          }
          .risk-low .risk-badge {
            background: #28a745;
            color: white;
          }
          
          .risk-medium { 
            border-color: #ffc107;
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          }
          .risk-medium .risk-badge {
            background: #ffc107;
            color: #212529;
          }
          
          .risk-high, .risk-critical { 
            border-color: #dc3545;
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          }
          .risk-high .risk-badge, .risk-critical .risk-badge {
            background: #dc3545;
            color: white;
          }
          
          .risk-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.9em;
            color: #6c757d;
            margin-top: 10px;
          }
          
          .topic-section {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            overflow: hidden;
          }
          
          .topic-header {
            background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
            color: white;
            padding: 15px 20px;
          }
          
          .topic-header h3 {
            font-size: 1.3em;
            margin-bottom: 5px;
          }
          
          .topic-header p {
            opacity: 0.9;
            font-size: 0.95em;
          }
          
          .questions-container {
            padding: 20px;
            background: #fff;
          }
          
          .question { 
            margin-bottom: 20px; 
            padding: 15px; 
            border-left: 4px solid #02b1aa;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
          }
          
          .question p {
            margin-bottom: 10px;
            color: #212529;
            font-weight: 500;
          }
          
          .answer { 
            display: inline-block;
            background: linear-gradient(135deg, #02b1aa 0%, #029fdf 100%);
            color: white;
            padding: 8px 16px; 
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            box-shadow: 0 2px 5px rgba(2, 177, 170, 0.3);
          }
          
          .no-answer {
            color: #6c757d;
            font-style: italic;
            background: #e9ecef;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
          }
          
          .legend-table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          }
          
          .legend-table th { 
            background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
            color: white;
            padding: 15px; 
            font-weight: 600;
          }
          
          .legend-table td { 
            padding: 12px 15px; 
            border-bottom: 1px solid #e9ecef;
            background: #fff;
          }
          
          .legend-table tr:last-child td {
            border-bottom: none;
          }
          
          .legend-table tr:nth-child(even) td {
            background: #f8f9fa;
          }
          
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
            .risk-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório DRPS</h1>
          <h2>Diagnóstico de Riscos Psicossociais</h2>
          <p>📅 ${new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="section">
          <h2>👤 Informações do Participante</h2>
          <div class="section-content">
            <table class="participant-info">
              <tr><th>Nome:</th><td>${submission.nome}</td></tr>
              <tr><th>Email:</th><td>${submission.email}</td></tr>
              <tr><th>Telefone:</th><td>${submission.telefone}</td></tr>
              <tr><th>Função:</th><td>${submission.funcao}</td></tr>
              <tr><th>Setor:</th><td>${submission.setor}</td></tr>
              <tr><th>Data da Avaliação:</th><td>${new Date(submission.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              })} às ${new Date(submission.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}</td></tr>
            </table>
          </div>
        </div>

        <div class="section">
          <h2>📈 Resumo Geral</h2>
          <div class="section-content">
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Nível de Risco Geral</h3>
                <p><strong>${overallRisk.level}</strong></p>
              </div>
              <div class="summary-card">
                <h3>Média Geral</h3>
                <p><strong>${overallAverage.toFixed(2)}</strong>/4.0</p>
              </div>
              <div class="summary-card">
                <h3>Total de Respostas</h3>
                <p><strong>${Object.keys(submission.respostas).length}</strong> perguntas</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🎯 Análise por Tópicos</h2>
          <div class="section-content">
            <div class="risk-analysis">
              ${DRPS_TOPICS.map(topic => {
                const score = topicScores[topic.id];
                const risk = getRiskLevel(score.average);
                const riskClass = risk.level.toLowerCase()
                  .replace('í', 'i')
                  .replace('é', 'e')
                  .replace('ó', 'o')
                  .replace(/\s+/g, '-');
                
                return `
                  <div class="risk-card risk-${riskClass}">
                    <h3>${topic.title}</h3>
                    <div class="risk-badge">${risk.level}</div>
                    <div class="risk-stats">
                      <span><strong>Média:</strong> ${score.average.toFixed(2)}/4.0</span>
                      <span><strong>Respostas:</strong> ${score.count}/10</span>
                    </div>
                    <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">${topic.description}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📝 Respostas Detalhadas</h2>
          <div class="section-content">
            ${DRPS_TOPICS.map(topic => `
              <div class="topic-section">
                <div class="topic-header">
                  <h3>${topic.title}</h3>
                  <p>${topic.description}</p>
                </div>
                <div class="questions-container">
                  ${topic.questions.map(question => {
                    const answer = submission.respostas[question.id];
                    return `
                      <div class="question">
                        <p><strong>${question.text}</strong></p>
                        ${answer !== undefined 
                          ? `<div class="answer">${answer} - ${SCORE_LABELS[answer as keyof typeof SCORE_LABELS]}</div>`
                          : '<div class="no-answer">Não respondida</div>'
                        }
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2>📋 Legenda de Pontuação</h2>
          <div class="section-content">
            <table class="legend-table">
              <thead>
                <tr>
                  <th>Pontuação</th>
                  <th>Descrição</th>
                  <th>Significado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>0</strong></td><td>Nunca</td><td>Situação nunca ocorre</td></tr>
                <tr><td><strong>1</strong></td><td>Raramente</td><td>Situação ocorre muito poucas vezes</td></tr>
                <tr><td><strong>2</strong></td><td>Ocasionalmente</td><td>Situação ocorre algumas vezes</td></tr>
                <tr><td><strong>3</strong></td><td>Frequentemente</td><td>Situação ocorre muitas vezes</td></tr>
                <tr><td><strong>4</strong></td><td>Sempre</td><td>Situação ocorre constantemente</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <p style="color: #6c757d; font-size: 0.9em;">
            <strong>Clínica Resilience</strong> • Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-drps-${submission.nome.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="space-y-6">
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email, função ou setor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
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
    </div>
  );
}
