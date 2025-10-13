"use server";

import { createAdminClient } from "@/lib/server-admin";

export async function editarProfissional(data: {
    userId: string;
    nome: string;
    email: string; // Email é readonly, mas incluído para consistência
    cpf: string;
    telefone: string;
    area: string;
    especialidade: string;
    crp: string;
    descricao?: string;
    foto_url?: string;
}) {
    const supabase = createAdminClient();

    // ✅ Validações antes de atualizar

    // 1. Validar e limpar CPF
    const cpfLimpo = data.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter exatamente 11 dígitos');
    }

    // 2. Validar telefone (WhatsApp - deve ter 11 dígitos: DDD + 9 dígitos)
    const telefoneLimpo = data.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
        throw new Error('Telefone deve conter exatamente 11 dígitos (DDD + número com 9 dígitos)');
    }

    // 3. Verificar campos obrigatórios
    if (!data.nome?.trim()) {
        throw new Error('O campo Nome é obrigatório');
    }
    if (!data.area?.trim()) {
        throw new Error('O campo Área é obrigatório');
    }
    if (!data.especialidade?.trim()) {
        throw new Error('O campo Especialidade é obrigatório');
    }
    if (!data.crp?.trim()) {
        throw new Error('O campo CRP é obrigatório');
    }

    // 4. Verificar se CPF já existe em outro usuário (exceto o próprio)
    const { data: existingCpf, error: cpfError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cpf", cpfLimpo)
        .neq("id", data.userId)
        .maybeSingle();

    if (cpfError) {
        console.error("Erro ao verificar CPF:", cpfError);
        throw new Error('Erro ao verificar CPF');
    }

    if (existingCpf) {
        throw new Error('Este CPF já está cadastrado para outro usuário');
    }

    // 5. Verificar se CRP já existe em outro usuário (exceto o próprio)
    const { data: existingCrp, error: crpError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("crp", data.crp.trim())
        .neq("id", data.userId)
        .maybeSingle();

    if (crpError) {
        console.error("Erro ao verificar CRP:", crpError);
        throw new Error('Erro ao verificar CRP');
    }

    if (existingCrp) {
        throw new Error('Este CRP já está cadastrado para outro usuário');
    }

    // ✅ Atualizar dados do profissional
    const { error: updateError } = await supabase
        .from("usuarios")
        .update({
            nome: data.nome.trim(),
            cpf: cpfLimpo,
            telefone: telefoneLimpo,
            area: data.area.trim(),
            especialidade: data.especialidade.trim(),
            crp: data.crp.trim(),
            bio: data.descricao?.trim() || null,
            avatar_url: data.foto_url || null,
            atualizado_em: new Date().toISOString(),
        })
        .eq("id", data.userId);

    if (updateError) {
        console.error("Erro ao atualizar profissional:", updateError);
        throw new Error(`Erro ao atualizar dados do profissional: ${updateError.message}`);
    }

    return { success: true };
}
