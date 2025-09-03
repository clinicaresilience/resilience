"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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

export default function ProfissionaisPublico({
  data,
}: {
  data: Profissional[];
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
      {data.map((prof) => (
        <Card
          key={prof.id}
          className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl flex flex-col items-center text-center p-6"
        >
          {/* Foto */}
          {prof.informacoes_adicionais.foto && (
            <div className="w-40 h-40 -mt-14 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
              <img
                src={prof.informacoes_adicionais.foto}
                alt={`Foto de ${prof.nome}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <CardHeader className="p-0 w-full">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {prof.nome}
            </CardTitle>
            {prof.informacoes_adicionais.especialidade && (
              <p className="text-sm text-azul-escuro">
                {prof.informacoes_adicionais.especialidade}
              </p>
            )}
            {prof.informacoes_adicionais.crp && (
              <p className="text-xs text-gray-500">
                {prof.informacoes_adicionais.crp}
              </p>
            )}
          </CardHeader>

          <CardContent className="p-0 mt-4">
            {prof.informacoes_adicionais.descricao && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {prof.informacoes_adicionais.descricao}
              </p>
            )}
            <Button
              className="w-full bg-azul-escuro text-white font-medium rounded-lg hover:bg-azul-medio transition-colors"
              asChild
            >
              <Link href={`/portal-publico/profissionais/${prof.id}`}>
                Ver Agenda
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
