import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export type StatusAgendamento = 'confirmado' | 'pendente' | 'cancelado' | 'concluido';

export interface Agendamento {
  id: string;
  paciente_id: string;   // igual ao banco
  profissional_id: string;
  data_consulta: string; // igual ao banco
  status: StatusAgendamento;
  local: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  paciente?: { nome: string; email: string; telefone?: string };

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

    try {
      console.log('Criando agendamento:', data);

      // Criar agendamento sem empresa_id
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          paciente_id: data.usuario_id,
          profissional_id: data.profissional_id,
          data_consulta: data.data_hora,
          status: 'pendente',
        })
        .select(`
          *,
          paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
          profissional:usuarios!agendamentos_profissional_id_fkey(nome)
        `)
        .single();

      if (agendamentoError) {
        console.error('Erro ao criar agendamento:', agendamentoError);
        throw agendamentoError;
      }

      console.log('Agendamento criado com sucesso:', agendamento.id);

      // Mapear para o formato esperado
      return {
        id: agendamento.id,
        paciente_id: agendamento.paciente_id,       // banco → frontend
        profissional_id: agendamento.profissional_id,
        data_consulta: agendamento.data_consulta,      // banco → frontend
        status: agendamento.status,
        local: agendamento.local ?? data.local,    // pega do banco, fallback pro DTO
        notas: agendamento.notas ?? data.notas,    // pega do banco, fallback pro DTO
        usuario: agendamento.paciente,
        profissional: agendamento.profissional,
      } satisfies Agendamento;
    } catch (error) {
      console.error('Erro no createAgendamento:', error);
      throw error;
    }
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
        paciente:usuarios!agendamentos_paciente_id_fkey(nome, email),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `);

    if (filters?.usuario_id) {
      query = query.eq('paciente_id', filters.usuario_id);
    }

    if (filters?.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.data_inicio) {
      query = query.gte('data_consulta', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('data_consulta', filters.data_fim);
    }

    const { data, error } = await query.order('data_consulta', { ascending: true });

    if (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }

    return data as Agendamento[];
  }

  /**
   * Verificar disponibilidade de horário baseado nas configurações
   */
  static async checkAvailability(
    profissional_id: string,
    data_hora: string
  ): Promise<boolean> {
    const supabase = await createClient();

    try {
      console.log('=== VERIFICANDO DISPONIBILIDADE ===');
      console.log('Input recebido:', { profissional_id, data_hora });

      // Extrair data e hora do datetime
      let dataObj;

      if (data_hora.includes('Z')) {
        dataObj = new Date(data_hora);
      } else if (data_hora.includes('T')) {
        dataObj = new Date(data_hora + (data_hora.includes('.') ? '' : '.000Z'));
      } else {
        dataObj = new Date(data_hora);
      }

      if (isNaN(dataObj.getTime())) {
        console.error('Data inválida:', data_hora);
        return false;
      }

      const data = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = dataObj.toISOString().split('T')[1].substring(0, 5); // HH:MM
      const diaSemana = dataObj.getDay(); // 0=domingo, 1=segunda, etc.

      console.log('Data/hora processadas:', { data, hora, diaSemana });

      // 1. Verificar se o profissional atende neste dia da semana
      const { data: configuracao, error: configError } = await supabase
        .from('agenda_configuracoes')
        .select('hora_inicio, hora_fim, intervalo_minutos')
        .eq('profissional_id', profissional_id)
        .eq('dia_semana', diaSemana)
        .single();

      if (configError || !configuracao) {
        console.log('Profissional não atende neste dia da semana:', { diaSemana, configError });
        return false;
      }

      console.log('Configuração encontrada:', configuracao);

      // 2. Verificar se o horário está dentro do expediente
      const horaMinutos = parseInt(hora.split(':')[0]) * 60 + parseInt(hora.split(':')[1]);
      const inicioMinutos = parseInt(configuracao.hora_inicio.split(':')[0]) * 60 + parseInt(configuracao.hora_inicio.split(':')[1]);
      const fimMinutos = parseInt(configuracao.hora_fim.split(':')[0]) * 60 + parseInt(configuracao.hora_fim.split(':')[1]);

      if (horaMinutos < inicioMinutos || horaMinutos >= fimMinutos) {
        console.log('Horário fora do expediente:', { horaMinutos, inicioMinutos, fimMinutos });
        return false;
      }

      // 3. Verificar se o horário está em um intervalo válido
      const intervaloMinutos = (horaMinutos - inicioMinutos) % configuracao.intervalo_minutos;
      if (intervaloMinutos !== 0) {
        console.log('Horário não está em um intervalo válido:', { intervaloMinutos });
        return false;
      }

      // 4. Verificar se não há exceção para esta data
      const { data: excecao } = await supabase
        .from('agenda_excecoes')
        .select('id')
        .eq('profissional_id', profissional_id)
        .eq('data', data)
        .single();

      if (excecao) {
        console.log('Data bloqueada por exceção:', excecao);
        return false;
      }

      // 5. Verificar se já existe agendamento neste horário
      const { data: agendamentoExistente } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('profissional_id', profissional_id)
        .eq('data_consulta', data_hora)
        .neq('status', 'cancelado')
        .single();

      if (agendamentoExistente) {
        console.log('Já existe agendamento neste horário:', agendamentoExistente);
        return false;
      }

      console.log('Horário disponível!');
      return true;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  }

  /**
   * Atualizar status do agendamento
   */
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


  /**
   * Cancelar agendamento
   */
  static async cancelAgendamento(id: string, motivo: string) {
    return this.updateAgendamentoStatus(id, { status: "cancelado", notas: motivo });
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
      .eq('paciente_id', user.id)
      .order('data_consulta', { ascending: true });

    if (error) {
      console.error('Erro ao buscar meus agendamentos:', error);
      throw error;
    }

    // Mapear para o formato esperado pelo frontend
    return data.map(ag => ({
      id: ag.id,
      usuarioId: ag.paciente_id,
      profissionalId: ag.profissional_id,
      profissionalNome: ag.profissional?.nome || 'Profissional',
      especialidade: ag.profissional?.especialidade || '',
      dataISO: ag.data_consulta,
      local: 'Clínica Resilience',
      status: ag.status,
      notas: ag.notas,
    }));
  }
}
