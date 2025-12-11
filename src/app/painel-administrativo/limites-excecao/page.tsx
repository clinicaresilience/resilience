import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { ExceptionLimitsManagement } from "@/components/admin/exception-limits-management";

export default async function LimitesExcecaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single();

  if (error || !usuario || usuario.tipo_usuario !== "administrador") {
    redirect("/portal-publico");
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro">Limites de Exceção</h1>
        <p className="mt-2 text-lg text-gray-600">
          Bem-vindo, <span className="font-semibold">{usuario.nome}</span> ({user.email})
        </p>
      </div>

      {/* Content Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Configure o tempo máximo de exceção diário que profissionais podem ter
          </p>
        </div>
      </div>

      {/* Exception Limits Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ExceptionLimitsManagement />
      </div>
    </div>
  );
}
