import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar dados adicionais do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Retornar dados do usuário
    return NextResponse.json({
      id: user.id,
      email: user.email,
      nome: userData.nome,
      tipo_usuario: userData.tipo_usuario,
      user_metadata: user.user_metadata,
      ...userData
    });

  } catch (error) {
    console.error('Erro na API de autenticação:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
