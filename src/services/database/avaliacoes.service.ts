import { createClient } from '@/lib/server';

export interface AvaliacaoProfissional {
  id: string;
  agendamento_id: string;
  profissional_id: string;
  paciente_id: string;
  nota: number;
  comentario?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AvaliacaoComDetalhes extends AvaliacaoProfissional {
  paciente: {
    nome: string;
    email: string;
  };
  agendamento: {
    data_consulta: string;
    modalidade: string;
  };
}

export interface MediaAvaliacao {
  profissional_id: string;
  nome_profissional: string;
  especialidade: string;
  media_avaliacao: number;
  total_avaliacoes: number;
}

export interface CriarAvaliacaoData {
  agendamento_id: string;
  profissional_id: string;
  paciente_id: string;
  nota: number;
  comentario?: string;
}

export interface AgendamentoParaAvaliar {
  id: string;
  data_consulta: string;
  modalidade: string;
  profissional: {
    id: string;
    nome: string;
    especialidade: string;
  };
}

interface AvaliacaoRawData {
  id: string;
  agendamento_id: string;
  profissional_id: string;
  paciente_id: string;
  nota: number;
  comentario: string | null;
  criado_em: string;
  atualizado_em: string;
  paciente: {
    nome: string;
    email: string;
  } | {
    nome: string;
    email: string;
  }[];
  agendamento: {
    data_consulta: string;
    modalidade: string;
  } | {
    data_consulta: string;
    modalidade: string;
  }[];
}

export class AvaliacoesService {
  
  /**
   * Verifica se uma consulta está concluída e se o paciente pode avaliar
   */
  static async verificarSeConsultaConcluida(agendamentoId: string, pacienteId: string): Promise<boolean> {
    const supabase = await createClient();

    try {
      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .select('id, status, paciente_id')
        .eq('id', agendamentoId)
        .eq('paciente_id', pacienteId)
        .eq('status', 'concluido')
        .single();

      if (error || !agendamento) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar consulta concluída:', error);
      return false;
    }
  }

  /**
   * Verifica se já existe uma avaliação para um agendamento
   */
  static async verificarAvaliacaoExistente(agendamentoId: string): Promise<boolean> {
    const supabase = await createClient();

    try {
      const { data: avaliacao, error } = await supabase
        .from('avaliacoes_profissionais')
        .select('id')
        .eq('agendamento_id', agendamentoId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao verificar avaliação existente:', error);
        return false;
      }

      return !!avaliacao;
    } catch (error) {
      console.error('Erro ao verificar avaliação existente:', error);
      return false;
    }
  }

  /**
   * Criar uma nova avaliação
   */
  static async criarAvaliacao(dadosAvaliacao: CriarAvaliacaoData): Promise<AvaliacaoProfissional> {
    const supabase = await createClient();

    try {
      // Verificar se a consulta está concluída
      const consultaConcluida = await this.verificarSeConsultaConcluida(
        dadosAvaliacao.agendamento_id, 
        dadosAvaliacao.paciente_id
      );

      if (!consultaConcluida) {
        throw new Error('Consulta não encontrada ou não está concluída');
      }

      // Verificar se já existe avaliação para este agendamento
      const avaliacaoExiste = await this.verificarAvaliacaoExistente(dadosAvaliacao.agendamento_id);

      if (avaliacaoExiste) {
        throw new Error('Já existe uma avaliação para esta consulta');
      }

      // Validar nota
      if (dadosAvaliacao.nota < 0 || dadosAvaliacao.nota > 5) {
        throw new Error('A nota deve estar entre 0 e 5');
      }

      // Criar a avaliação
      const { data: avaliacao, error } = await supabase
        .from('avaliacoes_profissionais')
        .insert([{
          agendamento_id: dadosAvaliacao.agendamento_id,
          profissional_id: dadosAvaliacao.profissional_id,
          paciente_id: dadosAvaliacao.paciente_id,
          nota: dadosAvaliacao.nota,
          comentario: dadosAvaliacao.comentario || null
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar avaliação:', error);
        throw error;
      }

      return avaliacao;
    } catch (error) {
      console.error('Erro no criarAvaliacao:', error);
      throw error;
    }
  }

  /**
   * Buscar avaliações de um profissional específico (apenas admins)
   */
  static async buscarAvaliacoesPorProfissional(profissionalId: string): Promise<AvaliacaoComDetalhes[]> {
    const supabase = await createClient();

    try {
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes_profissionais')
        .select(`
          id,
          agendamento_id,
          profissional_id,
          paciente_id,
          nota,
          comentario,
          criado_em,
          atualizado_em,
          paciente:usuarios!avaliacoes_profissionais_paciente_id_fkey(
            nome,
            email
          ),
          agendamento:agendamentos!avaliacoes_profissionais_agendamento_id_fkey(
            data_consulta,
            modalidade
          )
        `)
        .eq('profissional_id', profissionalId)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar avaliações:', error);
        throw error;
      }

      return (avaliacoes || []).map((avaliacao: AvaliacaoRawData) => {
        const pacienteData = Array.isArray(avaliacao.paciente) ? avaliacao.paciente[0] : avaliacao.paciente;
        const agendamentoData = Array.isArray(avaliacao.agendamento) ? avaliacao.agendamento[0] : avaliacao.agendamento;

        return {
          id: avaliacao.id,
          agendamento_id: avaliacao.agendamento_id,
          profissional_id: avaliacao.profissional_id,
          paciente_id: avaliacao.paciente_id,
          nota: avaliacao.nota,
          comentario: avaliacao.comentario || undefined,
          criado_em: avaliacao.criado_em,
          atualizado_em: avaliacao.atualizado_em,
          paciente: {
            nome: pacienteData?.nome || 'N/A',
            email: pacienteData?.email || 'N/A'
          },
          agendamento: {
            data_consulta: agendamentoData?.data_consulta || '',
            modalidade: agendamentoData?.modalidade || 'N/A'
          }
        };
      });
    } catch (error) {
      console.error('Erro no buscarAvaliacoesPorProfissional:', error);
      throw error;
    }
  }

  /**
   * Calcular média de avaliação de um profissional
   */
  static async calcularMediaAvaliacao(profissionalId: string): Promise<{ media: number; total: number }> {
    const supabase = await createClient();

    try {
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes_profissionais')
        .select('nota')
        .eq('profissional_id', profissionalId);

      if (error) {
        console.error('Erro ao calcular média:', error);
        throw error;
      }

      if (!avaliacoes || avaliacoes.length === 0) {
        return { media: 0, total: 0 };
      }

      const total = avaliacoes.length;
      const soma = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
      const media = parseFloat((soma / total).toFixed(1));

      return { media, total };
    } catch (error) {
      console.error('Erro no calcularMediaAvaliacao:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as médias de avaliação dos profissionais (apenas admins)
   */
  static async buscarMediasProfissionais(): Promise<MediaAvaliacao[]> {
    const supabase = await createClient();

    try {
      // Buscar todos os profissionais
      const { data: profissionais, error: profissionaisError } = await supabase
        .from('usuarios')
        .select('id, nome, especialidade')
        .eq('tipo_usuario', 'profissional');

      if (profissionaisError) {
        console.error('Erro ao buscar profissionais:', profissionaisError);
        throw profissionaisError;
      }

      const medias: MediaAvaliacao[] = [];

      // Para cada profissional, calcular a média
      for (const profissional of profissionais || []) {
        const { media, total } = await this.calcularMediaAvaliacao(profissional.id);
        
        medias.push({
          profissional_id: profissional.id,
          nome_profissional: profissional.nome,
          especialidade: profissional.especialidade || 'N/A',
          media_avaliacao: media,
          total_avaliacoes: total
        });
      }

      // Ordenar por média decrescente, depois por total de avaliações
      return medias.sort((a, b) => {
        if (b.media_avaliacao !== a.media_avaliacao) {
          return b.media_avaliacao - a.media_avaliacao;
        }
        return b.total_avaliacoes - a.total_avaliacoes;
      });

    } catch (error) {
      console.error('Erro no buscarMediasProfissionais:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as avaliações do sistema (apenas admins)
   */
  static async buscarTodasAvaliacoes(): Promise<AvaliacaoComDetalhes[]> {
    const supabase = await createClient();

    try {
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes_profissionais')
        .select(`
          id,
          agendamento_id,
          profissional_id,
          paciente_id,
          nota,
          comentario,
          criado_em,
          atualizado_em,
          paciente:usuarios!avaliacoes_profissionais_paciente_id_fkey(
            nome,
            email
          ),
          profissional:usuarios!avaliacoes_profissionais_profissional_id_fkey(
            nome,
            especialidade
          ),
          agendamento:agendamentos!avaliacoes_profissionais_agendamento_id_fkey(
            data_consulta,
            modalidade
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar todas as avaliações:', error);
        throw error;
      }

      return (avaliacoes || []).map((avaliacao: AvaliacaoRawData) => {
        const pacienteData = Array.isArray(avaliacao.paciente) ? avaliacao.paciente[0] : avaliacao.paciente;
        const agendamentoData = Array.isArray(avaliacao.agendamento) ? avaliacao.agendamento[0] : avaliacao.agendamento;

        return {
          id: avaliacao.id,
          agendamento_id: avaliacao.agendamento_id,
          profissional_id: avaliacao.profissional_id,
          paciente_id: avaliacao.paciente_id,
          nota: avaliacao.nota,
          comentario: avaliacao.comentario || undefined,
          criado_em: avaliacao.criado_em,
          atualizado_em: avaliacao.atualizado_em,
          paciente: {
            nome: pacienteData?.nome || 'N/A',
            email: pacienteData?.email || 'N/A'
          },
          agendamento: {
            data_consulta: agendamentoData?.data_consulta || '',
            modalidade: agendamentoData?.modalidade || 'N/A'
          }
        };
      });
    } catch (error) {
      console.error('Erro no buscarTodasAvaliacoes:', error);
      throw error;
    }
  }

  /**
   * Buscar agendamentos concluídos que ainda não foram avaliados por um paciente
   */
  static async buscarAgendamentosParaAvaliar(pacienteId: string): Promise<AgendamentoParaAvaliar[]> {
    const supabase = await createClient();

    try {
      // Buscar agendamentos concluídos do paciente
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_consulta,
          modalidade,
          profissional:usuarios!agendamentos_profissional_id_fkey(
            id,
            nome,
            especialidade
          )
        `)
        .eq('paciente_id', pacienteId)
        .eq('status', 'concluido')
        .order('data_consulta', { ascending: false });

      if (agendamentosError) {
        console.error('Erro ao buscar agendamentos:', agendamentosError);
        throw agendamentosError;
      }

      if (!agendamentos || agendamentos.length === 0) {
        return [];
      }

      // Verificar quais ainda não foram avaliados
      const agendamentosParaAvaliar: AgendamentoParaAvaliar[] = [];

      for (const agendamento of agendamentos) {
        const avaliacaoExiste = await this.verificarAvaliacaoExistente(agendamento.id);
        
        if (!avaliacaoExiste) {
          const profissionalData = Array.isArray(agendamento.profissional) ? agendamento.profissional[0] : agendamento.profissional;
          
          agendamentosParaAvaliar.push({
            id: agendamento.id,
            data_consulta: agendamento.data_consulta,
            modalidade: agendamento.modalidade,
            profissional: {
              id: profissionalData?.id || '',
              nome: profissionalData?.nome || 'N/A',
              especialidade: profissionalData?.especialidade || 'N/A'
            }
          });
        }
      }

      return agendamentosParaAvaliar;

    } catch (error) {
      console.error('Erro no buscarAgendamentosParaAvaliar:', error);
      throw error;
    }
  }
}
