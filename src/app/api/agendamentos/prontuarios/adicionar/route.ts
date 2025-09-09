import { NextResponse, NextRequest } from "next/server"
import { ConsultasService } from "@/services/database/consultas.service"
import { createClient } from "@/lib/server"

// POST /api/agendamentos/prontuarios/adicionar
// Adicionar PDF a um prontuário que não tem PDF
export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const consultaId = formData.get('consultaId') as string;
    const arquivo = formData.get('arquivo') as File;

    if (!consultaId || !arquivo) {
      return NextResponse.json(
        { error: "consultaId e arquivo são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo do arquivo
    if (arquivo.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são permitidos" },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo deve ter no máximo 10MB" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await arquivo.arrayBuffer();
    const arquivoPdfBuffer = Buffer.from(arrayBuffer);

    const resultado = await ConsultasService.atualizarProntuario(
      user.id,
      consultaId,
      undefined, // texto (não alterar)
      arquivoPdfBuffer // novo arquivo PDF
    );

    return NextResponse.json({
      success: true,
      data: resultado,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro ao adicionar PDF ao prontuário:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro ao adicionar PDF ao prontuário", detail: errorMessage },
      { status: 500 }
    );
  }
}
