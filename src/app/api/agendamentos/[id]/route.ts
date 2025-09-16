import { NextResponse, NextRequest } from "next/server"
import { AgendamentosService } from "@/services/database/agendamentos.service"
import { createClient } from "@/lib/server"

// PATCH /api/agendamentos/[id]
// Atualiza um agendamento (cancelar, confirmar, etc)
export async function PATCH(
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
    const { status, justificativa, notas, data_consulta } = body || {}

    // Verificar se o usuário tem permissão para atualizar este agendamento
    const agendamento = await AgendamentosService.getAgendamentoById(id)

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    // Verificar permissões
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    const isOwner = agendamento.paciente_id === user.id
    const isProfessional = agendamento.profissional_id === user.id
    const isAdmin = userData?.tipo_usuario === "administrador"

    if (!isOwner && !isProfessional && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão para atualizar este agendamento" }, { status: 403 })
    }

    // Atualizar baseado no que foi fornecido
    let updatedAgendamento

    if (status === "cancelado" && justificativa) {
      updatedAgendamento = await AgendamentosService.cancelAgendamento(id, justificativa)
    } else if (status === "confirmado") {
      updatedAgendamento = await AgendamentosService.confirmAgendamento(id)
    } else if (status === "concluido") {
      updatedAgendamento = await AgendamentosService.completeAgendamento(id, notas)
    } else if (data_consulta) {
      // Reagendamento - atualizar data/hora
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          data_consulta: data_consulta,
          notas: notas || agendamento.notas
        })
        .eq("id", id)

      if (updateError) {
        throw updateError
      }

      updatedAgendamento = await AgendamentosService.getAgendamentoById(id)
    } else if (status) {
      updatedAgendamento = await AgendamentosService.updateAgendamentoStatus(id, { status, notas })
    } else {
      return NextResponse.json({ error: "Nenhuma atualização especificada" }, { status: 400 })
    }

    if (!updatedAgendamento) {
      return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
    }

    // Formatar resposta
    const formattedAgendamento = {
      id: updatedAgendamento.id,
      usuarioId: updatedAgendamento.paciente_id,
      profissionalId: updatedAgendamento.profissional_id,
      profissionalNome: updatedAgendamento.profissional?.nome || "Profissional",
      especialidade: updatedAgendamento.profissional?.especialidade || "",
      dataISO: updatedAgendamento.data_consulta,
      local: "Clínica Resilience",
      status: updatedAgendamento.status,
      notas: updatedAgendamento.notas,
    }

    return NextResponse.json({
      success: true,
      data: formattedAgendamento,
    }, { status: 200 })
  } catch (error: unknown) {
    console.error("Erro ao atualizar agendamento:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento", detail: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE /api/agendamentos/[id]
// Remove um agendamento (apenas admins)
export async function DELETE(
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

    // Verificar se é admin
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    if (userData?.tipo_usuario !== "administrador") {
      return NextResponse.json({ error: "Apenas administradores podem deletar agendamentos" }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID do agendamento não fornecido" }, { status: 400 })
    }

    // Deletar agendamento
    const { error } = await supabase
      .from("agendamentos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao deletar agendamento:", error)
      return NextResponse.json(
        { error: "Erro ao deletar agendamento", detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento deletado com sucesso",
    }, { status: 200 })
  } catch (error: unknown) {
    console.error("Erro ao deletar agendamento:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Erro ao deletar agendamento", detail: errorMessage },
      { status: 500 }
    )
  }
}
