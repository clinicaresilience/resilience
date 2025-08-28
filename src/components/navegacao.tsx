"use client";
import React from "react";
import IconeLogo from "../app/assets/icones/logo.png";
import Image from "next/image";
import Cabecalho from "./ui/cabecalho";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Navegacao() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/auth/login";

  const estiloBotao =
    "w-24 h-9 flex items-center justify-center rounded-3xl cursor-pointer transition-colors duration-500 ease-in-out hover:bg-gradient-to-r hover:from-azul-vivido hover:to-roxo hover:text-white";

  const botoesNavegacao = [
    { rotulo: "Home", link: "/", ativo: true },
    { rotulo: "Sobre", link: "#" },
    { rotulo: "Contato", link: "#" },
  ];

  return (
    <Cabecalho className="w-full py-4 px-20 fixed drop-shadow-xl z-[99]  bg-white	shadow">
      <nav className="flex items-center justify-around">
        {/* Logo e Título */}

        <div className="flex items-center gap-8">
          <Image
            src={IconeLogo}
            alt="Logo Clínica Resilience"
            width={90}
            height={90}
          />

          <h1
            className={`${
              isLoginPage ? "invisible" : "visible"
            } text-3xl font-bold text-azul-escuro`}
          >
            Clínica Resilience
          </h1>
        </div>

        {/* Navegação Principal */}
        <ul className={`flex gap-3 ${isLoginPage ? "invisible" : "visible"} `}>
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

        {/* Ações (Login) */}
        <div className=" items-center flex gap-3">
          <Button
            className={`${estiloBotao} ${
              isLoginPage ? "invisible" : "visible"
            } bg-azul-escuro text-white flex`}
          >
            <Link href="/auth/login" className="w-full text-center">
              Login
            </Link>
          </Button>
          <span className="w-px h-7 bg-azul-escuro-secundario"></span>
          <Button className={`${estiloBotao} w-fit text-azul-escuro-secundario border-azul-escuro-secundario border`}>
            <Link href="/portal-publico" className="w-full text-center">
              Agendamento
            </Link>
          </Button>
        </div>
      </nav>
    </Cabecalho>
  );
}
