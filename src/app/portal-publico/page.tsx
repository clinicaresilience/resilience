// src/app/portal-publico/page.tsx
import ProfissionaisAgendamentos from "./profissionais/page";

export default async function AgendamentosPublico() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Chama sua API interna (sem precisar de SITE_URL)
  const res = await fetch(`${baseUrl}/api/profissionais`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Erro ao buscar profissionais:", res.statusText);
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-azul-escuro mb-10">
          Nossos Psicólogos
        </h1>
        <p className="text-red-500">Erro ao carregar profissionais.</p>
      </div>
    );
  }

  const profissionais = await res.json();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-azul-escuro mb-10">
        Nossos Psicólogos
      </h1>

      <ProfissionaisAgendamentos data={profissionais ?? []} />
    </div>
  );
}
