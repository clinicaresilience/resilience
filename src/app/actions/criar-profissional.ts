"use server";

import { createAdminClient } from "@/lib/server-admin";
import { EmailService } from "@/services/email/email.service";

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
    foto_url?: string;
}) {
    const supabase = createAdminClient();

    // ✅ Validações antes de criar qualquer coisa
    
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
    if (!data.area?.trim()) {
        throw new Error('O campo Área é obrigatório');
    }
    if (!data.especialidade?.trim()) {
        throw new Error('O campo Especialidade é obrigatório');
    }
    if (!data.crp?.trim()) {
        throw new Error('O campo CRP é obrigatório');
    }

    // 4. Verificar se email já existe no Auth (duplicação)
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingAuthUsers.users?.some(user => user.email === data.email);
    if (emailExists) {
        throw new Error('Este email já está cadastrado no sistema');
    }

    // 5. Verificar se CPF já existe na tabela usuarios
    const { data: existingCpf } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cpf", cpfLimpo)
        .single();
    
    if (existingCpf) {
        throw new Error('Este CPF já está cadastrado no sistema');
    }

    // 6. Verificar se CRP já existe
    const { data: existingCrp } = await supabase
        .from("usuarios")
        .select("id")
        .eq("crp", data.crp.trim())
        .single();
    
    if (existingCrp) {
        throw new Error('Este CRP já está cadastrado no sistema');
    }

    let userId: string | undefined;

    try {
        // ✅ Agora sim criar usuário no Auth (somente após todas as validações)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.senha,
            email_confirm: true,
            user_metadata: { nome: data.nome },
        });

        if (authError || !authUser?.user) {
            throw new Error(authError?.message || "Erro ao criar usuário no Auth");
        }

        userId = authUser.user.id;

        // ✅ Verificar se já existe na tabela usuarios (double-check por segurança)
        const { data: existingUser } = await supabase
            .from("usuarios")
            .select("id")
            .eq("id", userId)
            .single();

        if (existingUser) {
            // Se já existe, atualizar ao invés de inserir
            const { error: updateError } = await supabase
                .from("usuarios")
                .update({
                    nome: data.nome.trim(),
                    email: data.email.trim(),
                    cpf: cpfLimpo,
                    telefone: telefoneLimpo,
                    tipo_usuario: "profissional",
                    ativo: true,
                    primeiro_acesso: true,
                    area: data.area?.trim(),
                    especialidade: data.especialidade?.trim(),
                    crp: data.crp?.trim(),
                    bio: data.descricao?.trim() || null,
                    avatar_url: data.foto_url || null,
                })
                .eq("id", userId);

            if (updateError) {
                throw new Error(`Erro ao atualizar dados do profissional: ${updateError.message}`);
            }
        } else {
            // Se não existe, inserir novo registro
            const { error: insertError } = await supabase.from("usuarios").insert([
                {
                    id: userId,
                    nome: data.nome.trim(),
                    email: data.email.trim(),
                    cpf: cpfLimpo,
                    telefone: telefoneLimpo,
                    tipo_usuario: "profissional",
                    ativo: true,
                    primeiro_acesso: true,
                    area: data.area?.trim(),
                    especialidade: data.especialidade?.trim(),
                    crp: data.crp?.trim(),
                    bio: data.descricao?.trim() || null,
                    avatar_url: data.foto_url || null,
                },
            ]);

            if (insertError) {
                throw new Error(`Erro ao salvar dados do profissional: ${insertError.message}`);
            }
        }

        // Enviar email de boas-vindas para o profissional
        try {
            await EmailService.enviarBoasVindasProfissional({
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                especialidade: data.especialidade!,
                crp: data.crp!
            });
        } catch (emailError) {
            console.warn('Aviso: Não foi possível enviar email de boas-vindas:', emailError);
            // Não falhar a criação do profissional por erro de email
        }

        return { success: true, id: userId, senha: data.senha };

    } catch (error) {
        // ❌ Se algo deu errado e userId foi criado, limpar do Auth
        if (userId) {
            await supabase.auth.admin.deleteUser(userId).catch(() => {
                // Silenciar erro de cleanup - o erro principal já será thrown
            });
        }
        throw error;
    }
}
