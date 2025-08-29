import { NextResponse, NextRequest } from "next/server"
import { createClient as createSupabaseServerClient } from "@/lib/server"
import { mapDbToUi } from "@/types/agendamento"

// PATCH /api/agendamentos/:id
// Ação suportada: cancelar (status = "cancelado") se a coluna existir.
// Garante que o agendamento pertence ao usuário autenticado.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agendamentoId = params.id
    if (!agendamentoId) {
      return NextResponse.json(
        { error: "ID do agendamento não informado" },
        { status: 400 }
      )
    }

    // Verifica existência e propriedade
    const { data: existing, error: fetchErr } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", agendamentoId)
      .eq("paciente_id", user.id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }

    // Tenta cancelar via atualização de status
    const { data: updated, error: updateErr } = await supabase
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("id", agendamentoId)
      .eq("paciente_id", user.id)
      .select("*")
      .single()

    if (updateErr || !updated) {
      // Caso a coluna 'status' não exista ou falhe, retorna erro informativo
      return NextResponse.json(
        {
          error:
            "Não foi possível cancelar. Verifique se a coluna 'status' existe na tabela 'agendamentos'.",
          detail: updateErr?.message,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ data: mapDbToUi(updated) }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: "Falha inesperada ao atualizar agendamento", detail: String(e?.message ?? e) },
      { status: 500 }
    )
  }
}
