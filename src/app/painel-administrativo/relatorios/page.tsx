import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { ProfessionalAnalytics } from "@/components/admin/professional-analytics";

export default async function RelatoriosPage() {
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

  // Verificar se é administrador
  if (usuario.tipo_usuario !== "administrador") {
    if (usuario.tipo_usuario === "profissional") {
      redirect("/tela-profissional");
    } else {
      redirect("/tela-usuario");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-azul-escuro">Relatórios e Análises</h1>
        <p className="text-gray-600">Análises detalhadas e relatórios do sistema.</p>
      </div>
      
      <ProfessionalAnalytics />
    </div>
  );
}
