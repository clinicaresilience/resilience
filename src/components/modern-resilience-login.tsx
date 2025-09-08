"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import Resilience from "../app/assets/icones/logo.png";

export function ModernResilienceLogin({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();

  // Redirecionar usuário já logado para seu painel
  useEffect(() => {
    if (!authLoading && user) {
      const dest =
        user.tipo_usuario === "administrador"
          ? ROUTES.admin.root
          : user.tipo_usuario === "profissional"
          ? ROUTES.professional.root
          : ROUTES.user.root;
      
      router.push(dest);
    }
  }, [user, authLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-azul-ciano-claro">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-azul-vivido border-t-transparent rounded-full animate-spin"></div>
          <span className="text-azul-escuro">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Se usuário já está logado, não mostrar o formulário
  if (user) {
    return null;
  }

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
    <div className={cn("w-full min-h-screen relative overflow-hidden", className)} {...props}>
      {/* Background com gradiente suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-azul-ciano-claro">
        {/* Logo de fundo transparente */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Image
            src={Resilience}
            alt="Background Logo"
            width={800}
            height={800}
            className=" "
            priority
          />
        </div>
        
        {/* Elementos decorativos sutis */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-azul-vivido/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-azul-medio/5 rounded-full blur-2xl"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Botão Voltar */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 text-sm font-medium text-azul-escuro bg-white/80 backdrop-blur-sm rounded-full border border-azul-escuro/20 hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <span className="mr-2">←</span>
            <span className="hidden md:inline">Voltar</span>
          </Link>
        </div>

        {/* Conteúdo centralizado */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-sm">
            
            {/* Logo principal */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Image
                    src="/logoResilience.png"
                    alt="Clínica Resilience"
                    width={120}
                    height={120}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
                    priority
                  />
                </div>
              </div>
              
              {/* Título estilizado */}
              <div className="space-y-2">
              
              </div>
            </div>

            {/* Card do formulário */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
              
              {/* Feedback de erro */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl">
                  <p className="text-sm text-red-700 font-medium text-center">{error}</p>
                </div>
              )}
              
              {/* Feedback de sucesso */}
              {success && (
                <div className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-2xl">
                  <p className="text-sm text-green-700 font-medium text-center">Sucesso! Redirecionando...</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Campo Email */}
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    className="h-14 px-6 text-base bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-azul-vivido/30 transition-all duration-200 placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={loading || success}
                    className="h-14 px-6 text-base bg-gray-50/80 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-azul-vivido/30 transition-all duration-200 placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full h-14 text-white font-semibold text-base rounded-2xl bg-gradient-to-r from-roxo via-azul-escuro to-azul-vivido hover:from-roxo/90 hover:via-azul-escuro/90 hover:to-azul-vivido/90 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : success ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                    className="text-sm text-roxo hover:text-azul-vivido transition-colors font-medium"
                    disabled={loading || success}
                  >
                    Esqueci minha senha
                  </button>
                  
                  <Link
                    href="/auth/cadastro"
                    className="text-sm text-azul-vivido hover:text-azul-ciano transition-colors font-medium"
                  >
                    Criar conta
                  </Link>
                </div>
              </form>
            </div>

            {/* Logo de fundo menor no mobile */}
            <div className="md:hidden absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
              <Image
                src="/logoResilience.png"
                alt="Background Logo Mobile"
                width={300}
                height={300}
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
