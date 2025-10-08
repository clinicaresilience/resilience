import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';

export interface Company {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  nome_fantasia?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}

export class CompaniesService {
  /**
   * Criar uma nova empresa no banco de dados
   */
  static async createCompany(companyData: {
    nome: string;
    codigo: string;
    ativa?: boolean;
    cnpj: string;
    inscricao_estadual?: string | null;
    inscricao_municipal?: string | null;
    nome_fantasia?: string | null;
    endereco_logradouro?: string | null;
    endereco_numero?: string | null;
    endereco_complemento?: string | null;
    endereco_bairro?: string | null;
    endereco_cidade?: string | null;
    endereco_estado?: string | null;
    endereco_cep?: string | null;
  }) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome: companyData.nome,
        codigo: companyData.codigo.toUpperCase().trim(),
        ativa: companyData.ativa ?? true,
        cnpj: companyData.cnpj,
        inscricao_estadual: companyData.inscricao_estadual,
        inscricao_municipal: companyData.inscricao_municipal,
        nome_fantasia: companyData.nome_fantasia,
        endereco_logradouro: companyData.endereco_logradouro,
        endereco_numero: companyData.endereco_numero,
        endereco_complemento: companyData.endereco_complemento,
        endereco_bairro: companyData.endereco_bairro,
        endereco_cidade: companyData.endereco_cidade,
        endereco_estado: companyData.endereco_estado,
        endereco_cep: companyData.endereco_cep,
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
   * Buscar empresa por CNPJ
   */
  static async getCompanyByCnpj(cnpj: string) {
    const supabase = await createClient();
    
    // Remove formatting from CNPJ
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('cnpj', cleanCnpj)
      .eq('ativa', true)
      .single();

    if (error) {
      console.error('Erro ao buscar empresa por CNPJ:', error);
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
