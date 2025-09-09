import { createClient } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function fetchConsultasByProfissional(profissionalId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("consultas")
        .select(`
      id,
      paciente_id,
      paciente:paciente_id(nome, email),
      profissional_id,
      status,
      local,
      observacoes,
      data_consulta
    `)
        .eq("profissional_id", profissionalId)
        .order("data_consulta", { ascending: true });

    if (error) throw error;

    return data?.map((c: any) => ({
        id: c.id,
        usuario_id: c.paciente_id,
        usuario: c.paciente,
        status: c.status || "pendente",
        local: c.local || "",
        observacoes: c.observacoes || null,
        dataISO: c.data_consulta,
    })) ?? [];
}

export async function updateConsultaStatus(id: string, status: string) {
    const supabase = createClient();
    return supabase.from("consultas").update({ status }).eq("id", id);
}

export async function updateConsultaObservacoes(id: string, observacoes: string) {
    const supabase = createClient();
    return supabase.from("consultas").update({ observacoes }).eq("id", id);
}

// route.ts em /api/consultas



export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { id, observacoes } = await req.json();

        if (!id || observacoes === undefined) {
            return NextResponse.json(
                { error: "Campos obrigatórios ausentes: id e observacoes" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("consultas")
            .update({ observacoes })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar observações:", error);
            return NextResponse.json({ error: "Erro ao atualizar observações" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err) {
        console.error("Erro desconhecido:", err);
        return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
    }
}



export async function GET() {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("consultas")
        .select(`
      id,
      paciente_id,
      paciente:paciente_id(nome, email),
      profissional_id,
      profissional:profissional_id(nome),
      status,
      data_consulta
    `)
        .order("data_consulta", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
}
