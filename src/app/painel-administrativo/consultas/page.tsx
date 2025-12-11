import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { SchedulesSection } from "@/components/admin/schedules-section";

export default async function ConsultasPage() {
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
        <h1 className="text-2xl font-bold text-azul-escuro">Gerenciar Consultas</h1>
        <p className="text-gray-600">Visualize e gerencie todas as consultas e agendamentos do sistema.</p>
      </div>
      
      <SchedulesSection />
    </div>
  );
}
