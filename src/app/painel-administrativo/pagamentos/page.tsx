'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  DollarSign,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  User,
  Package
} from 'lucide-react';

type Pagamento = {
  id: string;
  status: string;
  valor_pago: number;
  created_at: string;
  sessoes_total: number;
  sessoes_utilizadas: number;
  agendamentos_criados: boolean;
  primeiro_horario_data: string;
  modalidade: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  };
  profissional: {
    id: string;
    nome: string;
    email: string;
  };
  pacote: {
    id: string;
    quantidade_sessoes: number;
    preco_total: number;
    desconto_percentual: number;
  };
  pagamento_mp: {
    id: string;
    preference_id: string;
    payment_id: string;
    status: string;
    payment_type: string;
    payment_method: string;
    created_at: string;
  } | null;
};

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pagamentos');
      const data = await response.json();

      if (data.success) {
        setPagamentos(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativo: <Badge className="bg-green-500">Ativo</Badge>,
      pendente: <Badge className="bg-yellow-500">Pendente</Badge>,
      expirado: <Badge className="bg-red-500">Expirado</Badge>,
      cancelado: <Badge className="bg-gray-500">Cancelado</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Sem pagamento</Badge>;

    const badges = {
      approved: <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>,
      pending: <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>,
      rejected: <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>,
      cancelled: <Badge className="bg-gray-500">Cancelado</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const getPaymentMethodLabel = (type: string | undefined, method: string | undefined) => {
    if (!type || !method) return '-';

    const labels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      account_money: 'Saldo MP',
      ticket: 'Boleto',
    };

    return labels[type] || `${type} - ${method}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    const matchStatus = filtroStatus === 'todos' || pag.status === filtroStatus;
    const matchBusca =
      filtroBusca === '' ||
      pag.paciente.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      pag.profissional.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      pag.paciente.email.toLowerCase().includes(filtroBusca.toLowerCase());

    return matchStatus && matchBusca;
  });

  const totalRecebido = pagamentos
    .filter((p) => p.status === 'ativo')
    .reduce((acc, p) => acc + (p.valor_pago || 0), 0);

  const totalPendente = pagamentos
    .filter((p) => p.status === 'pendente')
    .reduce((acc, p) => acc + (p.valor_pago || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pagamentos e compras de pacotes
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRecebido)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPendente)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagamentos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as transações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por paciente ou profissional..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            {pagamentosFiltrados.length} {pagamentosFiltrados.length === 1 ? 'registro encontrado' : 'registros encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status Compra</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Agendamentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentosFiltrados.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(pagamento.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{pagamento.paciente.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {pagamento.paciente.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pagamento.profissional.nome}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{pagamento.pacote.quantidade_sessoes} sessões</span>
                          {pagamento.pacote.desconto_percentual > 0 && (
                            <Badge variant="outline" className="ml-1">
                              -{pagamento.pacote.desconto_percentual}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(pagamento.valor_pago)}
                      </TableCell>
                      <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(pagamento.pagamento_mp?.status)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodLabel(
                          pagamento.pagamento_mp?.payment_type,
                          pagamento.pagamento_mp?.payment_method
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{pagamento.sessoes_utilizadas}</span>
                          <span className="text-muted-foreground">/</span>
                          <span>{pagamento.sessoes_total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{
                              width: `${(pagamento.sessoes_utilizadas / pagamento.sessoes_total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pagamento.agendamentos_criados ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Criados
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
