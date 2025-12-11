// src/app/api/alterar-senha/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server-admin";

export async function PUT(req: NextRequest) {
    try {
        const { userId, newPassword } = await req.json();

        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: "Parâmetros inválidos" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Atualiza a senha no Auth
        const { error: authError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (authError) {
            console.error("Erro Auth:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // Atualiza primeiro_acesso
        const { error: dbError } = await supabase
            .from("usuarios")
            .update({ primeiro_acesso: false })
            .eq("id", userId);

        if (dbError) {
            console.error("Erro DB:", dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Senha redefinida com sucesso" });
    } catch (err: unknown) {
        console.error("Erro inesperado:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Erro desconhecido" }, { status: 500 });
    }
}
