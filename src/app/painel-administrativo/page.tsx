import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { LogoutButton } from "@/components/logout-button";
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog";
import { ProfissionaisList } from "@/components/admin/profissionais-list";
import { AdminDashboard } from "@/components/admin/dashboard";

export default async function PainelAdministrativo() {
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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-azul-escuro">Painel Administrativo</h1>
            <p className="mt-1 text-gray-600">
              Bem-vindo, <span className="font-semibold">{usuario.nome}</span> ({user.email})
            </p>
          </div>
          <div className="flex gap-2">
            <CadastrarProfissionalDialog />
            <LogoutButton />
          </div>
        </div>

        {/* Dashboard - estatísticas por profissional (mock) */}
        <div className="mt-8">
          <AdminDashboard />
        </div>

        {/* Lista de profissionais cadastrados (mock/localStorage) */}
        <div className="mt-8">
          <ProfissionaisList />
        </div>
      </div>
    </div>
  );
}
