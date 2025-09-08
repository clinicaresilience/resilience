"use client";
import React, { useState, useEffect } from "react";
import IconeLogo from "../app/assets/icones/logo.png";
import Image from "next/image";
import Cabecalho from "./ui/cabecalho";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";

export default function Navegacao() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const eAPaginaDeLogin = pathname === "/auth/login";
  const [menuAberto, setMenuAberto] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Fecha o menu quando a tela fica >= 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && menuAberto) {
        setMenuAberto(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuAberto]);

  // Efeito de scroll para navbar fixa
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detecta se está scrolled
      setIsScrolled(currentScrollY > 50);

      // Detecta direção do scroll para mostrar/ocultar navbar
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scroll para baixo - esconder
      } else {
        setIsVisible(true); // Scroll para cima - mostrar
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const estiloBotao =
    "relative w-20 sm:w-24 h-8 sm:h-9 flex items-center justify-center rounded-full cursor-pointer transition-all duration-500 ease-in-out text-sm sm:text-base font-medium overflow-hidden group";

  const estiloBotaoAtivo =
    "bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-lg shadow-[#02b1aa]/25";

  const estiloBotaoInativo =
    "text-gray-600 hover:text-[#02b1aa] hover:bg-gradient-to-r hover:from-[#edfffe] hover:to-blue-50";

  const botoesNavegacao = [
    { rotulo: "Home", link: "/", ativo: pathname === "/" },
    { rotulo: "Sobre", link: "/portal-publico/sobre", ativo: pathname === "/portal-publico/sobre" },
    { rotulo: "Contato", link: "/portal-publico/contato", ativo: pathname === "/portal-publico/contato" },
  ];

  // Função para obter o link do painel baseado no tipo de usuário
  const getPainelLink = () => {
    if (!user) return "/auth/login";
    
    switch (user.tipo_usuario) {
      case "administrador":
        return ROUTES.admin.root;
      case "profissional":
        return ROUTES.professional.root;
      case "comum":
        return ROUTES.user.root;
      default:
        return "/auth/login";
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    await signOut();
    setMenuAberto(false);
    router.push("/");
  };

  return (
    <Cabecalho
      className={`
        fixed top-0 left-0 right-0 w-full h-24 items-center flex justify-center py-3 px-4 sm:px-8 lg:px-20 z-[100]
        transition-all duration-700 ease-out
        ${isScrolled
          ? 'bg-white/95 backdrop-blur-2xl shadow-2xl shadow-[#02b1aa]/15 border-b border-[#edfffe]/60'
          : 'bg-white/90 backdrop-blur-xl shadow-xl shadow-[#02b1aa]/8 border-b border-[#edfffe]/40'
        }
        ${isVisible
          ? 'transform translate-y-0'
          : 'transform -translate-y-full'
        }
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#02b1aa]/3 before:via-transparent before:to-[#029fdf]/3 before:pointer-events-none
        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#02b1aa]/20 after:to-transparent
      `}
    >
      <nav className="flex items-center justify-between w-full max-w-7xl">
        {/* Logo e Título */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative group">
            <Image
              className="transition-transform duration-300 group-hover:scale-105"
              src={IconeLogo}
              alt="Logo Clínica Resilience"
              width={55}
              height={55}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#02b1aa]/20 to-[#029fdf]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </div>

          <h1
            className={`hidden min-[1100px]:block ${
              eAPaginaDeLogin ? "invisible" : "visible"
            } text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent hover:from-[#029fdf] hover:to-[#01c2e3] transition-all duration-500`}
          >
            Clínica Resilience
          </h1>
        </div>

        {/* Navegação Desktop/Tablet (>=768px) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <ul
            className={`flex gap-2 sm:gap-3 ${
              eAPaginaDeLogin ? "invisible" : "visible"
            }`}
          >
            {botoesNavegacao.map(({ rotulo, link, ativo }) => (
              <li
                key={rotulo}
                className={`${estiloBotao} ${
                  ativo ? estiloBotaoAtivo : estiloBotaoInativo
                }`}
              >
                <Link href={link} className="relative z-10">
                  {rotulo}
                </Link>
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#02b1aa]/20 to-[#029fdf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              </li>
            ))}
          </ul>

          {/* Ações baseadas no estado de autenticação */}
          <div className="items-center flex gap-2 sm:gap-3">
            {!loading && (
              <>
                {user ? (
                  // Usuário logado - mostrar painel e logout
                  <>
                    <div className={`${estiloBotao} ${estiloBotaoAtivo} px-3`}>
                      <Link href={getPainelLink()} className="relative z-10 flex items-center gap-2 text-xs sm:text-sm">
                        <User size={14} />
                        Meu Painel
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#029fdf]/20 to-[#01c2e3]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    </div>
                    <div className={`${estiloBotao} bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center gap-2 px-3 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25`}>
                      <button onClick={handleLogout} className="relative z-10 flex items-center gap-2 text-xs sm:text-sm">
                        <LogOut size={14} />
                        Sair
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    </div>
                  </>
                ) : (
                  // Usuário não logado - mostrar login e agendamento
                  <>
                    <div className={`${estiloBotao} ${estiloBotaoAtivo} px-3 ${eAPaginaDeLogin ? "invisible" : "visible"}`}>
                      <Link href="/auth/login" className="relative z-10 text-xs sm:text-sm">
                        Login
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#029fdf]/20 to-[#01c2e3]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    </div>
                    <div className="hidden sm:block w-px h-7 bg-gradient-to-b from-[#02b1aa] to-[#029fdf]"></div>
                    <div className={`${estiloBotao} !w-auto px-4 border-2 border-[#02b1aa] text-[#02b1aa] hover:bg-gradient-to-r hover:from-[#02b1aa] hover:to-[#029fdf] hover:text-white hover:border-transparent transition-all duration-500`}>
                      <Link href="/portal-publico" className="relative z-10 text-xs sm:text-sm whitespace-nowrap">
                        Agendamento
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Menu Hamburguer - Mobile (<768px) */}
        <div className="md:hidden flex items-center relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="relative p-3 rounded-2xl border-2 border-[#02b1aa]/30 hover:border-[#02b1aa] bg-gradient-to-r from-white to-[#edfffe] hover:from-[#edfffe] hover:to-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="relative z-10">
              {menuAberto ? <X size={20} className="text-[#02b1aa]" /> : <Menu size={20} className="text-[#02b1aa]" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </button>

          {/* Dropdown mobile */}
          <div
            className={`absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-[#edfffe] flex flex-col transform transition-all duration-500 ease-out ${
              menuAberto
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            {/* Navegação */}
            <div className="p-2">
              {botoesNavegacao.map(({ rotulo, link, ativo }) => (
                <Link
                  key={rotulo}
                  href={link}
                  onClick={() => setMenuAberto(false)}
                  className={`block px-4 py-3 mb-1 rounded-xl transition-all duration-300 ${
                    ativo
                      ? "bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#edfffe] hover:to-blue-50 hover:text-[#02b1aa]"
                  }`}
                >
                  {rotulo}
                </Link>
              ))}
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#02b1aa]/30 to-transparent mx-4 my-2"></div>

            {/* Opções baseadas no estado de autenticação - Mobile */}
            <div className="p-2">
              {!loading && (
                <>
                  {user ? (
                    // Usuário logado - mostrar painel e logout
                    <>
                      <Link
                        href={getPainelLink()}
                        onClick={() => setMenuAberto(false)}
                        className="flex items-center gap-3 px-4 py-3 mb-1 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-[#edfffe] hover:to-blue-50 hover:text-[#02b1aa] transition-all duration-300"
                      >
                        <User size={18} />
                        Meu Painel
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                      >
                        <LogOut size={18} />
                        Sair
                      </button>
                    </>
                  ) : (
                    // Usuário não logado - mostrar login e agendamento
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMenuAberto(false)}
                        className="flex items-center gap-3 px-4 py-3 mb-1 rounded-xl bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white hover:from-[#029fdf] hover:to-[#01c2e3] transition-all duration-300 shadow-lg"
                      >
                        Login
                      </Link>
                      <Link
                        href="/portal-publico"
                        onClick={() => setMenuAberto(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#02b1aa] text-[#02b1aa] hover:bg-gradient-to-r hover:from-[#02b1aa] hover:to-[#029fdf] hover:text-white hover:border-transparent transition-all duration-300"
                      >
                        Agendamento
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </Cabecalho>
  );
}
