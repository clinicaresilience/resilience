import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone, cpf, senha, confirmarSenha } = body;

    // Validation
    if (!nome || !email || !telefone || !cpf || !senha || !confirmarSenha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

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

    const supabase = await createClient();
    
    // Create account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/protected`,
        data: {
          nome,
          telefone,
        }
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create record in usuarios table
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email,
          nome,
          telefone,
          cpf,
          tipo_usuario: 'comum', // Default for new registrations
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB insertion fails, as auth account was created
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Conta criada com sucesso!' 
    });

  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
