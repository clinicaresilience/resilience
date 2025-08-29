import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { LogoutButton } from "@/components/logout-button";
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog";
import { ProfissionaisList } from "@/components/admin/profissionais-list";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-fundo-escuro text-white">
      <h1 className="text-3xl font-bold text-azul-escuro">
        Painel Administrativo {user.email}
      </h1>
      <p className="mt-4 text-lg text-black">
        Bem-vindo,{" "}
        <span className="font-semibold text-azul-claro">{usuario.nome}</span>!
      </p>

      <div className="mt-8 w-full max-w-2xl">
        <ProfissionaisList />
      </div>

      <div className="mt-6 flex gap-3">
        <CadastrarProfissionalDialog />

        <LogoutButton />
      </div>
    </div>
  );
}
