
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
  empresa?: {
    nome: string;
    codigo: string;
    endereco_logradouro?: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    endereco_cep?: string;
  };
  tipo_paciente?: 'fisica' | 'juridica';
  codigo_empresa?: string;
}

export interface CreateAgendamentoDTO {
  usuario_id: string;
  profissional_id: string;
  modalidade: Modalidade;
  data_consulta: string;
  notas?: string;
  tipo_paciente?: 'fisica' | 'juridica';
  compra_pacote_id?: string;
  codigo_empresa?: string;
}

export class AgendamentosService {
  // ======================================
  // Criar novo agendamento
  // ======================================
  static async createAgendamento(data: CreateAgendamentoDTO) {
    // Usar admin client para funcionar em contextos sem autenticação (webhooks)
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    try {


      // Validação: não permitir agendamentos para horários passados
      const dataConsulta = new Date(data.data_consulta);
      const agora = new Date();

      // Se for hoje, verificar se o horário já passou
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataConsultaInicioDia = new Date(dataConsulta);
      dataConsultaInicioDia.setHours(0, 0, 0, 0);

      if (dataConsultaInicioDia.getTime() === hoje.getTime()) {
        // É hoje - verificar se o horário já passou
        if (dataConsulta <= agora) {
          throw new Error('Não é possível agendar consultas para horários que já passaram no dia atual');
        }
      } else if (dataConsulta < hoje) {
        // É uma data passada
        throw new Error('Não é possível agendar consultas para datas passadas');
      }

      // Validação: verificar se o paciente já tem agendamento no mesmo dia
      const dataConsultaSemHorario = dataConsulta.toISOString().split('T')[0]; // YYYY-MM-DD
      const inicioDataConsulta = `${dataConsultaSemHorario}T00:00:00.000Z`;
      const fimDataConsulta = `${dataConsultaSemHorario}T23:59:59.999Z`;

      const { data: agendamentoExistente, error: existingAppointmentError } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('paciente_id', data.usuario_id)
        .gte('data_consulta', inicioDataConsulta)
        .lte('data_consulta', fimDataConsulta)
        .in('status', ['confirmado', 'pendente']) // Não contar agendamentos cancelados
        .limit(1);

      if (existingAppointmentError) {
        console.error('Erro ao verificar agendamento existente:', existingAppointmentError);
        throw new Error('Erro interno ao validar disponibilidade');
      }

      if (agendamentoExistente && agendamentoExistente.length > 0) {
        const dataFormatada = dataConsulta.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        throw new Error(`Você já possui um agendamento para o dia ${dataFormatada}. Cada paciente pode ter apenas um agendamento por dia.`);
      }

      // Extrair data e horário do ISO datetime
      const dataObj = new Date(data.data_consulta);
      const dataSlot = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const horarioSlot = dataObj.toISOString().split('T')[1].substring(0, 5); // HH:mm

      // 1️⃣ Verificar se existe slot disponível usando novo schema (data_hora_inicio)
      const dataConsultaISO = new Date(data.data_consulta).toISOString();

      console.log('🔍 Buscando slot livre:', {
        profissional_id: data.profissional_id,
        data_hora_inicio: dataConsultaISO,
        status: 'livre'
      });

      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', data.profissional_id)
        .eq('data_hora_inicio', dataConsultaISO)
        .eq('status', 'livre')
        .single();

      if (slotError || !slot) {
        console.error('❌ Erro ao buscar slot:', slotError);
        console.error('Buscando por:', {
          profissional_id: data.profissional_id,
          data_hora_inicio: dataConsultaISO,
          status: 'livre'
        });
        throw new Error('Slot não disponível para este horário');
      }

      console.log('✅ Slot livre encontrado:', {
        id: slot.id,
        data_hora_inicio: slot.data_hora_inicio,
        status: slot.status
      });

      // 2️⃣ Criar agendamento e consulta em sequência para evitar trigger problems
      let agendamentoBasico;
      let createAppointmentError;

      try {
        // Primeiro, criar o agendamento
        const result = await supabase
          .from('agendamentos')
          .insert({
            paciente_id: data.usuario_id,
            profissional_id: data.profissional_id,
            data_consulta: data.data_consulta,
            status: 'confirmado',
            modalidade: data.modalidade,
            notas: data.notas,
            tipo_paciente: data.tipo_paciente || 'juridica',
            compra_pacote_id: data.compra_pacote_id,
            codigo_empresa: data.codigo_empresa,
          })
          .select()
          .single();

        agendamentoBasico = result.data;
        createAppointmentError = result.error;

        // Nota: Removido código que criava consulta correspondente
        // pois a tabela consultas não existe mais

      } catch (err) {
        createAppointmentError = err;
      }

      if (createAppointmentError) {
        console.error('Erro ao criar agendamento:', createAppointmentError);
        throw createAppointmentError;
      }

      // Buscar dados completos do agendamento criado
      const { data: agendamentoCompleto, error: fetchError } = await supabase
        .from('agendamentos')
        .select(`*,
          paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
          profissional:usuarios!agendamentos_profissional_id_fkey(nome)
        `)
        .eq('id', agendamentoBasico.id)
        .single();


      // Declarar a variável antes
      let agendamento_let: Agendamento;

      if (fetchError || !agendamentoCompleto) {
        agendamento_let = {
          id: agendamentoBasico.id,
          paciente_id: agendamentoBasico.paciente_id,
          profissional_id: agendamentoBasico.profissional_id,
          data_consulta: agendamentoBasico.data_consulta,
          status: agendamentoBasico.status,
          modalidade: agendamentoBasico.modalidade,
          notas: agendamentoBasico.notas,
          usuario: undefined,
          profissional: undefined,
        };
      } else {
        // Criar um novo objeto explicitamente a partir de agendamentoCompleto
        agendamento_let = {
          id: agendamentoCompleto.id,
          paciente_id: agendamentoCompleto.paciente_id,
          profissional_id: agendamentoCompleto.profissional_id,
          data_consulta: agendamentoCompleto.data_consulta,
          status: agendamentoCompleto.status,
          modalidade: agendamentoCompleto.modalidade,
          notas: agendamentoCompleto.notas,
          usuario: agendamentoCompleto.paciente,
          profissional: agendamentoCompleto.profissional,
          created_at: agendamentoCompleto.created_at,
          updated_at: agendamentoCompleto.updated_at,
        };
      }







      console.log('🔒 Marcando slot como ocupado:', {
        slot_id: slot.id,
        paciente_id: data.usuario_id,
        profissional_id: data.profissional_id,
        data_hora_inicio: slot.data_hora_inicio,
        status_antes: slot.status
      });

      // Usar admin client para garantir que a atualização sempre funcione
      const { createAdminClient } = await import('@/lib/server-admin');
      const adminClient = createAdminClient();

      const { data: updateResult, error: updateSlotError } = await adminClient
        .from('agendamento_slot')
        .update({
          status: 'ocupado',
          paciente_id: data.usuario_id,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', slot.id)
        .select();

      if (updateSlotError) {
        console.error('❌ Erro ao atualizar slot:', updateSlotError);
        throw updateSlotError;
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('❌ Nenhum slot foi atualizado. Possível problema de ID ou permissões.');
        console.error('Tentou atualizar slot:', slot.id);
        throw new Error('Falha ao marcar slot como ocupado');
      }

      console.log('✅ Slot marcado como ocupado:', updateResult[0].id);



      // 4️⃣ Retornar agendamento formatado
      return {
        id: agendamento_let.id,
        paciente_id: agendamento_let.paciente_id,
        profissional_id: agendamento_let.profissional_id,
        data_consulta: agendamento_let.data_consulta,
        status: agendamento_let.status,
        modalidade: agendamento_let.modalidade,
        notas: agendamento_let.notas,
        usuario: agendamento_let.paciente,
        profissional: agendamento_let.profissional,
      };

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
        paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar agendamento:', error);
      return null;
    }

    // Buscar empresa se houver codigo_empresa
    if (data.codigo_empresa) {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nome, codigo, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep')
        .eq('codigo', data.codigo_empresa)
        .single();

      if (empresa) {
        (data as Agendamento).empresa = empresa;
      }
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
        paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
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

    // Buscar empresas para agendamentos que têm codigo_empresa
    const agendamentosComEmpresas = await Promise.all(
      (data || []).map(async (agendamento) => {
        if (agendamento.codigo_empresa) {
          const { data: empresa } = await supabase
            .from('empresas')
            .select('nome, codigo, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep')
            .eq('codigo', agendamento.codigo_empresa)
            .single();

          if (empresa) {
            return { ...agendamento, empresa } as Agendamento;
          }
        }
        return agendamento as Agendamento;
      })
    );

    return agendamentosComEmpresas;
  }

  // ======================================
  // Verificar disponibilidade de slot por ID
  // ======================================
  static async checkSlotAvailability(
    slot_id: string,
    profissional_id: string
  ): Promise<boolean> {
    const supabase = await createClient();

    try {
      console.log('=== VERIFICANDO DISPONIBILIDADE DE SLOT ===');


      // Buscar o slot pelo ID usando novo schema
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('id, status, data_hora_inicio, data_hora_fim')
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
  // Verificar disponibilidade por data/hora
  // ======================================
  static async checkAvailability(
    profissional_id: string,
    data_consulta: string
  ): Promise<boolean> {
    // Usar admin client para funcionar em webhooks
    const { createAdminClient } = await import('@/lib/server-admin');
    const supabase = createAdminClient();

    try {
      const dataConsultaISO = new Date(data_consulta).toISOString();

      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('id, status')
        .eq('profissional_id', profissional_id)
        .eq('data_hora_inicio', dataConsultaISO)
        .single();

      if (slotError || !slot) return false;
      return slot.status === 'livre';
    } catch {
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
        paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
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


      // 3️⃣ Buscar slot correspondente na nova tabela agendamento_slot usando data_hora_inicio
      const dataConsultaISO = new Date(agendamento.data_consulta).toISOString();
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', agendamento.profissional_id)
        .eq('data_hora_inicio', dataConsultaISO)
        .eq('paciente_id', agendamento.paciente_id)
        .eq('status', 'ocupado')
        .single();

      if (slot) {
        // 4️⃣ Liberar o slot na nova tabela (usar admin client)
        const { createAdminClient } = await import('@/lib/server-admin');
        const adminClient = createAdminClient();

        const { error: updateSlotError } = await adminClient
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
      // 1️⃣ Atualizar apenas o status do agendamento para concluído
      const updatedAgendamento = await this.updateAgendamentoStatus(id, {
        status: "concluido",
        notas: notas
      });

      console.log('Agendamento marcado como concluído');
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

  // ======================================
  // Reagendar agendamento (limite de 3 vezes)
  // ======================================
  static async reagendarAgendamento(
    agendamento_id: string,
    nova_data_consulta: string,
    motivo?: string
  ) {
    const supabase = await createClient();

    try {
      // 1. Buscar agendamento atual com número de reagendamentos
      const { data: agendamento, error: fetchError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id', agendamento_id)
        .single();

      if (fetchError || !agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      // 2. Validar limite de reagendamentos (máximo 3)
      const numeroReagendamentos = agendamento.numero_reagendamentos || 0;
      if (numeroReagendamentos >= 3) {
        throw new Error('Limite de reagendamentos atingido. Você já reagendou este agendamento 3 vezes.');
      }

      // 3. Validar que a nova data não é no passado
      const novaDataObj = new Date(nova_data_consulta);
      const agora = new Date();

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const novaDataInicioDia = new Date(novaDataObj);
      novaDataInicioDia.setHours(0, 0, 0, 0);

      if (novaDataInicioDia.getTime() === hoje.getTime()) {
        if (novaDataObj <= agora) {
          throw new Error('Não é possível reagendar para horários que já passaram');
        }
      } else if (novaDataObj < hoje) {
        throw new Error('Não é possível reagendar para datas passadas');
      }

      // 4. Verificar se o novo slot está disponível
      const novaDataISO = novaDataObj.toISOString();
      const { data: novoSlot, error: novoSlotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', agendamento.profissional_id)
        .eq('data_hora_inicio', novaDataISO)
        .eq('status', 'livre')
        .single();

      if (novoSlotError || !novoSlot) {
        throw new Error('O horário selecionado não está disponível');
      }

      // 5. Liberar o slot antigo
      const dataAntigaISO = new Date(agendamento.data_consulta).toISOString();
      console.log('🔓 Tentando liberar slot antigo:', {
        profissional_id: agendamento.profissional_id,
        data_hora_inicio: dataAntigaISO,
        paciente_id: agendamento.paciente_id
      });

      const { data: slotAntigo, error: slotAntigoError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('profissional_id', agendamento.profissional_id)
        .eq('data_hora_inicio', dataAntigaISO)
        .eq('paciente_id', agendamento.paciente_id)
        .maybeSingle();

      if (slotAntigoError) {
        console.error('❌ Erro ao buscar slot antigo:', slotAntigoError);
      }

      if (slotAntigo) {
        console.log('✅ Slot antigo encontrado, liberando:', slotAntigo.id);
        const { createAdminClient } = await import('@/lib/server-admin');
        const adminClient = createAdminClient();

        const { error: liberarSlotError } = await adminClient
          .from('agendamento_slot')
          .update({
            status: 'livre',
            paciente_id: null,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', slotAntigo.id);

        if (liberarSlotError) {
          console.error('❌ Erro ao liberar slot antigo:', liberarSlotError);
          throw new Error('Erro ao liberar horário anterior');
        }
        console.log('✅ Slot antigo liberado com sucesso');
      } else {
        console.warn('⚠️ Slot antigo não encontrado - pode já estar liberado ou não existir');
      }

      // 6. Ocupar o novo slot (usar admin client)
      const { createAdminClient: createAdmin2 } = await import('@/lib/server-admin');
      const adminClient2 = createAdmin2();

      const { error: ocuparSlotError } = await adminClient2
        .from('agendamento_slot')
        .update({
          status: 'ocupado',
          paciente_id: agendamento.paciente_id,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', novoSlot.id);

      if (ocuparSlotError) {
        // Reverter liberação do slot antigo em caso de erro
        if (slotAntigo) {
          const { createAdminClient: createAdmin3 } = await import('@/lib/server-admin');
          const adminClient3 = createAdmin3();
          await adminClient3
            .from('agendamento_slot')
            .update({
              status: 'ocupado',
              paciente_id: agendamento.paciente_id,
              atualizado_em: new Date().toISOString()
            })
            .eq('id', slotAntigo.id);
        }
        throw new Error('Erro ao ocupar novo horário');
      }

      // 7. Atualizar histórico de reagendamentos
      const historicoAtual = agendamento.historico_reagendamentos || [];
      const novoHistorico = [
        ...historicoAtual,
        {
          data_anterior: agendamento.data_consulta,
          data_nova: nova_data_consulta,
          reagendado_em: new Date().toISOString(),
          motivo: motivo || 'Não informado'
        }
      ];

      // 8. Atualizar o agendamento
      const { data: agendamentoAtualizado, error: updateError } = await supabase
        .from('agendamentos')
        .update({
          data_consulta: nova_data_consulta,
          numero_reagendamentos: numeroReagendamentos + 1,
          historico_reagendamentos: novoHistorico,
          notas: motivo ? `Reagendado: ${motivo}` : agendamento.notas,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', agendamento_id)
        .select(`
          *,
          paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
          profissional:usuarios!agendamentos_profissional_id_fkey(nome)
        `)
        .single();

      if (updateError) {
        console.error('Erro ao atualizar agendamento:', updateError);
        throw new Error('Erro ao atualizar agendamento');
      }

      return {
        success: true,
        agendamento: agendamentoAtualizado as Agendamento,
        reagendamentos_restantes: 3 - (numeroReagendamentos + 1)
      };

    } catch (error) {
      console.error('Erro ao reagendar agendamento:', error);
      throw error;
    }
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
