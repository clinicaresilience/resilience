import { createClient } from '@/lib/server';

export interface PacienteAtendido {
  id: string;
  nome: string;
  email: string;
  ultimaConsulta: string;
  totalConsultas: number;
}

interface ConsultaComPaciente {
  id: string;
  paciente_id: string;
  data_consulta: string;
  status: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface Consulta {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_consulta: string;
  status: string;
  modalidade: string;
  local?: string;
  observacoes?: string;
  prontuario?: string;
  notas?: string;
  paciente?: {
    nome: string;
    email: string;
  };
}

export class ConsultasService {
  // ======================================
  // Buscar pacientes atendidos por um profissional
  // ======================================
  static async getPacientesAtendidos(profissionalId: string): Promise<PacienteAtendido[]> {
    const supabase = await createClient();

    try {
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          paciente_id,
          data_consulta,
          status,
          paciente:usuarios!agendamentos_paciente_id_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('profissional_id', profissionalId)
        .eq('status', 'concluido')
        .order('data_consulta', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pacientes atendidos:', error);
        throw error;
      }

      // Agrupar por paciente e calcular estatísticas
      const pacientesMap = new Map<string, PacienteAtendido>();

      agendamentos?.forEach((agendamento: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!agendamento.paciente) return;

        const pacienteId = agendamento.paciente.id;
        
        if (pacientesMap.has(pacienteId)) {
          const paciente = pacientesMap.get(pacienteId)!;
          paciente.totalConsultas += 1;
          
          // Atualizar última consulta se for mais recente
          if (new Date(agendamento.data_consulta) > new Date(paciente.ultimaConsulta)) {
            paciente.ultimaConsulta = agendamento.data_consulta;
          }
        } else {
          pacientesMap.set(pacienteId, {
            id: pacienteId,
            nome: agendamento.paciente.nome,
            email: agendamento.paciente.email,
            ultimaConsulta: agendamento.data_consulta,
            totalConsultas: 1
          });
        }
      });

      return Array.from(pacientesMap.values())
        .sort((a, b) => new Date(b.ultimaConsulta).getTime() - new Date(a.ultimaConsulta).getTime());

    } catch (error) {
      console.error('Erro no getPacientesAtendidos:', error);
      throw error;
    }
  }

  // ======================================
  // Criar prontuário (salvar PDF)
  // ======================================
  static async criarProntuario(
    profissionalId: string,
    pacienteId: string,
    arquivoPdf: string // Base64 ou URL do arquivo
  ): Promise<Consulta> {
    const supabase = await createClient();

    try {
      // Buscar o agendamento mais recente do paciente com este profissional
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('profissional_id', profissionalId)
        .eq('paciente_id', pacienteId)
        .eq('status', 'concluido')
        .order('data_consulta', { ascending: false })
        .limit(1)
        .single();

      if (agendamentoError || !agendamento) {
        throw new Error('Nenhuma consulta concluída encontrada para este paciente');
      }

      // Atualizar o agendamento com o prontuário
      const { data: agendamentoAtualizado, error: updateError } = await supabase
        .from('agendamentos')
        .update({ 
          prontuario: arquivoPdf,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamento.id)
        .select(`
          *,
          paciente:usuarios!agendamentos_paciente_id_fkey(nome, email)
        `)
        .single();

      if (updateError) {
        console.error('Erro ao atualizar agendamento com prontuário:', updateError);
        throw updateError;
      }

      return agendamentoAtualizado as Consulta;

    } catch (error) {
      console.error('Erro no criarProntuario:', error);
      throw error;
    }
  }

  // ======================================
  // Buscar prontuários de um profissional
  // ======================================
  static async getProntuarios(profissionalId: string): Promise<Consulta[]> {
    const supabase = await createClient();

    try {
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          paciente:usuarios!agendamentos_paciente_id_fkey(nome, email)
        `)
        .eq('profissional_id', profissionalId)
        .not('prontuario', 'is', null)
        .order('data_consulta', { ascending: false });

      if (error) {
        console.error('Erro ao buscar prontuários:', error);
        throw error;
      }

      return agendamentos as Consulta[];

    } catch (error) {
      console.error('Erro no getProntuarios:', error);
      throw error;
    }
  }
}
