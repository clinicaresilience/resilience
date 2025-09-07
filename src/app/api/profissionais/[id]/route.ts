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

  // Buscar agenda do profissional
  const { data: agenda, error: agendaError } = await supabase

    .from("agenda_profissional")
    .select("id, configuracao, slots") // apenas colunas reais
    .eq("profissional_id", id)
    .single();

  if (agendaError) {
    return NextResponse.json(
      { error: agendaError.message },
      { status: 500 }
    );
  }

  const hoje = new Date();

  // 🔹 Filtrar apenas slots futuros (inclui hoje)
  const slotsFuturos = (agenda?.slots || []).filter((slot: any) => {
    if (!slot.diaSemana || !slot.horaInicio) return false;

    const now = new Date();
    const diaSemanaAtual = now.getDay();

    let diff = slot.diaSemana - diaSemanaAtual;
    if (diff < 0) diff += 7;

    const dataSlot = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diff
    );

    const [h, m] = slot.horaInicio.split(":").map(Number);
    dataSlot.setHours(h, m, 0, 0);

    return dataSlot >= hoje;
  });

  // 🔹 Converter para o formato esperado pelo frontend (Agenda[])
  const agendas = (slotsFuturos || []).map((slot: any, index: number) => {
    const now = new Date();
    const diaSemanaAtual = now.getDay();

    let diff = slot.diaSemana - diaSemanaAtual;
    if (diff < 0) diff += 7;

    const dataSlot = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diff
    );

    const [h, m] = slot.horaInicio.split(":").map(Number);
    dataSlot.setHours(h, m, 0, 0);

    return {
      id: `${slot.diaSemana}-${slot.horaInicio}-${index}`, // id único
      data: dataSlot.toISOString().split("T")[0],          // "2025-09-07"
      hora: slot.horaInicio,                               // "08:00"
      disponivel: slot.disponivel,
    };
  });

  return NextResponse.json({
    profissional,
    agendas,
  });
}
