import { createClient } from '@/lib/server';
import { CompanySector, CreateCompanySectorDto, UpdateCompanySectorDto } from '@/types/company-sectors';

export class CompanySectorsService {
  /**
   * Listar todos os setores de uma empresa
   */
  static async listSectorsByCompany(
    empresaId: string,
    filters?: { ativo?: boolean }
  ): Promise<CompanySector[]> {
    const supabase = await createClient();

    let query = supabase
      .from('empresa_setores')
      .select('*')
      .eq('empresa_id', empresaId);

    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao listar setores:', error);
      throw error;
    }

    return data as CompanySector[];
  }

  /**
   * Buscar setor por ID
   */
  static async getSectorById(setorId: string): Promise<CompanySector | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('empresa_setores')
      .select('*')
      .eq('id', setorId)
      .single();

    if (error) {
      console.error('Erro ao buscar setor:', error);
      return null;
    }

    return data as CompanySector;
  }

  /**
   * Criar novo setor
   */
  static async createSector(
    empresaId: string,
    sectorData: CreateCompanySectorDto
  ): Promise<CompanySector> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('empresa_setores')
      .insert({
        empresa_id: empresaId,
        nome: sectorData.nome.trim(),
        ativo: sectorData.ativo ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar setor:', error);
      throw error;
    }

    return data as CompanySector;
  }

  /**
   * Atualizar setor existente
   */
  static async updateSector(
    setorId: string,
    updates: UpdateCompanySectorDto
  ): Promise<CompanySector> {
    const supabase = await createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.nome !== undefined) {
      updateData.nome = updates.nome.trim();
    }

    if (updates.ativo !== undefined) {
      updateData.ativo = updates.ativo;
    }

    const { data, error } = await supabase
      .from('empresa_setores')
      .update(updateData)
      .eq('id', setorId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar setor:', error);
      throw error;
    }

    return data as CompanySector;
  }

  /**
   * Deletar setor (soft delete - desativa)
   */
  static async deleteSector(setorId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('empresa_setores')
      .delete()
      .eq('id', setorId);

    if (error) {
      console.error('Erro ao deletar setor:', error);
      throw error;
    }

    return true;
  }

  /**
   * Verificar se já existe um setor com o mesmo nome na empresa
   */
  static async sectorNameExists(
    empresaId: string,
    nome: string,
    excludeSetorId?: string
  ): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase
      .from('empresa_setores')
      .select('id')
      .eq('empresa_id', empresaId)
      .ilike('nome', nome.trim());

    if (excludeSetorId) {
      query = query.neq('id', excludeSetorId);
    }

    const { data, error } = await query.single();

    return !error && !!data;
  }

  /**
   * Contar quantos setores ativos uma empresa tem
   */
  static async countActiveSectors(empresaId: string): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('empresa_setores')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao contar setores:', error);
      return 0;
    }

    return count || 0;
  }
}
