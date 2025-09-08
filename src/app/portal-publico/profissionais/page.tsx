// src/app/portal-publico/profissionais/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "../../assets/icones/logo.png";
import Image from "next/image";
import { CheckCircle, Users } from "lucide-react";

type Profissional = {
  id: string;
  nome: string;
  informacoes_adicionais: {
    crp: string;
    especialidade: string;
    descricao: string;
    foto: string;
  };
};

export default function ProfissionaisAgendamentos({
  data,
}: {
  data: Profissional[];
}) {
  return (
    <div className="grid font-['Red_Hat_Display'] sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl">
      {data.map((prof) => (
        <div key={prof.id} className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
          <Card className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between text-center">
            {/* Foto */}
            <div className="w-40 h-40 -mt-16 mb-6 rounded-full overflow-hidden border-4 border-[#02b1aa] shadow-lg bg-gray-100 mx-auto group-hover:border-[#029fdf] transition-colors duration-300">
              {prof.informacoes_adicionais.foto ? (
                <img
                  src={prof.informacoes_adicionais.foto}
                  alt={`Foto de ${prof.nome}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src={logo}
                  alt={`Foto de ${prof.nome}`}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            {/* Cabeçalho */}
            <CardHeader className="p-0 w-full mb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {prof.nome}
              </CardTitle>

              <p className="text-base text-[#02b1aa] font-semibold mb-1">
                {prof.informacoes_adicionais.especialidade}
              </p>

              <p className="text-sm text-gray-500">
                CRP: {prof.informacoes_adicionais.crp}
              </p>
            </CardHeader>

            {/* Conteúdo */}
            <CardContent className="p-0 mt-4 flex flex-col flex-1">
              <p className="text-gray-700 text-base mb-6 leading-relaxed flex-1">
                {prof.informacoes_adicionais.descricao}
              </p>

              <div className="mt-6 flex items-center text-[#02b1aa] font-semibold text-sm mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Especialista Certificado</span>
              </div>

              <Button
                className="w-full mt-auto bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white font-semibold rounded-xl hover:from-[#029fdf] hover:to-[#01c2e3] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                asChild
              >
                <Link
                  className="w-full py-3"
                  href={`/portal-publico/profissionais/${prof.id}`}
                >
                  Ver Agenda
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
