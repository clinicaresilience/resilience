import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-azul-ciano-claro flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-azul-vivido/10 to-roxo/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-azul-medio/10 to-azul-ciano/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header elegante */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-azul-escuro hover:text-azul-vivido transition-all duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar ao início</span>
          </Link>
          
          {/* Logo e título mais elegantes */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-azul-escuro to-azul-medio rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-azul-vivido to-roxo rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-azul-escuro to-azul-medio bg-clip-text text-transparent">
              Clínica Resilience
            </h1>
            <p className="text-gray-600 text-sm mt-2">Bem-vindo de volta! Entre na sua conta</p>
          </div>
        </div>

        {/* Formulário de login */}
        <LoginForm />

        {/* Links adicionais com design melhorado */}
        <div className="mt-8 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
            <span className="text-sm text-gray-600">Ainda não tem uma conta? </span>
            <Link 
              href="/auth/cadastro" 
              className="text-sm text-azul-escuro hover:text-azul-vivido transition-colors font-semibold underline decoration-2 underline-offset-2"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
