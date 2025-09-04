import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { AgendaCalendar } from "@/components/professional/agenda-calendar";
import AgendamentosList from "@/components/agendamentos-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List } from "lucide-react";

export default async function AgendaPage() {
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

  // Buscar agendamentos do profissional
  const { data: agendamentos, error: agendamentosError } = await supabase
    .from("agendamentos")
    .select(`
      *,
      paciente:usuarios!agendamentos_paciente_id_fkey(nome, email, telefone),
      profissional:usuarios!agendamentos_profissional_id_fkey(nome)
    `)
    .eq("profissional_id", user.id)
    .order("data_consulta", { ascending: true });

  if (agendamentosError) {
    console.error("Erro ao buscar agendamentos:", agendamentosError);
  }

  // Formatar agendamentos para o componente
  const formattedAgendamentos = agendamentos?.map((ag) => ({
    id: ag.id,
    usuarioId: ag.paciente_id,
    profissionalId: ag.profissional_id,
    profissionalNome: ag.profissional?.nome || "Profissional",
    especialidade: ag.profissional?.especialidade || "",
    dataISO: ag.data_consulta,
    local: "Clínica Resilience",
    status: ag.status,
    notas: ag.notas,
    pacienteNome: ag.paciente?.nome || "Paciente",
    pacienteEmail: ag.paciente?.email || "",
    pacienteTelefone: ag.paciente?.telefone || "",
  })) || [];

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-profissional" texto="Voltar para Área do Profissional" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">Minha Agenda</h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualize sua agenda em formato de calendário, Dr(a). {usuario.nome}
        </p>
      </div>

      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="mt-6">
          <AgendaCalendar />
        </TabsContent>

        <TabsContent value="lista" className="mt-6">
          <AgendamentosList initialAgendamentos={formattedAgendamentos} />
        </TabsContent>
      </Tabs>
    </>
  );
}
