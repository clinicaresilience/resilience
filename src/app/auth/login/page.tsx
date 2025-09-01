import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ArrowLeft, Home } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* Header com link de volta */}
        <div className="mb-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-azul-escuro hover:text-azul-vivido transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao início</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-azul-vivido to-roxo rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h1 className="text-2xl font-bold text-azul-escuro">Clínica Resilience</h1>
          </div>
          <p className="text-gray-600 text-sm">Faça login para acessar sua conta</p>
        </div>

        {/* Formulário de login */}
        <div className="flex justify-center">
          <LoginForm />
        </div>

        {/* Links adicionais */}
        <div className="mt-6 text-center">
          <div>
            <span className="text-sm text-gray-600">Não tem uma conta? </span>
            <Link 
              href="/auth/cadastro" 
              className="text-sm text-azul-escuro hover:text-azul-vivido transition-colors font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
