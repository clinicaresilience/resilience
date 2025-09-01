export type Role = "administrador" | "profissional" | "usuario";

export type AuthUser = {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: Role;
  mustChangePassword?: boolean;
  active?: boolean;
};

export type Usuario = AuthUser;

export type SignInResult = {
  error?: string;
  user?: AuthUser | null;
};

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}
