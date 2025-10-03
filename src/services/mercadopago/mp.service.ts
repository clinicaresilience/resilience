import { Preference, Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/server';

export interface PreferenceData {
  compraPacoteId: string;
  pacienteNome: string;
  pacienteEmail: string;
  valor: number;
  descricao: string;
}

export interface PaymentData {
  payment_id: string;
  status: string;
  status_detail: string;
  payment_type: string;
  payment_method: string;
  transaction_amount: number;
}

export class MercadoPagoService {
  /**
   * Criar preferência de pagamento
   */
  static async criarPreferencia(data: PreferenceData) {
    try {
      const preference = new Preference(mpClient);

      // Determinar URL base (produção ou desenvolvimento)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const preferenceData = {
        items: [
          {
            id: data.compraPacoteId,
            title: data.descricao,
            quantity: 1,
            unit_price: data.valor,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: data.pacienteNome,
          email: data.pacienteEmail,
        },
        back_urls: {
          success: `${baseUrl}/tela-usuario/agendamentos`,
          failure: `${baseUrl}/tela-usuario/agendamentos`,
          pending: `${baseUrl}/tela-usuario/agendamentos`,
        },
        auto_return: 'approved' as const,
        external_reference: data.compraPacoteId,
        notification_url: `https://www.clinicaresilience.com/api/mercadopago/webhook`,
        statement_descriptor: 'CLINICA RESILIENCE',
        metadata: {
          compra_pacote_id: data.compraPacoteId,
        },
      };

      const result = await preference.create({ body: preferenceData });

      // Salvar preferência no banco
      const supabase = await createClient();
      await supabase.from('pagamentos_mercadopago').insert({
        compra_pacote_id: data.compraPacoteId,
        preference_id: result.id,
        valor: data.valor,
        status: 'pending',
      });

      return {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      };
    } catch (error) {
      console.error('Erro ao criar preferência MP:', error);
      throw error;
    }
  }

  /**
   * Consultar status de pagamento
   */
  static async consultarPagamento(paymentId: string): Promise<PaymentData | null> {
    try {
      const payment = new Payment(mpClient);
      const result = await payment.get({ id: paymentId });

      return {
        payment_id: result.id?.toString() || '',
        status: result.status || '',
        status_detail: result.status_detail || '',
        payment_type: result.payment_type_id || '',
        payment_method: result.payment_method_id || '',
        transaction_amount: result.transaction_amount || 0,
      };
    } catch (error) {
      console.error('Erro ao consultar pagamento MP:', error);
      return null;
    }
  }

  /**
   * Processar webhook do Mercado Pago
   */
  static async processarWebhook(webhookData: Record<string, unknown>) {
    try {
      console.log('Processando webhook MP:', webhookData);

      const tipo = webhookData.type || webhookData.action;

      // Apenas processar eventos de pagamento
      if (tipo !== 'payment') {
        console.log('Webhook ignorado - tipo:', tipo);
        return;
      }

      const paymentId = (webhookData.data as { id: string })?.id;
      if (!paymentId) {
        console.error('Payment ID não encontrado no webhook');
        return;
      }

      // Consultar detalhes do pagamento
      const paymentData = await this.consultarPagamento(paymentId);
      if (!paymentData) {
        console.error('Não foi possível consultar pagamento:', paymentId);
        return;
      }

      const supabase = await createClient();

      // Buscar pagamento no banco pela preference ou criar novo
      const { data: pagamentoExistente } = await supabase
        .from('pagamentos_mercadopago')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (pagamentoExistente) {
        // Atualizar pagamento existente
        await supabase
          .from('pagamentos_mercadopago')
          .update({
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            payment_type: paymentData.payment_type,
            payment_method: paymentData.payment_method,
            webhook_data: webhookData,
          })
          .eq('id', pagamentoExistente.id);

        // Se aprovado, ativar compra do pacote
        if (paymentData.status === 'approved') {
          await this.ativarCompraPacote(pagamentoExistente.compra_pacote_id, paymentId);
        }
      } else {
        // Criar novo registro de pagamento (webhook chegou antes da criação local)
        console.log('Pagamento não encontrado no banco, aguardando criação local');
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Ativar compra de pacote após pagamento aprovado
   */
  private static async ativarCompraPacote(compraPacoteId: string, paymentId: string) {
    const supabase = await createClient();

    // Atualizar status da compra para ativo
    await supabase
      .from('compras_pacotes')
      .update({
        status: 'ativo',
        pagamento_mp_id: paymentId,
      })
      .eq('id', compraPacoteId);

    console.log(`Compra ${compraPacoteId} ativada após pagamento ${paymentId}`);

    // Criar agendamentos recorrentes automaticamente
    try {
      const { PacotesService } = await import('@/services/database/pacotes.service');
      const resultado = await PacotesService.criarAgendamentosRecorrentes(compraPacoteId);

      console.log(`Agendamentos recorrentes criados para compra ${compraPacoteId}:`, {
        agendamentos: resultado.agendamentos.length,
        erros: resultado.errors.length
      });

      if (resultado.errors.length > 0) {
        console.warn('Alguns agendamentos não puderam ser criados:', resultado.errors);
      }
    } catch (error) {
      console.error('Erro ao criar agendamentos recorrentes:', error);
      // Não falhar o webhook por erro nos agendamentos
    }
  }

  /**
   * Verificar se pagamento foi aprovado
   */
  static async verificarPagamentoAprovado(preferenceId: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { data: pagamento } = await supabase
        .from('pagamentos_mercadopago')
        .select('status')
        .eq('preference_id', preferenceId)
        .single();

      return pagamento?.status === 'approved';
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return false;
    }
  }
}
