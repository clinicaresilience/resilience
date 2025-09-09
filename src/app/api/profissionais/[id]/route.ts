import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";



export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = context.params;

  // Buscar profissional
  const { data: profissional, error: profError } = await supabase
    .from("usuarios")
    .select("id, nome, informacoes_adicionais")
    .eq("id", id)
    .eq("tipo_usuario", "profissional")
    .single();

  if (profError || !profissional) {
    return NextResponse.json(
      { error: "Profissional não encontrado" },
      { status: 404 }
    );
  }

  const hoje = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  // Buscar slots futuros
  const { data: slots, error: slotsError } = await supabase
    .from("agendamento_slot")
    .select("id, data, hora_inicio, hora_fim, status, paciente_id")
    .eq("profissional_id", id)
    .gte("data", hoje)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 500 });
  }

  // Converter para formato do frontend
  const agendas = (slots || []).map((slot) => ({
    id: slot.id,
    data: slot.data,            // "2025-09-07"
    hora: slot.hora_inicio,     // "08:00"
    disponivel: slot.status === "livre",
  }));

  return NextResponse.json({
    profissional,
    agendas,
  });
}

