import { NextResponse, NextRequest } from "next/server"
import { ConsultasService } from "@/services/database/consultas.service"
import { createClient } from "@/lib/server"

// DELETE /api/agendamentos/prontuarios/remover
// Excluir prontuário (remove o registro completo)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é um profissional
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (!userData || userData.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso restrito a profissionais" }, { status: 403 });
    }

    const body = await req.json();
    const { prontuarioId } = body;

    console.log("Remover PDF - Request body:", body);
    console.log("Remover PDF - prontuarioId:", prontuarioId);

    if (!prontuarioId) {
      console.log("Remover PDF - prontuarioId is missing or invalid");
      return NextResponse.json(
        { error: "prontuarioId é obrigatório" },
        { status: 400 }
      );
    }

    const resultado = await ConsultasService.excluirProntuario(
      user.id,
      prontuarioId
    );

    return NextResponse.json({
      success: true,
      data: resultado,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro ao excluir prontuário:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro ao excluir prontuário", detail: errorMessage },
      { status: 500 }
    );
  }
}
