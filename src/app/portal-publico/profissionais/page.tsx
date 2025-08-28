"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import IconeProfissional from "../../assets/icones/logo.png";
import { useRouter } from "next/navigation";

type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  crp: string;
  descricao: string;
  foto: StaticImageData;
};

export default function PortalPublico() {
  const router = useRouter();

  const profissionais: Profissional[] = [
    {
      id: "ana",
      nome: "Dra. Ana Souza",
      especialidade: "Psicóloga Clínica",
      crp: "CRP 12/34567",
      descricao:
        "Atendimento individual e em grupo, com foco em terapia cognitivo-comportamental.",
      foto: IconeProfissional,
    },
    {
      id: "marcos",
      nome: "Dr. Marcos Lima",
      especialidade: "Psicólogo Infantil",
      crp: "CRP 98/76543",
      descricao:
        "Especialista em psicologia infantil, lida com dificuldades de aprendizado e comportamento.",
      foto: IconeProfissional,
    },
    {
      id: "joana",
      nome: "Dra. Joana Pereira",
      especialidade: "Psicóloga Organizacional",
      crp: "CRP 45/11223",
      descricao:
        "Atuação voltada para saúde mental no trabalho e desenvolvimento de equipes.",
      foto: IconeProfissional,
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-azul-escuro mb-10">
        Nossos Psicólogos
      </h1>

      {/* Grid de profissionais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
        {profissionais.map((prof) => (
          <Card
            key={prof.id}
            className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl flex flex-col items-center text-center p-6"
          >
            {/* Foto do profissional */}
            <div className="w-40 h-40 -mt-14 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
              <Image
                src={prof.foto}
                alt={`Foto de ${prof.nome}`}
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>

            <CardHeader className="p-0 w-full">
              <CardTitle className="text-xl font-semibold text-gray-800">
                {prof.nome}
              </CardTitle>
              <p className="text-sm text-azul-escuro">{prof.especialidade}</p>
              <p className="text-xs text-gray-500">{prof.crp}</p>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {prof.descricao}
              </p>
              <Button
                className="w-full bg-azul-escuro text-white font-medium rounded-lg hover:bg-azul-medio transition-colors"
                onClick={() =>
                  router.push(`/portal-publico/profissionais/${prof.id}`)
                }
              >
                Ver Agenda
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
