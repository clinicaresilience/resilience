import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { NovoProntuarioClient } from "@/components/professional/novo-prontuario-client";

export default async function ProntuariosProfissionalPage() {
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
        <BackButton
          href="/tela-profissional"
          texto="Voltar para Área do Profissional"
        />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-azul-escuro">
          Prontuários 
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Acesse, edite e gerencie os prontuários dos seus pacientes
        </p>
      </div>

      <NovoProntuarioClient
        profissionalNome={`Dr(a). ${usuario.nome}`}
        profissionalId={user.id}
      />
    </div>
  );
}
