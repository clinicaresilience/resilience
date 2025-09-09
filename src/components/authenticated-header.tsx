// AuthenticatedHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";

import { useTabStore } from "@/app/store/useTabStore";

export default function AuthenticatedHeader() {
  const { user: usuario } = useAuth();
  const pathname = usePathname();
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
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Navegação Central */}
          <nav className="hidden md:flex items-center space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.path!}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>

          {/* Área do Usuário */}
        </div>
      </div>

      {/* Fixed Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.path!}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-shrink-0 min-w-0 ${
                activeTab === tab.id
                  ? "bg-azul-escuro text-white"
                  : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs mt-1 leading-tight">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
