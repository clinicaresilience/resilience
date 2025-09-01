import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { PacientesListClient } from "@/components/admin/pacientes-list-client";

export default async function PacientesPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-azul-escuro">Gerenciar Pacientes</h1>
          <p className="text-gray-600">Visualize e gerencie todos os pacientes cadastrados no sistema.</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <PacientesListClient />
    </div>
  );
}
