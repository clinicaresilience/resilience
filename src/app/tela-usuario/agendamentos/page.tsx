import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import AgendamentosList from "@/components/agendamentos-list"
import { BackButton } from "@/components/ui/back-button"
import { AgendamentosService } from "@/services/database/agendamentos.service" 

export default async function AgendamentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single()

  if (error || !usuario) {
    redirect("/auth/login")
  }

  // se for admin, encaminha pro painel administrativo
  if (usuario.tipo_usuario === "administrador") {
    redirect("/painel-administrativo")
  }

  // Busca inicial direto no service (SSR)
  const agendamentos = await AgendamentosService.listAgendamentos({
    usuario_id: user.id,
  })

  // Mapeia para o formato do componente de UI
  const initialAgendamentos = agendamentos.map((ag) => ({
    id: ag.id,
    usuarioId: ag.paciente_id,
    profissionalId: ag.profissional_id,
    profissionalNome: ag.profissional?.nome || "Profissional",
    especialidade: ag.profissional?.especialidade || "",
    dataISO: ag.data_consulta,
    local: ag.local || "Clínica Resilience",
    status: ag.status,
    notas: ag.notas,
  }))

  return (
    <div className="min-h-screen w-full bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-4">
          <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-azul-escuro-secundario text-center">
            Meus agendamentos
          </h1>
          <p className="mt-2 text-lg text-center">
            Bem-vindo, <span className="font-semibold">{usuario.nome}</span>! Aqui
            você pode acompanhar seus agendamentos.
          </p>
        </div>

        <div className="w-full">
          <AgendamentosList userId={user.id} initialAgendamentos={initialAgendamentos} />
        </div>
      </div>
    </div>
  )
}
