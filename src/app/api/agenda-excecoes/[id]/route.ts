import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Buscar exceção específica
    const { data: excecao, error } = await supabase
      .from('agenda_excecoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar exceção:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!excecao) {
      return NextResponse.json({ error: 'Exceção não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário pode acessar esta exceção
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (usuario.tipo_usuario !== 'administrador' && user.id !== excecao.profissional_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      excecao
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      tipo, 
      motivo, 
      data, 
      data_fim, 
      hora_inicio, 
      hora_fim,
      disponivel 
    } = body;

    // Buscar exceção existente
    const { data: excecaoExistente, error: fetchError } = await supabase
      .from('agenda_excecoes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !excecaoExistente) {
      return NextResponse.json({ error: 'Exceção não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (usuario.tipo_usuario !== 'administrador' && user.id !== excecaoExistente.profissional_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Validações por tipo
    if (tipo === 'recorrente' && (!hora_inicio || !hora_fim)) {
      return NextResponse.json({ 
        error: 'Para exceções recorrentes, hora_inicio e hora_fim são obrigatórios' 
      }, { status: 400 });
    }

    if ((tipo === 'pontual' || tipo === 'feriado') && !data) {
      return NextResponse.json({ 
        error: 'Para exceções pontuais e feriados, data é obrigatória' 
      }, { status: 400 });
    }

    // Atualizar exceção
    const { data: excecaoAtualizada, error: updateError } = await supabase
      .from('agenda_excecoes')
      .update({
        tipo: tipo || excecaoExistente.tipo,
        motivo: motivo || excecaoExistente.motivo,
        data: data !== undefined ? data : excecaoExistente.data,
        data_fim: data_fim !== undefined ? data_fim : excecaoExistente.data_fim,
        hora_inicio: hora_inicio !== undefined ? hora_inicio : excecaoExistente.hora_inicio,
        hora_fim: hora_fim !== undefined ? hora_fim : excecaoExistente.hora_fim,
        disponivel: disponivel !== undefined ? disponivel : excecaoExistente.disponivel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar exceção:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      excecao: excecaoAtualizada,
      message: 'Exceção atualizada com sucesso!'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Buscar exceção existente
    const { data: excecaoExistente, error: fetchError } = await supabase
      .from('agenda_excecoes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !excecaoExistente) {
      return NextResponse.json({ error: 'Exceção não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (usuario.tipo_usuario !== 'administrador' && user.id !== excecaoExistente.profissional_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Deletar exceção
    const { error: deleteError } = await supabase
      .from('agenda_excecoes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao deletar exceção:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Exceção removida com sucesso!'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
