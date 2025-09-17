import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone, cpf, senha, confirmarSenha } = body;

    // Validações básicas
    if (!nome || !email || !telefone || !cpf || !senha || !confirmarSenha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar senhas
    if (senha !== confirmarSenha) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Limpar CPF para validação (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter 11 dígitos' },
        { status: 400 }
      );
    }

    // Limpar telefone (remover formatação)
    const telefoneLimpo = telefone.replace(/\D/g, '');

    // Usar cliente admin para operações privilegiadas
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_PROJECT_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {}
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    // Cliente regular para auth
    const supabase = await createClient();

    // Verificar se email já existe
    const { data: existingUserByEmail } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const { data: existingUserByCpf } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('cpf', cpfLimpo)
      .single();

    if (existingUserByCpf) {
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado' },
        { status: 400 }
      );
    }

    // Criar usuário na auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
        data: {
          nome,
          tipo_usuario: 'comum'
        }
      },
    });

    if (authError) {
      console.error('Erro na criação do usuário:', authError);
      
      // Tratar erros específicos
      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 400 }
      );
    }

    // Criar perfil na tabela usuarios usando cliente admin
    const { error: profileError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nome,
        email,
        telefone: telefoneLimpo,
        cpf: cpfLimpo,
        tipo_usuario: 'comum',
        ativo: true,
        primeiro_acesso: true,
        autenticado: false, // Será true apenas após confirmação do email
        boas_vindas: true
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      
      // Se falhou ao criar perfil, tentar deletar o usuário da auth usando admin client
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        if (deleteError) {
          console.error('Erro ao deletar usuário após falha no perfil:', deleteError);
        }
      } catch (deleteErr) {
        console.error('Erro ao tentar deletar usuário:', deleteErr);
      }
      
      // Tratar erros específicos de constraint
      if (profileError.message.includes('usuarios_email_key')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        );
      }
      
      if (profileError.message.includes('usuarios_cpf_key')) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário' },
        { status: 500 }
      );
    }

    console.log('Usuário criado com sucesso:', {
      id: authData.user.id,
      email: authData.user.email,
      confirmed: authData.user.email_confirmed_at
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso. Verifique seu email para confirmar a conta.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: !!authData.user.email_confirmed_at
      },
    });

  } catch (error) {
    console.error('Erro no signup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
