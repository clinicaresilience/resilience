// AuthenticatedHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { Menu, X, User, Stethoscope } from "lucide-react";

import { useTabStore } from "@/app/store/useTabStore";

export default function AuthenticatedHeader() {
  const { user: usuario } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab, getTabsByUserType, syncTabFromPath } =
    useTabStore();

  // Sincroniza a aba ativa com o pathname atual na inicialização e mudanças de rota
  useEffect(() => {
    if (usuario?.tipo_usuario) {
      syncTabFromPath(
        pathname,
        usuario.tipo_usuario as "administrador" | "profissional" | "comum"
      );
    }
  }, [pathname, usuario?.tipo_usuario, syncTabFromPath]);

  if (!usuario) return null;

  const tabs = getTabsByUserType(
    usuario.tipo_usuario as "administrador" | "profissional" | "comum"
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm overflow-x-hidden md:relative fixed top-0 z-30">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo/Título - Mobile */}
          <div className="flex items-center space-x-3 md:hidden">
            <span className="text-lg font-semibold text-azul-escuro">
              {usuario.tipo_usuario === "administrador"
                ? "Admin"
                : usuario.tipo_usuario === "profissional"
                ? "Profissional"
                : "Paciente"}
            </span>
          </div>

          {/* Navegação Central - Desktop */}
          <nav className="hidden md:flex items-center flex-1 justify-center px-2 min-w-0">
            <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto scrollbar-hide max-w-full">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.path!}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-azul-escuro text-white"
                      : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Avatar e Menu Hamburguer - Mobile */}
          <div className="flex items-center space-x-3">
            {/* Avatar do usuário */}
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

            {/* Menu Hamburguer - Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-azul-escuro hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Hamburguer Dropdown - Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="py-4 px-4">
            {/* Informações do usuário */}
            <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-gray-50 rounded-lg">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  usuario.tipo_usuario === "administrador"
                    ? "bg-gradient-to-r from-purple-400 to-purple-600"
                    : usuario.tipo_usuario === "profissional"
                    ? "bg-gradient-to-r from-blue-400 to-blue-600"
                    : "bg-gradient-to-r from-green-400 to-green-600"
                }`}
              >
                {usuario.tipo_usuario === "profissional" ? (
                  <Stethoscope className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{usuario.nome}</p>
                <p className="text-sm text-gray-500 capitalize">{usuario.tipo_usuario}</p>
              </div>
            </div>

            {/* Navegação */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.path!}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-azul-escuro text-white shadow-sm"
                      : "text-gray-700 hover:text-azul-escuro hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>

            {/* Botão para fechar */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 text-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                Fechar Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
