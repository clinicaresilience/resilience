import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// GET - Buscar evolução específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: evolucao, error } = await supabase
      .from('prontuario_evolucoes')
      .select(`
        *,
        profissional:usuarios!profissional_id(
          id,
          nome,
          informacoes_adicionais
        ),
        agendamento:agendamentos(
          id,
          data_consulta,
          status
        ),
        prontuario:prontuarios(
          id,
          paciente:usuarios!paciente_id(
            id,
            nome,
            email
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Evolução não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evolucao
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evolução
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { tipo_evolucao, texto, dados_structurados, data_evolucao } = body;

    if (!texto || !tipo_evolucao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: texto, tipo_evolucao' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se a evolução existe e se o usuário tem permissão
    const { data: evolucaoAtual, error: evolucaoError } = await supabase
      .from('prontuario_evolucoes')
      .select(`
        *,
        prontuario:prontuarios(profissional_atual_id)
      `)
      .eq('id', params.id)
      .single();

    if (evolucaoError) {
      return NextResponse.json(
        { error: 'Evolução não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões (admin, profissional responsável ou autor da evolução)
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (usuarioError) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const isAdmin = usuario.tipo_usuario === 'admin';
    const isProfissionalResponsavel = evolucaoAtual.prontuario.profissional_atual_id === user.id;
    const isAutorEvolucao = evolucaoAtual.profissional_id === user.id;

    if (!isAdmin && !isProfissionalResponsavel && !isAutorEvolucao) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta evolução' },
        { status: 403 }
      );
    }

    // Atualizar evolução
    const { data: evolucaoAtualizada, error: updateError } = await supabase
      .from('prontuario_evolucoes')
      .update({
        tipo_evolucao,
        texto,
        dados_structurados,
        data_evolucao: data_evolucao || evolucaoAtual.data_evolucao,
      })
      .eq('id', params.id)
      .select(`
        *,
        profissional:usuarios!profissional_id(
          id,
          nome,
          informacoes_adicionais
        ),
        agendamento:agendamentos(
          id,
          data_consulta,
          status
        )
      `)
      .single();

    if (updateError) {
      console.error('Erro ao atualizar evolução:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar evolução' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evolucaoAtualizada
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evolução
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se a evolução existe e se o usuário tem permissão
    const { data: evolucaoAtual, error: evolucaoError } = await supabase
      .from('prontuario_evolucoes')
      .select(`
        *,
        prontuario:prontuarios(profissional_atual_id)
      `)
      .eq('id', params.id)
      .single();

    if (evolucaoError) {
      return NextResponse.json(
        { error: 'Evolução não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões (apenas admin)
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (usuarioError) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const isAdmin = usuario.tipo_usuario === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem excluir evoluções' },
        { status: 403 }
      );
    }

    // Excluir evolução
    const { error: deleteError } = await supabase
      .from('prontuario_evolucoes')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Erro ao excluir evolução:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao excluir evolução' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Evolução excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
