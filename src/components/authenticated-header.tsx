// AuthenticatedHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { Menu, X, User, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/layout/authenticated-layout";

import { useTabStore } from "@/app/store/useTabStore";

export default function AuthenticatedHeader() {
  const { user: usuario } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useSidebar();
  const { activeTab, setActiveTab, getTabsByUserType, syncTabFromPath } =
    useTabStore();

  // Verifica se pode fazer scroll
  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };

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

  const getUserTypeConfig = () => {
    switch (usuario.tipo_usuario) {
      case "administrador":
        return {
          gradient: "from-purple-500 via-purple-600 to-indigo-600",
          bg: "bg-purple-50",
          text: "text-purple-700",
          icon: User,
        };
      case "profissional":
        return {
          gradient: "from-[#02b1aa] via-[#029fdf] to-[#01c2e3]",
          bg: "bg-cyan-50",
          text: "text-[#02b1aa]",
          icon: Stethoscope,
        };
      case "comum":
        return {
          gradient: "from-emerald-500 via-green-500 to-teal-500",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: User,
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-600",
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: User,
        };
    }
  };

  const userConfig = getUserTypeConfig();
  const IconComponent = userConfig.icon;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-lg overflow-x-hidden md:relative fixed top-0 z-40">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-fade-left {
          -webkit-mask-image: linear-gradient(to right, transparent, black 40px);
          mask-image: linear-gradient(to right, transparent, black 40px);
        }
        .scroll-fade-right {
          -webkit-mask-image: linear-gradient(to left, transparent, black 40px);
          mask-image: linear-gradient(to left, transparent, black 40px);
        }
        .scroll-fade-both {
          -webkit-mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
          mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
        }
      `}</style>
      <div className={`w-full transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        <div className="flex items-center h-14 min-w-0 relative">
          {/* Navegação Central - Desktop com limite calculado */}
          <nav className="hidden md:flex items-center relative group/nav" style={{ width: 'calc(100% - 140px)' }}>
            {/* Botão Scroll Esquerda */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-2 sm:left-4 lg:left-6 z-10 h-full px-2 bg-gradient-to-r from-white/95 to-transparent hover:from-white flex items-center transition-all duration-300"
                aria-label="Scroll para esquerda"
              >
                <ChevronLeft className="w-5 h-5 text-[#02b1aa]" />
              </button>
            )}

            <div
              ref={navRef}
              onScroll={checkScroll}
              className={`flex items-center justify-start overflow-x-auto scrollbar-hide w-full px-2 sm:px-4 lg:px-6 ${
                canScrollLeft && canScrollRight ? 'scroll-fade-both' :
                canScrollLeft ? 'scroll-fade-left' :
                canScrollRight ? 'scroll-fade-right' : ''
              }`}
            >
              <div className="flex items-center gap-0.5 md:gap-1 min-w-max py-1 pr-4">
                {tabs.map((tab) =>
                  tab.path ? (
                    <Link
                      key={tab.id}
                      href={tab.path}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex flex-col items-center justify-center px-2 md:px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-md shadow-[#02b1aa]/20 scale-[1.02]"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-sm"
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 md:w-[18px] md:h-[18px] flex-shrink-0 mb-0.5 transition-transform duration-300 ${
                        activeTab !== tab.id && "group-hover:scale-110"
                      }`} />
                      <span className="text-[9px] md:text-[10px] leading-tight text-center font-semibold whitespace-nowrap">
                        {tab.label}
                      </span>
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-t-full"></div>
                      )}
                    </Link>
                  ) : (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex flex-col items-center justify-center px-2 md:px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-md shadow-[#02b1aa]/20 scale-[1.02]"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-sm"
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 md:w-[18px] md:h-[18px] flex-shrink-0 mb-0.5 transition-transform duration-300 ${
                        activeTab !== tab.id && "group-hover:scale-110"
                      }`} />
                      <span className="text-[9px] md:text-[10px] leading-tight text-center font-semibold whitespace-nowrap">
                        {tab.label}
                      </span>
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-t-full"></div>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Botão Scroll Direita */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-2 z-10 h-full px-2 bg-gradient-to-l from-white/95 to-transparent hover:from-white flex items-center transition-all duration-300"
                aria-label="Scroll para direita"
              >
                <ChevronRight className="w-5 h-5 text-[#02b1aa]" />
              </button>
            )}
          </nav>

          {/* User Info Desktop - Posição Absoluta à Direita */}
          <div className="hidden md:flex items-center absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30">
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${userConfig.bg} border border-${userConfig.text}/20 shadow-lg backdrop-blur-sm bg-white/90`}>
              <div className="relative group/avatar">
                <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-r opacity-75 blur-sm group-hover/avatar:opacity-100 transition-opacity duration-300 ${userConfig.gradient}`}></div>
                <div className={`relative w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md ${userConfig.gradient}`}>
                  <IconComponent className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="hidden xl:block">
                <p className="text-[11px] font-semibold text-gray-900 leading-tight max-w-[100px] truncate">
                  {usuario.nome}
                </p>
                <p className={`text-[9px] font-medium ${userConfig.text}`}>
                  {usuario.tipo_usuario === "administrador" ? "Admin" : usuario.tipo_usuario === "profissional" ? "Profissional" : "Paciente"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Hamburguer - Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border-2 border-[#02b1aa]/30 bg-gradient-to-r from-white to-[#edfffe] hover:border-[#02b1aa] hover:from-[#edfffe] hover:to-cyan-50 transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#02b1aa]" />
            ) : (
              <Menu className="w-5 h-5 text-[#02b1aa]" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Hamburguer Dropdown - Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white/98 backdrop-blur-xl shadow-2xl border-t border-gray-200/80 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="py-5 px-4">
            {/* Informações do usuário */}
            <div className={`flex items-center gap-3 px-4 py-4 mb-5 rounded-xl shadow-sm border ${userConfig.bg} border-${userConfig.text}/20`}>
              <div className="relative group/avatar">
                <div className={`absolute -inset-1 rounded-full bg-gradient-to-r opacity-75 blur-sm transition-opacity duration-300 ${userConfig.gradient}`}></div>
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ${userConfig.gradient}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{usuario.nome}</p>
                <p className={`text-sm font-semibold ${userConfig.text}`}>
                  {usuario.tipo_usuario === "administrador" ? "Administrador" : usuario.tipo_usuario === "profissional" ? "Profissional" : "Paciente"}
                </p>
              </div>
            </div>

            {/* Navegação */}
            <nav className="space-y-2">
              {tabs.map((tab) =>
                tab.path ? (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-lg shadow-[#02b1aa]/30"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-md"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </Link>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 w-full text-left ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-lg shadow-[#02b1aa]/30"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-md"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              )}
            </nav>

            {/* Botão para fechar */}
            <div className="mt-5 pt-4 border-t border-gray-200/60">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 text-center text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
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
