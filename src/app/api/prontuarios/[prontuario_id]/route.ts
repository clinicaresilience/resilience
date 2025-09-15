import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// DELETE - Excluir prontuário inteiro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { prontuario_id: string } }
) {
  try {
    const { prontuario_id: id } = params;
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
        { error: 'Acesso negado. Apenas administradores podem excluir prontuários.' },
        { status: 403 }
      );
    }

    // Primeiro, excluir todos os registros do prontuário
    const { error: registrosError } = await supabase
      .from('prontuarios_registros')
      .delete()
      .eq('prontuario_id', id);

    if (registrosError) {
      console.error('Erro ao excluir registros do prontuário:', registrosError);
      return NextResponse.json(
        { error: 'Erro ao excluir registros do prontuário' },
        { status: 500 }
      );
    }

    // Depois, excluir o prontuário
    const { error: prontuarioError } = await supabase
      .from('prontuarios')
      .delete()
      .eq('id', id);

    if (prontuarioError) {
      console.error('Erro ao excluir prontuário:', prontuarioError);
      return NextResponse.json(
        { error: 'Erro ao excluir prontuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prontuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir prontuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
