"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Cabecalho from "./ui/cabecalho";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
      setIsScrolled(currentScrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const estiloBotao =
    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out";

  const estiloBotaoAtivo =
    "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-md shadow-[#02b1aa]/20";

  const estiloBotaoInativo =
    "text-gray-600 hover:text-[#02b1aa] hover:bg-gray-50/80";

  const botoesNavegacao = [
    { rotulo: "Home", link: "/", ativo: pathname === "/" },
    {
      rotulo: "Sobre",
      link: "/portal-publico/sobre",
      ativo: pathname === "/portal-publico/sobre",
    },
    {
      rotulo: "DRPS",
      link: "/portal-publico/drps",
      ativo: pathname === "/portal-publico/drps",
    },
  ];

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

  const handleLogout = async () => {
    await signOut();
    setMenuAberto(false);
    router.push("/");
  };

  return (
    <Cabecalho
      className={`
        fixed top-0 select-none left-0 right-0 w-full h-20 items-center flex justify-center py-4 px-4 sm:px-8 lg:px-20 z-[100]
        transition-all duration-500 ease-out
        ${
          isScrolled
            ? "bg-white/95 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-b border-gray-200/60"
            : "bg-white/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-b border-gray-100/60"
        }
      `}
    >
      <nav className="flex items-center justify-between w-full max-w-7xl">
        {/* Logo - Modernizado */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#02b1aa]/5 to-[#029fdf]/5 rounded-2xl p-2.5 border border-gray-200/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-[#02b1aa]/30">
                <Image
                  src="/logo.png"
                  alt="Logo Clínica Resilience"
                  width={40}
                  height={40}
                  className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight">
                Clínica Resilience
              </span>
              <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                Saúde Mental Corporativa
              </span>
            </div>
          </Link>
        </div>

        {/* Navegação Desktop/Tablet (>=768px) - Modernizado */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <ul
            className={`flex gap-1 ${
              eAPaginaDeLogin ? "invisible" : "visible"
            }`}
          >
            {botoesNavegacao.map(({ rotulo, link, ativo }) => (
              <li key={rotulo}>
                <Link
                  href={link}
                  className={`${estiloBotao} ${
                    ativo ? estiloBotaoAtivo : estiloBotaoInativo
                  } flex items-center justify-center relative group/nav`}
                >
                  {rotulo}
                  {ativo && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Ações de autenticação - Modernizado */}
          <div className="items-center flex gap-2">
            {!loading && user ? (
              <>
                <Link
                  href={getPainelLink()}
                  className={`${estiloBotao} ${estiloBotaoAtivo} flex items-center gap-2 text-xs sm:text-sm`}
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Meu Painel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`${estiloBotao} bg-red-500/90 text-white flex items-center gap-2 hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md`}
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`${estiloBotao} ${estiloBotaoAtivo} text-xs sm:text-sm`}
                >
                  Login
                </Link>
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                <Link
                  href="/portal-publico"
                  className={`${estiloBotao} border border-[#02b1aa]/30 text-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300 text-xs sm:text-sm whitespace-nowrap`}
                >
                  Agendamento
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Menu Mobile - Modernizado */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2.5 rounded-xl border border-gray-200/80 hover:border-[#02b1aa]/40 bg-white/80 backdrop-blur-sm hover:bg-gray-50/80 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {menuAberto ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <Menu size={20} className="text-gray-600" />
            )}
          </button>

          {menuAberto && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl shadow-xl rounded-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {botoesNavegacao.map(({ rotulo, link, ativo }) => (
                <Link
                  key={rotulo}
                  href={link}
                  onClick={() => setMenuAberto(false)}
                  className={`block px-4 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium transition-all duration-300 ${
                    ativo ? estiloBotaoAtivo : estiloBotaoInativo
                  }`}
                >
                  {rotulo}
                </Link>
              ))}

              <div className="h-px bg-gray-100 mx-3 my-2"></div>

              {!loading && user ? (
                <>
                  <Link
                    href={getPainelLink()}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 hover:text-[#02b1aa] transition-all duration-300"
                  >
                    <User size={18} />
                    Meu Painel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 mx-2 w-full text-left rounded-xl bg-red-500/90 text-white hover:bg-red-600 transition-all duration-300 shadow-sm"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuAberto(false)}
                    className={`block px-4 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium ${estiloBotaoAtivo}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/portal-publico"
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-2.5 mx-2 rounded-xl text-sm font-medium border border-[#02b1aa]/30 text-[#02b1aa] hover:bg-[#02b1aa] hover:text-white transition-all duration-300"
                  >
                    Agendamento
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </Cabecalho>
  );
}
