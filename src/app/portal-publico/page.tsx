// src/app/portal-publico/page.tsx (SERVER)
import { createClient } from "@/lib/server";
import ProfissionaisPublico from "./profissionais/page";

export default async function PortalPublico() {
  const supabase = await createClient();

  const { data: profissionais, error } = await supabase
    .from("usuarios")
    .select("id, nome, informacoes_adicionais")
    .eq("tipo_usuario", "profissional")
    .order("nome");

  console.log("profissionais", profissionais);

  if (error) {
    console.error("Erro ao buscar profissionais:", error.message);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-azul-escuro mb-10">
        Nossos Psicólogos
      </h1>

      <ProfissionaisPublico data={profissionais ?? []} />
    </div>
  );
}
