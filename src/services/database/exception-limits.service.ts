import { createClient } from '@/lib/server';

export interface ExceptionLimit {
  id: string;
  profissional_id: string | null;
  tipo_excecao: string;
  limite_diario: string; // PostgreSQL interval as string
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  profissional?: {
    nome: string;
    email: string;
  };
}

export class ExceptionLimitsService {
  /**
   * Criar um novo limite de exceção
   */
  static async createExceptionLimit(data: {
    profissional_id: string | null;
    tipo_excecao: string;
    limite_diario: string; // Format: '1 hour', '30 minutes', etc
    ativo?: boolean;
  }) {
    const supabase = await createClient();
    
    const { data: result, error } = await supabase
      .from('limite_excecao_profissional')
      .insert({
        profissional_id: data.profissional_id,
        tipo_excecao: data.tipo_excecao,
        limite_diario: data.limite_diario,
        ativo: data.ativo ?? true,
      })
      .select(`
        *,
        profissional:usuarios(nome, email)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar limite de exceção:', error);
      throw error;
    }

    return result as ExceptionLimit;
  }

  /**
   * Listar limites de exceção
   */
  static async listExceptionLimits(filters?: {
    profissional_id?: string;
    tipo_excecao?: string;
    ativo?: boolean;
  }) {
    const supabase = await createClient();
    
    let query = supabase
      .from('limite_excecao_profissional')
      .select(`
        *,
        profissional:usuarios(nome, email)
      `);

    if (filters?.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters?.tipo_excecao) {
      query = query.eq('tipo_excecao', filters.tipo_excecao);
    }

    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    const { data, error } = await query.order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao listar limites de exceção:', error);
      throw error;
    }

    return data as ExceptionLimit[];
  }

  /**
   * Buscar limite por ID
   */
  static async getExceptionLimitById(id: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('limite_excecao_profissional')
      .select(`
        *,
        profissional:usuarios(nome, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar limite de exceção:', error);
      return null;
    }

    return data as ExceptionLimit;
  }

  /**
   * Atualizar limite de exceção
   */
  static async updateExceptionLimit(id: string, updates: Partial<ExceptionLimit>) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('limite_excecao_profissional')
      .update({
        ...updates,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        profissional:usuarios(nome, email)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar limite de exceção:', error);
      throw error;
    }

    return data as ExceptionLimit;
  }

  /**
   * Deletar limite de exceção
   */
  static async deleteExceptionLimit(id: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('limite_excecao_profissional')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar limite de exceção:', error);
      throw error;
    }

    return true;
  }

  /**
   * Buscar limite para profissional e tipo específico
   */
  static async getLimitForProfessional(profissionalId: string, tipoExcecao: string = 'qualquer') {
    const supabase = await createClient();
    
    // Primeiro tenta buscar limite específico do profissional
    let { data } = await supabase
      .from('limite_excecao_profissional')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('tipo_excecao', tipoExcecao)
      .eq('ativo', true)
      .single();

    // Se não encontrou, busca regra global
    if (!data) {
      const result = await supabase
        .from('limite_excecao_profissional')
        .select('*')
        .is('profissional_id', null)
        .eq('tipo_excecao', tipoExcecao)
        .eq('ativo', true)
        .single();
      
      data = result.data;
    }

    return data as ExceptionLimit | null;
  }
}
