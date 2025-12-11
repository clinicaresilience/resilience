import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { AgendamentosService } from "@/services/database/agendamentos.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "administrador") {
      return NextResponse.json({ error: "Acesso negado. Apenas administradores podem acessar." }, { status: 403 });
    }

    // Buscar todos os agendamentos com dados relacionados
    const agendamentos = await AgendamentosService.listAgendamentos({});

    const formattedAgendamentos = agendamentos.map(ag => ({
      id: ag.id,
      usuarioId: ag.paciente_id,
      profissionalId: ag.profissional_id,
      profissionalNome: ag.profissional?.nome || "Profissional",
      especialidade: ag.profissional?.especialidade || "",
      dataISO: ag.data_consulta,
      data_consulta: ag.data_consulta,
      local: "Clínica Resilience",
      status: ag.status,
      notas: ag.notas,
      modalidade: ag.modalidade,
      pacienteNome: ag.paciente?.nome || "Paciente",
      pacienteEmail: ag.paciente?.email || "",
      pacienteTelefone: ag.paciente?.telefone || "",
      paciente: {
        id: ag.paciente_id,
        nome: ag.paciente?.nome || "Paciente",
        email: ag.paciente?.email || "",
        telefone: ag.paciente?.telefone || "",
      },
      profissional: {
        nome: ag.profissional?.nome || "Profissional",
        especialidade: ag.profissional?.especialidade || "",
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedAgendamentos
    }, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar agendamentos para admin:", error);
    return NextResponse.json({
      error: "Erro ao buscar agendamentos",
      detail: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
