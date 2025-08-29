import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { LogoutButton } from "@/components/logout-button";
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-azul-escuro-secundario">
        Painel Administrativo
      </h1>
      <p className="mt-4 text-lg">
        Bem-vindo, <span className="font-semibold">{usuario.nome}</span>!
      </p>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow w-full max-w-md">
        <h2 className="text-xl font-semibold">Suas informações</h2>
        <ul className="mt-2 text-gray-700 space-y-1">
          <li>
            <b>ID:</b> {user.id}
          </li>
          <li>
            <b>Email:</b> {user.email}
          </li>
          <li>
            <b>Tipo de usuário:</b> {usuario.tipo_usuario}
          </li>
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <CadastrarProfissionalDialog />
        <LogoutButton />
      </div>
    </div>
  );
}
