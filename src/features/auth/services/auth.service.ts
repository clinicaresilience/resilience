import { createClient } from "@/lib/client";
import type { AuthUser, Role } from "../types";

function mapToAuthUser(user: any): AuthUser | null {
  if (!user) return null;

  const nome =
    user?.user_metadata?.nome ??
    user?.user_metadata?.name ??
    "Usuário";

  const tipo_usuario: Role =
    user?.user_metadata?.tipo_usuario ??
    user?.app_metadata?.role ??
    "usuario";

  return {
    id: user.id,
    email: user.email ?? "",
    nome,
    tipo_usuario,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return mapToAuthUser(user);
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message ?? "Falha ao autenticar" };
  }
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
