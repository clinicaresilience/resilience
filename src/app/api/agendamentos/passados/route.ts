import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user)
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const agoraISO = new Date().toISOString();

        // Buscar consultas passadas do paciente (confirmadas que já passaram + concluídas)
        const { data: consultasData } = await supabase
            .from("agendamentos")
            .select("id, data_consulta, status, profissional_id, modalidade")
            .eq("paciente_id", user.id)
            .or("status.eq.concluido,and(status.eq.confirmado,data_consulta.lt." + agoraISO + ")")
            .order("data_consulta", { ascending: false });

        if (!consultasData || consultasData.length === 0)
            return NextResponse.json({ success: true, data: [], usuario: user?.user_metadata?.nome || "Paciente" });

        // Obter nomes dos profissionais
        const profIds = Array.from(new Set(consultasData.map(c => c.profissional_id).filter(Boolean)));
        const { data: profs } = await supabase
            .from("usuarios")
            .select("id, nome")
            .in("id", profIds)
            .eq("tipo_usuario", "profissional");

        const profMap = profs?.reduce<Record<string, string>>((acc, p) => {
            acc[p.id] = p.nome;
            return acc;
        }, {}) || {};

        const consultas = consultasData.map(c => ({
            id: c.id,
            profissional_nome: c.profissional_id ? profMap[c.profissional_id] : "Profissional",
            tipo: "Consulta",
            data_consulta: c.data_consulta,
            modalidade: c.modalidade,
            status: c.status, // incluir status para mostrar no frontend
        }));

        return NextResponse.json({
            success: true,
            data: consultas,
            usuario: user?.user_metadata?.nome || "Paciente",
        });
    } catch (error: unknown) {
        console.error("Erro ao buscar próximas consultas:", error);
        return NextResponse.json(
            { error: "Erro ao buscar próximas consultas", detail: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
