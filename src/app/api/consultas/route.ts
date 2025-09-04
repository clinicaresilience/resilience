import { createClient } from "@/lib/client";

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
      data_hora
    `)
        .eq("profissional_id", profissionalId)
        .order("data_hora", { ascending: true });

    if (error) throw error;

    return data?.map((c: any) => ({
        id: c.id,
        usuario_id: c.paciente_id,
        usuario: c.paciente,
        status: c.status || "pendente",
        local: c.local || "",
        observacoes: c.observacoes || null,
        dataISO: c.data_hora,
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
