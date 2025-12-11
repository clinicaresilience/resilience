import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { ProfessionalAnalytics } from "@/components/admin/professional-analytics";

export default async function AnalyticsPage() {
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
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro">Análises Profissionais</h1>
        <p className="mt-2 text-lg text-gray-600">
          Bem-vindo, <span className="font-semibold">{usuario.nome}</span> ({user.email})
        </p>
      </div>

      {/* Content Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Análises detalhadas por profissional
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProfessionalAnalytics />
      </div>
    </div>
  );
}
