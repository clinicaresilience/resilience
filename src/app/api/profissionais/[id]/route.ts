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
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const hoje = new Date().toISOString(); // ISO completo

  // Buscar slots futuros
  const { data: slots, error: slotsError } = await supabase
    .from("agendamento_slot")
    .select("id, data, status, paciente_id")
    .eq("profissional_id", id)
    .gte("data_hora_inicio", hoje) // compara timestamptz diretamente
    .order("data", { ascending: true });

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 500 });
  }

  // Converter para formato do frontend
  const agendas = (slots || []).map((slot) => {
    const dataISO = new Date(slot.data).toISOString(); // garante ISO
    return {
      id: slot.id,
      data: dataISO.split("T")[0],          // "2025-09-07"
      hora: dataISO.split("T")[1]?.substring(0, 5), // "08:00"
      disponivel: slot.status === "livre",
    };
  });

  return NextResponse.json({
    profissional,
    agendas,
  });
}
