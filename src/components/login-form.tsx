"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(email, senha);
      if (res.error) throw new Error(res.error);
      setSuccess(true);

      // Se o admin criou a conta e marcou para trocar senha no primeiro acesso
      if (res.user?.mustChangePassword) {
        router.push(ROUTES.auth.updatePassword);
        return;
      }

      const role = res.user?.tipo_usuario;
      setTimeout(() => {
        const dest =
          role === "administrador"
            ? ROUTES.admin.root
            : role === "profissional"
            ? ROUTES.professional.root
            : ROUTES.user.root;
        router.push(dest);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Campo Email */}
        <div>
          <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="h-10 px-3 border border-gray-300 rounded-md focus:border-azul-escuro focus:ring-1 focus:ring-azul-escuro/30 transition-colors bg-white"
          />
        </div>

        {/* Campo Senha */}
        <div>
          <Label htmlFor="password" className="text-sm text-gray-700 mb-2 block">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading || success}
              className="h-10 px-3 pr-14 border border-gray-300 rounded-md focus:border-azul-escuro focus:ring-1 focus:ring-azul-escuro/30 transition-colors bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-azul-escuro text-xs"
              disabled={loading || success}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Feedback de erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* Feedback de sucesso */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">Sucesso! Redirecionando...</p>
          </div>
        )}

        {/* Botão de Login */}
        <Button
          type="submit"
          disabled={loading || success}
          className="w-full h-10 text-white font-medium rounded-md bg-azul-escuro hover:bg-azul-medio disabled:opacity-50 transition-colors mt-6"
        >
          {loading ? "Entrando..." : success ? "Sucesso!" : "Entrar"}
        </Button>

        {/* Link "Esqueci minha senha" */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push(ROUTES.auth.forgot)}
            className="text-azul-escuro hover:text-azul-vivido text-sm hover:underline"
            disabled={loading || success}
          >
            Esqueci minha senha
          </button>
        </div>
      </form>
    </div>
  );
}
