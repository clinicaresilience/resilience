import { createClient } from '@/lib/server';

export interface PacoteSessao {
  id: string;
  quantidade_sessoes: number;
  preco_total: number;
  preco_por_sessao: number;
  desconto_percentual: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompraPacote {
  id: string;
  paciente_id: string;
  profissional_id: string;
  pacote_id: string;
  sessoes_total: number;
  sessoes_utilizadas: number;
  sessoes_restantes?: number;
  status: 'pendente' | 'ativo' | 'cancelado' | 'expirado';
  pagamento_mp_id?: string;
  valor_pago?: number;
  data_compra: string;
  data_validade?: string;
  created_at?: string;
  updated_at?: string;
}

export class PacotesService {
  /**
   * Listar todos os pacotes ativos
   */
  static async listarPacotesAtivos(): Promise<PacoteSessao[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('pacotes_sessoes')
      .select('*')
      .eq('ativo', true)
      .order('quantidade_sessoes', { ascending: true });

    if (error) {
      console.error('Erro ao listar pacotes:', error);
      throw error;
    }

    return data as PacoteSessao[];
  }

  /**
   * Buscar pacote por ID
   */
  static async buscarPacotePorId(pacoteId: string): Promise<PacoteSessao | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('pacotes_sessoes')
      .select('*')
      .eq('id', pacoteId)
      .single();

    if (error) {
      console.error('Erro ao buscar pacote:', error);
      return null;
    }

    return data as PacoteSessao;
  }

  /**
   * Criar compra de pacote
   */
  static async criarCompraPacote(data: {
    paciente_id: string;
    profissional_id: string;
    pacote_id: string;
    valor_pago?: number;
    primeiro_horario_data?: string;
    primeiro_horario_slot_id?: string;
    modalidade?: 'presencial' | 'online';
  }): Promise<CompraPacote> {
    const supabase = await createClient();

    // Buscar informações do pacote
    const pacote = await this.buscarPacotePorId(data.pacote_id);
    if (!pacote) {
      throw new Error('Pacote não encontrado');
    }

    // Criar compra
    const { data: compra, error } = await supabase
      .from('compras_pacotes')
      .insert({
        paciente_id: data.paciente_id,
        profissional_id: data.profissional_id,
        pacote_id: data.pacote_id,
        sessoes_total: pacote.quantidade_sessoes,
        sessoes_utilizadas: 0,
        status: 'pendente',
        valor_pago: data.valor_pago,
        data_validade: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 dias
        primeiro_horario_data: data.primeiro_horario_data,
        primeiro_horario_slot_id: data.primeiro_horario_slot_id,
        modalidade: data.modalidade || 'online',
        agendamentos_criados: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar compra de pacote:', error);
      throw error;
    }

    return compra as CompraPacote;
  }

  /**
   * Buscar compra por ID
   */
  static async buscarCompraPorId(compraId: string): Promise<CompraPacote | null> {
    // Usar admin client para funcionar em contextos sem autenticação (webhooks)
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('compras_pacotes')
      .select('*')
      .eq('id', compraId)
      .single();

    if (error) {
      console.error('Erro ao buscar compra:', error);
      return null;
    }

    return data as CompraPacote;
  }

  /**
   * Atualizar status da compra
   */
  static async atualizarStatusCompra(
    compraId: string,
    status: CompraPacote['status'],
    pagamentoMpId?: string
  ): Promise<CompraPacote> {
    // Usar admin client
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { status };
    if (pagamentoMpId) {
      updateData.pagamento_mp_id = pagamentoMpId;
    }

    const { data, error } = await supabase
      .from('compras_pacotes')
      .update(updateData)
      .eq('id', compraId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status da compra:', error);
      throw error;
    }

    return data as CompraPacote;
  }

  /**
   * Incrementar sessões utilizadas
   */
  static async incrementarSessoesUtilizadas(compraId: string): Promise<void> {
    const compra = await this.buscarCompraPorId(compraId);
    if (!compra) {
      throw new Error('Compra não encontrada');
    }

    if (compra.sessoes_utilizadas >= compra.sessoes_total) {
      throw new Error('Todas as sessões do pacote já foram utilizadas');
    }

    // Usar admin client
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('compras_pacotes')
      .update({ sessoes_utilizadas: compra.sessoes_utilizadas + 1 })
      .eq('id', compraId);

    if (error) {
      console.error('Erro ao incrementar sessões utilizadas:', error);
      throw error;
    }
  }

  /**
   * Listar compras do paciente
   */
  static async listarComprasPaciente(pacienteId: string): Promise<CompraPacote[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('compras_pacotes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar compras do paciente:', error);
      throw error;
    }

    return data as CompraPacote[];
  }

  /**
   * Buscar compra ativa do paciente com sessões disponíveis
   */
  static async buscarCompraAtivaComSessoes(
    pacienteId: string,
    profissionalId: string
  ): Promise<CompraPacote | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('compras_pacotes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('profissional_id', profissionalId)
      .eq('status', 'ativo')
      .gt('sessoes_restantes', 0)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // Não encontrou compra ativa é ok
      return null;
    }

    return data as CompraPacote;
  }

  /**
   * Criar agendamentos recorrentes após aprovação do pagamento
   */
  static async criarAgendamentosRecorrentes(compraId: string): Promise<{ success: boolean; agendamentos: string[]; errors: string[] }> {
    // Usar admin client para funcionar em webhooks
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    // Buscar dados da compra
    const compra = await this.buscarCompraPorId(compraId);
    if (!compra) {
      throw new Error('Compra não encontrada');
    }

    // Verificar se já foram criados agendamentos
    if (compra.agendamentos_criados) {
      console.log('Agendamentos já foram criados para esta compra');
      return { success: true, agendamentos: [], errors: [] };
    }

    // Verificar se tem primeiro horário definido
    if (!compra.primeiro_horario_data || !compra.primeiro_horario_slot_id) {
      throw new Error('Primeiro horário não definido na compra');
    }

    const { AgendamentosService } = await import('./agendamentos.service');
    const agendamentosCriados: string[] = [];
    const erros: string[] = [];

    try {
      // Criar agendamentos para cada sessão do pacote
      for (let i = 0; i < compra.sessoes_total; i++) {
        const dataAgendamento = new Date(compra.primeiro_horario_data);
        dataAgendamento.setDate(dataAgendamento.getDate() + (i * 7)); // Semanal

        const dataAgendamentoISO = dataAgendamento.toISOString();

        try {
          // Verificar disponibilidade
          const disponivel = await AgendamentosService.checkAvailability(
            compra.profissional_id,
            dataAgendamentoISO
          );

          if (!disponivel && i > 0) {
            erros.push(`Sessão ${i + 1}: Horário ${dataAgendamentoISO} não disponível`);
            continue;
          }

          // Criar agendamento
          const agendamento = await AgendamentosService.createAgendamento({
            usuario_id: compra.paciente_id,
            profissional_id: compra.profissional_id,
            data_consulta: dataAgendamentoISO,
            modalidade: (compra.modalidade as 'presencial' | 'online') || 'online',
            notas: `Sessão ${i + 1} de ${compra.sessoes_total} - Pacote pré-pago`,
            tipo_paciente: 'fisica',
            compra_pacote_id: compra.id,
          });

          agendamentosCriados.push(agendamento.id);
          console.log(`Agendamento criado: Sessão ${i + 1}/${compra.sessoes_total} em ${dataAgendamentoISO}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          erros.push(`Sessão ${i + 1}: ${errorMsg}`);
          console.error(`Erro ao criar agendamento ${i + 1}:`, error);
        }
      }

      // Marcar como agendamentos criados (usar admin client)
      const { createAdminClient } = await import('@/lib/server-admin');
      const adminClient = createAdminClient();

      await adminClient
        .from('compras_pacotes')
        .update({ agendamentos_criados: true })
        .eq('id', compraId);

      // Atualizar sessões utilizadas com base nos agendamentos criados
      if (agendamentosCriados.length > 0) {
        await adminClient
          .from('compras_pacotes')
          .update({ sessoes_utilizadas: agendamentosCriados.length })
          .eq('id', compraId);
      }

      return {
        success: true,
        agendamentos: agendamentosCriados,
        errors: erros
      };
    } catch (error) {
      console.error('Erro ao criar agendamentos recorrentes:', error);
      throw error;
    }
  }
}
