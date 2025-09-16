import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// GET - Buscar preferências do usuário
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar preferências do usuário
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('boas_vindas')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar preferências:', error);
      return NextResponse.json({ error: 'Erro ao buscar preferências' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        showWelcome: userData?.boas_vindas ?? true 
      } 
    });

  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH - Atualizar preferência de boas-vindas
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { showWelcome } = body;

    if (typeof showWelcome !== 'boolean') {
      return NextResponse.json({ error: 'showWelcome deve ser um boolean' }, { status: 400 });
    }

    // Atualizar preferência
    const { error } = await supabase
      .from('usuarios')
      .update({ boas_vindas: showWelcome })
      .eq('id', user.id);

    if (error) {
      console.error('Erro ao atualizar preferências:', error);
      return NextResponse.json({ error: 'Erro ao atualizar preferências' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Preferências atualizadas com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
