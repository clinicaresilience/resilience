"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          senha: formData.senha,
          confirmarSenha: formData.confirmarSenha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Exibir mensagem de sucesso da API
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/sign-up-success");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full min-h-screen relative overflow-hidden", className)} {...props}>
      {/* Background com gradiente similar ao login */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-azul-ciano-claro">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Image
            src="/logoResilience.png"
            alt="Background Logo"
            width={800}
            height={800}
            priority
          />
        </div>
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
          <div className="w-full max-w-md">
            
            {/* Logo e título */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/logoResilience.png"
                  alt="Clínica Resilience"
                  width={100}
                  height={100}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold text-azul-escuro mb-2">
                Criar Conta
              </h1>
              <p className="text-gray-600">
                Preencha seus dados para começar
              </p>
            </div>

            {/* Card do formulário - Estilo similar ao agendamento */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <CardContent className="p-6 md:p-8">
                
                {/* Mensagens de feedback */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 text-center">
                      Conta criada com sucesso! Redirecionando...
                    </p>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                  
                  {/* Campo Nome Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={formData.nome}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                  </div>

                  {/* Campo Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                  </div>

                  {/* Campo Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                      Telefone WhatsApp *
                    </Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      required
                      value={formData.telefone}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">
                      Número do WhatsApp para contato e confirmações
                    </p>
                  </div>

                  {/* Campo CPF */}
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      required
                      value={formData.cpf}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                  </div>

                  {/* Campo Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={formData.senha}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                  </div>

                  {/* Campo Confirmar Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      placeholder="Digite a senha novamente"
                      required
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="h-12 px-4 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 transition-all duration-200"
                    />
                  </div>

                  {/* Botão de Cadastro */}
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className="w-full h-12 text-white font-semibold rounded-lg bg-gradient-to-r from-roxo via-azul-escuro to-azul-vivido hover:from-roxo/90 hover:via-azul-escuro/90 hover:to-azul-vivido/90 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Criando conta...</span>
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Conta criada!</span>
                      </div>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  {/* Link para login */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Já possui uma conta?{" "}
                      <Link 
                        href="/auth/login" 
                        className="font-medium text-azul-vivido hover:text-azul-escuro transition-colors"
                      >
                        Fazer login
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Termos de uso */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="#" className="text-azul-vivido hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="#" className="text-azul-vivido hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
