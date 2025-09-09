import { NextResponse, NextRequest } from "next/server"
import { ConsultasService } from "@/services/database/consultas.service"
import { createClient } from "@/lib/server"

// GET /api/agendamentos/pacientes-atendidos
// Buscar pacientes atendidos por um profissional (agendamentos concluídos)
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

    const pacientesAtendidos = await ConsultasService.getPacientesAtendidos(user.id)

    return NextResponse.json({
      success: true,
      data: pacientesAtendidos,
    }, { status: 200 })

  } catch (error: unknown) {
    console.error("Erro ao buscar pacientes atendidos:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Erro ao buscar pacientes atendidos", detail: errorMessage },
      { status: 500 }
    )
  }
}
