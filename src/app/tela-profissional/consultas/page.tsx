import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { ProfessionalConsultasClient } from "@/components/professional/consultas-client";
import { BackButton } from "@/components/ui/back-button";

export default async function ConsultasProfissionalPage() {
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
    <div className="min-h-screen w-full bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-4">
          <BackButton href="/tela-profissional" texto="Voltar para Área do Profissional" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-azul-escuro">
            Minhas Consultas
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Gerencie suas consultas agendadas - confirme, cancele ou adicione observações
          </p>
        </div>

        <ProfessionalConsultasClient 
          profissionalNome={`Dr(a). ${usuario.nome}`}
          profissionalId={user.id}
        />
      </div>
    </div>
  );
}
