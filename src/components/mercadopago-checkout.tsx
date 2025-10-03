'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';

interface PacoteSessao {
  id: string;
  quantidade_sessoes: number;
  preco_total: number;
  preco_por_sessao: number;
  desconto_percentual: number;
}

interface MercadoPagoCheckoutProps {
  pacote: PacoteSessao;
  profissionalId: string;
  primeiroHorario: {
    data: string;
    slot_id: string;
    hora: string;
  };
  modalidade?: 'presencial' | 'online';
  onSuccess: (compraPacoteId: string) => void;
  onCancel: () => void;
}

export function MercadoPagoCheckout({
  pacote,
  profissionalId,
  primeiroHorario,
  modalidade = 'online',
  onSuccess,
  onCancel,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacote_id: pacote.id,
          profissional_id: profissionalId,
          primeiro_horario_data: primeiroHorario.data,
          primeiro_horario_slot_id: primeiroHorario.slot_id,
          modalidade: modalidade,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar preferência de pagamento');
      }

      // Redirecionar para o Mercado Pago
      const initPoint = data.data.init_point;
      window.location.href = initPoint;

      // Após redirecionamento bem-sucedido, chamar onSuccess com o ID da compra
      // Nota: O onSuccess será chamado quando o usuário retornar do MP via webhook
      // Por enquanto, vamos apenas guardar o ID da compra no sessionStorage
      sessionStorage.setItem('compra_pacote_id', data.data.compra_id);
    } catch (err) {
      console.error('Erro no checkout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Finalizar Compra</h2>
        <p className="text-muted-foreground">
          Você será redirecionado para o Mercado Pago
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Compra</CardTitle>
          <CardDescription>Confira os detalhes do seu pacote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-medium">Pacote</span>
            <span>
              {pacote.quantidade_sessoes} {pacote.quantidade_sessoes === 1 ? 'Sessão' : 'Sessões'}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-medium">Primeira sessão</span>
            <span className="text-sm">
              {new Date(primeiroHorario.data).toLocaleDateString('pt-BR')} às {primeiroHorario.hora}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-medium">Valor por sessão</span>
            <span>{formatCurrency(pacote.preco_por_sessao)}</span>
          </div>

          {pacote.desconto_percentual > 0 && (
            <div className="flex justify-between items-center border-b pb-3 text-green-600">
              <span className="font-medium">Desconto</span>
              <span>-{pacote.desconto_percentual}%</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">
              {formatCurrency(pacote.preco_total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar com Mercado Pago
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
          disabled={loading}
        >
          Voltar
        </Button>
      </div>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <p>Pagamento seguro processado pelo Mercado Pago</p>
        <p>Após a confirmação do pagamento, você poderá agendar suas sessões</p>
      </div>
    </div>
  );
}
