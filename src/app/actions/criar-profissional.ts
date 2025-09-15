"use server";

import { createAdminClient } from "@/lib/server-admin";

export async function criarProfissional(data: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    senha: string;
    area?: string;
    especialidade?: string;
    crp?: string;
    descricao?: string;
}) {
    const supabase = createAdminClient();

    // 1️⃣ Criar usuário no Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.senha,
        email_confirm: true,
        user_metadata: { nome: data.nome },
    });

    if (authError || !authUser?.user) {
        throw new Error(authError?.message || "Erro ao criar usuário no Auth");
    }

    const userId = authUser.user.id;

    // 2️⃣ Verificar se já existe registro na tabela 'usuarios'
    const { data: existingUsers } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .single();

    if (existingUsers) {
        // Atualizar registro existente
        const { error: updateError } = await supabase.from("usuarios").update({
            tipo_usuario: "profissional",
            nome: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
            informacoes_adicionais: {
                area: data.area,
                especialidade: data.especialidade,
                crp: data.crp,
                descricao: data.descricao
            },
            ativo: true,
            primeiro_acesso: true,
        }).eq("id", userId);

        if (updateError) throw new Error(updateError.message);
    } else {
        // Criar registro novo
        const { error: insertError } = await supabase.from("usuarios").insert([
            {
                id: userId,
                nome: data.nome,
                email: data.email,
                cpf: data.cpf,
                telefone: data.telefone,
                tipo_usuario: "profissional",
                ativo: true,
                primeiro_acesso: true,
                informacoes_adicionais: {
                    area: data.area,
                    especialidade: data.especialidade,
                    crp: data.crp,
                    descricao: data.descricao
                },
            },
        ]);

        if (insertError) throw new Error(insertError.message);
    }

    return { success: true, id: userId, senha: data.senha };
}
