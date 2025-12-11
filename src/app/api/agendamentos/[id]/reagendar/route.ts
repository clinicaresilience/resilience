import { NextResponse, NextRequest } from "next/server"
import { AgendamentosService } from "@/services/database/agendamentos.service"
import { createClient } from "@/lib/server"
import { EmailService } from "@/services/email/email.service"

// POST /api/agendamentos/[id]/reagendar
// Reagenda um agendamento (máximo 3 vezes)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID do agendamento não fornecido" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { nova_data_consulta, motivo } = body || {}

    if (!nova_data_consulta) {
      return NextResponse.json({ error: "Nova data de consulta é obrigatória" }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para reagendar este agendamento
    const agendamento = await AgendamentosService.getAgendamentoById(id)

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    // Verificar permissões - apenas o paciente pode reagendar
    const isOwner = agendamento.paciente_id === user.id

    if (!isOwner) {
      return NextResponse.json({ error: "Apenas o paciente pode reagendar seu agendamento" }, { status: 403 })
    }

    // Chamar o serviço de reagendamento
    const resultado = await AgendamentosService.reagendarAgendamento(
      id,
      nova_data_consulta,
      motivo
    )

    // Enviar notificação por email de reagendamento
    try {
      const dadosEmail = await EmailService.buscarDadosAgendamento(id)
      if (dadosEmail) {
        await EmailService.enviarNotificacaoReagendamento(dadosEmail)
      }
    } catch (emailError) {
      console.error('Erro ao enviar notificações de reagendamento:', emailError)
    }

    // Formatar resposta
    const formattedAgendamento = {
      id: resultado.agendamento.id,
      usuarioId: resultado.agendamento.paciente_id,
      profissionalId: resultado.agendamento.profissional_id,
      profissionalNome: resultado.agendamento.profissional?.nome || "Profissional",
      especialidade: resultado.agendamento.profissional?.especialidade || "",
      dataISO: resultado.agendamento.data_consulta,
      local: "Clínica Resilience",
      status: resultado.agendamento.status,
      notas: resultado.agendamento.notas,
    }

    return NextResponse.json({
      success: true,
      data: formattedAgendamento,
      reagendamentos_restantes: resultado.reagendamentos_restantes,
      message: `Agendamento reagendado com sucesso. Você ainda pode reagendar ${resultado.reagendamentos_restantes} vez(es).`
    }, { status: 200 })
  } catch (error: unknown) {
    console.error("Erro ao reagendar agendamento:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
