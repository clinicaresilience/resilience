import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export type StatusAgendamento = 'confirmado' | 'cancelado';
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

      // 1️⃣ Criar agendamento
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

      // 2️⃣ Atualizar slots no agenda_profissional
      const { data: agendaProfissional } = await supabase
        .from('agenda_profissional')
        .select('id, slots')
        .eq('profissional_id', data.profissional_id)
        .single();

      if (!agendaProfissional) throw new Error('Agenda do profissional não encontrada');

      const dataObj = new Date(data.data_consulta);
      const diaSemana = dataObj.getDay();
      const hora = dataObj.toISOString().split('T')[1].substring(0, 5);

      const novosSlots = agendaProfissional.slots.map((slot: any) => {
        if (slot.diaSemana === diaSemana && slot.horaInicio === hora) {
          return {
            ...slot,
            disponivel: false,
            agendamento_id: agendamento.id,
          };
        }
        return slot;
      });

      const { error: slotsError } = await supabase
        .from('agenda_profissional')
        .update({ slots: novosSlots })
        .eq('id', agendaProfissional.id);

      if (slotsError) throw slotsError;

      console.log('Slot atualizado com sucesso!');

      // 3️⃣ Retornar agendamento formatado
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
    data_hora: string
  ): Promise<boolean> {
    const supabase = await createClient();

    try {
      console.log('=== VERIFICANDO DISPONIBILIDADE ===');
      console.log('Input recebido:', { profissional_id, data_hora });

      const dataObj = new Date(data_hora);
      if (isNaN(dataObj.getTime())) {
        console.error('Data inválida:', data_hora);
        return false;
      }

      const data = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = dataObj.toISOString().split('T')[1].substring(0, 5); // HH:MM
      const diaSemana = dataObj.getDay(); // 0=domingo, 1=segunda, etc.

      console.log('Data/hora processadas:', { data, hora, diaSemana });

      // 1. Buscar configuração JSON
      // 1. Buscar configuração JSON
      const { data: configData, error: configError } = await supabase
        .from('agenda_profissional')
        .select('configuracao')
        .eq('profissional_id', profissional_id)
        .single();

      if (configError || !configData) {
        console.log('Profissional não atende neste dia:', { diaSemana, configError });
        return false;
      }

      // NÃO USAR JSON.parse
      const configObj = configData.configuracao;
      const diaConfig = configObj.dias.find((d: any) => d.diaSemana === diaSemana);

      if (!diaConfig) {
        console.log('Profissional não atende neste dia da semana:', diaSemana);
        return false;
      }

      const horaInicio = diaConfig.horaInicio;
      const horaFim = diaConfig.horaFim;
      const intervaloMinutos = configObj.intervalo_minutos;


      // 2. Verificar se está dentro do expediente
      const horaMinutos = parseInt(hora.split(':')[0]) * 60 + parseInt(hora.split(':')[1]);
      const inicioMinutos = parseInt(horaInicio.split(':')[0]) * 60 + parseInt(horaInicio.split(':')[1]);
      const fimMinutos = parseInt(horaFim.split(':')[0]) * 60 + parseInt(horaFim.split(':')[1]);

      if (horaMinutos < inicioMinutos || horaMinutos >= fimMinutos) return false;

      // 3. Verificar se está no intervalo correto
      if ((horaMinutos - inicioMinutos) % intervaloMinutos !== 0) return false;

      // 4. Verificar exceções
      const { data: excecao } = await supabase
        .from('agenda_excecoes')
        .select('id')
        .eq('profissional_id', profissional_id)
        .eq('data', data)
        .single();

      if (excecao) return false;

      // 5. Verificar agendamentos existentes
      const { data: agendamentoExistente } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('profissional_id', profissional_id)
        .eq('data_consulta', data_hora)
        .neq('status', 'cancelado')
        .single();

      if (agendamentoExistente) return false;

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
    return this.updateAgendamentoStatus(id, { status: "cancelado", notas: motivo });
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
