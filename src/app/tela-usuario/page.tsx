import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PortalPublico() {
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

  // 🔑 se for admin, encaminha pro painel administrativo
  if (usuario.tipo_usuario === "administrador") {
    redirect("/painel-administrativo");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-azul-escuro-secundario">
        Area do usuario
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
        <Button asChild>
          <Link href="/tela-usuario/agendamentos">Ver meus agendamentos</Link>
        </Button>
        <LogoutButton />
      </div>
    </div>
  );
}
