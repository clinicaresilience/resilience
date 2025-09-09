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
  prontuario?: string | ProntuarioData;
  notas?: string;
  paciente?: {
    nome: string;
    email: string;
  };
}

export interface ProntuarioData {
  id: string;
  consulta_id: string;
  texto: string | null;
  arquivo: Buffer | null;
  criado_em: string;
  atualizado_em: string;
}

export interface ConsultaComProntuario {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_consulta: string;
  status: string;
  modalidade: string;
  local?: string;
  observacoes?: string;
  notas?: string;
  paciente?: {
    nome: string;
    email: string;
  };
  prontuario: ProntuarioData;
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
  // Criar prontuário (salvar texto e/ou PDF)
  // ======================================
  static async criarProntuario(
    profissionalId: string,
    pacienteId: string,
    texto: string | null = null,
    arquivoPdf: Buffer | null = null
  ): Promise<ProntuarioData> {
    const supabase = await createClient();

    try {
      // Buscar o agendamento mais recente do paciente com este profissional
      const { data: agendamento, error: agendamentoError } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("profissional_id", profissionalId)
        .eq("paciente_id", pacienteId)
        .eq("status", "concluido")
        .order("data_consulta", { ascending: false })
        .limit(1)
        .single();

      if (agendamentoError || !agendamento) {
        throw new Error("Nenhuma consulta concluída encontrada para este paciente");
      }

      // Preparar dados para inserção
      const dadosProntuario: {
        consulta_id: string;
        texto?: string;
        arquivo?: Buffer;
      } = {
        consulta_id: agendamento.id,
      };

      if (texto) {
        dadosProntuario.texto = texto;
      }

      if (arquivoPdf) {
        dadosProntuario.arquivo = arquivoPdf;
      }

      // Inserir o prontuário na tabela prontuarios
      const { data: prontuario, error: insertError } = await supabase
        .from("prontuarios")
        .insert([dadosProntuario])
        .select("*")
        .single();

      if (insertError) {
        console.error("Erro ao inserir prontuário:", insertError);
        throw insertError;
      }

      return prontuario;

    } catch (error) {
      console.error("Erro no criarProntuario:", error);
      throw error;
    }
  }

  // ======================================
  // Buscar prontuários de um profissional
  // ======================================
  static async getProntuarios(profissionalId: string): Promise<ConsultaComProntuario[]> {
    const supabase = await createClient();

    try {
      const { data: prontuarios, error } = await supabase
        .from('prontuarios')
        .select(`
    id,
    consulta_id,
    texto,
    arquivo,
    criado_em,
    atualizado_em,
    agendamento:consulta_id!inner(
      id,
      paciente_id,
      profissional_id,
      data_consulta,
      modalidade,
      status,
      notas,
      paciente:usuarios!agendamentos_paciente_id_fkey(
        nome,
        email
      )
    )
  `)
        .eq('agendamento.profissional_id', profissionalId)
        .order('criado_em', { ascending: false });


      if (error) {
        console.error('Erro ao buscar prontuários:', error);
        throw error;
      }

      return prontuarios.map((p: any) => ({
        id: p.agendamento.id,
        paciente_id: p.agendamento.paciente_id,
        profissional_id: p.agendamento.profissional_id,
        data_consulta: p.agendamento.data_consulta,
        status: p.agendamento.status,
        modalidade: p.agendamento.modalidade,
        observacoes: p.agendamento.notas || undefined,
        paciente: p.agendamento.paciente || undefined,
        prontuario: {
          id: p.id,
          consulta_id: p.consulta_id,
          texto: p.texto,
          arquivo: p.arquivo,
          criado_em: p.criado_em,
          atualizado_em: p.atualizado_em
        }
      }));

    } catch (error) {
      console.error('Erro no getProntuarios:', error);
      throw error;
    }
  }

}
