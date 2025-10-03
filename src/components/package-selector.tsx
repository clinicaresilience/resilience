'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PacoteSessao {
  id: string;
  quantidade_sessoes: number;
  preco_total: number;
  preco_por_sessao: number;
  desconto_percentual: number;
}

interface PackageSelectorProps {
  profissionalId: string;
  onSelectPackage: (pacote: PacoteSessao) => void;
  onCancel: () => void;
}

export function PackageSelector({ profissionalId, onSelectPackage, onCancel }: PackageSelectorProps) {
  const [pacotes, setPacotes] = useState<PacoteSessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPacotes();
  }, []);

  const fetchPacotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pacotes');
      const data = await response.json();

      if (data.success) {
        setPacotes(data.data);
      } else {
        setError('Erro ao carregar pacotes');
      }
    } catch (err) {
      console.error('Erro ao buscar pacotes:', err);
      setError('Erro ao carregar pacotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (pacote: PacoteSessao) => {
    setSelectedPackageId(pacote.id);
    onSelectPackage(pacote);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularEconomia = (pacote: PacoteSessao) => {
    const precoSemDesconto = 100 * pacote.quantidade_sessoes;
    return precoSemDesconto - pacote.preco_total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pacotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchPacotes} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Escolha seu pacote</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Quanto mais sessões, maior o desconto
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {pacotes.map((pacote) => {
          const economia = calcularEconomia(pacote);
          const isSelected = selectedPackageId === pacote.id;
          const isBestValue = pacote.desconto_percentual === Math.max(...pacotes.map(p => p.desconto_percentual));

          return (
            <Card
              key={pacote.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'border-primary shadow-lg' : ''
              }`}
              onClick={() => handleSelect(pacote)}
            >
              {isBestValue && pacote.quantidade_sessoes > 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Melhor Oferta
                </div>
              )}

              <CardHeader className="text-center pb-3 sm:pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {pacote.quantidade_sessoes} {pacote.quantidade_sessoes === 1 ? 'Sessão' : 'Sessões'}
                </CardTitle>
                {pacote.desconto_percentual > 0 && (
                  <CardDescription className="text-base sm:text-lg font-semibold text-green-600">
                    {pacote.desconto_percentual}% de desconto
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="text-center space-y-3 sm:space-y-4">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary">
                    {formatCurrency(pacote.preco_total)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {formatCurrency(pacote.preco_por_sessao)} por sessão
                  </div>
                </div>

                {economia > 0 && (
                  <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-3 py-2 rounded-md">
                    <div className="text-sm font-medium">
                      Economize {formatCurrency(economia)}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected && <Check className="w-4 h-4 mr-2" />}
                  {isSelected ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center pt-2">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Voltar
        </Button>
      </div>

      <div className="text-[10px] sm:text-xs text-center text-muted-foreground space-y-1 px-2">
        <p>Pacotes válidos por 180 dias a partir da compra</p>
        <p>Agendamentos realizados automaticamente toda semana no mesmo horário</p>
      </div>
    </div>
  );
}
