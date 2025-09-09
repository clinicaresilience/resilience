import { NextResponse, NextRequest } from "next/server"
import { ConsultasService } from "@/services/database/consultas.service"
import { createClient } from "@/lib/server"

// GET /api/agendamentos/prontuarios
// Buscar prontuários de um profissional (agendamentos com prontuários anexados)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é um profissional
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    if (!userData || userData.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso restrito a profissionais" }, { status: 403 })
    }

    const prontuarios = await ConsultasService.getProntuarios(user.id)

    return NextResponse.json({
      success: true,
      data: prontuarios,
    }, { status: 200 })

  } catch (error: unknown) {
    console.error("Erro ao buscar prontuários:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Erro ao buscar prontuários", detail: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/agendamentos/prontuarios
// Criar/atualizar prontuário para um agendamento
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é um profissional
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    if (!userData || userData.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso restrito a profissionais" }, { status: 403 })
    }

    const body = await req.json()
    const { paciente_id, arquivo_pdf } = body

    if (!paciente_id || !arquivo_pdf) {
      return NextResponse.json(
        { error: "paciente_id e arquivo_pdf são obrigatórios" },
        { status: 400 }
      )
    }

    const consultaAtualizada = await ConsultasService.criarProntuario(
      user.id,
      paciente_id,
      arquivo_pdf
    )

    return NextResponse.json({
      success: true,
      data: consultaAtualizada,
    }, { status: 200 })

  } catch (error: unknown) {
    console.error("Erro ao criar prontuário:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Erro ao criar prontuário", detail: errorMessage },
      { status: 500 }
    )
  }
}
