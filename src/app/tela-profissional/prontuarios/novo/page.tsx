import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { NovoProntuarioClient } from "@/components/professional/novo-prontuario-client";

export default async function NovoProntuarioPage() {
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
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-4">
          <BackButton href="/tela-profissional/prontuarios" texto="Voltar para Prontuários" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-azul-escuro">
            Criar Novo Prontuário
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Faça upload do prontuário em PDF para um paciente atendido
          </p>
        </div>

        <NovoProntuarioClient 
          profissionalNome={`Dr(a). ${usuario.nome}`}
          profissionalId={user.id}
        />
      </div>
    </div>
  );
}
