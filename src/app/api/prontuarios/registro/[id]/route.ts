import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// PUT - Editar registro
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { texto } = await request.json();

    if (!texto || !texto.trim()) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar se o usuário é admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (profile?.tipo_usuario !== 'admin' && profile?.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem editar registros.' },
        { status: 403 }
      );
    }

    // Atualizar o registro
    const { data, error } = await supabase
      .from('prontuarios_registros')
      .update({ 
        texto: texto.trim()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar registro:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Registro atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao editar registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verificar se o usuário é admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (profile?.tipo_usuario !== 'admin' && profile?.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem excluir registros.' },
        { status: 403 }
      );
    }

    // Excluir o registro
    const { error } = await supabase
      .from('prontuarios_registros')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir registro:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
