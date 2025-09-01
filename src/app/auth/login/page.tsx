import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background sutil */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-azul-escuro/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-azul-medio/5 rounded-full blur-3xl"></div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo simples */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-azul-escuro mb-2">
            Resilience
          </h1>
          <p className="text-gray-600">Clínica Médica</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Link voltar */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="text-azul-escuro hover:text-azul-vivido transition-colors text-sm"
            >
              ← Voltar
            </Link>
          </div>

          {/* Título do formulário */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Entrar
            </h2>
          </div>

          {/* Formulário de login */}
          <LoginForm />

          {/* Link criar conta */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/cadastro" 
              className="text-azul-escuro hover:text-azul-vivido text-sm transition-colors hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
