import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

// GET - retorna agenda do profissional
export async function GET(req: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const profissionalId = searchParams.get("profissionalId");

    const { data, error } = await supabase
        .from("agenda_configuracoes")
        .select("*")
        .eq("profissional_id", profissionalId)
        .order("dia_semana");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

// POST - salva ou atualiza agenda
export async function POST(req: Request) {
    const supabase = await createClient();
    const body = await req.json();

    // body = { profissional_id, dia_semana, hora_inicio, hora_fim, intervalo_minutos, ativo }
    const { data, error } = await supabase
        .from("agenda_configuracoes")
        .upsert(body, { onConflict: ["profissional_id", "dia_semana"] });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
