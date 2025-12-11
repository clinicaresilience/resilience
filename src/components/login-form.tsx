"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";

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
    <div
      className={cn(
        "w-full max-w-sm border border-roxo shadow-roxo shadow-sm p-8 rounded-2xl bg-white",
        className
      )}
      {...props}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Campo Email */}

        <div className="flex flex-col gap-2">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="h-12 shadow-sm px-3 border border-gray-300 rounded-2xl focus:border-azul-escuro focus:ring-1 focus:ring-azul-escuro/30 transition-colors bg-white"
          />
        </div>
        {/* Campo Senha */}
        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading || success}
              className="h-12 px-3 shadow-sm pr-14 border border-gray-300 rounded-2xl focus:border-azul-escuro focus:ring-1 focus:ring-azul-escuro/30 transition-colors bg-white"
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {/* Feedback de sucesso */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-sm text-green-700">Sucesso! Redirecionando...</p>
          </div>
        )}
        {/* Botão de Login */}
        <Button
          type="submit"
          disabled={loading || success}
          className="w-full h-12 text-lg text-white bg-linear-[135deg]  duration-300 ease-in-out from-[#8a2be2] to-[#00e5ee] font-medium rounded-2xl disabled:opacity-50  mt-6"
        >
          {loading ? "Entrando..." : success ? "Sucesso!" : "Entrar"}
        </Button>
        {/* Link "Esqueci minha senha" */}
        <div className="text-center pt-2 gap-4 flex justify-around">
          <button
            type="button"
            onClick={() => router.push(ROUTES.auth.forgot)}
            className="text-azul-escuro hover:text-azul-vivido text-sm hover:underline"
            disabled={loading || success}
          >
            Esqueci minha senha
          </button>
          <Link
            href="/auth/cadastro"
            className="text-azul-escuro hover:text-azul-vivido text-sm transition-colors hover:underline"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}
