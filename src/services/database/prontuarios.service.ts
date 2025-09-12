import { createClient } from '@/lib/server';

// Interface para o prontuário principal
export interface Prontuario {
  id: string;
  paciente_id: string;
  profissional_atual_id: string;
  criado_em: string;
  atualizado_em: string;
}

// Interface para registros do prontuário
export interface ProntuarioRegistro {
  id: string;
  prontuario_id: string;
  profissional_id: string;
  texto: string;
  criado_em: string;
  assinatura_digital: {
    nome: string;
    cpf: string;
    crp: string;
    data: string;
  };
}

// Interface para prontuário completo (com registros)
export interface ProntuarioCompleto {
  id: string;
  paciente_id: string;
  profissional_atual_id: string;
  criado_em: string;
  atualizado_em: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  };
  registros: ProntuarioRegistro[];
}

// Interface para dados do profissional (para assinatura)
export interface DadosProfissional {
  id: string;
  nome: string;
  cpf: string;
  crp: string;
}

export class ProntuariosService {

  // ======================================
  // Buscar ou criar prontuário para um paciente
  // ======================================
  static async obterProntuarioPaciente(
    pacienteId: string,
    profissionalId: string
  ): Promise<Prontuario> {
    const supabase = await createClient();

    try {
      // Primeiro, tentar buscar prontuário existente
      const { data: prontuarioExistente, error: buscarError } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('paciente_id', pacienteId)
        .single();

      if (buscarError && buscarError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar prontuário:', buscarError);
        throw buscarError;
      }

      if (prontuarioExistente) {
        // Se prontuário existe, atualizar profissional atual se necessário
        if (prontuarioExistente.profissional_atual_id !== profissionalId) {
          const { data: prontuarioAtualizado, error: atualizarError } = await supabase
            .from('prontuarios')
            .update({
              profissional_atual_id: profissionalId,
              atualizado_em: new Date().toISOString()
            })
            .eq('id', prontuarioExistente.id)
            .select('*')
            .single();

          if (atualizarError) {
            console.error('Erro ao atualizar profissional atual:', atualizarError);
            throw atualizarError;
          }

          return prontuarioAtualizado;
        }

        return prontuarioExistente;
      }

      // Se não existe, criar novo prontuário
      const { data: novoProntuario, error: criarError } = await supabase
        .from('prontuarios')
        .insert([{
          paciente_id: pacienteId,
          profissional_atual_id: profissionalId
        }])
        .select('*')
        .single();

      if (criarError) {
        console.error('Erro ao criar prontuário:', criarError);
        throw criarError;
      }

      return novoProntuario;

    } catch (error) {
      console.error('Erro no obterProntuarioPaciente:', error);
      throw error;
    }
  }

  // ======================================
  // Criar novo registro no prontuário
  // ======================================
  static async criarRegistro(
    profissionalId: string,
    pacienteId: string,
    texto: string,
    cpfProfissional?: string
  ): Promise<ProntuarioRegistro> {
    const supabase = await createClient();

    try {
      // Obter ou criar prontuário
      const prontuario = await this.obterProntuarioPaciente(pacienteId, profissionalId);

      // Verificar se o profissional atual pode adicionar registros
      if (prontuario.profissional_atual_id !== profissionalId) {
        throw new Error('Apenas o profissional atual pode adicionar registros ao prontuário');
      }

      // Buscar dados do profissional para assinatura digital
      const { data: profissional, error: profissionalError } = await supabase
        .from('usuarios')
        .select('id, nome, cpf, crp, especialidade')
        .eq('id', profissionalId)
        .single();

      if (profissionalError) {
        console.error('Erro ao buscar profissional:', profissionalError);
        throw new Error(`Erro ao buscar dados do profissional: ${profissionalError.message}`);
      }

      if (!profissional) {
        throw new Error('Profissional não encontrado no banco de dados');
      }

      // Criar assinatura digital (usar especialidade como fallback se CRP não existir)
      const assinaturaDigital = {
        nome: profissional.nome || 'Nome não informado',
        cpf: cpfProfissional || profissional.cpf || 'N/A',
        crp: profissional.crp || profissional.especialidade || 'N/A',
        data: new Date().toISOString()
      };

      // Inserir novo registro
      const { data: novoRegistro, error: inserirError } = await supabase
        .from('prontuarios_registros')
        .insert([{
          prontuario_id: prontuario.id,
          profissional_id: profissionalId,
          texto: texto,
          assinatura_digital: assinaturaDigital
        }])
        .select('*')
        .single();

      if (inserirError) {
        console.error('Erro ao inserir registro:', inserirError);
        throw inserirError;
      }

      // Atualizar timestamp do prontuário
      await supabase
        .from('prontuarios')
        .update({ atualizado_em: new Date().toISOString() })
        .eq('id', prontuario.id);

      return novoRegistro;

    } catch (error) {
      console.error('Erro no criarRegistro:', error);
      throw error;
    }
  }

  // ======================================
  // Buscar prontuário completo com registros
  // ======================================
  static async obterProntuarioCompleto(
    pacienteId: string,
    profissionalId: string
  ): Promise<ProntuarioCompleto | null> {
    const supabase = await createClient();

    try {
      // Buscar prontuário
      const { data: prontuario, error: prontuarioError } = await supabase
        .from('prontuarios')
        .select(`
          *,
          paciente:usuarios!prontuarios_paciente_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('paciente_id', pacienteId)
        .single();

      if (prontuarioError) {
        if (prontuarioError.code === 'PGRST116') {
          return null; // Prontuário não existe
        }
        throw prontuarioError;
      }

      // Buscar todos os registros do prontuário
      const { data: registros, error: registrosError } = await supabase
        .from('prontuarios_registros')
        .select('*')
        .eq('prontuario_id', prontuario.id)
        .order('criado_em', { ascending: true });

      if (registrosError) {
        console.error('Erro ao buscar registros:', registrosError);
        throw registrosError;
      }

      // Verificar se o profissional tem acesso
      const podeAcessar = 
        prontuario.profissional_atual_id === profissionalId || // É o profissional atual
        registros.some(r => r.profissional_id === profissionalId); // Já criou registros anteriormente

      if (!podeAcessar) {
        throw new Error('Profissional não tem acesso a este prontuário');
      }

      const pacienteData = Array.isArray(prontuario.paciente) 
        ? prontuario.paciente[0] 
        : prontuario.paciente;

      return {
        id: prontuario.id,
        paciente_id: prontuario.paciente_id,
        profissional_atual_id: prontuario.profissional_atual_id,
        criado_em: prontuario.criado_em,
        atualizado_em: prontuario.atualizado_em,
        paciente: pacienteData,
        registros: registros || []
      };

    } catch (error) {
      console.error('Erro no obterProntuarioCompleto:', error);
      throw error;
    }
  }

  // ======================================
  // Listar prontuários do profissional (pacientes que pode acessar)
  // ======================================
  static async listarProntuariosProfissional(
    profissionalId: string
  ): Promise<ProntuarioCompleto[]> {
    const supabase = await createClient();

    try {
      // Primeiro, buscar prontuários onde o profissional é atual
      const { data: prontuariosAtuais, error: prontuariosAtuaisError } = await supabase
        .from('prontuarios')
        .select(`
          *,
          paciente:usuarios!prontuarios_paciente_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('profissional_atual_id', profissionalId);

      if (prontuariosAtuaisError) {
        console.error('Erro ao buscar prontuários atuais:', prontuariosAtuaisError);
        throw prontuariosAtuaisError;
      }

      // Segundo, buscar prontuários onde o profissional criou registros
      const { data: registrosDoProfissional, error: registrosError } = await supabase
        .from('prontuarios_registros')
        .select('prontuario_id')
        .eq('profissional_id', profissionalId);

      if (registrosError) {
        console.error('Erro ao buscar registros do profissional:', registrosError);
        throw registrosError;
      }

      const prontuarioIdsComRegistros = [...new Set(registrosDoProfissional?.map(r => r.prontuario_id) || [])];
      
      let prontuariosComRegistros: Array<{
        id: string;
        paciente_id: string;
        profissional_atual_id: string;
        criado_em: string;
        atualizado_em: string;
        paciente: {
          id: string;
          nome: string;
          email: string;
        };
      }> = [];
      
      if (prontuarioIdsComRegistros.length > 0) {
        const { data, error } = await supabase
          .from('prontuarios')
          .select(`
            *,
            paciente:usuarios!prontuarios_paciente_fkey(
              id,
              nome,
              email
            )
          `)
          .in('id', prontuarioIdsComRegistros);

        if (error) {
          console.error('Erro ao buscar prontuários com registros:', error);
        } else {
          prontuariosComRegistros = data || [];
        }
      }

      // Combinar e remover duplicatas
      const todosOsProntuarios = [...(prontuariosAtuais || []), ...prontuariosComRegistros];
      const prontuariosUnicos = todosOsProntuarios.filter((prontuario, index, array) => 
        array.findIndex(p => p.id === prontuario.id) === index
      );

      const resultado: ProntuarioCompleto[] = [];

      // Para cada prontuário, buscar os registros
      for (const prontuario of prontuariosUnicos) {
        const { data: registros, error: registrosError } = await supabase
          .from('prontuarios_registros')
          .select('*')
          .eq('prontuario_id', prontuario.id)
          .order('criado_em', { ascending: true });

        if (registrosError) {
          console.error('Erro ao buscar registros:', registrosError);
          continue;
        }

        const pacienteData = Array.isArray(prontuario.paciente) 
          ? prontuario.paciente[0] 
          : prontuario.paciente;

        resultado.push({
          id: prontuario.id,
          paciente_id: prontuario.paciente_id,
          profissional_atual_id: prontuario.profissional_atual_id,
          criado_em: prontuario.criado_em,
          atualizado_em: prontuario.atualizado_em,
          paciente: pacienteData,
          registros: registros || []
        });
      }

      return resultado.sort((a, b) => 
        new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()
      );

    } catch (error) {
      console.error('Erro no listarProntuariosProfissional:', error);
      throw error;
    }
  }

  // ======================================
  // Método auxiliar para obter IDs de prontuários onde profissional criou registros
  // ======================================
  private static async obterProntuariosComRegistrosDoProfissional(
    profissionalId: string
  ): Promise<string> {
    const supabase = await createClient();

    try {
      const { data: registros, error } = await supabase
        .from('prontuarios_registros')
        .select('prontuario_id')
        .eq('profissional_id', profissionalId);

      if (error) {
        console.error('Erro ao buscar registros do profissional:', error);
        return '';
      }

      const prontuarioIds = [...new Set(registros?.map(r => r.prontuario_id) || [])];
      return prontuarioIds.length > 0 ? prontuarioIds.join(',') : '';

    } catch (error) {
      console.error('Erro no obterProntuariosComRegistrosDoProfissional:', error);
      return '';
    }
  }

  // ======================================
  // Alterar profissional responsável
  // ======================================
  static async alterarProfissionalResponsavel(
    prontuarioId: string,
    novoProfissionalId: string,
    profissionalAtualId: string
  ): Promise<Prontuario> {
    const supabase = await createClient();

    try {
      // Verificar se o profissional atual tem permissão
      const { data: prontuario, error: buscarError } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('id', prontuarioId)
        .eq('profissional_atual_id', profissionalAtualId)
        .single();

      if (buscarError || !prontuario) {
        throw new Error('Prontuário não encontrado ou profissional não autorizado');
      }

      // Verificar se o novo profissional existe
      const { data: novoProfissional, error: profissionalError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', novoProfissionalId)
        .eq('tipo_usuario', 'profissional')
        .single();

      if (profissionalError || !novoProfissional) {
        throw new Error('Novo profissional não encontrado');
      }

      // Atualizar profissional responsável
      const { data: prontuarioAtualizado, error: atualizarError } = await supabase
        .from('prontuarios')
        .update({
          profissional_atual_id: novoProfissionalId,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', prontuarioId)
        .select('*')
        .single();

      if (atualizarError) {
        console.error('Erro ao atualizar profissional responsável:', atualizarError);
        throw atualizarError;
      }

      return prontuarioAtualizado;

    } catch (error) {
      console.error('Erro no alterarProfissionalResponsavel:', error);
      throw error;
    }
  }

  // ======================================
  // Buscar todos os prontuários (para admin)
  // ======================================
  static async listarTodosProntuarios(): Promise<ProntuarioCompleto[]> {
    const supabase = await createClient();

    try {
      const { data: prontuarios, error: prontuariosError } = await supabase
        .from('prontuarios')
        .select(`
          *,
          paciente:usuarios!prontuarios_paciente_fkey(
            id,
            nome,
            email
          )
        `)
        .order('atualizado_em', { ascending: false });

      if (prontuariosError) {
        console.error('Erro ao buscar todos os prontuários:', prontuariosError);
        throw prontuariosError;
      }

      const resultado: ProntuarioCompleto[] = [];

      // Para cada prontuário, buscar os registros
      for (const prontuario of prontuarios || []) {
        const { data: registros, error: registrosError } = await supabase
          .from('prontuarios_registros')
          .select('*')
          .eq('prontuario_id', prontuario.id)
          .order('criado_em', { ascending: true });

        if (registrosError) {
          console.error('Erro ao buscar registros:', registrosError);
          continue;
        }

        const pacienteData = Array.isArray(prontuario.paciente) 
          ? prontuario.paciente[0] 
          : prontuario.paciente;

        resultado.push({
          id: prontuario.id,
          paciente_id: prontuario.paciente_id,
          profissional_atual_id: prontuario.profissional_atual_id,
          criado_em: prontuario.criado_em,
          atualizado_em: prontuario.atualizado_em,
          paciente: pacienteData,
          registros: registros || []
        });
      }

      return resultado;

    } catch (error) {
      console.error('Erro no listarTodosProntuarios:', error);
      throw error;
    }
  }
}
