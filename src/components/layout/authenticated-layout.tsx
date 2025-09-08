"use client";

import React, { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import ConditionalNavigation from "@/components/conditional-navigation";
import { useAuth } from "@/features/auth/context/auth-context";

// Context for sidebar state
const SidebarContext = createContext<{ collapsed: boolean }>({
  collapsed: false,
});

export const useSidebar = () => useContext(SidebarContext);

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user: usuario, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Verificar se deve mostrar a sidebar
  const rotasComSidebar = [
    "/painel-administrativo",
    "/tela-usuario",
    "/tela-profissional",
  ];

  const mostrarSidebar = rotasComSidebar.some((rota) =>
    pathname.startsWith(rota)
  );

  // Rotas que não devem mostrar nenhum cabeçalho (páginas de auth)
  const rotasSemCabecalho = [
    "/auth/login",
    "/auth/cadastro",
    "/auth/forgot-password",
    "/auth/update-password",
    "/auth/sign-up-success",
    "/auth/error",
  ];

  const eRotaSemCabecalho = rotasSemCabecalho.some((rota) =>
    pathname.startsWith(rota)
  );

  if (loading && mostrarSidebar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-azul-escuro"></div>
      </div>
    );
  }

  // Para rotas sem cabeçalho ou sem sidebar, renderiza apenas o children
  if (eRotaSemCabecalho || !mostrarSidebar) {
    return (
      <>
        <ConditionalNavigation />
        <main className="flex-1  w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </>
    );
  }

  // Para rotas com sidebar
  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed }}>
      <div className="flex flex-col w-full h-full bg-gray-50">
        {pathname.startsWith("/painel-administrativo") ? null : (
          <ConditionalNavigation />
        )}
        {usuario && (
          <>
            <Sidebar
              userType={usuario.tipo_usuario}
              userName={usuario.nome}
              onCollapseChange={setSidebarCollapsed}
            />
            <main
              className={`transition-all duration-500 ease-in-out overflow-y-auto min-h-screen 
    ${pathname.startsWith("/painel-administrativo") ? "" : "pt-8"} 
    ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}
  `}
            >
              <div className={`${pathname.startsWith("/painel-administrativo") ? "p-0 w-full max-w-none" : "px-4 sm:px-6 lg:px-8 pb-6 w-full mx-auto"}`}>
                {children}
              </div>
            </main>
          </>
        )}
      </div>
    </SidebarContext.Provider>
  );
}
