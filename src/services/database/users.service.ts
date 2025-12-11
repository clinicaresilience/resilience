import { createClient } from '@/lib/server';
import { createClient as createClientBrowser } from '@/lib/client';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type TipoUsuario = 'administrador' | 'profissional' | 'comum';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  tipo_usuario: TipoUsuario;
  created_at?: string;
  updated_at?: string;
}

export class UsersService {
  /**
   * Criar um novo usuário no banco de dados
   * Usado após o registro no Supabase Auth
   */
  static async createUser(userData: {
    id: string;
    email: string;
    nome: string;
    telefone?: string;
    tipo_usuario?: TipoUsuario;
  }) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        telefone: userData.telefone || null,
        tipo_usuario: userData.tipo_usuario || 'comum',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }

    return data as Usuario;
  }
  static async getAllProfissionais() {
    const supabase = await createClient();
  
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "profissional")
      .order("nome");
  
    if (error) {
      console.error("Erro ao buscar profissionais:", error);
      throw error;
    }
  
    return data ;
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(userId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    return data as Usuario;
  }

  /**
   * Buscar usuário por email
   */
  
  
  static async getUserByType(tipo_usuario:string){
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_usuario', tipo_usuario)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    return data as Usuario;
  }
  static async getUserByEmail(email: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }

    return data as Usuario;
  }

  /**
   * Atualizar dados do usuário
   */
  static async updateUser(userId: string, updates: Partial<Usuario>) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }

    return data as Usuario;
  }

  /**
   * Listar todos os usuários (admin)
   */
  static async listUsers(filters?: {
    tipo_usuario?: TipoUsuario;
    search?: string;
  }) {
    const supabase = await createClient();
    
    let query = supabase.from('usuarios').select('*');

    if (filters?.tipo_usuario) {
      query = query.eq('tipo_usuario', filters.tipo_usuario);
    }

    if (filters?.search) {
      query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }

    return data as Usuario[];
  }

  /**
   * Deletar usuário (remove no Auth e na tabela)
   */
  static async deleteUser(userId: string) {
    // Primeiro, remove no Auth com Service Role (apenas no servidor)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL ausente nas variáveis de ambiente do servidor');
    }
    const admin = createServiceClient(url, serviceKey);
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Erro ao deletar usuário do Auth:', authError);
      throw authError;
    }

    // Depois remove do banco (respeitando RLS com sessão do admin autenticado)
    const supabase = await createClient();
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }

    return true;
  }

  /**
   * Verificar se o usuário existe
   */
  static async userExists(email: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    return !error && !!data;
  }

  /**
   * Buscar profissionais (para agendamento)
   */
  static async getProfissionais() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_usuario', 'profissional')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw error;
    }

    return data as Usuario[];
  }
}

// Versão para uso no cliente (browser)
export class UsersServiceClient {
  /**
   * Buscar dados do usuário atual
   */
  static async getCurrentUser() {
    const supabase = createClientBrowser();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }

    return data as Usuario;
  }

  /**
   * Atualizar perfil do usuário atual
   */
  static async updateProfile(updates: Partial<Usuario>) {
    const supabase = createClientBrowser();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }

    return data as Usuario;
  }
}
