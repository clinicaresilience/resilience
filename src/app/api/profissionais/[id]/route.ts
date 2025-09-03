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

  // Buscar agenda (slots futuros)
  const { data: agendas, error: agendaError } = await supabase
    .from("agenda_slots")
    .select("id, data, hora, disponivel")
    .eq("profissional_id", id)
    .gte("data", new Date().toISOString().split("T")[0]) // só datas de hoje em diante
    .order("data", { ascending: true })
    .order("hora", { ascending: true });

  if (agendaError) {
    return NextResponse.json({ error: agendaError.message }, { status: 500 });
  }

  return NextResponse.json({ profissional, agendas });
}
