import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    // Buscar profissional
    const { data: profissional, error: errorProf } = await supabase
        .from("usuarios")
        .select("id, nome, informacoes_adicionais")
        .eq("id", params.id)
        .eq("tipo_usuario", "profissional")
        .single();

    if (errorProf || !profissional) {
        return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    // Buscar horários de agenda
    const { data: agendas, error: errorAgenda } = await supabase
        .from("agendas")
        .select("id, data, hora, disponivel")
        .eq("profissional_id", params.id)
        .order("data", { ascending: true })
        .order("hora", { ascending: true });

    if (errorAgenda) {
        return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 });
    }

    return NextResponse.json({ profissional, agendas });
}
