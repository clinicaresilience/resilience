"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Plus,
  Trash2,
  User,
  Clock,
  Building2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  email: string;
  informacoes_adicionais?: {
    especialidade?: string;
    crp?: string;
  };
}

interface DesignacaoPresencial {
  id: string;
  profissional_id: string;
  data_presencial: string;
  hora_inicio?: string;
  hora_fim?: string;
  criado_em: string;
  atualizado_em: string;
  usuarios: Profissional;
}

interface NovaDesignacao {
  profissional_id: string;
  data_presencial: string;
  hora_inicio?: string;
  hora_fim?: string;
}

export function GestaoAtendimentoPresencial() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [designacoes, setDesignacoes] = useState<DesignacaoPresencial[]>([]);
  const [carregandoProfissionais, setCarregandoProfissionais] = useState(true);
  const [carregandoDesignacoes, setCarregandoDesignacoes] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Estados para o modal de nova designação
  const [modalAberto, setModalAberto] = useState(false);
  const [salvandoDesignacao, setSalvandoDesignacao] = useState(false);
  const [novaDesignacao, setNovaDesignacao] = useState<NovaDesignacao>({
    profissional_id: '',
    data_presencial: '',
    hora_inicio: '',
    hora_fim: '',
  });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    profissional_id: '',
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    buscarProfissionais();
    buscarDesignacoes();
  }, []);

  useEffect(() => {
    buscarDesignacoes();
  }, [filtros]);

  const buscarProfissionais = async () => {
    try {
      setCarregandoProfissionais(true);
      const response = await fetch('/api/profissionais');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar profissionais');
      }

      setProfissionais(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      setErro('Erro ao carregar lista de profissionais');
    } finally {
      setCarregandoProfissionais(false);
    }
  };

  const buscarDesignacoes = async () => {
    try {
      setCarregandoDesignacoes(true);
      setErro('');

      const params = new URLSearchParams();
      if (filtros.profissional_id) params.set('profissional_id', filtros.profissional_id);
      if (filtros.data_inicio) params.set('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.set('data_fim', filtros.data_fim);

      const response = await fetch(`/api/profissional-presencial?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar designações');
      }

      setDesignacoes(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar designações:', error);
      setErro('Erro ao carregar designações presenciais');
    } finally {
      setCarregandoDesignacoes(false);
    }
  };

  const criarDesignacao = async () => {
    try {
      setSalvandoDesignacao(true);
      setErro('');

      // Validações
      if (!novaDesignacao.profissional_id || !novaDesignacao.data_presencial) {
        setErro('Profissional e data são obrigatórios');
        return;
      }

      const payload = {
        ...novaDesignacao,
        hora_inicio: novaDesignacao.hora_inicio || null,
        hora_fim: novaDesignacao.hora_fim || null,
      };

      const response = await fetch('/api/profissional-presencial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar designação');
      }

      setSucesso('Designação presencial criada com sucesso!');
      setModalAberto(false);
      setNovaDesignacao({
        profissional_id: '',
        data_presencial: '',
        hora_inicio: '',
        hora_fim: '',
      });
      buscarDesignacoes();

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao criar designação:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao criar designação');
    } finally {
      setSalvandoDesignacao(false);
    }
  };

  const removerDesignacao = async (id: string, profissionalNome: string, data: string) => {
    if (!confirm(`Tem certeza que deseja remover a designação presencial de ${profissionalNome} para ${formatarData(data)}?`)) {
      return;
    }

    try {
      setErro('');
      
      const response = await fetch(`/api/profissional-presencial?id=${id}`, {
        method: 'DELETE',
      });

      const data_response = await response.json();

      if (!response.ok) {
        throw new Error(data_response.error || 'Erro ao remover designação');
      }

      setSucesso('Designação presencial removida com sucesso!');
      buscarDesignacoes();

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao remover designação:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao remover designação');
    }
  };

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarHora = (horaString?: string) => {
    if (!horaString) return '-';
    return horaString.substring(0, 5);
  };

  const profissionalSelecionado = profissionais.find(p => p.id === novaDesignacao.profissional_id);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Gestão de Atendimento Presencial
              </CardTitle>
              <CardDescription>
                Gerencie as designações de atendimento presencial dos profissionais
              </CardDescription>
            </div>
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Designação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nova Designação Presencial</DialogTitle>
                  <DialogDescription>
                    Designe um profissional para atendimento presencial em uma data específica
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="profissional">Profissional *</Label>
                    <Select 
                      value={novaDesignacao.profissional_id}
                      onValueChange={(value) => setNovaDesignacao(prev => ({
                        ...prev,
                        profissional_id: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{prof.nome}</span>
                              {prof.informacoes_adicionais?.especialidade && (
                                <span className="text-sm text-gray-500">
                                  {prof.informacoes_adicionais.especialidade}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data">Data do Atendimento Presencial *</Label>
                    <Input
                      id="data"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={novaDesignacao.data_presencial}
                      onChange={(e) => setNovaDesignacao(prev => ({
                        ...prev,
                        data_presencial: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hora-inicio">Hora de Início (opcional)</Label>
                      <Input
                        id="hora-inicio"
                        type="time"
                        value={novaDesignacao.hora_inicio}
                        onChange={(e) => setNovaDesignacao(prev => ({
                          ...prev,
                          hora_inicio: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora-fim">Hora de Fim (opcional)</Label>
                      <Input
                        id="hora-fim"
                        type="time"
                        value={novaDesignacao.hora_fim}
                        onChange={(e) => setNovaDesignacao(prev => ({
                          ...prev,
                          hora_fim: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {profissionalSelecionado && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Profissional Selecionado</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        <strong>{profissionalSelecionado.nome}</strong>
                        {profissionalSelecionado.informacoes_adicionais?.especialidade && (
                          <span> - {profissionalSelecionado.informacoes_adicionais.especialidade}</span>
                        )}
                      </p>
                      {profissionalSelecionado.informacoes_adicionais?.crp && (
                        <p className="text-sm text-blue-700">
                          CRP: {profissionalSelecionado.informacoes_adicionais.crp}
                        </p>
                      )}
                    </div>
                  )}

                  {erro && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">{erro}</span>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={criarDesignacao}
                    disabled={salvandoDesignacao}
                  >
                    {salvandoDesignacao ? 'Salvando...' : 'Criar Designação'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Mensagens de feedback */}
      {sucesso && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">{sucesso}</span>
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{erro}</span>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Profissional</Label>
              <Select 
                value={filtros.profissional_id}
                onValueChange={(value) => setFiltros(prev => ({
                  ...prev,
                  profissional_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os profissionais</SelectItem>
                  {profissionais.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros(prev => ({
                  ...prev,
                  data_inicio: e.target.value
                }))}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros(prev => ({
                  ...prev,
                  data_fim: e.target.value
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Designações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Designações Presenciais ({designacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carregandoDesignacoes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : designacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma designação presencial encontrada</p>
              {Object.values(filtros).some(f => f) && (
                <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {designacoes.map((designacao) => (
                <div key={designacao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Profissional */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{designacao.usuarios.nome}</p>
                          <p className="text-sm text-gray-500">{designacao.usuarios.email}</p>
                        </div>
                        {designacao.usuarios.informacoes_adicionais?.especialidade && (
                          <Badge variant="secondary" className="ml-2">
                            {designacao.usuarios.informacoes_adicionais.especialidade}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Data e Horário */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{formatarData(designacao.data_presencial)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          {designacao.hora_inicio && designacao.hora_fim ? (
                            <span>{formatarHora(designacao.hora_inicio)} - {formatarHora(designacao.hora_fim)}</span>
                          ) : (
                            <span className="text-gray-400">Dia inteiro</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Data de criação */}
                      <div className="text-sm text-gray-500">
                        Criado em: {formatarData(designacao.criado_em)}
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removerDesignacao(
                          designacao.id,
                          designacao.usuarios.nome,
                          designacao.data_presencial
                        )}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
