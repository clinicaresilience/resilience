"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/context/auth-context"
import { BackButton } from "@/components/ui/back-button"
import { User, Settings, Home, Users, Calendar, FileText, BarChart3, Clock, Stethoscope, ArrowLeft } from "lucide-react"

type Usuario = {
  nome: string
  email: string
  tipo_usuario: string
}

export default function AuthenticatedHeader() {
  const { user: usuario } = useAuth()
  const pathname = usePathname()

  const isAdmin = usuario?.tipo_usuario === "administrador"
  const isProfessional = usuario?.tipo_usuario === "profissional"
  const isUser = usuario?.tipo_usuario === "comum"
  
  const isAdminPanel = pathname.startsWith("/painel-administrativo")
  const isUserPanel = pathname.startsWith("/tela-usuario")
  const isProfessionalPanel = pathname.startsWith("/tela-profissional")

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Título da Área */}
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-azul-escuro">
              {isAdminPanel ? "" :
               isProfessionalPanel ? "Área do Profissional" :
               isUserPanel ? "Área do Paciente" : "Sistema"}
            </span>
          </div>

          {/* Navegação Central - Admin - Removida, será feita no componente específico */}

          {/* Navegação Central - Profissional */}
          {isProfessional && isProfessionalPanel && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/tela-profissional"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/tela-profissional"
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link
                href="/tela-profissional/agenda"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-profissional/agenda")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Agenda</span>
              </Link>
              <Link
                href="/tela-profissional/consultas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-profissional/consultas")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Consultas</span>
              </Link>
              <Link
                href="/tela-profissional/pacientes"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-profissional/pacientes")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pacientes</span>
              </Link>
              <Link
                href="/tela-profissional/prontuarios"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-profissional/prontuarios")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prontuários</span>
              </Link>
              <Link
                href="/tela-profissional/estatisticas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-profissional/estatisticas")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Estatísticas</span>
              </Link>
            </nav>
          )}

          {/* Navegação Central - Usuário */}
          {isUser && isUserPanel && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/tela-usuario"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/tela-usuario" 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link 
                href="/tela-usuario/agendamentos"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-usuario/agendamentos") 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Agendamentos</span>
              </Link>
              <Link 
                href="/tela-usuario/perfil"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/tela-usuario/perfil") 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>
            </nav>
          )}

          {/* Área do Usuário */}
          <div className="flex items-center space-x-4">
            {usuario && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{usuario.nome}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? "Administrador" : isProfessional ? "Profissional" : "Paciente"}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isAdmin ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                  isProfessional ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                  "bg-gradient-to-r from-green-400 to-green-600"
                }`}>
                  {isProfessional ? (
                    <Stethoscope className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Navegação Mobile */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="px-4 py-2">
          {/* Admin Mobile - Removida, será feita no componente específico */}
          
          {/* Professional Mobile */}
          {isProfessional && isProfessionalPanel && (
            <div className="flex space-x-4 overflow-x-auto">
              <Link
                href="/tela-profissional"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname === "/tela-profissional"
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link
                href="/tela-profissional/agenda"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-profissional/agenda")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Agenda</span>
              </Link>
              <Link
                href="/tela-profissional/consultas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-profissional/consultas")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Consultas</span>
              </Link>
              <Link
                href="/tela-profissional/pacientes"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-profissional/pacientes")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pacientes</span>
              </Link>
              <Link
                href="/tela-profissional/prontuarios"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-profissional/prontuarios")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prontuários</span>
              </Link>
              <Link
                href="/tela-profissional/estatisticas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-profissional/estatisticas")
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Estatísticas</span>
              </Link>
            </div>
          )}
          
          {/* User Mobile */}
          {isUser && isUserPanel && (
            <div className="flex space-x-4 overflow-x-auto">
              <Link 
                href="/tela-usuario"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname === "/tela-usuario" 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
              <Link 
                href="/tela-usuario/agendamentos"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-usuario/agendamentos") 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Agendamentos</span>
              </Link>
              <Link 
                href="/tela-usuario/perfil"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  pathname.startsWith("/tela-usuario/perfil") 
                    ? "bg-azul-escuro text-white" 
                    : "text-gray-600"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
