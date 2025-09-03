import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// ====================
// Criar profissional
// ====================
export async function POST(req: Request) {
    const body = await req.json();
    const { nome, email, especialidade, crp, descricao } = body;

    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ apenas no backend
    );

    // 1) Cria usuário no auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome, tipo_usuario: "profissional" },
    });

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2) Atualiza informacoes_adicionais na tabela "usuarios"
    const { error: updateError } = await admin
        .from("usuarios")
        .update({
            informacoes_adicionais: { crp, especialidade, descricao, foto: "" },
        })
        .eq("id", authUser.user.id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: authUser.user.id });
}

// ====================
// Listar profissionais
// ====================
export async function GET() {
    const supabase = await createClient();

    const { data: profissionais, error } = await supabase
        .from("usuarios")
        .select("id, nome, informacoes_adicionais")
        .eq("tipo_usuario", "profissional")
        .order("nome");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profissionais ?? []);
}
