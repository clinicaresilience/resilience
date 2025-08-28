"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // login
      const { data: login, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;

      const user = login.user;
      if (!user) throw new Error("Usuário não encontrado");

      // buscar tipo_usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("tipo_usuario")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuario) throw new Error("Usuário inválido");

      setSuccess(true);

      // redireciona conforme tipo_usuario
      setTimeout(() => {
        router.push(
          usuario.tipo_usuario === "administrador"
            ? "/painel-administrativo"
            : "/tela-usuario"
        );
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white w-[350px] min-h-[400px] border border-gray-500 shadow-gray-200 drop-shadow-sm">
        <CardHeader>
          <span
            onClick={() => router.back()}
            className="cursor-pointer text-gray-400 text-md"
          >
            Voltar
          </span>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading || success}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">
                Login realizado com sucesso! Redirecionando...
              </p>
            )}

            <Button
              disabled={loading || success}
              className="w-full text-white rounded px-4 py-2 bg-gradient-to-r from-azul-vivido via-roxo to-laranja bg-[length:200%_100%] bg-[position:0%_0%] transition-[background-position] duration-500 ease-in-out hover:bg-[position:100%_0%]"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
