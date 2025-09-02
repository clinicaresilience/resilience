import { createClient } from "@/lib/client";
import type { AuthUser, Role } from "../types";

function mapToAuthUser(user: unknown): AuthUser | null {
  if (!user || typeof user !== 'object') return null;

  const userObj = user as Record<string, unknown>;

  const userMetadata = userObj.user_metadata as Record<string, unknown> | undefined;
  const appMetadata = userObj.app_metadata as Record<string, unknown> | undefined;

  const nome =
    (userMetadata?.nome as string) ??
    (userMetadata?.name as string) ??
    "Usuário";

  const tipo_usuario: Role =
    (userMetadata?.tipo_usuario as Role) ??
    (appMetadata?.role as Role) ??
    "usuario";

  const mustChangePassword: boolean =
    (userMetadata?.mustChangePassword as boolean) ?? false;

  const active: boolean =
    (userMetadata?.active as boolean) ?? true;

  return {
    id: userObj.id as string,
    email: (userObj.email as string) ?? "",
    nome,
    tipo_usuario,
    mustChangePassword,
    active,
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
