import { NextResponse, NextRequest } from "next/server"
import { createClient as createSupabaseServerClient } from "@/lib/server"
import { mapDbToUi, composeISODateTime } from "@/types/agendamento"

// GET /api/agendamentos
// Retorna os agendamentos do usuário logado
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("paciente_id", user.id)

    if (error) {
      return NextResponse.json(
        { error: "Erro ao buscar agendamentos", detail: error.message },
        { status: 500 }
      )
    }

    const ui = (data ?? []).map(mapDbToUi)
    // ordenar por data/hora (próximos primeiro)
    ui.sort((a, b) => +new Date(a.dataISO) - +new Date(b.dataISO))

    return NextResponse.json({ data: ui }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: "Falha inesperada ao obter agendamentos", detail: String(e?.message ?? e) },
      { status: 500 }
    )
  }
}

// POST /api/agendamentos
// Cria um agendamento para o usuário logado
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { profissional_id, data, hora, notas } = body || {}

    if (!profissional_id || !data || !hora) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes", required: ["profissional_id", "data", "hora"] },
        { status: 400 }
      )
    }

    const insertPayload: Record<string, any> = {
      paciente_id: user.id,
      profissional_id,
      data,
      hora,
    }
    if (typeof notas === "string" && notas.length > 0) {
      insertPayload.notas = notas
    }

    const { data: inserted, error } = await supabase
      .from("agendamentos")
      .insert([insertPayload])
      .select("*")
      .single()

    if (error || !inserted) {
      return NextResponse.json(
        { error: "Erro ao criar agendamento", detail: error?.message },
        { status: 500 }
      )
    }

    const ui = mapDbToUi(inserted)
    // Garantir campo ISO coerente
    ui.dataISO = composeISODateTime(inserted.data, inserted.hora)

    return NextResponse.json({ data: ui }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: "Falha inesperada ao criar agendamento", detail: String(e?.message ?? e) },
      { status: 500 }
    )
  }
}
