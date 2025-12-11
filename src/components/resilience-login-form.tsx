"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function ResilienceLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <div className={cn("w-full min-h-screen", className)} {...props}>
      {/* Background com gradiente usando as cores do sistema */}
      <div className="min-h-screen bg-gradient-to-br from-azul-ciano-claro via-white to-azul-ciano-claro relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0">
          {/* Círculos decorativos com as cores do sistema */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-azul-vivido/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-azul-medio/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-azul-ciano/5 rounded-full blur-3xl"></div>
        </div>

        {/* Container principal */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Botão Voltar - Desktop */}
          <div className="hidden md:block absolute top-8 left-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-azul-escuro bg-white/90 backdrop-blur-sm rounded-full border-2 border-azul-escuro/20 hover:bg-azul-escuro hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← Voltar
            </Link>
          </div>

          {/* Botão Voltar - Mobile */}
          <div className="md:hidden absolute top-6 left-6 z-20">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-12 h-12 text-azul-escuro bg-white/90 backdrop-blur-sm rounded-full border-2 border-azul-escuro/20 hover:bg-azul-escuro hover:text-white transition-all duration-300 shadow-lg"
            >
              ←
            </Link>
          </div>

          {/* Conteúdo centralizado */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md">
              {/* Logo e título */}
              <div className="text-center mb-8 md:mb-12">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    {/* Logo usando CSS com as cores do sistema */}
                    <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-gradient-to-br from-azul-escuro via-azul-medio to-azul-vivido rounded-full shadow-2xl">
                      <div className="text-white font-bold text-lg md:text-2xl tracking-wider">
                        R
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3"></div>
              </div>

              {/* Card do formulário */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-azul-escuro/10 p-6 md:p-8">
                {/* Feedback de erro */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Feedback de sucesso */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      Sucesso! Redirecionando...
                    </p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Campo Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-azul-escuro"
                    >
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || success}
                      className="h-12 px-4 text-base bg-azul-ciano-claro/50 border-2 border-azul-escuro/20 rounded-xl focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200 placeholder:text-azul-medio/60"
                    />
                  </div>

                  {/* Campo Senha */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-azul-escuro"
                    >
                      Senha
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      disabled={loading || success}
                      className="h-12 px-4 text-base bg-azul-ciano-claro/50 border-2 border-azul-escuro/20 rounded-xl focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200 placeholder:text-azul-medio/60"
                    />
                  </div>

                  {/* Botão de Login */}
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className="w-full h-12 text-white font-semibold text-base rounded-xl bg-gradient-to-r from-azul-escuro via-azul-medio to-azul-vivido hover:from-azul-escuro-secundario hover:via-azul-escuro hover:to-azul-medio disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Sucesso!</span>
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  {/* Links inferiores */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 space-y-3 sm:space-y-0">
                    <button
                      type="button"
                      onClick={() => router.push(ROUTES.auth.forgot)}
                      className="text-sm text-azul-escuro hover:text-azul-vivido hover:underline transition-colors font-medium"
                      disabled={loading || success}
                    >
                      Esqueci minha senha
                    </button>

                    <Link
                      href="/auth/cadastro"
                      className="text-sm text-azul-ciano hover:text-azul-vivido hover:underline transition-colors font-medium"
                    >
                      Criar conta
                    </Link>
                  </div>
                </form>
              </div>

              {/* Informações adicionais */}
              <div className="mt-8 text-center">
                <p className="text-xs text-azul-medio/70">
                  © 2025 Clínica Resilience - Todos os direitos reservados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
