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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Search,
  User,
  TrendingUp,
  MessageSquare,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MediaAvaliacao {
  profissional_id: string;
  nome_profissional: string;
  especialidade: string;
  media_avaliacao: number;
  total_avaliacoes: number;
}

interface AvaliacaoDetalhada {
  id: string;
  nota: number;
  comentario?: string;
  criado_em: string;
  paciente: {
    nome: string;
    email: string;
  };
  agendamento: {
    data_consulta: string;
    modalidade: string;
  };
}

export function AvaliacoesManagement() {
  const [medias, setMedias] = useState<MediaAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [selectedProfissional, setSelectedProfissional] = useState<MediaAvaliacao | null>(null);
  const [detalhesAvaliacoes, setDetalhesAvaliacoes] = useState<AvaliacaoDetalhada[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/avaliacoes?action=medias');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar médias");
      }

      setMedias(data.data || []);
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar avaliações dos profissionais");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetalhesAvaliacoes = async (profissionalId: string) => {
    try {
      setLoadingDetalhes(true);
      
      const response = await fetch(`/api/avaliacoes?profissional_id=${profissionalId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar detalhes");
      }

      setDetalhesAvaliacoes(data.data || []);
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar detalhes das avaliações");
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleVerDetalhes = async (profissional: MediaAvaliacao) => {
    setSelectedProfissional(profissional);
    setModalOpen(true);
    await fetchDetalhesAvaliacoes(profissional.profissional_id);
  };

  const renderEstrelas = (media: number, size: "sm" | "md" = "sm") => {
    const estrelas = [];
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(media)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
        />
      );
    }
    
    return <div className="flex items-center gap-1">{estrelas}</div>;
  };

  const getAvaliacaoColor = (media: number) => {
    if (media >= 4.5) return "text-green-600 bg-green-100";
    if (media >= 3.5) return "text-yellow-600 bg-yellow-100";
    if (media >= 2.5) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const filteredMedias = medias.filter(media =>
    media.nome_profissional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Avaliações dos Profissionais
              </CardTitle>
              <CardDescription>
                Acompanhe as avaliações e médias de satisfação dos profissionais
              </CardDescription>
            </div>
            <Button onClick={fetchMedias} variant="outline">
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <MessageSquare className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome do profissional ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Profissionais</p>
                <p className="text-2xl font-bold">{medias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold">
                  {medias.length > 0 
                    ? (medias.reduce((acc, m) => acc + m.media_avaliacao, 0) / medias.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Avaliações</p>
                <p className="text-2xl font-bold">
                  {medias.reduce((acc, m) => acc + m.total_avaliacoes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Com Avaliações</p>
                <p className="text-2xl font-bold">
                  {medias.filter(m => m.total_avaliacoes > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professionals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking de Profissionais ({filteredMedias.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : filteredMedias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum profissional encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMedias.map((media, index) => (
                <div
                  key={media.profissional_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Professional Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {media.nome_profissional}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {media.especialidade}
                          </p>
                        </div>
                      </div>

                      {/* Rating Info */}
                      <div className="flex items-center gap-4 ml-11">
                        <div className="flex items-center gap-2">
                          {renderEstrelas(media.media_avaliacao)}
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAvaliacaoColor(media.media_avaliacao)}`}>
                            {media.media_avaliacao.toFixed(1)}
                          </span>
                        </div>
                        
                        <Badge variant="outline">
                          {media.total_avaliacoes} {media.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {media.total_avaliacoes > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerDetalhes(media)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Avaliações de {selectedProfissional?.nome_profissional}
            </DialogTitle>
            <DialogDescription>
              {selectedProfissional?.especialidade} • {selectedProfissional?.total_avaliacoes} {selectedProfissional?.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'}
            </DialogDescription>
          </DialogHeader>

          {selectedProfissional && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Média Geral</span>
                  <span className={`px-3 py-1 rounded-full text-lg font-bold ${getAvaliacaoColor(selectedProfissional.media_avaliacao)}`}>
                    {selectedProfissional.media_avaliacao.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderEstrelas(selectedProfissional.media_avaliacao, "md")}
                  <span className="text-sm text-gray-600 ml-2">
                    Baseado em {selectedProfissional.total_avaliacoes} avaliações
                  </span>
                </div>
              </div>

              {/* Individual Reviews */}
              {loadingDetalhes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">Avaliações Individuais</h4>
                  {detalhesAvaliacoes.map((avaliacao) => (
                    <div key={avaliacao.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {renderEstrelas(avaliacao.nota)}
                          <span className="font-medium">{avaliacao.nota}.0</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatarData(avaliacao.criado_em)}
                        </div>
                      </div>

                      {avaliacao.comentario && (
                        <p className="text-gray-700 mb-3">{avaliacao.comentario}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{avaliacao.paciente.nome}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatarData(avaliacao.agendamento.data_consulta)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {avaliacao.agendamento.modalidade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
