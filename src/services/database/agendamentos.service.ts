import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export type StatusAgendamento = 'confirmado' | 'cancelado' | 'pendente' | 'concluido';
export type Modalidade = 'presencial' | 'online';

export interface Agendamento {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_consulta: string;
  modalidade: Modalidade;
  status: StatusAgendamento;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: { nome: string; email: string; telefone?: string };
  usuario?: { nome: string; email: string; telefone?: string };
  profissional?: { nome: string; especialidade?: string };
}

export interface CreateAgendamentoDTO {
  usuario_id: string;
  profissional_id: string;
  modalidade: Modalidade;
  data_consulta: string;
  notas?: string;
}

export class AgendamentosService {
  // ======================================
  // Criar novo agendamento
  // ======================================
  static async createAgendamento(data: CreateAgendamentoDTO) {
    const supabase = await createClient();

    try {
      console.log('Criando agendamento:', data);

      // Extrair data e horário do ISO datetime
      const dataObj = new Date(data.data_consulta);
      const dataSlot = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const horarioSlot = dataObj.toISOString().split('T')[1].substring(0, 5); // HH:mm

      // 1️⃣ Verificar se existe slot disponível na nova tabela agendamento_slot
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', data.profissional_id)
        .eq('data', dataSlot)
        .eq('hora_inicio', horarioSlot)
        .eq('status', 'livre')
        .single();

      if (slotError || !slot) {
        throw new Error('Slot não disponível para este horário');
      }

      // 2️⃣ Criar agendamento
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          paciente_id: data.usuario_id,
          profissional_id: data.profissional_id,
          data_consulta: data.data_consulta,
          status: 'confirmado',
          modalidade: data.modalidade,
          notas: data.notas,
        })
        .select(`*,
          paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
          profissional:usuarios!agendamentos_profissional_id_fkey(nome)
        `)
        .single();

      if (agendamentoError) {
        console.error('Erro ao criar agendamento:', agendamentoError);
        throw agendamentoError;
      }

      console.log('Agendamento criado com sucesso:', agendamento.id);

      // 3️⃣ Marcar slot como ocupado na nova tabela
      const { error: updateSlotError } = await supabase
        .from('agendamento_slot')
        .update({
          status: 'ocupado',
          paciente_id: data.usuario_id,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', slot.id);

      if (updateSlotError) {
        console.error('Erro ao atualizar slot:', updateSlotError);
        throw updateSlotError;
      }

      console.log('Slot marcado como ocupado!');

      // 4️⃣ Retornar agendamento formatado
      return {
        id: agendamento.id,
        paciente_id: agendamento.paciente_id,
        profissional_id: agendamento.profissional_id,
        data_consulta: agendamento.data_consulta,
        status: agendamento.status,
        modalidade: agendamento.modalidade,
        notas: agendamento.notas,
        usuario: agendamento.paciente,
        profissional: agendamento.profissional,
      } satisfies Agendamento;

    } catch (error) {
      console.error('Erro no createAgendamento:', error);
      throw error;
    }
  }

  // ======================================
  // Buscar agendamento por ID
  // ======================================
  static async getAgendamentoById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
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

  // ======================================
  // Listar agendamentos com filtros
  // ======================================
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
        paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `);

    if (filters?.usuario_id) query = query.eq('paciente_id', filters.usuario_id);
    if (filters?.profissional_id) query = query.eq('profissional_id', filters.profissional_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.data_inicio) query = query.gte('data_consulta', filters.data_inicio);
    if (filters?.data_fim) query = query.lte('data_consulta', filters.data_fim);

    const { data, error } = await query.order('data_consulta', { ascending: true });

    if (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }

    return data as Agendamento[];
  }

  // ======================================
  // Verificar disponibilidade
  // ======================================
  static async checkAvailability(
    profissional_id: string,
    slot_id: string
  ): Promise<boolean> {
    const supabase = await createClient();

    try {
      console.log('=== VERIFICANDO DISPONIBILIDADE ===');
      console.log('Input recebido:', { profissional_id, slot_id });

      // Buscar o slot pelo ID
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('id, status, data, hora_inicio, hora_fim')
        .eq('id', slot_id)
        .eq('profissional_id', profissional_id)
        .single();

      if (slotError || !slot) {
        console.log('Slot não encontrado ou não pertence ao profissional:', slotError);
        return false;
      }

      // Verificar se o slot está livre
      if (slot.status !== 'livre') {
        console.log('Slot já ocupado ou indisponível:', slot.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  }


  // ======================================
  // Atualizar status do agendamento
  // ======================================
  static async updateAgendamentoStatus(
    id: string,
    updates: Partial<{ status: StatusAgendamento; notas: string }>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      throw error;
    }

    return data as Agendamento;
  }

  static async cancelAgendamento(id: string, motivo: string) {
    const supabase = await createClient();

    try {
      // 1️⃣ Buscar o agendamento para obter dados necessários
      const agendamento = await this.getAgendamentoById(id);
      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      // 2️⃣ Extrair data e horário do agendamento
      const dataObj = new Date(agendamento.data_consulta);
      const dataSlot = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const horarioSlot = dataObj.toISOString().split('T')[1].substring(0, 5); // HH:mm

      console.log('Cancelando agendamento:', { id, dataSlot, horarioSlot, profissional_id: agendamento.profissional_id });

      // 3️⃣ Buscar slot correspondente na nova tabela agendamento_slot
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', agendamento.profissional_id)
        .eq('data', dataSlot)
        .eq('hora_inicio', horarioSlot)
        .eq('paciente_id', agendamento.paciente_id)
        .eq('status', 'ocupado')
        .single();

      if (slot) {
        // 4️⃣ Liberar o slot na nova tabela
        const { error: updateSlotError } = await supabase
          .from('agendamento_slot')
          .update({
            status: 'livre',
            paciente_id: null,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', slot.id);

        if (updateSlotError) {
          console.error('Erro ao liberar slot:', updateSlotError);
          throw updateSlotError;
        }

        console.log('Slot liberado com sucesso!');
      } else {
        console.warn('Slot não encontrado na nova tabela agendamento_slot:', slotError);
      }

      // 5️⃣ Atualizar o status do agendamento para cancelado
      const updatedAgendamento = await this.updateAgendamentoStatus(id, {
        status: "cancelado",
        notas: motivo
      });

      return updatedAgendamento;

    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }

  // ======================================
  // Completar agendamento (marcar consulta como concluída)
  // ======================================
  static async completeAgendamento(id: string, notas?: string) {
    const supabase = await createClient();

    try {
      // 1️⃣ Atualizar o status do agendamento para concluído
      const updatedAgendamento = await this.updateAgendamentoStatus(id, {
        status: "concluido",
        notas: notas
      });

      // 2️⃣ Atualizar o status_consulta na tabela consultas
      const { error: consultaError } = await supabase
        .from('consultas')
        .update({
          status_consulta: 'concluido',
          updated_at: new Date().toISOString()
        })
        .eq('agendamento_id', id);

      if (consultaError) {
        console.error('Erro ao atualizar status_consulta:', consultaError);
        // Não vamos fazer throw aqui para não quebrar o fluxo, mas vamos logar
      }

      console.log('Agendamento e consulta marcados como concluídos');
      return updatedAgendamento;

    } catch (error) {
      console.error('Erro ao completar agendamento:', error);
      throw error;
    }
  }

  // ======================================
  // Confirmar agendamento
  // ======================================
  static async confirmAgendamento(id: string) {
    return this.updateAgendamentoStatus(id, { status: "confirmado" });
  }
}

// ======================================
// Versão para uso no browser
// ======================================
export class AgendamentosServiceClient {
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
      .eq('paciente_id', user.id)
      .order('data_consulta', { ascending: true });

    if (error) throw error;

    return data.map(ag => ({
      id: ag.id,
      usuarioId: ag.paciente_id,
      profissionalId: ag.profissional_id,
      profissionalNome: ag.profissional?.nome || 'Profissional',
      especialidade: ag.profissional?.especialidade || '',
      dataISO: ag.data_consulta,
      status: ag.status,
      notas: ag.notas,
    }));
  }
}
