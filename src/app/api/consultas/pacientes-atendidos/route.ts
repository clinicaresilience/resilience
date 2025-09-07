import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { ConsultasService } from "@/services/database/consultas.service";

// GET /api/consultas/pacientes-atendidos
// Busca pacientes que já foram atendidos pelo profissional logado
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é profissional
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar pacientes atendidos
    const pacientesAtendidos = await ConsultasService.getPacientesAtendidos(user.id);

    return NextResponse.json({
      success: true,
      data: pacientesAtendidos,
    });

  } catch (error: any) {
    console.error("Erro ao buscar pacientes atendidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pacientes atendidos", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
