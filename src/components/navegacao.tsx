"use client";
import React, { useState, useEffect } from "react";
import IconeLogo from "../app/assets/icones/logo.png";
import Image from "next/image";
import Cabecalho from "./ui/cabecalho";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

export default function Navegacao() {
  const pathname = usePathname();
  const eAPaginaDeLogin = pathname === "/auth/login";
  const [menuAberto, setMenuAberto] = useState(false);

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

  const estiloBotao =
    "w-20 sm:w-24 h-8 sm:h-9 flex items-center justify-center rounded-3xl cursor-pointer transition-colors duration-500 ease-in-out hover:bg-gradient-to-r hover:from-azul-vivido hover:to-roxo hover:text-white text-sm sm:text-base";

  const botoesNavegacao = [
    { rotulo: "Home", link: "/", ativo: true },
    { rotulo: "Sobre", link: "#" },
    { rotulo: "Contato", link: "#" },
  ];

  return (
    <Cabecalho className="w-full h-24 items-center flex justify-center py-3 px-4 sm:px-8 lg:px-20 fixed drop-shadow-xl z-[99] bg-white shadow">
      <nav className="flex items-center justify-between w-full">
        {/* Logo e Título */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Image
            className=""
            src={IconeLogo}
            alt="Logo Clínica Resilience"
            width={55}
            height={55}
          />

          <h1
            className={`hidden min-[1100px]:block ${
              eAPaginaDeLogin ? "invisible" : "visible"
            } text-2xl lg:text-3xl font-bold text-azul-escuro`}
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
                  ativo
                    ? "bg-azul-escuro text-white hover:bg-azul-medio"
                    : "text-gray-500"
                }`}
              >
                <Link href={link}>{rotulo}</Link>
              </li>
            ))}
          </ul>

          {/* Ações (Login / Agendamento) */}
          <div className="items-center flex gap-2 sm:gap-3">
            <Button
              className={`${estiloBotao} ${
                eAPaginaDeLogin ? "invisible" : "visible"
              } bg-azul-escuro text-white flex`}
            >
              <Link href="/auth/login" className="w-full text-center">
                Login
              </Link>
            </Button>
            <span className="hidden sm:block w-px h-7 bg-azul-escuro-secundario"></span>
            <Button
              className={`${estiloBotao} !w-fit text-azul-escuro-secundario border-azul-escuro-secundario border`}
            >
              <Link href="/portal-publico" className="w-full text-center">
                Agendamento
              </Link>
            </Button>
          </div>
        </div>

        {/* Menu Hamburguer - Mobile (<768px) */}
        <div className="md:hidden flex items-center relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown mobile */}
          <div
            className={`absolute top-full right-0 mt-2 w-44 bg-white shadow-lg rounded-md flex flex-col text-right transform transition-all duration-300 ease-in-out ${
              menuAberto
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {botoesNavegacao.map(({ rotulo, link }) => (
              <Link
                key={rotulo}
                href={link}
                onClick={() => setMenuAberto(false)}
                className="px-4 py-2 text-gray-700 hover:text-azul-escuro transition-colors"
              >
                {rotulo}
              </Link>
            ))}

            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuAberto(false)}
                className="px-4 py-2 text-gray-700 hover:text-azul-escuro transition-colors"
              >
                Login
              </Link>
              <Link
                href="/portal-publico"
                onClick={() => setMenuAberto(false)}
                className="px-4 py-2 text-gray-700 hover:text-azul-escuro transition-colors"
              >
                Agendamento
              </Link>
            </>
          </div>
        </div>
      </nav>
    </Cabecalho>
  );
}
