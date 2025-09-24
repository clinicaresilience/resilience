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
  Mail
} from 'lucide-react';

export default function DrpsAdminPage() {
  const [submissions, setSubmissions] = useState<DrpsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DrpsSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
          
          <div className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              disabled={filteredSubmissions.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
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
                        onClick={() => viewDetails(submission)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
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
