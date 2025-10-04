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
        payment_methods: {
          installments: 12, // Permite parcelamento em até 12x (apenas para crédito)
          default_installments: 1, // Padrão à vista
        },
        back_urls: {
          success: `${baseUrl}/tela-usuario/agendamentos`,
          failure: `${baseUrl}/tela-usuario/agendamentos`,
          pending: `${baseUrl}/tela-usuario/agendamentos`,
        },
        auto_return: 'approved' as const,
        binary_mode: false, // Permite todos os status (aprovado, pendente, rejeitado)
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
      console.log('🔔 Processando webhook MP:', JSON.stringify(webhookData, null, 2));

      const tipo = webhookData.type || webhookData.action;

      // Apenas processar eventos de pagamento
      if (tipo !== 'payment') {
        console.log('⏭️ Webhook ignorado - tipo:', tipo);
        return;
      }

      const paymentId = (webhookData.data as { id: string })?.id;
      if (!paymentId) {
        console.error('❌ Payment ID não encontrado no webhook');
        return;
      }

      console.log(`🔍 Consultando pagamento MP #${paymentId}...`);

      // Consultar detalhes do pagamento
      const payment = new Payment(mpClient);
      const paymentResponse = await payment.get({ id: paymentId });

      if (!paymentResponse) {
        console.error('❌ Não foi possível consultar pagamento:', paymentId);
        return;
      }

      console.log('📦 Detalhes do pagamento:', {
        payment_id: paymentId,
        external_reference: paymentResponse.external_reference,
        status: paymentResponse.status,
        status_detail: paymentResponse.status_detail,
        transaction_amount: paymentResponse.transaction_amount,
      });

      const externalReference = paymentResponse.external_reference;
      if (!externalReference) {
        console.error('❌ External reference não encontrado no pagamento:', paymentId);
        return;
      }

      const supabase = await createClient();
      let pagamentoExistente = null;

      // ESTRATÉGIA 1: Buscar por compra_pacote_id (external_reference)
      console.log(`🔍 Estratégia 1: Buscando por compra_pacote_id = ${externalReference}`);
      const { data: pagamento1 } = await supabase
        .from('pagamentos_mercadopago')
        .select('*')
        .eq('compra_pacote_id', externalReference)
        .maybeSingle();

      if (pagamento1) {
        console.log('✅ Pagamento encontrado por compra_pacote_id');
        pagamentoExistente = pagamento1;
      }

      // ESTRATÉGIA 2: Buscar por payment_id
      if (!pagamentoExistente) {
        console.log(`🔍 Estratégia 2: Buscando por payment_id = ${paymentId}`);
        const { data: pagamento2 } = await supabase
          .from('pagamentos_mercadopago')
          .select('*')
          .eq('payment_id', paymentId)
          .maybeSingle();

        if (pagamento2) {
          console.log('✅ Pagamento encontrado por payment_id');
          pagamentoExistente = pagamento2;
        }
      }

      // ESTRATÉGIA 3: Buscar por preference_id (via metadata do pagamento)
      if (!pagamentoExistente && paymentResponse.metadata?.preference_id) {
        const preferenceId = paymentResponse.metadata.preference_id;
        console.log(`🔍 Estratégia 3: Buscando por preference_id = ${preferenceId}`);
        const { data: pagamento3 } = await supabase
          .from('pagamentos_mercadopago')
          .select('*')
          .eq('preference_id', preferenceId)
          .maybeSingle();

        if (pagamento3) {
          console.log('✅ Pagamento encontrado por preference_id');
          pagamentoExistente = pagamento3;
        }
      }

      // ESTRATÉGIA 4: Buscar compra_pacote diretamente
      if (!pagamentoExistente) {
        console.log(`🔍 Estratégia 4: Verificando se compra_pacote existe = ${externalReference}`);
        const { data: compraPacote } = await supabase
          .from('compras_pacotes')
          .select('*')
          .eq('id', externalReference)
          .maybeSingle();

        if (compraPacote) {
          console.log('✅ Compra de pacote encontrada, criando registro de pagamento');

          // Criar registro de pagamento
          const { data: novoPagamento, error: createError } = await supabase
            .from('pagamentos_mercadopago')
            .insert({
              compra_pacote_id: externalReference,
              payment_id: paymentId,
              status: paymentResponse.status || 'pending',
              status_detail: paymentResponse.status_detail || '',
              payment_type: paymentResponse.payment_type_id || '',
              payment_method: paymentResponse.payment_method_id || '',
              valor: paymentResponse.transaction_amount,
              webhook_data: webhookData,
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Erro ao criar registro de pagamento:', createError);
          } else {
            console.log('✅ Registro de pagamento criado:', novoPagamento?.id);
            pagamentoExistente = novoPagamento;
          }
        }
      }

      if (pagamentoExistente) {
        // Atualizar pagamento existente
        const { error: updateError } = await supabase
          .from('pagamentos_mercadopago')
          .update({
            payment_id: paymentId,
            status: paymentResponse.status || 'pending',
            status_detail: paymentResponse.status_detail || '',
            payment_type: paymentResponse.payment_type_id || '',
            payment_method: paymentResponse.payment_method_id || '',
            webhook_data: webhookData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pagamentoExistente.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar pagamento:', updateError);
        } else {
          console.log('✅ Pagamento atualizado:', {
            id: pagamentoExistente.id,
            compra_id: externalReference,
            payment_id: paymentId,
            status: paymentResponse.status
          });
        }

        // Se aprovado, ativar compra do pacote
        if (paymentResponse.status === 'approved') {
          console.log('💰 Pagamento aprovado! Ativando compra do pacote...');
          await this.ativarCompraPacote(pagamentoExistente.compra_pacote_id, paymentId);
        }
      } else {
        console.error('❌ CRÍTICO: Pagamento não encontrado em nenhuma estratégia:', {
          external_reference: externalReference,
          payment_id: paymentId,
        });
      }
    } catch (error) {
      console.error('💥 Erro ao processar webhook:', error);
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
