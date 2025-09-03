import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export type StatusAgendamento = 'confirmado' | 'pendente' | 'cancelado' | 'concluido';

export interface Agendamento {
  id: string;
  usuario_id: string;
  profissional_id: string;
  data_hora: string;
  status: StatusAgendamento;
  local: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados (joins)
  usuario?: {
    nome: string;
    email: string;
    telefone?: string;
  };
  profissional?: {
    nome: string;
    especialidade?: string;
  };
}

export interface CreateAgendamentoDTO {
  usuario_id: string;
  profissional_id: string;
  data_hora: string;
  local: string;
  notas?: string;
}

export class AgendamentosService {
  /**
   * Criar novo agendamento
   */
  static async createAgendamento(data: CreateAgendamentoDTO) {
    const supabase = await createClient();
    
    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .insert({
        ...data,
        status: 'pendente',
      })
      .select(`
        *,
        usuario:usuarios!agendamentos_usuario_id_fkey(nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }

    return agendamento as Agendamento;
  }

  /**
   * Buscar agendamento por ID
   */
  static async getAgendamentoById(id: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        usuario:usuarios!agendamentos_usuario_id_fkey(nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar agendamento:', error);
      return null;
    }

    return data as Agendamento;
  }

  /**
   * Listar agendamentos com filtros
   */
  static async listAgendamentos(filters?: {
    usuario_id?: string;
    profissional_id?: string;
    status?: StatusAgendamento;
    data_inicio?: string;
    data_fim?: string;
  }) {
    const supabase = await createClient();
    
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        usuario:usuarios!agendamentos_usuario_id_fkey(nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `);

    if (filters?.usuario_id) {
      query = query.eq('usuario_id', filters.usuario_id);
    }

    if (filters?.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.data_inicio) {
      query = query.gte('data_hora', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('data_hora', filters.data_fim);
    }

    const { data, error } = await query.order('data_hora', { ascending: true });

    if (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }

    return data as Agendamento[];
  }

  /**
   * Atualizar status do agendamento
   */
  static async updateAgendamentoStatus(id: string, status: StatusAgendamento, notas?: string) {
    const supabase = await createClient();
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notas) {
      updateData.notas = notas;
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        usuario:usuarios!agendamentos_usuario_id_fkey(nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      throw error;
    }

    return data as Agendamento;
  }

  /**
   * Cancelar agendamento
   */
  static async cancelAgendamento(id: string, motivo: string) {
    return this.updateAgendamentoStatus(id, 'cancelado', motivo);
  }

  /**
   * Confirmar agendamento
   */
  static async confirmAgendamento(id: string) {
    return this.updateAgendamentoStatus(id, 'confirmado');
  }

  /**
   * Concluir agendamento
   */
  static async completeAgendamento(id: string, notas?: string) {
    return this.updateAgendamentoStatus(id, 'concluido', notas);
  }

  /**
   * Reagendar (criar novo e cancelar antigo)
   */
  static async rescheduleAgendamento(
    oldAgendamentoId: string,
    newData: {
      data_hora: string;
      local?: string;
    }
  ) {
    const supabase = await createClient();
    
    // Buscar agendamento antigo
    const oldAgendamento = await this.getAgendamentoById(oldAgendamentoId);
    if (!oldAgendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // Criar novo agendamento
    const newAgendamento = await this.createAgendamento({
      usuario_id: oldAgendamento.usuario_id,
      profissional_id: oldAgendamento.profissional_id,
      data_hora: newData.data_hora,
      local: newData.local || oldAgendamento.local,
      notas: `Reagendado de ${oldAgendamento.data_hora}`,
    });

    // Cancelar antigo
    await this.cancelAgendamento(oldAgendamentoId, 'Reagendado pelo paciente');

    return newAgendamento;
  }

  /**
   * Verificar disponibilidade de horário
   */
  static async checkAvailability(
    profissional_id: string,
    data_hora: string
  ): Promise<boolean> {
    const supabase = await createClient();
    
    // Verificar se já existe agendamento no mesmo horário
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('profissional_id', profissional_id)
      .eq('data_hora', data_hora)
      .neq('status', 'cancelado');

    if (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }

    return !data || data.length === 0;
  }

  /**
   * Buscar próximos agendamentos
   */
  static async getUpcomingAgendamentos(usuario_id: string, limit = 5) {
    const supabase = await createClient();
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        usuario:usuarios!agendamentos_usuario_id_fkey(nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .eq('usuario_id', usuario_id)
      .gte('data_hora', now)
      .in('status', ['confirmado', 'pendente'])
      .order('data_hora', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar próximos agendamentos:', error);
      throw error;
    }

    return data as Agendamento[];
  }
}

// Versão para uso no cliente (browser)
export class AgendamentosServiceClient {
  /**
   * Buscar agendamentos do usuário atual
   */
  static async getMyAgendamentos() {
    const supabase = createClientBrowser();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .eq('usuario_id', user.id)
      .order('data_hora', { ascending: true });

    if (error) {
      console.error('Erro ao buscar meus agendamentos:', error);
      throw error;
    }

    // Mapear para o formato esperado pelo frontend
    return data.map(ag => ({
      id: ag.id,
      usuarioId: ag.usuario_id,
      profissionalId: ag.profissional_id,
      profissionalNome: ag.profissional?.nome || 'Profissional',
      especialidade: ag.profissional?.especialidade || '',
      dataISO: ag.data_hora,
      local: ag.local,
      status: ag.status,
      notas: ag.notas,
    }));
  }

  /**
   * Criar novo agendamento
   */
  static async createAgendamento(data: {
    profissional_id: string;
    data_hora: string;
    local: string;
    notas?: string;
  }) {
    const supabase = createClientBrowser();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .insert({
        usuario_id: user.id,
        ...data,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }

    return agendamento;
  }

  /**
   * Cancelar agendamento
   */
  static async cancelAgendamento(id: string, motivo: string) {
    const supabase = createClientBrowser();
    
    const { data, error } = await supabase
      .from('agendamentos')
      .update({
        status: 'cancelado',
        notas: motivo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }

    return data;
  }
}
