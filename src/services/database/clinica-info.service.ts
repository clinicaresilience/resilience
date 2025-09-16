import { createClient } from '@/lib/server';

export interface ClinicaInfo {
  id: number;
  nome: string;
  link: string;
  descricao?: string;
  tipo?: 'rede_social' | 'contato';
  created_at?: string;
  updated_at?: string;
}

export interface CreateClinicaInfoData {
  nome: string;
  link: string;
  descricao?: string;
  tipo?: 'rede_social' | 'contato';
}

export interface UpdateClinicaInfoData extends Partial<CreateClinicaInfoData> {
  id?: number;
}

export class ClinicaInfoService {
  /**
   * Busca todas as redes sociais da clínica
   */
  static async getRedesSociais(): Promise<ClinicaInfo[]> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('clinica_info')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar redes sociais da clínica:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar redes sociais da clínica:', error);
      throw error;
    }
  }

  /**
   * Busca uma rede social específica por ID
   */
  static async getRedeSocialById(id: number): Promise<ClinicaInfo | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('clinica_info')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao buscar rede social:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar rede social:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova rede social
   */
  static async createRedeSocial(data: CreateClinicaInfoData): Promise<ClinicaInfo> {
    try {
      const supabase = await createClient();

      const { data: redeSocial, error } = await supabase
        .from('clinica_info')
        .insert({
          nome: data.nome.trim(),
          link: data.link.trim(),
          descricao: data.descricao?.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar rede social:', error);
        throw error;
      }

      return redeSocial;
    } catch (error) {
      console.error('Erro ao criar rede social:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma rede social existente
   */
  static async updateRedeSocial(id: number, data: UpdateClinicaInfoData): Promise<ClinicaInfo> {
    try {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Só adicionar campos que foram fornecidos
      if (data.nome !== undefined) updateData.nome = data.nome.trim();
      if (data.link !== undefined) updateData.link = data.link.trim();
      if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim();

      const { data: redeSocial, error } = await supabase
        .from('clinica_info')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar rede social:', error);
        throw error;
      }

      return redeSocial;
    } catch (error) {
      console.error('Erro ao atualizar rede social:', error);
      throw error;
    }
  }

  /**
   * Remove uma rede social
   */
  static async deleteRedeSocial(id: number): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('clinica_info')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover rede social:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao remover rede social:', error);
      throw error;
    }
  }

  /**
   * Busca uma rede social específica por nome (ex: WhatsApp)
   */
  static async getRedeSocialByNome(nome: string): Promise<ClinicaInfo | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('clinica_info')
        .select('*')
        .ilike('nome', nome)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao buscar rede social por nome:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar rede social por nome:', error);
      return null;
    }
  }

  /**
   * Busca apenas o link do WhatsApp da clínica
   */
  static async getWhatsAppLink(): Promise<string | null> {
    try {
      const whatsapp = await this.getRedeSocialByNome('WhatsApp');
      return whatsapp?.link || null;
    } catch (error) {
      console.error('Erro ao buscar link do WhatsApp:', error);
      return null;
    }
  }
}
