import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { ConsultasService } from "@/services/database/consultas.service";

// POST /api/consultas/prontuarios
// Cria um prontuário em PDF para um paciente
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

    // Verificar se é profissional
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const formData = await req.formData();
    const pacienteId = formData.get("pacienteId") as string;
    const arquivo = formData.get("arquivo") as File;

    if (!pacienteId || !arquivo) {
      return NextResponse.json(
        { error: "Paciente e arquivo PDF são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se é PDF
    if (arquivo.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são permitidos" },
        { status: 400 }
      );
    }

    // Converter arquivo para base64 (em produção, seria melhor usar storage como S3)
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const arquivoBase64 = `data:application/pdf;base64,${base64}`;

    // Criar prontuário
    const consulta = await ConsultasService.criarProntuario(
      user.id,
      pacienteId,
      arquivoBase64
    );

    return NextResponse.json({
      success: true,
      message: "Prontuário criado com sucesso",
      data: {
        consultaId: consulta.id,
        pacienteNome: consulta.paciente?.nome,
        dataConsulta: consulta.data_hora,
      },
    });

  } catch (error: unknown) {
    console.error("Erro ao criar prontuário:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao criar prontuário", detail: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/consultas/prontuarios
// Busca prontuários do profissional logado
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

    // Buscar prontuários
    const prontuarios = await ConsultasService.getProntuarios(user.id);

    return NextResponse.json({
      success: true,
      data: prontuarios,
    });

  } catch (error: unknown) {
    console.error("Erro ao buscar prontuários:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao buscar prontuários", detail: errorMessage },
      { status: 500 }
    );
  }
}
