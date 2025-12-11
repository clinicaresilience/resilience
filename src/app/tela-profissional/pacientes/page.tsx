import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { PacientesOverview } from "@/components/professional/pacientes-client";

export default async function PacientesProfissionalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single();

  if (error || !usuario) {
    redirect("/auth/login");
  }

  // Verificar se é profissional
  if (usuario.tipo_usuario !== "profissional") {
    if (usuario.tipo_usuario === "administrador") {
      redirect("/painel-administrativo");
    } else {
      redirect("/tela-usuario");
    }
  }

  return (
    <div>
      <div className="mb-4">
        <BackButton href="/tela-profissional" texto="Voltar para Área do Profissional" />
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-azul-escuro">
          Meus Pacientes
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Histórico e informações dos pacientes que você atende
        </p>
      </div>

      <PacientesOverview 
        profissionalId={user.id}
      />
    </div>
  );
}
