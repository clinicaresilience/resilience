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

  // Buscar TODOS os prontuários (para admin)
  static async getAllProntuarios() {
    const supabase = await createClient();

    const { data: consultas, error } = await supabase
      .from('agendamentos')
      .select(`
        id,
        data_consulta,
        modalidade,
        status,
        notas,
        paciente:paciente_id(
          id,
          nome,
          email
        ),
        profissional:profissional_id(
          id,
          nome,
          especialidade
        ),
        prontuario:prontuarios(
          id,
          arquivo
        )
      `)
      .not('prontuario', 'is', null)
      .order('data_consulta', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos os prontuários:', error);
      throw error;
    }

    // Transform to match expected format for admin dashboard
    const consultasFormatted = (consultas || []).map(consulta => {
      // Handle Supabase returning arrays for related data
      const pacienteData = Array.isArray(consulta.paciente) ? consulta.paciente[0] : consulta.paciente;
      const profissionalData = Array.isArray(consulta.profissional) ? consulta.profissional[0] : consulta.profissional;
      const prontuarioData = Array.isArray(consulta.prontuario) ? consulta.prontuario[0] : consulta.prontuario;

      return {
        id: consulta.id,
        paciente_id: pacienteData?.id,
        profissional_id: profissionalData?.id,
        data_consulta: consulta.data_consulta,
        status: consulta.status,
        modalidade: consulta.modalidade,
        notas: consulta.notas,
        paciente: pacienteData ? {
          nome: pacienteData.nome,
          email: pacienteData.email
        } : undefined,
        profissional: profissionalData ? {
          nome: profissionalData.nome,
          especialidade: profissionalData.especialidade
        } : undefined,
        prontuario: prontuarioData ? {
          id: prontuarioData.id,
          consulta_id: consulta.id,
          arquivo: prontuarioData.arquivo,
          criado_em: consulta.data_consulta,
          atualizado_em: consulta.data_consulta
        } : undefined
      };
    });

    return consultasFormatted;
  }
  // ======================================
  // Buscar pacientes atendidos por um profissional (usando nova tabela paciente_profissional)
  // ======================================
  static async getPacientesAtendidos(profissionalId: string): Promise<PacienteAtendido[]> {
    const supabase = await createClient();

    try {
      // NOVO: Buscar pacientes ativos na relação paciente_profissional
      const { data: pacientesProfissional, error: relacaoError } = await supabase
        .from('paciente_profissional')
        .select(`
          paciente_id,
          paciente:usuarios!paciente_profissional_paciente_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('profissional_id', profissionalId)
        .eq('ativo', true);

      if (relacaoError) {
        console.error('Erro ao buscar relação paciente-profissional:', relacaoError);
        throw relacaoError;
      }

      if (!pacientesProfissional || pacientesProfissional.length === 0) {
        return [];
      }

      const pacientesAtendidos: PacienteAtendido[] = [];

      // Para cada paciente ativo, buscar estatísticas de consultas
      for (const relacao of pacientesProfissional) {
        if (!relacao.paciente) continue;

        const pacienteData = Array.isArray(relacao.paciente) 
          ? relacao.paciente[0] 
          : relacao.paciente;

        if (!pacienteData) continue;

        // Buscar consultas concluídas deste paciente com este profissional
        const { data: consultas, error: consultasError } = await supabase
          .from('agendamentos')
          .select('id, data_consulta')
          .eq('paciente_id', pacienteData.id)
          .eq('profissional_id', profissionalId)
          .eq('status', 'concluido')
          .order('data_consulta', { ascending: false });

        if (consultasError) {
          console.error('Erro ao buscar consultas do paciente:', consultasError);
          continue;
        }

        const totalConsultas = consultas?.length || 0;

        // Exigir pelo menos 1 consulta concluída
        if (totalConsultas === 0) {
          console.log(`Paciente ${pacienteData.nome} sem consultas concluídas - não incluir`);
          continue;
        }

        const ultimaConsulta = consultas[0].data_consulta;

        pacientesAtendidos.push({
          id: pacienteData.id,
          nome: pacienteData.nome,
          email: pacienteData.email,
          ultimaConsulta,
          totalConsultas
        });
      }

      return pacientesAtendidos.sort((a, b) => 
        new Date(b.ultimaConsulta).getTime() - new Date(a.ultimaConsulta).getTime()
      );

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

      // Verificar se já existe um prontuário para este agendamento
      const { data: prontuarioExistente } = await supabase
        .from("prontuarios")
        .select("id")
        .eq("consulta_id", agendamento.id)
        .single();

      if (prontuarioExistente) {
        // Se já existe, atualizar
        return await this.atualizarProntuario(
          profissionalId,
          prontuarioExistente.id,
          texto,
          arquivoPdf
        );
      }

      // Preparar dados para inserção
      const dadosProntuario: {
        consulta_id: string;
        texto?: string | null;
        arquivo: Buffer;
      } = {
        consulta_id: agendamento.id,
        texto: texto,
        arquivo: arquivoPdf || Buffer.from(''), // Arquivo vazio se não fornecido
      };

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

      return prontuarios.map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
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

  // ======================================
  // Deletar prontuário
  // ======================================
  static async deletarProntuario(
    profissionalId: string,
    prontuarioId: string
  ): Promise<{ success: boolean }> {
    const supabase = await createClient();

    try {
      // Primeiro verificar se o prontuário pertence ao profissional
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .from("prontuarios")
        .select(`
          id,
          agendamentos!inner(
            profissional_id
          )
        `)
        .eq("id", prontuarioId)
        .eq("agendamentos.profissional_id", profissionalId)
        .single();

      if (ownershipError || !ownershipCheck) {

        throw new Error("Acesso negado: prontuário não pertence ao profissional ou não encontrado");
      }

      // Deletar o prontuário
      const { error: deleteError } = await supabase
        .from("prontuarios")
        .delete()
        .eq("id", prontuarioId);

      if (deleteError) {
        console.error("Erro ao deletar prontuário:", deleteError);
        throw deleteError;
      }

      return { success: true };

    } catch (error) {
      console.error("Erro no deletarProntuario:", error);
      throw error;
    }
  }

  // ======================================
  // Atualizar prontuário (adicionar/substituir PDF ou texto)
  // ======================================
  static async atualizarProntuario(
    profissionalId: string,
    prontuarioId: string,
    texto?: string | null,
    arquivoPdf?: Buffer | null
  ): Promise<ProntuarioData> {
    const supabase = await createClient();

    try {
      // Primeiro verificar se o prontuário pertence ao profissional
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .from("prontuarios")
        .select(`
          id,
          agendamentos!inner(
            profissional_id
          )
        `)
        .eq("id", prontuarioId)
        .eq("agendamentos.profissional_id", profissionalId)
        .single();

      if (ownershipError || !ownershipCheck) {
  
        throw new Error("Acesso negado: prontuário não pertence ao profissional ou não encontrado");
      }

      // Preparar dados para atualização
      const dadosAtualizacao: {
        texto?: string | null;
        arquivo?: Buffer | null;
        atualizado_em?: string;
      } = {
        atualizado_em: new Date().toISOString(),
      };

      if (texto !== undefined) {
        dadosAtualizacao.texto = texto;
      }

      if (arquivoPdf !== undefined) {
        dadosAtualizacao.arquivo = arquivoPdf;
      }

      // Atualizar o prontuário
      const { data: prontuario, error: updateError } = await supabase
        .from("prontuarios")
        .update(dadosAtualizacao)
        .eq("id", prontuarioId)
        .select("*")
        .single();

      if (updateError) {
        console.error("Erro ao atualizar prontuário:", updateError);
        throw updateError;
      }

      return prontuario;

    } catch (error) {
      console.error("Erro no atualizarProntuario:", error);
      throw error;
    }
  }

  // ======================================
  // Excluir prontuário (remove o registro completo)
  // ======================================
  static async excluirProntuario(
    profissionalId: string,
    prontuarioId: string
  ): Promise<{ success: boolean }> {
    const supabase = await createClient();

    try {
      // Primeiro verificar se o prontuário pertence ao profissional usando uma query mais simples
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .from("prontuarios")
        .select(`
          id,
          agendamentos!inner(
            profissional_id
          )
        `)
        .eq("id", prontuarioId)
        .eq("agendamentos.profissional_id", profissionalId)
        .single();

      if (ownershipError || !ownershipCheck) {
       
        throw new Error("Acesso negado: prontuário não pertence ao profissional ou não encontrado");
      }

      // Excluir o prontuário completamente
      const { error: deleteError } = await supabase
        .from("prontuarios")
        .delete()
        .eq("id", prontuarioId);

      if (deleteError) {
        console.error("Erro ao excluir prontuário:", deleteError);
        throw deleteError;
      }

      return { success: true };

    } catch (error) {
      console.error("Erro no excluirProntuario:", error);
      throw error;
    }
  }

}
