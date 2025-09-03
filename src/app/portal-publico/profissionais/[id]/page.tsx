import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

type Agenda = {
  id: string;
  data: string;
  hora: string;
  disponivel: boolean;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getProfissional(id: string) {
  const res = await fetch(`${baseUrl}/api/profissionais/${id}`, {
    cache: "no-store", // evita cache no SSR
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function PerfilProfissional({
  params,
}: {
  params: { id: string }; // ✅ não é Promise
}) {
  const { id } = params; // ✅ sem await
  const data = await getProfissional(id);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Profissional não encontrado.</p>
      </div>
    );
  }

  const { profissional, agendas } = data as {
    profissional: Profissional;
    agendas: Agenda[];
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Profissional não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6 pt-20">
      <Card className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-8 flex flex-col items-center text-center">
        {/* Foto */}
        {profissional.informacoes_adicionais?.foto && (
          <div className="w-40 h-40 -mt-14 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
            <img
              src={profissional.informacoes_adicionais.foto}
              alt={`Foto de ${profissional.nome}`}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800">
          {profissional.nome}
        </h1>
        <p className="text-sm text-azul-escuro">
          {profissional.informacoes_adicionais?.especialidade}
        </p>
        <p className="text-xs text-gray-500">
          crp {profissional.informacoes_adicionais?.crp}
        </p>

        <p className="mt-4 text-gray-600 text-sm leading-relaxed">
          {profissional.informacoes_adicionais?.descricao}
        </p>

        {/* Agenda */}
        <div className="w-full mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">
            Horários disponíveis
          </h2>
          {agendas && agendas.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {agendas.map((slot: Agenda) => (
                <Button
                  key={slot.id}
                  className={`rounded-lg ${
                    slot.disponivel
                      ? "bg-azul-escuro text-white hover:bg-azul-medio"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!slot.disponivel}
                >
                  {new Date(slot.data).toLocaleDateString("pt-BR", {
                    weekday: "short", // ← mostra dia da semana (seg, ter, qua…)
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  - {slot.hora.slice(0, 5)}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum horário disponível.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
