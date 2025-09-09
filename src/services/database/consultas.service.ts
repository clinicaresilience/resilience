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
  status_consulta: string;
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
  status_consulta: string;
  prontuario?: string;
  agendamento_id?: string;
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
      const { data: consultas, error } = await supabase
        .from('consultas')
        .select(`
          id,
          paciente_id,
          data_consulta,
          status_consulta,
          paciente:usuarios!consultas_paciente_id_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('profissional_id', profissionalId)
        .eq('status_consulta', 'concluido')
        .order('data_consulta', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pacientes atendidos:', error);
        throw error;
      }

      // Agrupar por paciente e calcular estatísticas
      const pacientesMap = new Map<string, PacienteAtendido>();

      consultas?.forEach((consulta: any) => {
        if (!consulta.paciente) return;

        const pacienteId = consulta.paciente.id;
        
        if (pacientesMap.has(pacienteId)) {
          const paciente = pacientesMap.get(pacienteId)!;
          paciente.totalConsultas += 1;
          
          // Atualizar última consulta se for mais recente
          if (new Date(consulta.data_consulta) > new Date(paciente.ultimaConsulta)) {
            paciente.ultimaConsulta = consulta.data_consulta;
          }
        } else {
          pacientesMap.set(pacienteId, {
            id: pacienteId,
            nome: consulta.paciente.nome,
            email: consulta.paciente.email,
            ultimaConsulta: consulta.data_consulta,
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
      // Buscar a consulta mais recente do paciente com este profissional
      const { data: consulta, error: consultaError } = await supabase
        .from('consultas')
        .select('*')
        .eq('profissional_id', profissionalId)
        .eq('paciente_id', pacienteId)
        .eq('status_consulta', 'concluido')
        .order('data_consulta', { ascending: false })
        .limit(1)
        .single();

      if (consultaError || !consulta) {
        throw new Error('Nenhuma consulta concluída encontrada para este paciente');
      }

      // Atualizar a consulta com o prontuário
      const { data: consultaAtualizada, error: updateError } = await supabase
        .from('consultas')
        .update({ 
          prontuario: arquivoPdf,
          updated_at: new Date().toISOString()
        })
        .eq('id', consulta.id)
        .select(`
          *,
          paciente:usuarios!consultas_paciente_id_fkey(nome, email)
        `)
        .single();

      if (updateError) {
        console.error('Erro ao atualizar consulta com prontuário:', updateError);
        throw updateError;
      }

      return consultaAtualizada as Consulta;

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
      const { data: consultas, error } = await supabase
        .from('consultas')
        .select(`
          *,
          paciente:usuarios!consultas_paciente_id_fkey(nome, email)
        `)
        .eq('profissional_id', profissionalId)
        .not('prontuario', 'is', null)
        .order('data_consulta', { ascending: false });

      if (error) {
        console.error('Erro ao buscar prontuários:', error);
        throw error;
      }

      return consultas as Consulta[];

    } catch (error) {
      console.error('Erro no getProntuarios:', error);
      throw error;
    }
  }
}
