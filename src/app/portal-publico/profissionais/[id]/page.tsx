import { PerfilProfissionalClient } from "./client";

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
  params: { id: string };
}) {
  const { id } = params;
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

  return (
    <PerfilProfissionalClient 
      profissional={profissional} 
      agendas={agendas} 
    />
  );
}
