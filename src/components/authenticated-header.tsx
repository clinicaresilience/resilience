// AuthenticatedHeader.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/features/auth/context/auth-context"
import { Stethoscope, User } from "lucide-react"
import { useTabStore } from "@/app/store/useTabStore"

export default function AuthenticatedHeader() {
  const { user: usuario } = useAuth()
  const pathname = usePathname()
  const { activeTab, setActiveTab, getTabsByUserType, syncTabFromPath } = useTabStore()

  // Sincroniza a aba ativa com o pathname atual na inicialização e mudanças de rota
  useEffect(() => {
    if (usuario?.tipo_usuario) {
      console.log("AuthenticatedHeader: syncing tab for pathname:", pathname, "userType:", usuario.tipo_usuario);
      syncTabFromPath(pathname, usuario.tipo_usuario as "administrador" | "profissional" | "comum")
    }
  }, [pathname, usuario?.tipo_usuario, syncTabFromPath])

  // Log para debug do activeTab
  useEffect(() => {
    console.log("AuthenticatedHeader: activeTab changed to:", activeTab);
  }, [activeTab])

  if (!usuario) return null

  const tabs = getTabsByUserType(usuario.tipo_usuario as "administrador" | "profissional" | "comum")

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Título da Área */}
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-azul-escuro">
              {usuario.tipo_usuario === "administrador"
                ? "Painel Administrativo"
                : usuario.tipo_usuario === "profissional"
                ? "Área do Profissional"
                : "Área do Paciente"}
            </span>
          </div>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center space-x-6">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.path!}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>

          {/* Área do Usuário */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{usuario.nome}</p>
                <p className="text-xs text-gray-500">{usuario.tipo_usuario}</p>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  usuario.tipo_usuario === "administrador"
                    ? "bg-gradient-to-r from-purple-400 to-purple-600"
                    : usuario.tipo_usuario === "profissional"
                    ? "bg-gradient-to-r from-blue-400 to-blue-600"
                    : "bg-gradient-to-r from-green-400 to-green-600"
                }`}
              >
                {usuario.tipo_usuario === "profissional" ? (
                  <Stethoscope className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
