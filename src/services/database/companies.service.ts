import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export interface Company {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

export class CompaniesService {
  /**
   * Criar uma nova empresa no banco de dados
   */
  static async createCompany(companyData: {
    nome: string;
    codigo: string;
    ativa?: boolean;
  }) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome: companyData.nome,
        codigo: companyData.codigo.toUpperCase().trim(),
        ativa: companyData.ativa ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }

    return data as Company;
  }

  /**
   * Buscar empresa por ID
   */
  static async getCompanyById(companyId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Erro ao buscar empresa:', error);
      return null;
    }

    return data as Company;
  }

  /**
   * Buscar empresa por código
   */
  static async getCompanyByCode(codigo: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('codigo', codigo.toUpperCase().trim())
      .single();

    if (error) {
      console.error('Erro ao buscar empresa por código:', error);
      return null;
    }

    return data as Company;
  }

  /**
   * Atualizar dados da empresa
   */
  static async updateCompany(companyId: string, updates: Partial<Company>) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }

    return data as Company;
  }

  /**
   * Listar todas as empresas
   */
  static async listCompanies(filters?: {
    ativa?: boolean;
    search?: string;
  }) {
    const supabase = await createClient();
    
    let query = supabase.from('empresas').select('*');

    if (filters?.ativa !== undefined) {
      query = query.eq('ativa', filters.ativa);
    }

    if (filters?.search) {
      query = query.or(`nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar empresas:', error);
      throw error;
    }

    return data as Company[];
  }

  /**
   * Deletar empresa
   */
  static async deleteCompany(companyId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', companyId);

    if (error) {
      console.error('Erro ao deletar empresa:', error);
      throw error;
    }

    return true;
  }

  /**
   * Verificar se o código da empresa já existe
   */
  static async companyCodeExists(codigo: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('id')
      .eq('codigo', codigo.toUpperCase().trim())
      .single();

    return !error && !!data;
  }

  /**
   * Verificar se o código da empresa é válido (ativa)
   */
  static async isValidCompanyCode(codigo: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('id')
      .eq('codigo', codigo.toUpperCase().trim())
      .eq('ativa', true)
      .single();

    return !error && !!data;
  }

  /**
   * Buscar empresas ativas (para seleção)
   */
  static async getActiveCompanies() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('ativa', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar empresas ativas:', error);
      throw error;
    }

    return data as Company[];
  }
}

// Versão para uso no cliente (browser)
export class CompaniesServiceClient {
  /**
   * Listar empresas (apenas leitura no cliente)
   */
  static async getCompanies() {
    const supabase = createClientBrowser();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }

    return data as Company[];
  }

  /**
   * Buscar empresas ativas (para formulários)
   */
  static async getActiveCompanies() {
    const supabase = createClientBrowser();
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('ativa', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar empresas ativas:', error);
      throw error;
    }

    return data as Company[];
  }
}
