"use client";
import React, { useState, useEffect } from "react";
import IconeLogo from "../app/assets/icones/logo.png";
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
    "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out backdrop-blur-sm";

  const estiloBotaoAtivo =
    "bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl hover:shadow-[#02b1aa]/30";

  const estiloBotaoInativo =
    "text-gray-700 hover:text-[#02b1aa] hover:bg-gradient-to-r hover:from-[#edfffe]/60 hover:to-[#02b1aa]/10 hover:shadow-md";

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
            ? "bg-white/98 backdrop-blur-xl shadow-xl shadow-[#02b1aa]/10 border-b border-[#02b1aa]/20"
            : "bg-gradient-to-r from-white/95 via-[#edfffe]/80 to-white/95 backdrop-blur-md shadow-lg shadow-[#02b1aa]/5 border-b border-[#02b1aa]/10"
        }
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#02b1aa]/5 before:via-transparent before:to-[#029fdf]/5 before:pointer-events-none
      `}
    >
      <nav className="flex items-center justify-between w-full max-w-7xl">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-2 border border-white/30 shadow-lg">
                <Image
                  src={IconeLogo}
                  alt="Logo Clínica Resilience"
                  width={42}
                  height={42}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight">
                Clínica Resilience
              </span>
              <span className="text-xs text-[#02b1aa] font-medium tracking-wide">
                Saúde Mental Corporativa
              </span>
            </div>
          </Link>
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
                className={`rounded-xl transition-all duration-300 ${
                  ativo ? estiloBotaoAtivo : estiloBotaoInativo
                }`}
              >
                <Link
                  href={link}
                  className="block w-full h-full px-5 py-2.5 flex items-center justify-center"
                >
                  {rotulo}
                </Link>
              </li>
            ))}
          </ul>

          {/* Ações de autenticação */}
          <div className="items-center flex gap-2 sm:gap-3">
            {!loading && user ? (
              <>
                <div className={`${estiloBotao} ${estiloBotaoAtivo} px-3`}>
                  <Link
                    href={getPainelLink()}
                    className="flex items-center gap-2 text-xs sm:text-sm w-full h-full justify-center"
                  >
                    <User size={14} />
                    Meu Painel
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className={`${estiloBotao} bg-red-500 text-white flex items-center gap-2 px-3 hover:bg-red-600 w-full h-full justify-center rounded-xl`}
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <div className={`${estiloBotao} ${estiloBotaoAtivo} px-3`}>
                  <Link
                    href="/auth/login"
                    className="text-xs sm:text-sm w-full h-full flex items-center justify-center"
                  >
                    Login
                  </Link>
                </div>
                <div className="hidden sm:block w-px h-7 bg-gray-300"></div>
                <div
                  className={`${estiloBotao} !w-auto px-4 border-2 border-[#02b1aa] text-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300`}
                >
                  <Link
                    href="/portal-publico"
                    className="text-xs sm:text-sm whitespace-nowrap w-full h-full flex items-center justify-center"
                  >
                    Agendamento
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-3 rounded-xl border-2 border-[#02b1aa]/30 hover:border-[#02b1aa] bg-gradient-to-r from-white to-[#edfffe] hover:from-[#edfffe] hover:to-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {menuAberto ? (
              <X size={20} className="text-[#02b1aa]" />
            ) : (
              <Menu size={20} className="text-[#02b1aa]" />
            )}
          </button>

          {menuAberto && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-[#02b1aa]/20 py-3">
              {botoesNavegacao.map(({ rotulo, link, ativo }) => (
                <Link
                  key={rotulo}
                  href={link}
                  onClick={() => setMenuAberto(false)}
                  className={`block px-5 py-3 mx-2 mb-1 rounded-xl text-sm font-medium transition-all duration-300 ${
                    ativo ? estiloBotaoAtivo : estiloBotaoInativo
                  }`}
                >
                  {rotulo}
                </Link>
              ))}

              <div className="h-px bg-gradient-to-r from-transparent via-[#02b1aa]/30 to-transparent mx-4 my-3"></div>

              {!loading && user ? (
                <>
                  <Link
                    href={getPainelLink()}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 px-5 py-3 mx-2 mb-1 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#02b1aa] transition-all duration-300"
                  >
                    <User size={16} />
                    Meu Painel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-5 py-3 mx-2 w-full text-left rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuAberto(false)}
                    className="block px-5 py-3 mx-2 mb-1 rounded-xl text-sm font-medium bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white hover:from-[#029fdf] hover:to-[#01c2e3] transition-all duration-300 shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl hover:shadow-[#02b1aa]/30"
                  >
                    Login
                  </Link>
                  <Link
                    href="/portal-publico"
                    onClick={() => setMenuAberto(false)}
                    className="block px-5 py-3 mx-2 rounded-xl text-sm font-medium border-2 border-[#02b1aa] text-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300"
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
