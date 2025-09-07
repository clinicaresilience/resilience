import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/**
 * Gera slots de agendamento a partir da configuração do profissional
 */
function generateSlots(dias: any[], intervaloMinutos: number) {
  const slots: any[] = [];
  dias.forEach((dia) => {
    const { diaSemana, horaInicio, horaFim } = dia;
    const [hStart, mStart] = horaInicio.split(":").map(Number);
    const [hEnd, mEnd] = horaFim.split(":").map(Number);
    const startMinutes = hStart * 60 + mStart;
    const endMinutes = hEnd * 60 + mEnd;

    for (let t = startMinutes; t + intervaloMinutos <= endMinutes; t += intervaloMinutos) {
      const slotH = Math.floor(t / 60).toString().padStart(2, "0");
      const slotM = (t % 60).toString().padStart(2, "0");

      slots.push({
        diaSemana,
        horaInicio: `${slotH}:${slotM}`,
        disponivel: true,
        agendamento_id: null,
      });
    }
  });
  return slots;
}

// POST - criar ou atualizar agenda do profissional
// POST - criar ou atualizar agenda do profissional
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { profissional_id, configuracao } = body;

  if (!profissional_id || !configuracao) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  // gera os slots no backend também
  const slots = generateSlots(configuracao.dias, configuracao.intervalo_minutos);

  const { data, error } = await supabase
    .from("agenda_profissional")
    .upsert(
      {
        profissional_id,
        configuracao,
        slots,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: ["profissional_id"] }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, agenda: data });
}


// GET - buscar agenda do profissional
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const profissionalId = searchParams.get("profissionalId");

  if (!profissionalId) {
    return NextResponse.json({ error: "profissionalId é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("agenda_profissional")
    .select("configuracao, slots")
    .eq("profissional_id", profissionalId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? {});
}
