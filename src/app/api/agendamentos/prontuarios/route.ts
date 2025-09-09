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

    console.log("User auth check:", { user: user?.id, error: userError })

    if (userError || !user) {
      console.log("Authentication failed:", userError)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é um profissional ou admin
    const { data: userData, error: userDataError } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    console.log("User data check:", { userData, userDataError })

    if (userDataError || !userData) {
      console.log("User data fetch failed:", userDataError)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 403 })
    }

    console.log("User type:", userData.tipo_usuario)

    let prontuarios

    if (userData.tipo_usuario === "profissional") {
      // Se for profissional, buscar apenas seus prontuários
      console.log("Fetching prontuarios for professional:", user.id)
      prontuarios = await ConsultasService.getProntuarios(user.id)
    } else if (userData.tipo_usuario === "admin" || userData.tipo_usuario === "administrador") {
      // Se for admin, buscar todos os prontuários
      console.log("Fetching all prontuarios for admin")
      prontuarios = await ConsultasService.getAllProntuarios()
    } else {
      console.log("Access denied for user type:", userData.tipo_usuario)
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 })
    }

    console.log("Prontuarios fetched:", prontuarios?.length || 0)

    return NextResponse.json({
      success: true,
      consultas: prontuarios,
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

    const contentType = req.headers.get('content-type') || '';

    let paciente_id: string;
    let texto: string | null = null;
    let arquivo_pdf_binario: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (PDF upload)
      const formData = await req.formData();
      paciente_id = formData.get('paciente_id') as string;
      const arquivo = formData.get('arquivo') as File;

      if (!paciente_id || !arquivo) {
        return NextResponse.json(
          { error: "paciente_id e arquivo são obrigatórios" },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const arrayBuffer = await arquivo.arrayBuffer();
      arquivo_pdf_binario = Buffer.from(arrayBuffer);

    } else {
      // Handle JSON (text content)
      const body = await req.json();
      paciente_id = body.paciente_id;
      texto = body.texto;

      if (!paciente_id || !texto) {
        return NextResponse.json(
          { error: "paciente_id e texto são obrigatórios" },
          { status: 400 }
        );
      }
    }

    const consultaAtualizada = await ConsultasService.criarProntuario(
      user.id,
      paciente_id,
      texto,
      arquivo_pdf_binario
    );

    return NextResponse.json({
      success: true,
      data: consultaAtualizada,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro ao criar prontuário:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro ao criar prontuário", detail: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/agendamentos/prontuarios
// Deletar um prontuário específico ou remover PDF
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

    const url = new URL(req.url);
    const isRemovePdf = url.pathname.endsWith('/remover');

    const body = await req.json();

    if (isRemovePdf) {
      // Remover apenas o PDF do prontuário
      const { consultaId } = body;

      if (!consultaId) {
        return NextResponse.json(
          { error: "consultaId é obrigatório" },
          { status: 400 }
        );
      }

      const resultado = await ConsultasService.excluirProntuario(
        user.id,
        consultaId
      );

      return NextResponse.json({
        success: true,
        data: resultado,
      }, { status: 200 });
    } else {
      // Deletar prontuário completo
      const { prontuarioId } = body;

      if (!prontuarioId) {
        return NextResponse.json(
          { error: "prontuarioId é obrigatório" },
          { status: 400 }
        );
      }

      const resultado = await ConsultasService.deletarProntuario(
        user.id,
        prontuarioId
      );

      return NextResponse.json({
        success: true,
        data: resultado,
      }, { status: 200 });
    }

  } catch (error: unknown) {
    console.error("Erro na operação:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro na operação", detail: errorMessage },
      { status: 500 }
    );
  }
}
