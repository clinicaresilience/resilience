import { createClient } from "@/lib/client";
import { UsersServiceClient } from "@/services/database/users.service";
import type { AuthUser, Role } from "../types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Buscar dados completos do usuário no banco
    const userData = await UsersServiceClient.getCurrentUser();

    if (!userData) {
      // Se não encontrar no banco, usar dados básicos do auth
      return {
        id: user.id,
        email: user.email || "",
        nome: user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário",
        tipo_usuario: (user.user_metadata?.tipo_usuario as Role) || "comum",
        mustChangePassword: user.user_metadata?.mustChangePassword || false,
        active: true,
      };
    }

    return {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      tipo_usuario: userData.tipo_usuario as Role,
      mustChangePassword: false,
      active: true,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{
  error?: string;
  user?: AuthUser
}> {
  try {
    const supabase = createClient();

    // Autenticar com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error.message || "Falha ao autenticar" };
    }

    if (!data.user) {
      return { error: "Usuário não encontrado" };
    }

    // Buscar dados completos do usuário no banco
    const userData = await UsersServiceClient.getCurrentUser();

    if (!userData) {
      // Se não existir no banco, criar registro
      try {
        const { data: newUser } = await supabase
          .from("usuarios")
          .insert({
            id: data.user.id,
            email: data.user.email,
            nome: data.user.user_metadata?.nome || email.split('@')[0],
            tipo_usuario: "comum",
          })
          .select()
          .single();

        if (newUser) {
          return {
            user: {
              id: newUser.id,
              email: newUser.email,
              nome: newUser.nome,
              tipo_usuario: newUser.tipo_usuario as Role,
              mustChangePassword: false,
              active: true,
            }
          };
        }
      } catch (dbError) {
        console.error("Erro ao criar perfil do usuário:", dbError);
      }
    }

    // Como a propriedade 'ativo' não existe na interface Usuario,
    // assumir que todos os usuários no banco estão ativos
    return {
      user: {
        id: userData?.id || data.user.id,
        email: userData?.email || data.user.email || "",
        nome: userData?.nome || data.user.user_metadata?.nome || "Usuário",
        tipo_usuario: (userData?.tipo_usuario || "comum") as Role,
        mustChangePassword: data.user.user_metadata?.mustChangePassword || false,
        active: true, // Sempre true já que não temos controle de ativo/inativo
      }
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Erro ao fazer login. Tente novamente." };
  }
}

export async function signUp(data: {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}): Promise<{ error?: string; user?: AuthUser }> {
  try {
    const supabase = createClient();

    // Criar conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/protected`,
        data: {
          nome: data.nome,
          telefone: data.telefone,
        }
      },
    });

    if (authError) {
      return { error: authError.message || "Erro ao criar conta" };
    }

    if (!authData.user) {
      return { error: "Erro ao criar usuário" };
    }

    // Criar registro na tabela usuarios
    const { error: dbError } = await supabase
      .from("usuarios")
      .insert({
        id: authData.user.id,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        tipo_usuario: "comum",
      });

    if (dbError) {
      console.error("Erro ao criar perfil do usuário:", dbError);
      // Não retornar erro aqui pois a conta foi criada com sucesso
      // O trigger do banco deve criar o perfil automaticamente
    }

    return {
      user: {
        id: authData.user.id,
        email: data.email,
        nome: data.nome,
        tipo_usuario: "comum",
        mustChangePassword: false,
        active: true,
      }
    };
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return { error: "Erro ao criar conta. Tente novamente." };
  }
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`,
    });

    if (error) {
      return { error: error.message || "Erro ao enviar email de recuperação" };
    }

    return {};
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return { error: "Erro ao enviar email de recuperação" };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message || "Erro ao atualizar senha" };
    }

    // Remover flag de mustChangePassword se existir
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { mustChangePassword: false }
      });
    }

    return {};
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return { error: "Erro ao atualizar senha" };
  }
}
