"use client";

import Cabecalho from "@/components/cabecalho";
import IconeLogo from "./assets/icones/logo.png";
import Image from "next/image";

export default function Inicio() {
  const estiloBotao =
    "w-24 h-9 flex items-center justify-center rounded-3xl cursor-pointer transition-colors duration-500 ease-in-out hover:bg-gradient-to-r hover:from-azul-vivido hover:to-roxo hover:text-white";

  const botoesNavegacao = [
    { rotulo: "Home", link: "#", ativo: true },
    { rotulo: "Sobre", link: "#" },
    { rotulo: "Contato", link: "#" },
  ];

  return (
    <div className="w-full h-screen">
      <Cabecalho className="w-full py-4 px-20 absolute drop-shadow-2xl	shadow">
        <nav className="flex items-center justify-around">
          {/* Logo e Título */}
          <div className="flex items-center gap-8">
            <Image
              src={IconeLogo}
              alt="Logo Clínica Resilience"
              width={90}
              height={90}
            />
            <h1 className="text-3xl font-bold text-azul-escuro">
              Clínica Resilience
            </h1>
          </div>

          {/* Navegação Principal */}
          <ul className="flex gap-3">
            {botoesNavegacao.map(({ rotulo, link, ativo }) => (
              <li
                key={rotulo}
                className={`${estiloBotao} ${
                  ativo
                    ? "bg-azul-escuro text-white hover:bg-azul-medio"
                    : "text-gray-500"
                }`}
              >
                <a href={link}>{rotulo}</a>
              </li>
            ))}
          </ul>

          {/* Ações (Login/Cadastro) */}
          <ul className="flex items-center gap-3">
            <li className={`${estiloBotao} bg-azul-escuro text-white `}>
              <a href="./auth/login">Login</a>
            </li>
          </ul>
        </nav>
      </Cabecalho>

      {/* Conteúdo principal */}
      <main className="flex flex-col items-center sm:items-start w-full h-full gap-8" />

      {/* Rodapé */}
      <footer className="flex flex-wrap items-center justify-center gap-6" />
    </div>
  );
}
